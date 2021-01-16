import { Renderer } from "../renderer";
import { Attribute } from "./attribute";
import { Uniform } from "./uniform";

/**
 * Represents a WebGL Shader Program. Contains helper methods for compiling
 * and linking shaders
 */
export class Shader {
    // attributes
    private readonly _attributes: Map<string, Attribute>;
    // uniforms
    private readonly _uniforms: Map<string, Uniform>;

    // Our WebGL Shader Programs
    private _vShader?: WebGLShader;
    private _fShader?: WebGLShader;
    private _program?: WebGLProgram;

    constructor() {
        this._vShader = undefined;
        this._fShader = undefined;
        this._program = undefined;

        this._attributes = new Map<string, Attribute>();
        this._uniforms = new Map<string, Uniform>();
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
        const vShader: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER);

        if (vShader == null) {
            throw new Error("Shader.load(String, String) - gl.createShader(VERTEX_SHADER) failed");
        }

        const fShader: WebGLShader | null = gl.createShader(gl.FRAGMENT_SHADER);

        if (fShader == null) {
            gl.deleteShader(vShader);

            throw new Error("Shader.load(String, String) - gl.createShader(FRAGMENT_SHADER) failed");
        }

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
                const error: string | null = gl.getShaderInfoLog(vShader);

                gl.deleteShader(vShader);
                gl.deleteShader(fShader);

                throw new Error("Shader.load(String, String) - error compiling the Vertex Shader. " + error);
            }

            // check for compile errors - fragment shader
            if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
                const error: string | null = gl.getShaderInfoLog(fShader);

                gl.deleteShader(vShader);
                gl.deleteShader(fShader);

                throw new Error("Shader.load(String, String) - error compiling the Fragment Shader. " + error);
            }
        }

        const sProgram: WebGLProgram | null = gl.createProgram();

        if (sProgram == null) {
            gl.deleteShader(vShader);
            gl.deleteShader(fShader);

            throw new Error("Shader.load(String, String) - gl.createProgram() failed");
        }

        gl.attachShader(sProgram, vShader);
        gl.attachShader(sProgram, fShader);
        gl.linkProgram(sProgram);

        // only print/throw errors when renderer is dev mode enabled
        if (renderer.devMode) {
            // check for linking errors - program
            if (!gl.getProgramParameter(sProgram, gl.LINK_STATUS)) {
                const error: string | null = gl.getProgramInfoLog(sProgram);

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

        this.calculateAttributes(sProgram, gl);
        this.calculateUniforms(sProgram, gl);
    }

    /**
     * Calculate and fill the local key-value with the attributes in the Shader
     */
    private calculateAttributes(program: WebGLProgram, gl: WebGL2RenderingContext) {
        const attribCount: number = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < attribCount; i++) {
            const info: WebGLActiveInfo | null = gl.getActiveAttrib(program, i);

            if (info != null) {
                const name: string = info.name;
                const index: number = gl.getAttribLocation(program, name);

                this._attributes.set(name, new Attribute(name, index));
            }
        }
    }

    /**
     * Calclate and fill the local key-value with the uniforms in the Shader
     */
    private calculateUniforms(program: WebGLProgram, gl: WebGL2RenderingContext) {
        const uniformCount: number = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < uniformCount; i++) {
            const info: WebGLActiveInfo | null = gl.getActiveUniform(program, i);

            if (info != null) {
                const name: string = info.name;
                const location: WebGLUniformLocation | null = gl.getUniformLocation(program, name);

                if (location != null) {
                    this._uniforms.set(name, new Uniform(name, location));
                }
            }
        }
    }

    /**
     * Returns the location of the provided attribute for this Shader. Throws an error
     * if the attribute cannot be found.
     * 
     * @param key - The attribute to return
     */
    public attribute(key: string): Attribute {
        if (!this.hasAttribute(key)) {
            throw new Error("Shader.attribute(key) - attribute \"" + key + "\" not found");
        }

        const attrib: Attribute | undefined = this._attributes.get(key);

        if (attrib == undefined) {
            throw new Error("Shader.attribute(key) - attribute \"" + key + "\" was undefined");
        }

        return attrib;
    }

    /**
     * Checks if the provided attribute is available
     * 
     * @param key - The attribute to check
     */
    public hasAttribute(key: string): boolean {
        return this._attributes.has(key);
    }

    /**
     * Returns the location of the provided uniform for this Shader. Throws an error
     * if the unuform cannot be found.
     * 
     * @param key - The uniform to return
     */
    public uniform(key: string): Uniform {
        if (!this.hasUniform(key)) {
            throw new Error("Shader.uniform(key) - uniform \"" + key + "\" not found");
        }

        const uniform: Uniform | undefined = this._uniforms.get(key);

        if (uniform == undefined) {
            throw new Error("Shader.uniform(key) - uniform \"" + key + "\" was undefined");
        }

        return uniform;
    }

    /**
     * Checks if the provided uniform is available
     * 
     * @param key - The uniform to check
     */
    public hasUniform(key: string): boolean {
        return this._uniforms.has(key);
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

        if (this._vShader != undefined) {
            gl.deleteShader(this._vShader);
        }

        if (this._fShader != undefined) {
            gl.deleteShader(this._fShader);
        }

        if (this._program != undefined) {
            gl.deleteProgram(this._program);
        }

        this._vShader = undefined;
        this._fShader = undefined;
        this._program = undefined;
    }

    /**
     * Bind and use this Shader Program for drawing
     */
    public bind() {
        if (this._program == undefined) {
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
        return this._program != undefined;
    }
}