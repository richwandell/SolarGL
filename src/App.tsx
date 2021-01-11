import css from './App.module.css';
import {createRef, useEffect, useState} from "react";
import {SolarObj3d} from "./objs";
import {coloredTexturedShadedFragment, coloredTexturedShadedVertex} from "./shaders";
import {mat4} from "gl-matrix"
import {load} from '@loaders.gl/core';
import {GLTFLoader} from '@loaders.gl/gltf/dist/es6';

type Buffers = {
    position: WebGLBuffer,
    color: WebGLBuffer,
    indices: WebGLBuffer,
    normal: WebGLBuffer,
    textureCoord: WebGLBuffer
}

type Program = {
    program: WebGLProgram,
    attribLocations: {
        vertexPosition: number,
        vertexColor: number,
        vertexNormal: number,
        textureCoord: number
    },
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation,
        modelViewMatrix: WebGLUniformLocation,
        normalMatrix: WebGLUniformLocation,
        uSampler: WebGLUniformLocation
    }
}

const DEFAULT_SCENE = "suzanne.gltf.json";

function App() {
    const canvasRef = createRef<HTMLCanvasElement>()
    const [running, setRunning] = useState(true)
    const [selectedScene, setSelectedScene] = useState(DEFAULT_SCENE)


    function loadMesh(which: number, model: any): SolarObj3d[] {
        let mesh = model.meshes[which]

        let meshes = [];
        for (let primitive of mesh.primitives) {
            let position = primitive.attributes.POSITION.value
            let indices = primitive.indices.value
            let normals = primitive.attributes.NORMAL.value
            let textureCoords = primitive.attributes.TEXCOORD_0.value
            let imageData = primitive?.material?.pbrMetallicRoughness?.baseColorTexture?.texture?.source?.image
            meshes.push({
                dim: 3,
                faces: position,
                colors: [],
                indices: indices,
                normals: normals,
                textureCoords: textureCoords,
                image: imageData
            })
        }
        return meshes
    }

    function createProgram(gl: WebGL2RenderingContext): Program {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader
        gl.shaderSource(vertexShader, coloredTexturedShadedVertex)
        gl.compileShader(vertexShader)

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader
        gl.shaderSource(fragmentShader, coloredTexturedShadedFragment)
        gl.compileShader(fragmentShader)

        const shaderProgram = gl.createProgram() as WebGLProgram
        gl.attachShader(shaderProgram, vertexShader)
        gl.attachShader(shaderProgram, fragmentShader)
        gl.linkProgram(shaderProgram)

        return {
            program: shaderProgram as WebGLProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
                vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
                textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix') as WebGLUniformLocation,
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix') as WebGLUniformLocation,
                normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix') as WebGLUniformLocation,
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler') as WebGLUniformLocation,
            },
        }
    }

    function createBuffers(items: SolarObj3d[], gl: WebGL2RenderingContext): Buffers[] {
        let buffers = [];
        for (let item of items) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(item.faces), gl.STATIC_DRAW);
            const colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(item.colors), gl.STATIC_DRAW);
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(item.indices), gl.STATIC_DRAW);
            const normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(item.normals),
                gl.STATIC_DRAW);
            const textureCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(item.textureCoords),
                gl.STATIC_DRAW);
            buffers.push({
                position: positionBuffer as WebGLBuffer,
                color: colorBuffer as WebGLBuffer,
                indices: indexBuffer as WebGLBuffer,
                normal: normalBuffer as WebGLBuffer,
                textureCoord: textureCoordBuffer as WebGLBuffer
            })
        }
        return buffers
    }

    function clear(gl: WebGL2RenderingContext) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clearDepth(1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }

    function createMatrices(gl: WebGL2RenderingContext) {
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        // @ts-ignore
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create()
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)
        const modelViewMatrix = mat4.create();
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        return {
            projectionMatrix,
            modelViewMatrix,
            normalMatrix
        }
    }

    function setPositionBuffer(item: SolarObj3d, gl: WebGL2RenderingContext, buffers: Buffers, program: Program) {

        const numComponents = item.dim;
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            program.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(program.attribLocations.vertexPosition);

    }

    function setColorBuffer(gl: WebGL2RenderingContext, buffers: Buffers, program: Program) {

        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            program.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            program.attribLocations.vertexColor);

    }

    function setNormalBuffer(gl: WebGL2RenderingContext, buffers: Buffers, programInfo: Program) {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal);
    }

    function setTextureBuffer(gl: WebGL2RenderingContext, buffers: Buffers, programInfo: Program) {

        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.textureCoord);

    }

    function isPowerOf2(value: number) {
        return (value & (value - 1)) === 0;
    }

    function drawFps(time: number, lastTime: number, ticks: number) {
        if (ticks % 10 === 0) {
            //@ts-ignore
            document.querySelector("#fps").innerHTML = (1000 / (time - lastTime)).toFixed(2);
        }
    }

    function loadTexture(items: SolarObj3d[], gl: WebGL2RenderingContext) {
        let textures = [];
        for (let item of items) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

            if (item.image !== undefined) {
                const image = item.image as ImageBitmap;
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);

                if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                    // Yes, it's a power of 2. Generate mips.
                    gl.generateMipmap(gl.TEXTURE_2D);
                } else {
                    // No, it's not a power of 2. Turn of mips and set
                    // wrapping to clamp to edge
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                }
            }
            textures.push(texture)
        }

        return textures;
    }

    useEffect(() => {
        if (!canvasRef.current) return;


        let lastTime = 0,
            ticks = 0,
            middleButtonDown = false,
            mouseXLast = 0,
            xRotation = 76,
            mouseYLast = 0,
            yRotation = 0,
            meshes: SolarObj3d[],
            buffers: Buffers[],
            zLocation = -6.0

        const gl = canvasRef.current.getContext('webgl2') as WebGL2RenderingContext
        gl.viewport(0, 0, canvasRef.current.width, canvasRef.current.height)
        const programInfo = createProgram(gl)

        function run(time: number) {
            clear(gl)
            const {projectionMatrix, modelViewMatrix, normalMatrix} = createMatrices(gl)

            mat4.translate(modelViewMatrix,     // destination matrix
                modelViewMatrix,     // matrix to translate
                [-0.0, 0.0, zLocation]);  // amount to translate
            mat4.rotate(modelViewMatrix,  // destination matrix
                modelViewMatrix,  // matrix to rotate
                yRotation / 15,     // amount to rotate in radians
                [1, 0, 0]);       // axis to rotate around (Z)
            mat4.rotate(modelViewMatrix,  // destination matrix
                modelViewMatrix,  // matrix to rotate
                xRotation / 15,// amount to rotate in radians
                [0, 1, 0]);       // axis to rotate around (X)

            for (let i = 0; i < buffers.length; i++) {
                gl.useProgram(programInfo.program);
                setPositionBuffer(meshes[i], gl, buffers[i], programInfo)
                setColorBuffer(gl, buffers[i], programInfo)
                setTextureBuffer(gl, buffers[i], programInfo)
                setNormalBuffer(gl, buffers[i], programInfo)

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[i].indices);

                gl.uniformMatrix4fv(
                    programInfo.uniformLocations.projectionMatrix,
                    false,
                    projectionMatrix);
                gl.uniformMatrix4fv(
                    programInfo.uniformLocations.modelViewMatrix,
                    false,
                    modelViewMatrix);
                gl.uniformMatrix4fv(
                    programInfo.uniformLocations.normalMatrix,
                    false,
                    normalMatrix);

                const vertexCount = meshes[i].indices.length;
                const type = gl.UNSIGNED_SHORT;
                const offset = 0;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }

            drawFps(time, lastTime, ticks)
            lastTime = time
            ticks += 1
            if (ticks > 5) ticks = 0;
            if (running) {
                requestAnimationFrame(run)
            }
        }

        (async () => {
            const data = await load(selectedScene, GLTFLoader);
            console.log(data)
            meshes = loadMesh(0, data)
            console.log(meshes)
            buffers = createBuffers(meshes, gl)
            loadTexture(meshes, gl)
            run(0)
        })()

        canvasRef.current.addEventListener("mousedown", (event) => {
            if (event.button === 1) {
                mouseXLast = event.clientX
                mouseYLast = event.clientY
                middleButtonDown = true
            }
            event.preventDefault()
        })

        canvasRef.current.addEventListener("mouseup", (event) => {
            if (event.button === 1) {
                middleButtonDown = false
            }
            event.preventDefault()
        })

        canvasRef.current.addEventListener("mousemove", (event) => {
            if (middleButtonDown) {
                xRotation += event.clientX - mouseXLast;
                mouseXLast = event.clientX
                yRotation += event.clientY - mouseYLast;
                mouseYLast = event.clientY;
            }
            event.preventDefault()
        })

        canvasRef.current.addEventListener("wheel", (event) => {
            zLocation -= event.deltaY * 0.01
            event.preventDefault()
        })

        return () => {
            setRunning(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef, running, selectedScene])

    return (
        <>
            <canvas width={1920} height={1080} className={css.canvas} ref={canvasRef}/>
            <span id={"fps"} className={css.fps}>0</span>
            <select className={css.selectBox} defaultValue={DEFAULT_SCENE} onChange={(event) => setSelectedScene(event.target.value)}>
                <option value={DEFAULT_SCENE}>Suzanne</option>
                <option value={"tank.gltf"}>Tank</option>
            </select>
        </>
    );
}

export default App;
