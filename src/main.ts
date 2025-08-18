import traverse, {NodePath} from '@babel/traverse';
import type {
  Node as BabelNode,
  TaggedTemplateExpression,
  TemplateLiteral,
} from '@babel/types';
import type {AstPath, Options, Parser, ParserOptions, Plugin} from 'prettier';
import * as prettier from 'prettier';
import * as prettierParserAcorn from 'prettier/plugins/acorn';
import * as prettierParserBabel from 'prettier/plugins/babel';
import * as prettierParserFlow from 'prettier/plugins/flow';
import * as prettierParserMeriyah from 'prettier/plugins/meriyah';
import * as prettierParserTypescript from 'prettier/plugins/typescript';
import {WgslParser} from 'wgsl_reflect';

import {printWgsl} from './printWgsl';
import type {ParsedWgsl} from './types';

type ParserAndTransform<AST> = {
  parser: Parser<AST>;
  transform: (parentParser: string, ast: AST, options: Options) => AST;
};

function transformJavascript(
  parentParser: string,
  ast: BabelNode,
  options: Options = {},
) {
  // Walk the AST looking for template literals marked with the `wgsl` tag, or
  // decorated with the `/*wgsl*/` pragma.
  //
  // If found, format the contents of every template literal using
  // `prettier.format`.

  // First, collect all comments and template literals
  const commentsWithWgsl = [];
  const templateLiterals: {path: NodePath<TemplateLiteral>; start?: number}[] =
    [];

  traverse(ast, {
    TaggedTemplateExpression(path: NodePath<TaggedTemplateExpression>) {
      const {tag, quasi} = path.node;

      // Check if it's tagged with `wgsl`
      if (tag.type === 'Identifier' && tag.name === 'wgsl') {
        formatWgslInTemplateLiteral(parentParser, quasi, options);
      }
    },

    TemplateLiteral(path: NodePath<TemplateLiteral>) {
      if (path.node.start !== null) {
        templateLiterals.push({path, start: path.node.start});
      }
    },
  });

  // Find comments in the AST - babel stores comments separately

  // @ts-expect-error - FIXME: We should use `leadingComments` and
  // `trailingComments` instead
  const comments = ast.comments || [];

  for (const comment of comments) {
    if (comment.value.trim() === 'wgsl') {
      commentsWithWgsl.push(comment);
    }
  }

  // If we found wgsl comments, format all template literals (simple approach)
  if (commentsWithWgsl.length > 0) {
    for (const {path} of templateLiterals) {
      formatWgslInTemplateLiteral(parentParser, path.node, options);
    }
  }

  return ast;
}

async function formatWgslInTemplateLiteral(
  parentParser: string,
  templateLiteral: TemplateLiteral,
  options: Options,
) {
  // Only handle simple template literals with one quasi element for now
  if (templateLiteral.quasis && templateLiteral.quasis.length === 1) {
    const quasi = templateLiteral.quasis[0];
    if (!quasi) return;

    const wgslCode = quasi.value.raw;

    // HACKish: I would prefer to use `prettier.format` here, but unfortunately
    // there is no synchronous API we can use with custom plugins.
    // `@prettier/sync` unfortunately uses some kind of serialization trick to
    // conver its API to something synchronous, which means our plugins'
    // functions fail to be serialized.
    const {formatted} = prettier.doc.printer.printDocToString(
      printWgsl(plugin.parsers.wgsl.parse(wgslCode)),
      {
        printWidth: options.printWidth ?? 80,
        tabWidth: options.tabWidth ?? 2,
        parentParser,
      },
    );

    // Update the template literal with formatted code
    quasi.value.raw = formatted;
    quasi.value.cooked = formatted;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PARSERS: Record<string, ParserAndTransform<any>> = {
  __js_expression: {
    parser: prettierParserBabel.parsers.__js_expression,
    transform: transformJavascript,
  },
  'babel-flow': {
    parser: prettierParserBabel.parsers['babel-flow'],
    transform: transformJavascript,
  },
  'babel-ts': {
    parser: prettierParserBabel.parsers['babel-ts'],
    transform: transformJavascript,
  },
  acorn: {
    parser: prettierParserAcorn.parsers.acorn,
    transform: transformJavascript,
  },
  babel: {
    parser: prettierParserBabel.parsers.babel,
    transform: transformJavascript,
  },
  flow: {
    parser: prettierParserFlow.parsers.flow,
    transform: transformJavascript,
  },
  meriyah: {
    parser: prettierParserMeriyah.parsers.meriyah,
    transform: transformJavascript,
  },
  typescript: {
    parser: prettierParserTypescript.parsers.typescript,
    transform: transformJavascript,
  },
};

const builtinPlugins = {
  parsers: PARSERS,
} as const;

/**
 * Prettier plugin for WGSL (WebGPU Shading Language)
 */
const plugin = {
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
      parse: (text: string) => ({
        text,
        statements: new WgslParser().parse(text),
      }),
      astFormat: 'wgsl',
      locStart: () => 0,
      locEnd: () => 0,
    },
    ...Object.entries(builtinPlugins.parsers).reduce(
      (acc: Record<string, Parser>, [key, {parser, transform}]) => {
        acc[key] = {
          ...parser,
          async parse(text: string, options: ParserOptions) {
            const ast = await parser.parse(text, options);
            return transform(key, ast, options);
          },
        };
        return acc;
      },
      {},
    ),
  },
  printers: {
    wgsl: {
      print: (path: AstPath<ParsedWgsl>) => printWgsl(path.node),
    },
  },
  options: {},
  defaultOptions: {},
} as const satisfies Plugin<ParsedWgsl>;

export default plugin;
