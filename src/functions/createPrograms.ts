import {ColoredProgram, TexturedProgram} from "../types";
import {
    coloredFragment,
    coloredTexturedShadedFragment,
    coloredTexturedShadedVertex,
    simpleVertexColored
} from "../shaders";
import SolarMesh from "../SolarMesh";

function createColored(gl: WebGL2RenderingContext): ColoredProgram {
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
            primative.program = createTextured(gl)
        }
    }
}
