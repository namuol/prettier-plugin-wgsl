var x: f32 = 1.0;
var y: f32 = 2.0;
fn add(a: f32, b: f32) -> f32 {
  return a + b;
}
@vertex
fn main() -> @builtin(position) vec4<f32> {
  return vec4<f32>(0.0);
}