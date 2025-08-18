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
    input: 'fn test(){if(x>0.0){y=1.0;}else{y=0.0;}}',
    expected: dedent`
      fn test() {
        if (x > 0.0) {
          y = 1.0;
        } else {
          y = 0.0;
        }
      }
    `,
  },
  {
    name: 'for loop',
    input: 'fn test(){for(var i:i32=0;i<10;i=i+1){result=result+array[i];}}',
    expected: dedent`
      fn test() {
        for (var i: i32 = 0; i < 10; i = i + 1) {
          result = result + array[i];
        }
      }
    `,
  },
  {
    name: 'while loop',
    input: 'fn test(){while(count>0){process_item();count=count-1;}}',
    expected: dedent`
      fn test() {
        while (count > 0) {
          process_item();
          count = count - 1;
        }
      }
    `,
  },
  {
    name: 'switch statement',
    input:
      'fn test(){switch(value){case 0:{result=0.0;}case 1:{result=1.0;}default:{result=-1.0;}}}',
    expected: dedent`
      fn test() {
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
    input: 'var ptr:ptr<function,f32>;',
    expected: 'var ptr: ptr<function, f32>;',
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
    input: 'fn test(){x+=1.0;y-=2.0;z*=3.0;w/=4.0;}',
    expected: dedent`
      fn test() {
        x += 1.0;
        y -= 2.0;
        z *= 3.0;
        w /= 4.0;
      }
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
    input: 'alias Color=vec3<f32>;alias Matrix=mat4x4<f32>;',
    expected: dedent`
      alias Color = vec3<f32>;
      alias Matrix = mat4x4<f32>;
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
    name: 'private storage',
    input: 'var<private>private_data:f32;',
    expected: 'var<private> private_data: f32;',
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
      'fn test(){if(x>0.0){if(y>0.0){result=1.0;}else{result=2.0;}}else{result=0.0;}}',
    expected: dedent`
      fn test() {
        if (x > 0.0) {
          if (y > 0.0) {
            result = 1.0;
          } else {
            result = 2.0;
          }
        } else {
          result = 0.0;
        }
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
    name: 'function with multiple parameters',
    input: 'fn lerp(a:f32,b:f32,t:f32)->f32{return mix(a,b,t);}',
    expected: dedent`
      fn lerp(a: f32, b: f32, t: f32) -> f32 {
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
  {
    name: 'loop statement',
    input: 'fn test(){loop{if(condition){break;}}}',
    expected: dedent`
      fn test() {
        loop {
          if (condition) {
            break;
          }
        }
      }
    `,
  },
  {
    name: 'loop with continuing',
    input: 'fn test(){loop{if(condition){break;}continuing{count+=1;}}}',
    expected: dedent`
      fn test() {
        loop {
          if (condition) {
            break;
          }
          continuing {
            count += 1;
          }
        }
      }
    `,
  },
  {
    name: 'enable directive',
    input: 'enable f16;',
    expected: 'enable f16;',
  },
  {
    name: 'requires directive',
    input: 'requires readonly_and_readwrite_storage_textures;',
    expected: 'requires readonly_and_readwrite_storage_textures;',
  },
  {
    name: 'bitcast expression',
    input: 'fn test(){var result:f32=bitcast<f32>(value);}',
    expected: dedent`
      fn test() {
        var result: f32 = bitcast<f32>(value);
      }
    `,
  },
  {
    name: 'typeless bitcast expression',
    input: 'fn test(){var result:f32=bitcast<>(value);}',
    expected: dedent`
      fn test() {
        var result: f32 = bitcast<>(value);
      }
    `,
  },
  {
    name: 'typecast expression - scalar conversion',
    input: 'fn test(){var result:f32=f32(intValue);}',
    expected: dedent`
      fn test() {
        var result: f32 = f32(intValue);
      }
    `,
  },
  {
    name: 'typecast expression - vector constructor',
    input: 'fn test(){var pos:vec3<f32>=vec3<f32>(1.0,2.0,3.0);}',
    expected: dedent`
      fn test() {
        var pos: vec3<f32> = vec3<f32>(1.0, 2.0, 3.0);
      }
    `,
  },
  {
    name: 'typecast expression - matrix constructor',
    input:
      'fn test(){var transform:mat4x4<f32>=mat4x4<f32>(col0,col1,col2,col3);}',
    expected: dedent`
      fn test() {
        var transform: mat4x4<f32> = mat4x4<f32>(col0, col1, col2, col3);
      }
    `,
  },
  {
    name: 'typecast expression - multiple types',
    input: 'fn test(){var a:i32=i32(3.14);var b:u32=u32(42);}',
    expected: dedent`
      fn test() {
        var a: i32 = i32(3.14);
        var b: u32 = u32(42);
      }
    `,
  },
  {
    name: 'diagnostic directive - global filter off',
    input: 'diagnostic(off,derivative_uniformity);var<private>d:f32;',
    expected: dedent`
      diagnostic(off, derivative_uniformity);
      var<private> d: f32;
    `,
  },
  {
    name: 'diagnostic directive - global filter warning',
    input: 'diagnostic(warning,subgroup_uniformity);fn test(){}',
    expected: dedent`
      diagnostic(warning, subgroup_uniformity);
      fn test() {}
    `,
  },
  {
    name: 'diagnostic directive - global filter error',
    input: 'diagnostic(error,derivative_uniformity);',
    expected: 'diagnostic(error, derivative_uniformity);',
  },
  {
    name: 'diagnostic directive - global filter info',
    input: 'diagnostic(info,derivative_uniformity);',
    expected: 'diagnostic(info, derivative_uniformity);',
  },
  {
    name: 'diagnostic directive - multiple global filters',
    input:
      'diagnostic(off,derivative_uniformity);diagnostic(warning,subgroup_uniformity);fn main(){}',
    expected: dedent`
      diagnostic(off, derivative_uniformity);
      diagnostic(warning, subgroup_uniformity);
      fn main() {}
    `,
  },
  {
    name: 'override declaration',
    input: 'override workgroupSize:u32=64;',
    expected: 'override workgroupSize: u32 = 64;',
  },
  {
    name: 'override without default value',
    input: 'override maxIterations:i32;',
    expected: 'override maxIterations: i32;',
  },
  {
    name: 'const expression in array size',
    input: 'const SIZE:i32=10;var buffer:array<f32,SIZE>;',
    expected: dedent`
      const SIZE: i32 = 10;
      var buffer: array<f32, 10>;
    `,
  },
  {
    name: 'switch with default selector',
    input: 'fn test(){switch(value){case 1:{result=1;}default:{result=0;}}}',
    expected: dedent`
      fn test() {
        switch (value) {
          case 1: {
            result = 1;
          }
          default: {
            result = 0;
          }
        }
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

  describe('ts files', () => {
    for (const test of tests.slice(0, 1)) {
      it(`should format ${test.name} correctly (tagged template literal)`, async () => {
        const result = await prettier.format(
          `const shader = wgsl\`${test.input}\`;\n`,
          {
            parser: 'typescript',
            plugins: [plugin],
            embeddedLanguageFormatting: 'auto',
          },
        );
        expect(result).toBe(`const shader = wgsl\`${test.expected}\`;\n`);
      });
    }

    for (const test of tests.slice(0, 1)) {
      it(`should format ${test.name} correctly (comment)`, async () => {
        const result = await prettier.format(
          `const shader = /*wgsl*/ \`${test.input}\`;\n`,
          {
            parser: 'typescript',
            plugins: [plugin],
            embeddedLanguageFormatting: 'auto',
          },
        );
        expect(result).toBe(`const shader = /*wgsl*/ \`${test.expected}\`;\n`);
      });
    }
  });
});
