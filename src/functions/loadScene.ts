import SolarMesh from "../SolarMesh";
import {SolarMeshPrimitive} from "../types";


export default function loadScene (data: any): {meshes: SolarMesh[]} {
    let meshes: SolarMesh[] = [];
    for (let i = 0; i < data.nodes.length; i++) {
        const item = data.nodes[i];
        const id = item.id;
        const name = item.name;
        if (item.mesh !== undefined) {
            let primitives: SolarMeshPrimitive[] = [];
            for (let primitive of item.mesh.primitives) {
                let position = primitive.attributes.POSITION.value
                let indices = primitive.indices.value
                let normals = primitive.attributes.NORMAL.value
                let materials = [];
                if (primitive?.material?.pbrMetallicRoughness?.baseColorTexture) {
                    let textCoordKey = "TEXCOORD_" + primitive?.material?.pbrMetallicRoughness?.baseColorTexture.texCoord
                    materials.push({
                        textureCoords: primitive.attributes[textCoordKey].value,
                        imageData: primitive?.material?.pbrMetallicRoughness?.baseColorTexture?.texture?.source?.image
                    })
                }
                primitives.push({
                    dim: 3,
                    faces: position,
                    colors: [],
                    indices: indices,
                    normals: normals,
                    materials: materials,
                    buffers: undefined
                })
            }
            meshes.push(new SolarMesh(id, name, primitives))
        }
    }
    return {meshes};
}
