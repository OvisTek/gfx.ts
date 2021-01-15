import { Box, Renderer } from "../../dist/index";

const renderer = Renderer.instance;
renderer.devMode = true;
renderer.initWithID("render_canvas");
renderer.start();

const box = new Box();

renderer.stage.camera.transform.position.z = -20;