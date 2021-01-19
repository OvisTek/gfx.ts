#version 300 es
#pragma gfx_matrices
#pragma gfx_mesh

out vec4 vColor;

void main(void) {
    gl_Position = gfx_WorldMatrix() * gfx_Position;
    vColor = gfx_Color;
}