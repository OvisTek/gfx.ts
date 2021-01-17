uniform mat4 gfx_ProjectionMatrix;
uniform mat4 gfx_ModelMatrix;
uniform mat4 gfx_ViewMatrix;

mat4 gfx_WorldMatrix() {
    return gfx_ProjectionMatrix * gfx_ViewMatrix * gfx_ModelMatrix;
}