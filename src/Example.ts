import Solar from "./Solar";
import SolarMesh from "./SolarMesh";
import {Cube} from "./objs";

class Example extends Solar {

    private selectedScene: string;
    private keysDown = {
        left: false,
        right: false,
        up: false,
        down: false
    }
    private mouseData: { clickStartPos: number[], mouseDown: boolean } = {
        clickStartPos: [],
        mouseDown: false
    }
    private character: SolarMesh;
    private lastTime = 0;
    private ticks = 0;

    constructor(canvas: HTMLCanvasElement, selectedScene: string) {
        super(canvas);
        this.selectedScene = selectedScene;
        this.character = new SolarMesh(this, "cube", "cube", [Cube])
    }

    private drawFps(time: number) {
        if (this.ticks % 10 === 0) {
            //@ts-ignore
            document.querySelector("#fps").innerHTML = (1000 / (time -  this.lastTime)).toFixed(2);
        }
    }

    private tick(time: number) {
        this.drawFps(time)
        this.lastTime = time
        this.ticks += 1
        if ( this.ticks > 5)  this.ticks = 0;

        if (this.keysDown.left) {
            this.character.location.x -= .05;
        }
        if (this.keysDown.right) {
            this.character.location.x += .05;
        }
    }

    async start() {
        await this.loadScene("Scene", this.selectedScene)
        let characterMeshName;
        this.camera = this.getCamera()

        if (this.selectedScene.endsWith("suzanne.gltf")) {
            this.camera.translation = [0, 0, -20]
            characterMeshName = "Suzanne";
        } else if (this.selectedScene.endsWith("tank.gltf")) {
            this.camera.translation = [0, 0, -20]
            characterMeshName = "Hull";
        } else if (this.selectedScene.endsWith("bottle.gltf")) {
            this.camera.translation = [0, 0, -20]
            characterMeshName = "Circle";
        } else if (this.selectedScene.endsWith("stewarts-antique-record-player.gltf")) {
            this.camera.translation = [0, -.5, -2]
            characterMeshName = "Antique_Record_Player";
        } else if (this.selectedScene.endsWith("woman.gltf")) {
            characterMeshName = "Girl";
        } else {
            characterMeshName = "Thing"
        }

        this.character = this.getMesh(characterMeshName)

        let light = this.getLight("Light")

        this.addLight(light)

        this.addEventListener("keydown", "ArrowLeft", (app: Solar, event: any) => {
            this.keysDown.left = true
        })

        this.addEventListener("keyup", "ArrowLeft", (app: Solar, event: any) => {
            this.keysDown.left = false
        })

        this.addEventListener("keydown", "ArrowRight", (app: Solar, event: any) => {
            this.keysDown.right = true
        })

        this.addEventListener("keyup", "ArrowRight", (app: Solar, event: any) => {
            this.keysDown.right = false
        })

        this.addEventListener("mousedown", 0, (app: Solar, event: MouseEvent) => {
            this.mouseData.mouseDown = true;
            this.mouseData.clickStartPos = [event.clientX, event.clientY]
        })

        this.addEventListener("mouseup", 0, (app: any, event: any) => {
            this.mouseData.mouseDown = false;
            this.mouseData.clickStartPos = [0, 0]
        })

        this.addEventListener("mousemove", 0, (app: any, event: any) => {
            if (this.mouseData.mouseDown) {
                let fac = 1250
                let distance = Math.abs(event.clientY - this.mouseData.clickStartPos[1]) / fac
                if (event.clientY > this.mouseData.clickStartPos[1]) {
                    this.character.rotation.y += distance;
                } else {
                    this.character.rotation.y -= distance;
                }

                distance = Math.abs(event.clientX - this.mouseData.clickStartPos[0]) / fac
                if (event.clientX > this.mouseData.clickStartPos[0]) {
                    this.character.rotation.x += distance;
                } else {
                    this.character.rotation.x -= distance;
                }
            } else {
                light.location.x = event.clientX;
                light.location.y = event.clientY;
            }

        })

        this.addEventListener("wheel", 0, (app: Solar, event: WheelEvent) => {
            this.camera.translation[2] -= event.deltaY * 0.01
        })

        this.onTick(this.tick.bind(this))

        super.start()
    }
}

export default Example;
