#version 300 es
precision highp float;

#pragma gfx_lights

in vec4 vColor;
in vec3 vNormal;

// output color from fragment shader
out vec4 outColor;

void main(void) {
    // calculate lighting
    vec3 normal = normalize(vNormal);
    float light = dot(normal, gfx_lightDirection);

    outColor = vColor;
    outColor.rgb *= light;
}