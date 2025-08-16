import prettier from 'prettier';
import {describe, expect, it} from 'vitest';

type Test = {
  name: string;
  parser: 'wgsl' | 'typescript';
  input: string;
  expected: string;
};

const tests: Test[] = [
  {
    name: 'basic',
    parser: 'wgsl',
    input: 'var x:f32=1.0;',
    expected: 'var x: f32 = 1.0;',
  },
];

describe('prettier-plugin-wgsl', () => {
  for (const test of tests) {
    it(`should format ${test.name} correctly`, async () => {
      const result = await prettier.format(test.input, {
        parser: test.parser,
        plugins: ['.'],
      });
      expect(result).toBe(test.expected);
    });
  }
});
