import {ColoredProgram, TexturedProgram} from "../types";
import SolarMesh from "../SolarMesh";

const FragmentTextured = require("!!raw-loader!../shaders/FragmentTextured.frag").default;
const VertexTextured = require("!!raw-loader!../shaders/VertexTextured.vert").default;
const FragmentColored = require("!!raw-loader!../shaders/FragmentColored.frag").default;
const VertexColored = require("!!raw-loader!../shaders/VertexColored.vert").default;

function createColored(gl: WebGL2RenderingContext): ColoredProgram {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader
    gl.shaderSource(vertexShader, VertexColored)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader
    gl.shaderSource(fragmentShader, FragmentColored)
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
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal')
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix') as WebGLUniformLocation,
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix') as WebGLUniformLocation,
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix') as WebGLUniformLocation,
        },
    }
}

function createTextured(gl: WebGL2RenderingContext): TexturedProgram {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader
    gl.shaderSource(vertexShader, VertexTextured)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader
    gl.shaderSource(fragmentShader, FragmentTextured)
    gl.compileShader(fragmentShader)

    const shaderProgram = gl.createProgram() as WebGLProgram
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    return {
        program: shaderProgram as WebGLProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix') as WebGLUniformLocation,
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix') as WebGLUniformLocation,
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix') as WebGLUniformLocation,
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler') as WebGLUniformLocation,
            ambientLight: gl.getUniformLocation(shaderProgram, 'uAmbientLight') as WebGLUniformLocation,
            directionalVector: gl.getUniformLocation(shaderProgram, 'uDirectionalVector') as WebGLUniformLocation,
        },
    };
}


export default function createPrograms(items: SolarMesh[], gl: WebGL2RenderingContext) {
    for (let item of items) {
        for (let primative of item.primitives) {
            if (primative.shader === "colored") {
                primative.program = createColored(gl)
            } else {
                primative.program = createTextured(gl)
            }
        }
    }
}
