import { Box, Euler, Renderer } from "../../dist/index";

const renderer = Renderer.instance;
renderer.devMode = true;
renderer.initWithID("render_canvas");
renderer.start();

const euler = new Euler();

class MyBox extends Box {

    update(dt) {
        this.transform.position.z = 0;
        euler.rollDeg += 25 * dt;
        euler.pitchDeg += 25 * dt;
        euler.yawDeg += 25 * dt;

        this.transform.euler = euler;

        this.stage.camera.transform.position.z = 6;
    }
}

const box = new MyBox();