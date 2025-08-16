import type {Plugin} from 'prettier';

/**
 * Prettier plugin for WGSL (WebGPU Shading Language)
 */
const plugin: Plugin = {
  languages: [
    {
      name: 'WGSL',
      parsers: ['wgsl'],
      extensions: ['.wgsl'],
      vscodeLanguageIds: ['wgsl'],
    },
  ],
  parsers: {
    wgsl: {
      parse: () => {
        throw new Error('WGSL parser not implemented yet');
      },
      astFormat: 'wgsl',
      locStart: () => 0,
      locEnd: () => 0,
    },
  },
  printers: {
    wgsl: {
      print: () => {
        throw new Error('WGSL printer not implemented yet');
      },
    },
  },
  options: {},
  defaultOptions: {},
};

export default plugin;
