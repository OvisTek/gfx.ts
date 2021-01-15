import { Box, Euler, Renderer } from "../../dist/index";

const renderer = Renderer.instance;
renderer.devMode = true;
renderer.initWithID("render_canvas");
renderer.start();

class MyBox extends Box {
    update(dt) {
        box.transform.position.z = -6;
        const euler = box.transform.euler;

        euler.pitchDeg += 25 * dt;
        euler.rollDeg += 25 * dt;
        euler.yawDeg += 25 * dt;

        box.transform.euler = euler;
    }
}

const box = new MyBox();