import SolarMesh from "./SolarMesh";
import Solar from "./Solar";
import {Cube} from "./objs";

class SolarLight {

    private mesh: SolarMesh
    private solar: Solar;
    public location: { x: number; y: number; z: number };
    public rotation: { x: number; y: number; z: number; w: number };

    constructor(
        solar: Solar,
        mesh: SolarMesh = new SolarMesh(solar, "cube", "cube", [Cube]),
        location: { x: number; y: number; z: number },
        rotation: { x: number; y: number; z: number; w: number }
    ) {
        this.mesh = mesh;
        this.solar = solar;
        this.location = location;
        this.rotation = rotation;
    }
}

export default SolarLight;
