import { MeshRenderer } from "../../renderer/components/mesh-renderer";
import { Mesh } from "../../renderer/mesh/mesh";
import { Entity } from "../../renderer/scriptable/entity";
import { BasicMaterial } from "../materials/basic-material/basic-material";

export class Box extends Entity {

    protected create(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            const mesh: Mesh = new Mesh();

            mesh.vertices.data = [
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

            mesh.colors.data = [
                // front face color
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                // back face color
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                // top face color
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                // bottom face color
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                // right face color
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                // left face color
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0
            ];

            mesh.indices.data = [
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
            renderer.material = new BasicMaterial();
            renderer.mesh = mesh;

            return accept();
        });
    }
}