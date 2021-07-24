import { Renderer, Entity, Stage } from "../../dist/index";

const renderer = Renderer.instance;
renderer.devMode = true;
renderer.stage = new Stage();
renderer.initWithID("render_canvas");
renderer.start();

class MyEntity extends Entity {
    start() {
        console.log("MyEntity.start");
    }

    update(dt) {
        console.log("MyEntity.update");
    }
}

const tbox = new MyEntity();

window.renderer = renderer;