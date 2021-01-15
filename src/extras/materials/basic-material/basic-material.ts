import { Material } from "../../../renderer/shader/material";
import vShader from "./shaders/vert-shader.glsl";
import fShader from "./shaders/frag-shader.glsl";

export class BasicMaterial extends Material {

    constructor() {
        super();

        this.shader.load(vShader, fShader);
    }
}