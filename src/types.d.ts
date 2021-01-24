export type Buffers = {
    position: WebGLBuffer,
    color: WebGLBuffer,
    indices: WebGLBuffer,
    normal: WebGLBuffer,
    texCoords: WebGLBuffer[]
}

export type TexturedProgram = {
    program: WebGLProgram,
    attribLocations: {
        vertexPosition: number,
        vertexNormal: number,
        textureCoord: number
    },
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation,
        modelViewMatrix: WebGLUniformLocation,
        normalMatrix: WebGLUniformLocation,
        uSampler: WebGLUniformLocation,
        ambientLight: WebGLUniformLocation,
        directionalVector: WebGLUniformLocation
    }
}

export type ColoredProgram = {
    program: WebGLProgram,
    attribLocations: {
        vertexPosition: number,
        vertexColor: number,
        vertexNormal: number
    },
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation,
        modelViewMatrix: WebGLUniformLocation,
        normalMatrix: WebGLUniformLocation
    }
}

export type TextureMaterial = {
    textureCoords: number[],
    imageData: ImageBitmap | undefined,
    texture: WebGLTexture | undefined
}

export type ColorMaterial = {
    baseColor: number[],
    metalicFactor: number,
    roughnessFactor: number,
    texture: WebGLTexture | undefined
}

export type SolarMeshPrimitive = {
    shader: string,
    dim: number,
    faces: number[],
    colors: number[],
    indices: number[],
    normals: number[],
    materials: (TextureMaterial|ColorMaterial)[],
    buffers: Buffers | undefined,
    program: TexturedProgram | undefined
}

export type SolarObject = {
    id: string,
    name: string,
    rotation: number[],
    translation: number[]
}
