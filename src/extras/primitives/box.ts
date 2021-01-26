import { Color } from "../../math/color";
import { MeshRenderer } from "../../renderer/components/mesh-renderer";
import { Mesh } from "../../renderer/mesh/mesh";
import { Entity, EntityOptions } from "../../renderer/scriptable/entity";
import { Material } from "../../renderer/shader/material";
import { BasicColorMaterial } from "../materials/basic-color-material/basic-color-material";

export class Box extends Entity {

    protected readonly material: Material;

    constructor(material: Material | undefined = undefined, opt: EntityOptions | undefined = undefined) {
        super(opt);

        this.material = material === undefined ? new BasicColorMaterial() : material;
    }

    protected create(): Promise<void> {
        return new Promise<void>((accept, _reject) => {
            const mesh: Mesh = new Mesh();
            const material: Material = this.material;

            mesh.vertices.dataRef = [
                // front face vertices
                -1.0, -1.0, 1.0,
                1.0, -1.0, 1.0,
                1.0, 1.0, 1.0,
                -1.0, 1.0, 1.0,
                // back face vertices
                -1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, -1.0, -1.0,
                // top face vertices
                -1.0, 1.0, -1.0,
                -1.0, 1.0, 1.0,
                1.0, 1.0, 1.0,
                1.0, 1.0, -1.0,
                // bottom face vertices
                -1.0, -1.0, -1.0,
                1.0, -1.0, -1.0,
                1.0, -1.0, 1.0,
                -1.0, -1.0, 1.0,
                // right face vertices
                1.0, -1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, 1.0, 1.0,
                1.0, -1.0, 1.0,
                // left face vertices
                -1.0, -1.0, -1.0,
                -1.0, -1.0, 1.0,
                -1.0, 1.0, 1.0,
                -1.0, 1.0, -1.0
            ];

            mesh.normals.dataRef = [
                // front face normals
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                0.0, 0.0, 1.0,
                // back face normals
                0.0, 0.0, -1.0,
                0.0, 0.0, -1.0,
                0.0, 0.0, -1.0,
                0.0, 0.0, -1.0,
                // top face normals
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                // bottom face normals
                0.0, -1.0, 0.0,
                0.0, -1.0, 0.0,
                0.0, -1.0, 0.0,
                0.0, -1.0, 0.0,
                // right face normals
                1.0, 0.0, 0.0,
                1.0, 0.0, 0.0,
                1.0, 0.0, 0.0,
                1.0, 0.0, 0.0,
                // left face normals
                -1.0, 0.0, 0.0,
                -1.0, 0.0, 0.0,
                -1.0, 0.0, 0.0,
                -1.0, 0.0, 0.0
            ];

            mesh.uv.dataRef = [
                // front face uv
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // back face uv
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // top face uv
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // bottom face uv
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // right face uv
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // left face uv
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0
            ];

            const frontColor: number = Color.rgba8888(1, 0, 0, 1);
            const backColor: number = Color.rgba8888(0, 1, 0, 1);
            const topColor: number = Color.rgba8888(0, 0, 1, 1);
            const bottomColor: number = Color.rgba8888(0, 0, 0, 1);
            const rightColor: number = Color.rgba8888(1, 1, 1, 1);
            const leftColor: number = Color.rgba8888(1, 0, 1, 1);

            mesh.colors.dataRef = [
                // front face colors
                frontColor,
                frontColor,
                frontColor,
                frontColor,
                // back face colors
                backColor,
                backColor,
                backColor,
                backColor,
                // top face colors
                topColor,
                topColor,
                topColor,
                topColor,
                // bottom face colors
                bottomColor,
                bottomColor,
                bottomColor,
                bottomColor,
                // right face colors
                rightColor,
                rightColor,
                rightColor,
                rightColor,
                // left face colors
                leftColor,
                leftColor,
                leftColor,
                leftColor
            ];

            mesh.indices.dataRef = [
                // front triangles
                0, 1, 2, 0, 2, 3,
                // back triangles
                4, 5, 6, 4, 6, 7,
                // top triangles
                8, 9, 10, 8, 10, 11,
                // bottom triangles
                12, 13, 14, 12, 14, 15,
                // right triangles
                16, 17, 18, 16, 18, 19,
                // left triangles
                20, 21, 22, 20, 22, 23
            ];

            // mesh renderer component will allow this object to render a mesh
            const renderer: MeshRenderer = this.addComponent(new MeshRenderer());

            // assign material and mesh for this object
            renderer.material = material;
            renderer.mesh = mesh;

            return accept();
        });
    }
}