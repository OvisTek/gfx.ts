import { BasicColorMaterial, BasicTextureMaterial, Box, Euler, MeshRenderer, Renderer, Texture, Input, Key } from "../../dist/index";

const renderer = Renderer.instance;
renderer.devMode = true;
renderer.initWithID("render_canvas");
renderer.start();

class MyTexturedBox extends Box {

    constructor() {
        super(new BasicTextureMaterial());
    }

    start() {
        const texture = new Texture("https://webgl2fundamentals.org/webgl/resources/leaves.jpg");

        texture.load().then((texture) => {
            const renderer = this.getComponentOfType(MeshRenderer);

            renderer.material.texture = texture;
        }).catch((err) => {
            console.error(err);
        });

        this.transform.position.x = 2;
    }

    update(dt) {
        const euler = this.euler || new Euler();
        this.euler = euler;
        euler.rollDeg += dt * 25;
        euler.pitchDeg += dt * 35;
        euler.yawDeg += dt * 45;

        this.transform.euler = euler;

        if (Input.keyboard.isPressed(Key.W)) {
            console.log("pressed w");

            Input.mouse.lockPointer().then(() => {
                console.log("locking mouse");
            }).catch((err) => {
                console.log(err);
            });
        }

        if (Input.keyboard.isReleased(Key.W)) {
            console.log("released w");

            Input.mouse.unlockPointer().then(() => {
                console.log("unlocking mouse");
            }).catch((err) => {
                console.log(err);
            });
        }

        //console.log(Input.keyboard);

        console.log(Input.mouse.positionX + " " + Input.mouse.positionY);
    }
}

class MyColoredBox extends Box {

    constructor() {
        super(new BasicColorMaterial());
    }

    start() {
        const renderer = this.getComponentOfType(MeshRenderer);
        this.transform.position.x = -2;
    }

    update(dt) {
        const euler = this.euler || new Euler();
        this.euler = euler;
        euler.rollDeg += dt * 45;
        euler.pitchDeg += dt * 35;
        euler.yawDeg += dt * 25;

        this.transform.euler = euler;

        this.stage.camera.transform.position.z = 9;
    }
}

const tbox = new MyTexturedBox();
const cbox = new MyColoredBox();

window.renderer = renderer;