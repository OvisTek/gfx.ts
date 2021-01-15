#version 300 es

in vec4 gfx_Position;
in vec4 gfx_Color;

uniform mat4 gfx_ProjectionMatrix;
uniform mat4 gfx_ModelMatrix;
uniform mat4 gfx_ViewMatrix;

out highp vec4 vColor;

void main(void) {
    gl_Position = gfx_ProjectionMatrix * gfx_ViewMatrix * gfx_ModelMatrix * gfx_Position;
    vColor = gfx_Color;
}