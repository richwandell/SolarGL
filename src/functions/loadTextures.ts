import SolarMesh from "../SolarMesh";



export default function loadTextures(items: SolarMesh[], gl: WebGL2RenderingContext) {
    for (let item of items) {
        for(let primative of item.primitives) {
            for (let mat of primative.materials) {
                const texture = gl.createTexture();
                mat.texture = texture as WebGLTexture
            }
        }
    }
}
