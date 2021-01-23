#version 300 es
#pragma gfx_matrices
#pragma gfx_mesh

// passed into fragment shader
out vec4 vColor;
out vec3 vNormal;

void main(void) {
    gl_Position = gfx_mvpMatrix * gfx_Position;

    // set variables to be passed into fragment shader
    vColor = gfx_Color;
    vNormal = mat3(gfx_normalMatrix) * vec3(gfx_Normal);
}