import css from './App.module.css';
import {createRef, useEffect, useState} from "react";
import {square, cube, SolarObj3d} from "./objs";
import {coloredFragment, simpleVertexColored} from "./shaders";
import {mat4} from "gl-matrix"
import {load} from '@loaders.gl/core';
import {GLTFLoader} from '@loaders.gl/gltf/dist/es6';

type Buffers = {
    position: WebGLBuffer,
    color: WebGLBuffer,
    indices: WebGLBuffer
}

type Program = {
    program: WebGLProgram,
    attribLocations: {
        vertexPosition: number,
        vertexColor: number
    },
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation,
        modelViewMatrix: WebGLUniformLocation
    }
}

function App() {
    const canvasRef = createRef<HTMLCanvasElement>()
    const [running, setRunning] = useState(true)

    function createProgram(gl: WebGL2RenderingContext): Program {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader
        gl.shaderSource(vertexShader, simpleVertexColored)
        gl.compileShader(vertexShader)

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader
        gl.shaderSource(fragmentShader, coloredFragment)
        gl.compileShader(fragmentShader)

        const shaderProgram = gl.createProgram() as WebGLProgram
        gl.attachShader(shaderProgram, vertexShader)
        gl.attachShader(shaderProgram, fragmentShader)
        gl.linkProgram(shaderProgram)

        return {
            program: shaderProgram as WebGLProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor')
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix') as WebGLUniformLocation,
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix') as WebGLUniformLocation,
            },
        }
    }

    function createBuffers(item: SolarObj3d, gl: WebGL2RenderingContext): Buffers {
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
        return {
            position: positionBuffer as WebGLBuffer,
            color: colorBuffer as WebGLBuffer,
            indices: indexBuffer as WebGLBuffer,
        };
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
        return {
            projectionMatrix,
            modelViewMatrix
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

    function drawFps(time: number, lastTime: number, ticks: number) {
        if (ticks % 10 === 0) {
            //@ts-ignore
            document.querySelector("#fps").innerHTML = (1000 / (time - lastTime)).toFixed(2);
        }
    }

    useEffect(() => {
        if (!canvasRef.current) return;

        const gl = canvasRef.current.getContext('webgl') as WebGL2RenderingContext
        const programInfo = createProgram(gl)
        const buffers = createBuffers(cube, gl)
        let suzanne: any;

        let lastTime = 0;
        let rotation = 0.0;
        let ticks = 0;
        const run = (time: number) => {
            clear(gl)
            const {projectionMatrix, modelViewMatrix} = createMatrices(gl)

            mat4.translate(modelViewMatrix,     // destination matrix
                modelViewMatrix,     // matrix to translate
                [-0.0, 0.0, -6.0]);  // amount to translate
            mat4.rotate(modelViewMatrix,  // destination matrix
                modelViewMatrix,  // matrix to rotate
                rotation,     // amount to rotate in radians
                [0, 0, 1]);       // axis to rotate around (Z)
            mat4.rotate(modelViewMatrix,  // destination matrix
                modelViewMatrix,  // matrix to rotate
                rotation * .7,// amount to rotate in radians
                [0, 1, 0]);       // axis to rotate around (X)

            setPositionBuffer(cube, gl, buffers, programInfo)
            setColorBuffer(gl, buffers, programInfo)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            gl.useProgram(programInfo.program);

            gl.uniformMatrix4fv(
                programInfo.uniformLocations.projectionMatrix,
                false,
                projectionMatrix);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.modelViewMatrix,
                false,
                modelViewMatrix);

            {
                const vertexCount = 36;
                const type = gl.UNSIGNED_SHORT;
                const offset = 0;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }


            const deltaTime = (time - lastTime) * 0.001;
            rotation += deltaTime
            drawFps(time, lastTime, ticks)
            lastTime = time
            ticks += 1
            if (ticks > 5) ticks = 0;
            if (running) {
                requestAnimationFrame(run)
            }
        }

        (async () => {
            suzanne = await load("untitled.gltf", GLTFLoader);

            console.log(suzanne)
            run(0)
        })()


        return () => {
            setRunning(false)
        }
    }, [canvasRef, running])

    return (
        <>
            <span id={"fps"}>0</span>
            <canvas className={css.canvas} ref={canvasRef}/>
        </>
    );
}

export default App;
