import {SolarMeshPrimitive} from "./types";

class SolarMesh {

    private id: string;
    private name: string;
    public primitives: SolarMeshPrimitive[];
    public buffers: WebGLBuffer[] = [];

    constructor(id: string, name: string, primitives: SolarMeshPrimitive[]) {
        this.id = id;
        this.name = name;
        this.primitives = primitives;
    }
}

export default SolarMesh;
