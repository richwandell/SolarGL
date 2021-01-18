import SolarMesh from "../SolarMesh";

function isPowerOf2(value: number) {
    return (value & (value - 1)) === 0;
}

export default function loadTextures(items: SolarMesh[], gl: WebGL2RenderingContext) {
    for (let item of items) {
        for(let primative of item.primitives) {
            for (let mat of primative.materials) {
                const texture = gl.createTexture();
                // gl.bindTexture(gl.TEXTURE_2D, texture);
                // gl.texImage2D(
                //     gl.TEXTURE_2D,
                //     0,
                //     gl.RGBA, // internal format
                //     1,
                //     1,
                //     0,
                //     gl.RGBA, // src format
                //     gl.UNSIGNED_BYTE, //src type
                //     new Uint8Array([0, 0, 255, 255]) // opaque blue
                // );
                //
                // if ("imageData" in mat && mat.imageData !== undefined) {
                //     const image = mat.imageData as ImageBitmap;
                //     gl.bindTexture(gl.TEXTURE_2D, texture);
                //     gl.texImage2D(
                //         gl.TEXTURE_2D,
                //         0,
                //         gl.RGBA, // internal format
                //         gl.RGBA, // src format
                //         gl.UNSIGNED_BYTE, //src type
                //         image
                //     );
                //
                //     if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                //         // Yes, it's a power of 2. Generate mips.
                //         gl.generateMipmap(gl.TEXTURE_2D);
                //     } else {
                //         // No, it's not a power of 2. Turn of mips and set
                //         // wrapping to clamp to edge
                //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                //     }
                // }
                mat.texture = texture as WebGLTexture
            }
        }
    }
}
