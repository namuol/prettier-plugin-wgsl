import dedent from 'dedent';
import prettier from 'prettier';
import {describe, expect, it} from 'vitest';

import plugin from './main';

type Test = {
  name: string;
  input: string;
  expected: string;
};

const tests: Test[] = [
  {
    name: 'basic variable declaration',
    input: 'var x:f32=1.0;',
    expected: 'var x: f32 = 1.0;',
  },
  {
    name: 'multiple lines',
    input: 'var x: f32 = 1.0;var y: f32 = 2.0;',
    expected: dedent`
      var x: f32 = 1.0;
      var y: f32 = 2.0;
    `,
  },
  {
    name: 'let declaration with type',
    input: 'let position:vec3<f32>=vec3<f32>(1.0,2.0,3.0);',
    expected: 'let position: vec3<f32> = vec3<f32>(1.0, 2.0, 3.0);',
  },
  {
    name: 'const declaration',
    input: 'const PI:f32=3.14159;',
    expected: 'const PI: f32 = 3.14159;',
  },
  {
    name: 'function definition',
    input: 'fn add(a:f32,b:f32)->f32{return a+b;}',
    expected: dedent`
      fn add(a: f32, b: f32) -> f32 {
        return a + b;
      }
    `,
  },
  {
    name: 'function with attributes',
    input:
      '@vertex fn vertex_main(@location(0)position:vec3<f32>)->VertexOutput{var output:VertexOutput;output.position=vec4<f32>(position,1.0);return output;}',
    expected: dedent`
      @vertex
      fn vertex_main(@location(0) position: vec3<f32>) -> VertexOutput {
        var output: VertexOutput;
        output.position = vec4<f32>(position, 1.0);
        return output;
      }
    `,
  },
  {
    name: 'struct definition',
    input:
      'struct VertexInput{@location(0)position:vec3<f32>,@location(1)normal:vec3<f32>}',
    expected: dedent`
      struct VertexInput {
        @location(0) position: vec3<f32>,
        @location(1) normal: vec3<f32>,
      }
    `,
  },
  {
    name: 'if statement',
    input: 'if(x>0.0){y=1.0;}else{y=0.0;}',
    expected: dedent`
      if (x > 0.0) {
        y = 1.0;
      } else {
        y = 0.0;
      }
    `,
  },
  {
    name: 'for loop',
    input: 'for(var i:i32=0;i<10;i=i+1){result=result+array[i];}',
    expected: dedent`
      for (var i: i32 = 0; i < 10; i = i + 1) {
        result = result + array[i];
      }
    `,
  },
  {
    name: 'while loop',
    input: 'while(count>0){process_item();count=count-1;}',
    expected: dedent`
      while (count > 0) {
        process_item();
        count = count - 1;
      }
    `,
  },
  {
    name: 'switch statement',
    input:
      'switch(value){case 0:{result=0.0;}case 1:{result=1.0;}default:{result=-1.0;}}',
    expected: dedent`
      switch (value) {
        case 0: {
          result = 0.0;
        }
        case 1: {
          result = 1.0;
        }
        default: {
          result = -1.0;
        }
      }
    `,
  },
  {
    name: 'array type',
    input: 'var colors:array<vec3<f32>,4>;',
    expected: 'var colors: array<vec3<f32>, 4>;',
  },
  {
    name: 'matrix type',
    input: 'var transform:mat4x4<f32>;',
    expected: 'var transform: mat4x4<f32>;',
  },
  {
    name: 'pointer type',
    input: 'var ptr:*f32;',
    expected: 'var ptr: *f32;',
  },
  {
    name: 'atomic type',
    input: 'var counter:atomic<i32>;',
    expected: 'var counter: atomic<i32>;',
  },
  {
    name: 'texture types',
    input: 'var tex:texture_2d<f32>;var sampler:sampler;',
    expected: dedent`
      var tex: texture_2d<f32>;
      var sampler: sampler;
    `,
  },
  {
    name: 'function call with multiple arguments',
    input: 'var result:f32=clamp(value,0.0,1.0);',
    expected: 'var result: f32 = clamp(value, 0.0, 1.0);',
  },
  {
    name: 'member access',
    input: 'var pos:vec3<f32>=input.position;',
    expected: 'var pos: vec3<f32> = input.position;',
  },
  {
    name: 'array access',
    input: 'var element:f32=array[index];',
    expected: 'var element: f32 = array[index];',
  },
  {
    name: 'binary operations',
    input: 'var sum:f32=a+b*c/d-e%f;',
    expected: 'var sum: f32 = a + b * c / d - e % f;',
  },
  {
    name: 'unary operations',
    input: 'var neg:f32=-value;var not_bool:bool=!flag;',
    expected: dedent`
      var neg: f32 = -value;
      var not_bool: bool = !flag;
    `,
  },
  {
    name: 'comparison operators',
    input: 'var is_greater:bool=x>y;var is_equal:bool=a==b;',
    expected: dedent`
      var is_greater: bool = x > y;
      var is_equal: bool = a == b;
    `,
  },
  {
    name: 'logical operators',
    input: 'var both:bool=condition1&&condition2;var either:bool=flag1||flag2;',
    expected: dedent`
      var both: bool = condition1 && condition2;
      var either: bool = flag1 || flag2;
    `,
  },
  {
    name: 'assignment operators',
    input: 'x+=1.0;y-=2.0;z*=3.0;w/=4.0;',
    expected: dedent`
      x += 1.0;
      y -= 2.0;
      z *= 3.0;
      w /= 4.0;
    `,
  },
  {
    name: 'bitwise operations',
    input: 'var result:i32=value<<2;var mask:i32=flags&0xFF;',
    expected: dedent`
      var result: i32 = value << 2;
      var mask: i32 = flags & 0xFF;
    `,
  },
  {
    name: 'type aliases',
    input: 'type Color=vec3<f32>;type Matrix=mat4x4<f32>;',
    expected: dedent`
      type Color = vec3<f32>;
      type Matrix = mat4x4<f32>;
    `,
  },
  {
    name: 'workgroup variables',
    input: 'var<workgroup>shared_data:array<f32,64>;',
    expected: 'var<workgroup> shared_data: array<f32, 64>;',
  },
  {
    name: 'uniform variables',
    input: 'var<uniform>constants:Uniforms;',
    expected: 'var<uniform> constants: Uniforms;',
  },
  {
    name: 'storage variables',
    input: 'var<storage,read>input_buffer:array<Vertex>;',
    expected: 'var<storage, read> input_buffer: array<Vertex>;',
  },
  {
    name: 'push constants',
    input: 'var<push_constant>push_data:PushConstants;',
    expected: 'var<push_constant> push_data: PushConstants;',
  },
  {
    name: 'function with multiple statements',
    input: 'fn process(){var temp:f32=0.0;temp=temp+1.0;return temp;}',
    expected: dedent`
      fn process() {
        var temp: f32 = 0.0;
        temp = temp + 1.0;
        return temp;
      }
    `,
  },
  {
    name: 'nested control flow',
    input:
      'if(x>0.0){if(y>0.0){result=1.0;}else{result=2.0;}}else{result=0.0;}',
    expected: dedent`
      if (x > 0.0) {
        if (y > 0.0) {
          result = 1.0;
        } else {
          result = 2.0;
        }
      } else {
        result = 0.0;
      }
    `,
  },
  {
    name: 'complex expression',
    input: 'var result:f32=sqrt(pow(x,2.0)+pow(y,2.0));',
    expected: 'var result: f32 = sqrt(pow(x, 2.0) + pow(y, 2.0));',
  },
  {
    name: 'struct with nested types',
    input: 'struct Complex{data:array<vec3<f32>,16>,transform:mat4x4<f32>}',
    expected: dedent`
      struct Complex {
        data: array<vec3<f32>, 16>,
        transform: mat4x4<f32>,
      }
    `,
  },
  {
    name: 'function with default parameters',
    input: 'fn lerp(a:f32,b:f32,t:f32=0.5)->f32{return mix(a,b,t);}',
    expected: dedent`
      fn lerp(a: f32, b: f32, t: f32 = 0.5) -> f32 {
        return mix(a, b, t);
      }
    `,
  },
  {
    name: 'multiple attributes',
    input:
      '@vertex@builtin(position)fn main()->@builtin(position)vec4<f32>{return vec4<f32>(0.0,0.0,0.0,1.0);}',
    expected: dedent`
      @vertex
      @builtin(position)
      fn main() -> @builtin(position) vec4<f32> {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
      }
    `,
  },
  {
    name: 'compute shader',
    input:
      '@compute@workgroup_size(64)fn compute_main(@builtin(global_invocation_id)id:vec3<u32>){let index:u32=id.x;output[index]=input[index]*2.0;}',
    expected: dedent`
      @compute
      @workgroup_size(64)
      fn compute_main(@builtin(global_invocation_id) id: vec3<u32>) {
        let index: u32 = id.x;
        output[index] = input[index] * 2.0;
      }
    `,
  },
  {
    name: 'fragment shader',
    input:
      '@fragment fn fragment_main(@location(0)color:vec4<f32>)->@location(0)vec4<f32>{return color;}',
    expected: dedent`
      @fragment
      fn fragment_main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
        return color;
      }
    `,
  },
];

describe('prettier-plugin-wgsl', () => {
  describe('.wgsl files', () => {
    for (const test of tests) {
      it(`should format ${test.name} correctly`, async () => {
        const result = await prettier.format(test.input, {
          parser: 'wgsl',
          plugins: [plugin],
        });
        expect(result).toBe(test.expected);
      });
    }
  });
});
