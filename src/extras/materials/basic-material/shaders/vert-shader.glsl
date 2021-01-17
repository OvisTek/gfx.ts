#version 300 es

in vec4 gfx_Position;
in vec2 gfx_UV;

uniform mat4 gfx_ProjectionMatrix;
uniform mat4 gfx_ModelMatrix;
uniform mat4 gfx_ViewMatrix;

out vec2 vUV;

void main(void) {
    gl_Position = gfx_ProjectionMatrix * gfx_ViewMatrix * gfx_ModelMatrix * gfx_Position;
    vUV = gfx_UV;
}