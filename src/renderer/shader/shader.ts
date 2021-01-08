import { Renderer } from "../renderer";

/**
 * Represents a WebGL Shader Program. Contains helper methods for compiling
 * and linking shaders
 */
export class Shader {
    // attributes
    private readonly _attributes: Map<string, number>;
    // uniforms
    private readonly _uniforms: Map<string, WebGLUniformLocation>;

    // Our WebGL Shader Programs
    private _vShader?: WebGLShader;
    private _fShader?: WebGLShader;
    private _program?: WebGLProgram;

    // Quick check to ensure this Shader is valid
    private _isValid: boolean;

    constructor() {
        this._vShader = undefined;
        this._fShader = undefined;
        this._program = undefined;
        this._isValid = false;

        this._attributes = new Map<string, number>();
        this._uniforms = new Map<string, WebGLUniformLocation>();
    }

    /**
     * Loads a new shader given a Fragment Shader and Vertex Shader sources
     * 
     * @param vShaderSource - The Vertex Shader source
     * @param fShaderSource - The Fragment Shader source
     */
    public load(vShaderSource: string, fShaderSource: string) {
        const renderer: Renderer = Renderer.instance;

        if (!renderer.valid) {
            throw new Error("Shader.load(String, String) - unable to compile shader as Renderer instance is not valid");
        }

        const gl: WebGL2RenderingContext = renderer.gl;

        // create shaders
        const vShader: WebGLShader = gl.createShader(gl.VERTEX_SHADER);
        const fShader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER);

        // attach the sources
        gl.shaderSource(vShader, vShaderSource);
        gl.shaderSource(fShader, fShaderSource);

        // compile the shaders
        gl.compileShader(vShader);
        gl.compileShader(fShader);

        // only print/throw errors when renderer is dev mode enabled
        if (renderer.devMode) {
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
        }

        const sProgram: WebGLProgram = gl.createProgram();

        gl.attachShader(sProgram, vShader);
        gl.attachShader(sProgram, fShader);
        gl.linkProgram(sProgram);

        // only print/throw errors when renderer is dev mode enabled
        if (renderer.devMode) {
            // check for linking errors - program
            if (!gl.getProgramParameter(sProgram, gl.LINK_STATUS)) {
                const error: string = gl.getProgramInfoLog(sProgram);

                gl.deleteShader(vShader);
                gl.deleteShader(fShader);
                gl.deleteProgram(sProgram);

                throw new Error("Shader.load(String, String) - error compiling the Shader Program. " + error);
            }
        }

        // otherwise all good - save these for later
        this._vShader = vShader;
        this._fShader = fShader;
        this._program = sProgram;
        this._isValid = true;

        this.calculateAttributes();
        this.calculateUniforms();
    }

    /**
     * Calculate and fill the local key-value with the attributes in the Shader
     */
    private calculateAttributes() {
        const gl: WebGL2RenderingContext = Renderer.instance.gl;
        const program: WebGLProgram = this._program;

        const attribCount: number = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < attribCount; i++) {
            const info: WebGLActiveInfo = gl.getActiveAttrib(program, i);
            const name: string = info.name;
            const index: number = gl.getAttribLocation(program, name);

            this._attributes[name] = index;
        }
    }

    /**
     * Calclate and fill the local key-value with the uniforms in the Shader
     */
    private calculateUniforms() {
        const gl: WebGL2RenderingContext = Renderer.instance.gl;
        const program: WebGLProgram = this._program;

        const uniformCount: number = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < uniformCount; i++) {
            const info: WebGLActiveInfo = gl.getActiveUniform(program, i);
            const name: string = info.name;
            const location: WebGLUniformLocation = gl.getUniformLocation(program, name);

            this._uniforms[name] = location;
        }
    }

    /**
     * Returns the location of the provided attribute for this Shader. Throws an error
     * if the attribute cannot be found.
     * 
     * @param key - The attribute to return
     */
    public attribute(key: string): number {
        if (!this._attributes.has(key)) {
            throw new Error("Shader.attribute(key) - attribute \"" + key + "\" not found");
        }

        return this._attributes.get(key);
    }

    /**
     * Returns the location of the provided uniform for this Shader. Throws an error
     * if the unuform cannot be found.
     * 
     * @param key - The uniform to return
     */
    public uniform(key: string): WebGLUniformLocation {
        if (!this._uniforms.has(key)) {
            throw new Error("Shader.uniform(key) - uniform \"" + key + "\" not found");
        }

        return this._uniforms.get(key);
    }

    /**
     * Delete and Remove this Shader from memory
     */
    public destroy() {
        const renderer: Renderer = Renderer.instance;

        if (!renderer.valid) {
            throw new Error("Shader.destroy() - unable to delete shader as Renderer instance is not valid");
        }

        const gl: WebGL2RenderingContext = renderer.gl;

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
        this._isValid = false;
    }

    /**
     * Bind and use this Shader Program for drawing
     */
    public bind() {
        if (!this._isValid) {
            return;
        }

        const gl: WebGL2RenderingContext = Renderer.instance.gl;

        gl.useProgram(this._program);
    }

    /**
     * Checks the Validity of this Shader. Shader.load(String, String) must be called
     * successfully for this to return true
     */
    public get valid(): boolean {
        return this._isValid;
    }
}