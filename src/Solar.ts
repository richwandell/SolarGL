import {mat4, vec3} from "gl-matrix";
import {ColoredProgram, SolarMeshPrimitive, SolarObject, TexturedProgram} from "./types";
import {load} from "@loaders.gl/core";
import {GLBLoader, GLTFLoader} from "@loaders.gl/gltf/dist/es6";
import loadScene from "./functions/loadScene";
import SolarMesh from "./SolarMesh";
import createBuffers from "./functions/createBuffers";
import loadTextures from "./functions/loadTextures";
import createPrograms from "./functions/createPrograms";
import Listener from "./Listener";
import SolarLight from "./SolarLight";
import {Cube} from "./objs";


class Solar extends Listener {

    private readonly canvas: HTMLCanvasElement;
    private readonly gl: WebGL2RenderingContext;
    private meshes: SolarMesh[] = [];
    private eventListeners: {[key: string]: Function} = {}
    private running: boolean = false;
    private objects: SolarObject[] = [];
    protected camera: SolarObject;
    protected lights: SolarLight[] = [];

    constructor(canvas: HTMLCanvasElement) {
        super(canvas as HTMLElement);
        this.canvas = canvas
        this.gl = canvas.getContext('webgl2') as WebGL2RenderingContext
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)

        this.camera = {
            id: "",
            name: "",
            rotation: [0,0,0,0],
            translation: [0,0,-20.0]
        }
    }

    public onTick(handler: Function) {
        this.eventListeners["tick"] = handler
    }

    private quatToEul(quat: number[]) {
        const q0 = quat[0];
        const q1 = quat[1];
        const q2 = quat[2];
        const q3 = quat[3];

        const Rx = Math.atan2(2 * (q0 * q1 + q2 * q3), 1 - (2 * (q1 * q1 + q2 * q2)));
        const Ry = Math.asin(2 * (q0 * q2 - q3 * q1));
        const Rz = Math.atan2(2 * (q0 * q3 + q1 * q2), 1 - (2  * (q2 * q2 + q3 * q3)));

        const euler = [Rx, Ry, Rz];
        return euler;
    }

    destroy() {
        this.running = false;
        super.destroy()
    }

    public async loadScene(sceneName: string, file: string) {
        const data = await load(file, file.endsWith(".glb") ? GLBLoader : GLTFLoader);
        console.log(data)
        const scene = await loadScene(this, sceneName, data)
        this.meshes = scene.meshes
        this.objects = scene.otherObjects
        createPrograms(this.meshes, this.gl)
        createBuffers(this.meshes, this.gl)
        loadTextures(this.meshes, this.gl)
    }

    public getMesh(name: string): SolarMesh {
        return this.meshes.find(x => x.name === name) as SolarMesh
    }

    public getLight(name: string): SolarLight {
        let lightObj = this.objects.find(x => x.name === name) as SolarObject

        if (lightObj !== undefined) {
            return new SolarLight(
                this,
                new SolarMesh(this, "cube", "cube", [Cube]),
                {
                    x: lightObj.translation[0],
                    y: lightObj.translation[1],
                    z: lightObj.translation[2]
                },
                {
                    x: lightObj.rotation[0],
                    y: lightObj.rotation[1],
                    z: lightObj.rotation[2],
                    w: lightObj.rotation[3],
                }
            )
        } else {
            return new SolarLight(
                this,
                new SolarMesh(this, "cube", "cube", [Cube]),
                {
                    x: 0,
                    y: 0,
                    z: 0
                },
                {
                    x: 0,
                    y: 0,
                    z: 0,
                    w: 0,
                }
            )
        }
    }

    public addLight(light: SolarLight) {
        this.lights.push(light)
    }

    public getCamera(name?: string|null): SolarObject {
        let cam = this.objects.find(x => x.name === name) as SolarObject

        if (cam !== undefined) {
            return cam;
        }
        return this.camera;
    }

    public setCamera(object: SolarObject) {
        this.camera = object;
    }

    private clear() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
        this.gl.clearDepth(1.0)
        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.depthFunc(this.gl.LEQUAL)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    }

    private createProjectionMatrix() {
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        // @ts-ignore
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create()
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

        mat4.translate(projectionMatrix,     // destination matrix
            projectionMatrix,     // matrix to translate
            [this.camera.translation[0], this.camera.translation[1], this.camera.translation[2]]);  // amount to translate

        mat4.rotate(projectionMatrix,  // destination matrix
            projectionMatrix,  // matrix to rotate
            this.camera.rotation[0] * .5,     // amount to rotate in radians
            [1, 0, 0]);       // axis to rotate around (Z)

        mat4.rotate(projectionMatrix,  // destination matrix
            projectionMatrix,  // matrix to rotate
            this.camera.rotation[1] * .5,// amount to rotate in radians
            [0, 1, 0]);       // axis to rotate around (X)

        mat4.rotate(projectionMatrix,  // destination matrix
            projectionMatrix,  // matrix to rotate
            this.camera.rotation[2] * .5,// amount to rotate in radians
            [0, 0, 1]);       // axis to rotate around (X)


        return projectionMatrix;
    }

    private createModelViewMatrix(mesh: SolarMesh) {
        const modelViewMatrix = mat4.create()

        mat4.translate(modelViewMatrix,
            modelViewMatrix,
            [mesh.location.x, mesh.location.y, mesh.location.z]);

        mat4.rotate(modelViewMatrix,  // destination matrix
            modelViewMatrix,  // matrix to rotate
            mesh.rotation.y * .5,     // amount to rotate in radians
            [1, 0, 0]);       // axis to rotate around (Z)

        mat4.rotate(modelViewMatrix,  // destination matrix
            modelViewMatrix,  // matrix to rotate
            mesh.rotation.x * .5,// amount to rotate in radians
            [0, 1, 0]);       // axis to rotate around (X)

        mat4.rotate(modelViewMatrix,  // destination matrix
            modelViewMatrix,  // matrix to rotate
            mesh.rotation.z * .5,// amount to rotate in radians
            [0, 0, 1]);       // axis to rotate around (X)
        return modelViewMatrix;
    }

    private setPositionBuffer(item: SolarMeshPrimitive, buffer: WebGLBuffer, program: ColoredProgram|TexturedProgram) {
        const numComponents = item.dim;
        const type = this.gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(
            program.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        this.gl.enableVertexAttribArray(program.attribLocations.vertexPosition);
    }

    private setNormalBuffer(buffer: WebGLBuffer, program: ColoredProgram|TexturedProgram) {
        const numComponents = 3;
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(
            program.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        this.gl.enableVertexAttribArray(
            program.attribLocations.vertexNormal);
    }

    private setTextureBuffer(buffer: WebGLBuffer, program: TexturedProgram) {
        const numComponents = 2;
        const type = this.gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.vertexAttribPointer(
            program.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        this.gl.enableVertexAttribArray(
            program.attribLocations.textureCoord);
    }

    private isPowerOf2(value: number) {
        return (value & (value - 1)) === 0;
    }

    private drawMaterials(prim: SolarMeshPrimitive, program: TexturedProgram) {
        const gl = this.gl;
        let mat = prim.materials[0];
        if ("imageData" in mat) {
            const image = mat.imageData as ImageBitmap;
            gl.bindTexture(gl.TEXTURE_2D, mat.texture as WebGLTexture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA, // internal format
                gl.RGBA, // src format
                gl.UNSIGNED_BYTE, //src type
                image
            );

            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
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

        this.setTextureBuffer(prim.buffers?.texCoords[0] as WebGLBuffer, program as TexturedProgram)
    }

    private render(time: number) {
        const gl = this.gl;
        this.clear()

        // camera matrix
        const projectionMatrix = this.createProjectionMatrix()

        // const ambientLight = vec3.fromValues(0.3, 0.3, 0.3)
        // const directionalVector = vec3.fromValues(0.85, 0.8, 0.75)

        const ambientLight = vec3.fromValues(0.1, 0.1, 0.1)
        let directionalVector = [0.85, 0.8, 0]

        for(let light of this.lights) {
            directionalVector[0] = light.location.x;
            directionalVector[1] = this.canvas.height - light.location.y;
            // directionalVector[2] = light.location.z;
        }

        for(let mesh of this.meshes) {
            const modelViewMatrix = this.createModelViewMatrix(mesh)

            for (let i = 0; i < mesh.primitives.length; i++) {
                const prim = mesh.primitives[i];
                if (prim.program === undefined) continue;

                let program = prim.program;

                gl.useProgram(program.program);
                this.setPositionBuffer(prim, prim.buffers?.position as WebGLBuffer, program)

                const normalMatrix = mat4.create();
                mat4.invert(normalMatrix, modelViewMatrix);
                mat4.transpose(normalMatrix, normalMatrix);

                this.setNormalBuffer(prim.buffers?.normal as WebGLBuffer, program)
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prim.buffers?.indices as WebGLBuffer);

                this.drawMaterials(prim, program as TexturedProgram)

                gl.uniform3fv(program.uniformLocations.ambientLight, ambientLight)

                gl.uniform3fv(program.uniformLocations.directionalVector, directionalVector)

                gl.uniformMatrix4fv(
                    program.uniformLocations.projectionMatrix,
                    false,
                    projectionMatrix);

                gl.uniformMatrix4fv(
                    program.uniformLocations.modelViewMatrix,
                    false,
                    modelViewMatrix);

                gl.uniformMatrix4fv(
                    program.uniformLocations.normalMatrix,
                    false,
                    normalMatrix);

                gl.enable(gl.SAMPLE_COVERAGE);
                gl.enable(gl.DEPTH_TEST)
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
                gl.sampleCoverage(1.0, false);

                const vertexCount = mesh.primitives[i].indices.length;
                const type = gl.UNSIGNED_SHORT;
                const offset = 0;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
        }

        if ("tick" in this.eventListeners) {
            this.eventListeners["tick"](time)
        }

        if (this.running) {
            requestAnimationFrame(this.render.bind(this))
        }
    }

    start() {
        this.running = true;
        this.render(0)
    }
}

export default Solar;
