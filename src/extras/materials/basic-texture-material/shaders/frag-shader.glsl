#version 300 es
precision highp float;

#pragma gfx_lights

in vec2 vTexCoord;
in vec3 vNormal;

out vec4 outColor;

uniform sampler2D gfx_Texture0;

void main(void) {
    // calculate lighting
    vec3 normal = normalize(vNormal);
    float light = dot(normal, gfx_lightDirection);

    // color from the texture
    vec4 color = texture(gfx_Texture0, vTexCoord);
    outColor = color;
    outColor.rgb *= light;
}