import SolarMesh from "../SolarMesh";

export default function createBuffers(items: SolarMesh[], gl: WebGL2RenderingContext) {
    for (let mesh of items) {
        for (let prim of mesh.primitives) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(prim.faces), gl.STATIC_DRAW);

            const colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(prim.colors), gl.STATIC_DRAW);

            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(prim.indices), gl.STATIC_DRAW);

            const normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(prim.normals), gl.STATIC_DRAW);

            let texCoords: WebGLBuffer[] = [];
            for (let mat of prim.materials) {
                if ("textureCoords" in mat) {
                    const textureCoordBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mat.textureCoords), gl.STATIC_DRAW);
                    texCoords.push(textureCoordBuffer as WebGLBuffer)
                }
            }

            prim.buffers = {
                position: positionBuffer as WebGLBuffer,
                color: colorBuffer as WebGLBuffer,
                indices: indexBuffer as WebGLBuffer,
                normal: normalBuffer as WebGLBuffer,
                texCoords: texCoords as WebGLBuffer[]
            }
        }
    }
}
