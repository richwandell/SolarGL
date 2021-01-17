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

export type Material = {
    textureCoords: number[],
    imageData: ImageData | undefined
}

export type SolarMeshPrimitive = {
    dim: number,
    faces: number[],
    colors: number[],
    indices: number[],
    normals: number[],
    materials: Material[],
    buffers: Buffers | undefined
}

export type SolarMesh = {
    id: string,
    name: string,
    primitives: SolarMeshPrimitive[]
}
