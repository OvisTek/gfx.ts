/**
 * Allows TypeScript to load .glsl shader files
 */
declare module '*.glsl' {
    const value: string;
    export default value;
}