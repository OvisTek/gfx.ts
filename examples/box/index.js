import { Box, Renderer } from "../../dist/index";

const renderer = Renderer.instance;
renderer.initWithID("render_canvas");
renderer.start();

const box = new Box();
box.transform.position.z = 10;