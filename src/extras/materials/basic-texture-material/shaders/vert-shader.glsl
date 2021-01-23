#version 300 es
#pragma gfx_matrices
#pragma gfx_mesh

out vec2 vTexCoord;
out vec3 vNormal;

void main(void) {
    gl_Position = gfx_mvpMatrix * gfx_Position;

    // set variables to be passed into fragment shader
    vTexCoord = gfx_TexCoord0;
    vNormal = mat3(gfx_normalMatrix) * vec3(gfx_Normal);
}