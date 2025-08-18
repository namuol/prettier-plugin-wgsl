const vertexShader = wgsl`@vertex
fn main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
  return vec4<f32>(position, 0.0, 1.0);
}`;
const fragmentShader = /*wgsl*/ `@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}`;
export { vertexShader, fragmentShader };
