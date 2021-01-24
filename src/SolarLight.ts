import SolarMesh from "./SolarMesh";
import Solar from "./Solar";
import {Cube} from "./objs";

class SolarLight {
    public mesh: SolarMesh
    private solar: Solar;

    constructor(
        solar: Solar,
        mesh: SolarMesh = new SolarMesh(solar, "cube", "cube", [Cube]),
        location: { x: number; y: number; z: number },
        rotation: { x: number; y: number; z: number; w: number }
    ) {
        this.mesh = mesh;
        this.solar = solar;
        this.mesh.location = location;
        this.mesh.rotation = rotation;
    }

    get location(): { x: number; y: number; z: number } {
        return this.mesh.location;
    }

    set location(value: { x: number; y: number; z: number }) {
        this.mesh.location = value;
    }

    get rotation(): { x: number; y: number; z: number; w: number } {
        return this.mesh.rotation;
    }

    set rotation(value: { x: number; y: number; z: number; w: number }) {
        this.mesh.rotation = value;
    }
}

export default SolarLight;
