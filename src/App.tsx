import css from "./App.module.css";
import {createRef, useEffect, useState} from "react";
import Solar from "./Solar";
import SolarMesh from "./SolarMesh";

const DEFAULT_SCENE = "scenes/suzanne/suzanne.gltf";

function App() {

    const canvasRef = createRef<HTMLCanvasElement>()
    const [selectedScene, setSelectedScene] = useState(DEFAULT_SCENE)

    function drawFps(time: number, lastTime: number, ticks: number) {
        if (ticks % 10 === 0) {
            //@ts-ignore
            document.querySelector("#fps").innerHTML = (1000 / (time - lastTime)).toFixed(2);
        }
    }

    async function start(app: Solar) {
        await app.loadScene("Scene", selectedScene)
        let characterMeshName;
        const camera = app.getCamera()

        if(selectedScene.endsWith("suzanne.gltf")){
            camera.translation = [0, 0, -20]
            characterMeshName = "Suzanne";
        } else if (selectedScene.endsWith("tank.gltf")) {
            camera.translation = [0, 0, -20]
            characterMeshName = "Hull";
        } else if (selectedScene.endsWith("bottle.gltf")) {
            camera.translation = [0, 0, -20]
            characterMeshName = "Circle";
        } else {
            camera.translation = [0, -.5, -2]
            characterMeshName = "Antique_Record_Player";
        }
        app.setCamera(camera)
        const character = app.getMesh(characterMeshName)


        const keysDown = {
            left: false,
            right: false,
            up: false,
            down: false
        }

        app.addEventListener("keydown", "ArrowLeft", (suzanne: SolarMesh, event: any) => {
            keysDown.left = true
        })

        app.addEventListener("keyup", "ArrowLeft", (suzanne: SolarMesh, event: any) => {
            keysDown.left = false
        })

        app.addEventListener("keydown", "ArrowRight", (suzanne: SolarMesh, event: any) => {
            keysDown.right = true
        })

        app.addEventListener("keyup", "ArrowRight", (suzanne: SolarMesh, event: any) => {
            keysDown.right = false
        })

        const mouseData: {clickStartPos: number[], mouseDown: boolean} = {
            clickStartPos: [],
            mouseDown: false
        }

        app.addEventListener("mousedown", 0, (app: any, event: MouseEvent) => {
            mouseData.mouseDown = true;
            mouseData.clickStartPos = [event.clientX, event.clientY]
        })

        app.addEventListener("mouseup", 0, (app: any, event: any) => {
            mouseData.mouseDown = false;
            mouseData.clickStartPos = [0, 0]
        })

        app.addEventListener("mousemove", 0, (app: any, event: any) => {
            if (mouseData.mouseDown) {
                let fac = 1250
                let distance = Math.abs(event.clientY - mouseData.clickStartPos[1]) / fac
                if (event.clientY > mouseData.clickStartPos[1]) {
                    character.rotation.y += distance;
                } else {
                    character.rotation.y -= distance;
                }

                distance = Math.abs(event.clientX - mouseData.clickStartPos[0]) / fac
                if (event.clientX > mouseData.clickStartPos[0]) {
                    character.rotation.x += distance;
                } else {
                    character.rotation.x -= distance;
                }
            }
        })

        app.addEventListener("wheel", 0, (app: Solar, event: WheelEvent) => {
            camera.translation[2] -= event.deltaY * 0.01
        })

        let ticks = 0, lastTime = 0;
        app.onTick((time: number) => {
            drawFps(time, lastTime, ticks)
            lastTime = time
            ticks += 1
            if (ticks > 5) ticks = 0;

            if (keysDown.left) {
                character.location.x -= .05;
            }
            if (keysDown.right) {
                character.location.x += .05;
            }
        })

        app.start()
    }

    useEffect(() => {
        if (canvasRef.current === undefined) return;
        const app = new Solar(canvasRef.current as HTMLCanvasElement);
        start(app)

        return () => {
            app.destroy()
        }
    }, [canvasRef, selectedScene])

    return (
        <>
            <canvas width={1920} height={1080} className={css.canvas} ref={canvasRef}/>
            <span id={"fps"} className={css.fps}>0</span>
            <select className={css.selectBox} defaultValue={DEFAULT_SCENE} onChange={(event) => setSelectedScene(event.target.value)}>
                <option value={DEFAULT_SCENE}>Suzanne</option>
                <option value={"scenes/tank/tank.gltf"}>Tank</option>
                <option value={"scenes/bottle/bottle.gltf"}>Bottle</option>
                <option value={"scenes/record player/stewarts-antique-record-player.gltf"}>Record Player</option>
            </select>
        </>
    );
}

export default App;
