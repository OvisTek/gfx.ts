#version 300 es

precision highp float;

in vec2 vTexCoord;
out vec4 outColor;

uniform sampler2D gfx_Texture0;

void main(void) {
    vec4 color = texture(gfx_Texture0, vTexCoord);
    outColor = color;
}