const sqlQuery = `SELECT*FROM users WHERE id=${userId}`;
const wgslShader = wgsl`@vertex
fn main() -> @builtin(position) vec4<f32> {
  return vec4<f32>(0.0);
}`;
const htmlTemplate = `<div class="shader">${shaderCode}</div>`;
const anotherWgsl = /*wgsl*/ `@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4<f32>(1.0);
}`;
const regularString = "not a template literal";
