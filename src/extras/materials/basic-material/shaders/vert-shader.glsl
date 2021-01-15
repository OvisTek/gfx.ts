#version 300 es

in vec3 gfx_Position;
in vec4 gfx_Color;

uniform mat4 gfx_ProjectionMatrix;
uniform mat4 gfx_ModelMatrix;
uniform mat4 gfx_ViewMatrix;

out lowp vec4 vColor;

void main(void) {
    vColor = gfx_Color;
    gl_Position = gfx_ProjectionMatrix * gfx_ModelMatrix * gfx_ViewMatrix * vec4(gfx_Position, 0.0);
}