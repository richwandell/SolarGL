export type Buffers = {
    position: WebGLBuffer,
    color: WebGLBuffer,
    indices: WebGLBuffer,
    normal: WebGLBuffer,
    textureCoord: WebGLBuffer
}

export type Program = {
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