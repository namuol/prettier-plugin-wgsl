const shader1 = wgsl`@vertex
fn main() -> @builtin(position) vec4<f32> {
  return vec4<f32>(0.0);
}`;
const shader2 = /*wgsl*/ `@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4<f32>(1.0);
}`;
const shader3 = wgsl`@compute
@workgroup_size(1)
fn main() {}`;
export { shader1, shader2, shader3 };
