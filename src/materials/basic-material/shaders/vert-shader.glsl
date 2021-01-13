#version 300 es

layout(location = 0) in vec4 aVertexPosition;
layout(location = 1) in vec4 aVertexColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;

out lowp vec4 vColor;

void main(void) {
    vColor = aVertexColor;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
}