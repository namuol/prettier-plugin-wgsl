# prettier-plugin-wgsl

A [Prettier](https://prettier.io/) plugin for formatting [WGSL (WebGPU Shading Language)](https://gpuweb.github.io/gpuweb/wgsl/) code.

## Features

- Formats `.wgsl` files directly
- Formats WGSL code in tagged template literals:
  ```ts
  wgsl`
    struct VertexInput {
      @location(0) position: vec3<f32>,
      @location(1) normal: vec3<f32>
    };
  `;
  ```
- Supports `/*wgsl*/` comment syntax:
  ```ts
  /*wgsl*/ `
    @vertex
    fn vertex_main(input: VertexInput) -> VertexOutput {
      var output: VertexOutput;
      output.position = vec4<f32>(input.position, 1.0);
      return output;
    }
  `;
  ```

## Installation

```bash
npm install --save-dev prettier-plugin-wgsl
```

## Usage

### CLI

```bash
# Format .wgsl files
npx prettier --write "**/*.wgsl"

# Format JavaScript/TypeScript files with WGSL template literals
npx prettier --write "**/*.{js,ts,jsx,tsx}"
```

### Configuration

Add to your `.prettierrc` or `prettier.config.js`:

```json
{
  "plugins": ["prettier-plugin-wgsl"]
}
```

## License

MIT
