import { Box, Euler, Renderer } from "../../dist/index";

const renderer = Renderer.instance;
renderer.devMode = true;
renderer.initWithID("render_canvas");
renderer.start();

class MySecondBox extends Box {
    update(dt) {
        const euler = this.euler || new Euler();
        this.euler = euler;
        euler.rollDeg += 25 * dt;
        euler.pitchDeg += 25 * dt;
        euler.yawDeg += 25 * dt;

        this.transform.euler = euler;
    }
}

class MyBox extends Box {

    start() {
        const inBox = new MySecondBox();
        inBox.transform.position.z = -6;

        inBox.parent = this;
    }

    update(dt) {
        const euler = this.euler || new Euler();
        this.euler = euler;
        euler.rollDeg += 25 * dt;
        euler.pitchDeg += 25 * dt;
        euler.yawDeg += 25 * dt;

        this.transform.euler = euler;

        this.stage.camera.transform.position.z = 12;
    }
}

const box = new MyBox();