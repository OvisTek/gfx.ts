#version 300 es

precision highp float;

in vec2 vUV;
out vec4 outColor;

uniform sampler2D glfx_Texture0;

void main(void) {
    vec4 color = texture(glfx_Texture0, vUV);
    outColor = color;
}