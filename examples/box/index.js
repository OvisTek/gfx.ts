import { Box, Euler, MeshRenderer, Renderer, Texture } from "../../dist/index";

const renderer = Renderer.instance;
renderer.devMode = true;
renderer.initWithID("render_canvas");
renderer.start();

class MyBox extends Box {

    start() {
        const texture = new Texture("https://webgl2fundamentals.org/webgl/resources/leaves.jpg");

        texture.load().then((texture) => {
            const renderer = this.getComponentOfType(MeshRenderer);

            renderer.material.setTexture("glfx_Texture0", texture);
        }).catch((err) => {
            console.error(err);
        });
    }

    update(dt) {
        const euler = this.euler || new Euler();
        this.euler = euler;
        euler.rollDeg += dt * 25;
        euler.pitchDeg += dt * 25;
        euler.yawDeg += dt * 25;

        this.transform.euler = euler;

        this.stage.camera.transform.position.z = 6;
    }
}

const box = new MyBox();

window.renderer = renderer;