import { Material } from "../../index";
import vShader from "./shaders/vert-shader.glsl";
import fShader from "./shaders/frag-shader.glsl";

export class BasicMaterial extends Material {

    private static _instance: BasicMaterial;

    private constructor() {
        super();

        this.shader.load(vShader, fShader);
    }

    public static get instance(): BasicMaterial {
        if (!BasicMaterial._instance) {
            BasicMaterial._instance = new BasicMaterial();
        }

        return BasicMaterial._instance;
    }
}