import css from './App.module.css';
import {createRef, useEffect, useState} from "react";
import triangle from "./objs/triangle";
import {simpleVertex, whiteFragment} from "./shaders";

function App() {
    const canvasRef = createRef<HTMLCanvasElement>()
    const [running, setRunning] = useState(true)



    useEffect(() => {
        if (!canvasRef.current) return;
        const gl = canvasRef.current.getContext('webgl2') as WebGL2RenderingContext
        const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader
        gl.shaderSource(vertexShader, simpleVertex)
        gl.compileShader(vertexShader)

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader
        gl.shaderSource(fragmentShader, whiteFragment)
        gl.compileShader(fragmentShader)

        const shaderProgram = gl.createProgram() as WebGLProgram
        gl.attachShader(shaderProgram, vertexShader)
        gl.attachShader(shaderProgram, fragmentShader)
        gl.linkProgram(shaderProgram)

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        };

        let lastTime = 0;
        const run = (time: number) => {



            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            lastTime = time
            requestAnimationFrame(run)
        }
        run(0)

        return () => {
            setRunning(false)
        }
    }, [canvasRef])

    return (
        <canvas className={css.canvas} ref={canvasRef}/>
    );
}

export default App;
