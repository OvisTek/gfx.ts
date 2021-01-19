#version 300 es
#pragma gfx_matrices
#pragma gfx_mesh

out vec2 vTexCoord;

void main(void) {
    gl_Position = gfx_WorldMatrix() * gfx_Position;
    vTexCoord = gfx_TexCoord0;
}