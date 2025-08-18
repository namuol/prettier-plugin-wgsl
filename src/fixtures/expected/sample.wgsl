struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
}
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
}
@group(0)@binding(0)
var<uniform> modelMatrix: mat4x4<f32>;
@vertex
fn vertex_main(input: struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
}) -> struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
} {
  var output: struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPos: vec3<f32>,
  };
  let worldPos: vec4<f32> = modelMatrix * vec4<f32>(input.position, 1.0);
  output.worldPos = worldPos.xyz;
  output.position = worldPos;
  return output;
}
@fragment
fn fragment_main(input: struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) worldPos: vec3<f32>,
}) -> @location(0) vec4<f32> {
  return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}