import {SolarMeshPrimitive} from "./types";
import Solar from "./Solar";

class SolarMesh {

    public readonly id: string;
    public readonly name: string;
    public primitives: SolarMeshPrimitive[];

    public location: {x: number, y: number, z: number} = {x: 0, y: 0, z: 0}
    public rotation: {x: number, y: number, z: number} = {x: 0, y: 0, z: 0}
    private solar: Solar;

    constructor(solar: Solar, id: string, name: string, primitives: SolarMeshPrimitive[]) {
        this.solar = solar;
        this.id = id;
        this.name = name;
        this.primitives = primitives;
    }
}

export default SolarMesh;
