import SolarMesh from "../SolarMesh";
import {SolarMeshPrimitive, SolarObject} from "../types";
import Solar from "../Solar";

export default async function loadScene (solar: Solar, sceneName: string, data: any): Promise<{meshes: SolarMesh[], otherObjects: SolarObject[]}> {
    let meshes: SolarMesh[] = [];
    let otherObjects: SolarObject[] = [];

    const scene = data.scenes.find((s: any) => s.name === sceneName);

    for (let i = 0; i < scene.nodes.length; i++) {
        const item = scene.nodes[i];
        const id = item.id;
        const name = item.name;
        if (item.mesh !== undefined) {
            let primitives: SolarMeshPrimitive[] = [];
            for (let primitive of item.mesh.primitives) {
                let shader = "textured";
                let position = primitive.attributes.POSITION.value
                let indices = primitive.indices.value
                let normals = primitive.attributes.NORMAL.value
                let colors: number[] = [];
                if (primitive?.material?.pbrMetallicRoughness?.baseColorFactor) {
                    let cf = primitive?.material?.pbrMetallicRoughness?.baseColorFactor;
                    colors = cf
                }

                let materials = [];
                if (primitive?.material?.pbrMetallicRoughness?.baseColorTexture) {
                    let textCoordKey = "TEXCOORD_" + primitive?.material?.pbrMetallicRoughness?.baseColorTexture.texCoord
                    materials.push({
                        textureCoords: primitive.attributes[textCoordKey].value,
                        imageData: primitive?.material?.pbrMetallicRoughness?.baseColorTexture?.texture?.source?.image,
                        texture: undefined
                    })
                } else if (primitive?.material?.pbrMetallicRoughness?.baseColorFactor) {
                    let textCoordKey = "TEXCOORD_0"
                    let typed = new Uint8ClampedArray(500 * 500 * 4)
                    for (let i = 0; i < typed.length; i += 4) {
                        typed[i] = colors[0] * 255;    // R value
                        typed[i + 1] = colors[1] * 255;  // G value
                        typed[i + 2] = colors[2] * 255;    // B value
                        typed[i + 3] = colors[3] * 255;  // A value
                    }
                    let imageData = new ImageData(typed, 500, 500);
                    const bitmap = await createImageBitmap(imageData)
                    materials.push({
                        textureCoords: primitive.attributes[textCoordKey].value,
                        imageData: bitmap,
                        texture: undefined
                    })
                } else {
                    let textCoordKey = "TEXCOORD_0"
                    let typed = new Uint8ClampedArray(500 * 500 * 4)
                    for (let i = 0; i < typed.length; i += 4) {
                        typed[i] = 0;    // R value
                        typed[i + 1] = 0;  // G value
                        typed[i + 2] = 255;    // B value
                        typed[i + 3] = 255;  // A value
                    }
                    let imageData = new ImageData(typed, 500, 500);
                    const bitmap = await createImageBitmap(imageData)
                    materials.push({
                        textureCoords: primitive.attributes[textCoordKey].value,
                        imageData: bitmap,
                        texture: undefined
                    })
                }
                primitives.push({
                    shader,
                    dim: 3,
                    faces: position,
                    colors,
                    indices,
                    normals,
                    materials,
                    buffers: undefined,
                    program: undefined
                })
            }
            meshes.push(new SolarMesh(solar, id, name, primitives))
        } else {
            otherObjects.push(item)
        }
    }
    return {meshes, otherObjects};
}
