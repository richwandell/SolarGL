import css from "./App.module.css";
import {createRef, useEffect, useState} from "react";
import Example from "./Example";

const DEFAULT_SCENE = "scenes/suzanne/suzanne.gltf";

function App() {

    const canvasRef = createRef<HTMLCanvasElement>()
    const [selectedScene, setSelectedScene] = useState(DEFAULT_SCENE)

    useEffect(() => {
        if (canvasRef.current === undefined) return;
        const app = new Example(canvasRef.current as HTMLCanvasElement, selectedScene);
        void app.start()

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
