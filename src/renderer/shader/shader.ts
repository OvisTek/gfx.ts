import { Renderer } from "../renderer";

/**
 * Represents a WebGL Shader Program. Contains helper methods for compiling
 * and linking shaders
 */
export class Shader {

    private _vShader?: WebGLShader;
    private _fShader?: WebGLShader;
    private _program?: WebGLProgram;

    constructor() {
        this._vShader = undefined;
        this._fShader = undefined;
        this._program = undefined;
    }

    /**
     * Loads a new shader given a Fragment Shader and Vertex Shader sources
     * 
     * @param vShaderSource - The Vertex Shader source
     * @param fShaderSource - The Fragment Shader source
     */
    public load(vShaderSource: string, fShaderSource: string) {
        if (!Renderer.instance.valid) {
            throw new Error("Shader.load(String, String) - unable to compile shader as Renderer instance is not valid");
        }

        const gl: WebGL2RenderingContext = Renderer.instance.gl;

        // create shaders
        const vShader: WebGLShader = gl.createShader(gl.VERTEX_SHADER);
        const fShader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER);

        // attach the sources
        gl.shaderSource(vShader, vShaderSource);
        gl.shaderSource(fShader, fShaderSource);

        // compile the shaders
        gl.compileShader(vShader);
        gl.compileShader(fShader);

        // check for compile errors - vertex shader
        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
            const error: string = gl.getShaderInfoLog(vShader);

            gl.deleteShader(vShader);
            gl.deleteShader(fShader);

            throw new Error("Shader.load(String, String) - error compiling the Vertex Shader. " + error);
        }

        // check for compile errors - fragment shader
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
            const error: string = gl.getShaderInfoLog(fShader);

            gl.deleteShader(vShader);
            gl.deleteShader(fShader);

            throw new Error("Shader.load(String, String) - error compiling the Fragment Shader. " + error);
        }

        const sProgram: WebGLProgram = gl.createProgram();

        gl.attachShader(sProgram, vShader);
        gl.attachShader(sProgram, fShader);
        gl.linkProgram(sProgram);

        // check for linking errors - program
        if (!gl.getProgramParameter(sProgram, gl.LINK_STATUS)) {
            const error: string = gl.getProgramInfoLog(sProgram);

            gl.deleteShader(vShader);
            gl.deleteShader(fShader);
            gl.deleteProgram(sProgram);

            throw new Error("Shader.load(String, String) - error compiling the Shader Program. " + error);
        }

        // otherwise all good - save these for later
        this._vShader = vShader;
        this._fShader = fShader;
        this._program = sProgram;
    }

    /**
     * Delete and Remove this Shader from memory
     */
    public destroy() {
        if (!Renderer.instance.valid) {
            throw new Error("Shader.destroy() - unable to delete shader as Renderer instance is not valid");
        }

        const gl: WebGL2RenderingContext = Renderer.instance.gl;

        if (this._vShader) {
            gl.deleteShader(this._vShader);
        }

        if (this._fShader) {
            gl.deleteShader(this._fShader);
        }

        if (this._program) {
            gl.deleteProgram(this._program);
        }

        this._vShader = undefined;
        this._fShader = undefined;
        this._program = undefined;
    }
}