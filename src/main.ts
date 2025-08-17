import type {AstPath, Doc, Plugin} from 'prettier';
import {builders} from 'prettier/doc';
import {
  Alias,
  Argument,
  ArrayIndex,
  ArrayType,
  Assign,
  Attribute,
  BinaryOperator,
  BitcastExpr,
  Call,
  CallExpr,
  Case,
  Const,
  Continuing,
  CreateExpr,
  Default,
  Diagnostic,
  ElseIf,
  Enable,
  Expression,
  For,
  Function,
  If,
  Increment,
  Let,
  LiteralExpr,
  Loop,
  Member,
  Node,
  Override,
  PointerType,
  Requires,
  Return,
  SamplerType,
  Statement,
  StringExpr,
  Struct,
  Switch,
  TemplateType,
  Type,
  UnaryOperator,
  Var,
  VariableExpr,
  WgslParser,
  While,
} from 'wgsl_reflect';

const {hardline, indent, join} = builders;

type ParsedWgsl = {
  text: string;
  statements: Statement[];
};

/**
 * Prettier plugin for WGSL (WebGPU Shading Language)
 */
const plugin: Plugin<ParsedWgsl> = {
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
  },
  printers: {
    wgsl: {
      print: (path: AstPath<ParsedWgsl>) => {
        const {text, statements} = path.node;
        return join(hardline, statements.map(printStatement));

        function printWgslNode(node: Node): Doc {
          switch (node.astNodeType) {
            // Statement types
            case 'var':
              return printVar(node as Var);
            case 'let':
              return printLet(node as Let);
            case 'const':
              return printConst(node as Const);
            case 'function':
              return printFunction(node as Function);
            case 'struct':
              return printStruct(node as Struct);
            case 'return':
              return printReturn(node as Return);
            case 'if':
              return printIf(node as If);
            case 'for':
              return printFor(node as For);
            case 'while':
              return printWhile(node as While);
            case 'switch':
              return printSwitch(node as Switch);
            case 'assign':
              return printAssign(node as Assign);
            case 'break':
              return printBreak();
            case 'continue':
              return printContinue();
            case 'discard':
              return printDiscard();
            case 'increment':
              return printIncrement(node as Increment);
            case 'call':
              return printCall(node as Call);

            // Expression types
            case 'literalExpr':
              return printLiteralExpr(node as LiteralExpr);
            case 'variableExpr':
            case 'varExpr':
              return printVariableExpr(node as VariableExpr);
            case 'binaryOperator':
            case 'binaryOp':
              return printBinaryOperator(node as BinaryOperator);
            case 'unaryOperator':
            case 'unaryOp':
              return printUnaryOperator(node as UnaryOperator);
            case 'callExpr':
              return printCallExpr(node as CallExpr);
            case 'createExpr':
              return printCreateExpr(node as CreateExpr);
            case 'stringExpr':
              return printStringExpr(node as StringExpr);
            case 'arrayIndex':
              return printArrayIndexExpr(node as ArrayIndex);

            // Type expressions
            case 'type':
              return printTypeNode(node as Type);
            case 'templateType':
            case 'template':
              return printTemplateType(node as TemplateType);
            case 'arrayType':
            case 'array':
              return printArrayType(node as ArrayType);
            case 'pointerType':
            case 'pointer':
              return printPointerType(node as PointerType);
            case 'samplerType':
            case 'sampler':
              return printSamplerType(node as SamplerType);

            // Other nodes
            case 'argument':
              return printArgument(node as Argument);
            case 'member':
              return printMember(node as Member);
            case 'attribute':
              return printAttribute(node as Attribute);
            case 'case':
              return printCase(node as Case);
            case 'default':
              return printDefault(node as Default);
            case 'elseIf':
              return printElseIf(node as ElseIf);
            case 'alias':
              return printAlias(node as Alias);
            case 'loop':
              return printLoop(node as Loop);
            case 'continuing':
              return printContinuing(node as Continuing);
            case 'enable':
              return printEnable(node as Enable);
            case 'requires':
              return printRequires(node as Requires);
            case 'bitcastExpr':
              return printBitcastExpr(node as BitcastExpr);
            case 'diagnostic':
              return printDiagnostic(node as Diagnostic);

            case 'typecastExpr':
              // typecastExpr nodes are not currently generated by the parser
              // Type conversions like f32(value) are handled by createExpr
              // instead
              return text.slice(node.start, node.start + node.length);
            case 'override':
              return printOverride(node as Override);
            case 'staticAssert':
              // staticAssert nodes are not currently generated by the parser
              // Static assertions are not yet supported in WGSL
              return text.slice(node.start, node.start + node.length);
            case 'constExpr':
              // constExpr nodes are not currently generated by the parser
              // Constant expressions are evaluated and become literals instead
              return text.slice(node.start, node.start + node.length);
            case 'defaultSelector':
              // defaultSelector nodes are not currently generated by the parser
              // Default cases in switch statements are handled by the 'default'
              // case instead
              return text.slice(node.start, node.start + node.length);
            default:
              return text.slice(node.start, node.start + node.length);
          }
        }

        function printVar(node: Var): Doc {
          const parts: Doc[] = [];

          if (node.attributes) {
            parts.push(...node.attributes.map((attr) => printAttribute(attr)));
            parts.push(hardline);
          }

          parts.push('var');

          if (node.storage || node.access) {
            parts.push('<');
            if (node.storage) {
              parts.push(node.storage);
              if (node.access) {
                parts.push(', ', node.access);
              }
            }
            parts.push('>');
          }

          parts.push(' ', node.name);

          if (node.type) {
            parts.push(': ', printType(node.type));
          }

          if (node.value) {
            parts.push(' = ', printExpression(node.value));
          }

          parts.push(';');

          return parts;
        }

        function printLet(node: Let): Doc {
          const parts: Doc[] = [];

          if (node.attributes) {
            parts.push(...node.attributes.map((attr) => printAttribute(attr)));
            parts.push(hardline);
          }

          parts.push('let ');
          parts.push(node.name);

          if (node.type) {
            parts.push(': ', printType(node.type));
          }

          if (node.value) {
            parts.push(' = ', printExpression(node.value));
          }

          parts.push(';');

          return parts;
        }

        function printConst(node: Const): Doc {
          const parts: Doc[] = [];

          if (node.attributes) {
            parts.push(...node.attributes.map((attr) => printAttribute(attr)));
            parts.push(hardline);
          }

          parts.push('const ');
          parts.push(node.name);

          if (node.type) {
            parts.push(': ', printType(node.type));
          }

          parts.push(' = ', printExpression(node.value));
          parts.push(';');

          return parts;
        }

        function printFunction(node: Function): Doc {
          const parts: Doc[] = [];

          if (node.attributes) {
            node.attributes.forEach((attr) => {
              parts.push(printAttribute(attr), hardline);
            });
          }

          parts.push('fn ', node.name, '(');

          if (node.args.length > 0) {
            parts.push(
              join(
                ', ',
                node.args.map((arg) => printArgument(arg)),
              ),
            );
          }

          parts.push(')');

          if (node.returnType) {
            parts.push(' -> ', printType(node.returnType));
          }

          parts.push(' {');

          if (node.body.length > 0) {
            parts.push(
              indent([hardline, join(hardline, node.body.map(printStatement))]),
              hardline,
            );
          }

          parts.push('}');

          return parts;
        }

        function printStruct(node: Struct): Doc {
          const parts: Doc[] = [];

          if (node.attributes) {
            node.attributes.forEach((attr) => {
              parts.push(printAttribute(attr), hardline);
            });
          }

          parts.push('struct ', node.name, ' {');

          if (node.members.length > 0) {
            parts.push(
              indent([
                hardline,
                join(
                  hardline,
                  node.members.map((member) => printMember(member)),
                ),
              ]),
              hardline,
            );
          }

          parts.push('}');

          return parts;
        }

        function printStatement(stmt: Statement): Doc {
          return printWgslNode(stmt);
        }

        function printExpression(expr: Expression): Doc {
          return printWgslNode(expr);
        }

        function printType(type: Type): Doc {
          return printWgslNode(type);
        }

        function printTypeNode(node: Type): Doc {
          const parts: Doc[] = [];

          if (node.attributes) {
            parts.push(
              ...node.attributes.map((attr) => printAttribute(attr)),
              ' ',
            );
          }

          parts.push(node.name);

          return parts;
        }

        function printReturn(node: Return): Doc {
          return ['return ', printExpression(node.value), ';'];
        }

        function printIf(node: If): Doc {
          const parts: Doc[] = ['if (', printExpression(node.condition), ') {'];

          if (node.body.length > 0) {
            parts.push(
              indent([hardline, join(hardline, node.body.map(printStatement))]),
              hardline,
            );
          }

          parts.push('}');

          if (node.elseif) {
            node.elseif.forEach((elseif) => {
              parts.push(' else ', printElseIf(elseif));
            });
          }

          if (node.else) {
            parts.push(' else {');
            if (node.else.length > 0) {
              parts.push(
                indent([
                  hardline,
                  join(
                    hardline,
                    node.else.map((stmt) => printStatement(stmt)),
                  ),
                ]),
                hardline,
              );
            }
            parts.push('}');
          }

          return parts;
        }

        function printFor(node: For): Doc {
          const parts: Doc[] = ['for ('];

          if (node.init) {
            // Remove semicolon from init statement for for-loop formatting
            const initParts = printStatement(node.init);
            if (Array.isArray(initParts)) {
              const lastPart = initParts[initParts.length - 1];
              if (lastPart === ';') {
                initParts.pop();
              }
            }
            parts.push(initParts);
          }

          parts.push('; ');

          if (node.condition) {
            parts.push(printExpression(node.condition));
          }

          parts.push('; ');

          if (node.increment) {
            const incParts = printStatement(node.increment);
            if (Array.isArray(incParts)) {
              const lastPart = incParts[incParts.length - 1];
              if (lastPart === ';') {
                incParts.pop();
              }
            }
            parts.push(incParts);
          }

          parts.push(') {');

          if (node.body.length > 0) {
            parts.push(
              indent([hardline, join(hardline, node.body.map(printStatement))]),
              hardline,
            );
          }

          parts.push('}');

          return parts;
        }

        function printWhile(node: While): Doc {
          const parts: Doc[] = [
            'while (',
            printExpression(node.condition),
            ') {',
          ];

          if (node.body.length > 0) {
            parts.push(
              indent([hardline, join(hardline, node.body.map(printStatement))]),
              hardline,
            );
          }

          parts.push('}');

          return parts;
        }

        function printSwitch(node: Switch): Doc {
          const parts: Doc[] = [
            'switch (',
            printExpression(node.condition),
            ') {',
          ];

          if (node.cases.length > 0) {
            parts.push(
              indent([
                hardline,
                join(
                  hardline,
                  node.cases.map((switchCase) => printWgslNode(switchCase)),
                ),
              ]),
              hardline,
            );
          }

          parts.push('}');

          return parts;
        }

        function printAssign(node: Assign): Doc {
          return [
            printExpression(node.variable),
            ' ',
            node.operator,
            ' ',
            printExpression(node.value),
            ';',
          ];
        }

        function printBreak(): Doc {
          return 'break;';
        }

        function printContinue(): Doc {
          return 'continue;';
        }

        function printDiscard(): Doc {
          return 'discard;';
        }

        function printIncrement(node: Increment): Doc {
          return [printExpression(node.variable), node.operator, ';'];
        }

        function printCall(node: Call): Doc {
          const parts: Doc[] = [node.name, '('];

          if (node.args.length > 0) {
            parts.push(
              join(
                ', ',
                node.args.map((arg) => printExpression(arg)),
              ),
            );
          }

          parts.push(')', ';');

          return parts;
        }

        function printLiteralExpr(node: LiteralExpr): Doc {
          // Check if this is a floating point number and ensure it has decimal
          // point
          const value = text.slice(node.start, node.start + node.length);
          if (
            node.type.name === 'f32' &&
            !value.includes('.') &&
            !value.includes('e')
          ) {
            return value + '.0';
          }
          return value;
        }

        function printVariableExpr(node: VariableExpr): Doc {
          const parts: Doc[] = [node.name];

          if (node.postfix) {
            parts.push(printPostfixExpression(node.postfix));
          }

          return parts;
        }

        function printStringExpr(node: StringExpr): Doc {
          // StringExpr is likely used for property names in member access
          return node.value;
        }

        function printArrayIndexExpr(node: ArrayIndex): Doc {
          return ['[', printExpression(node.index), ']'];
        }

        function printPostfixExpression(postfix: Expression): Doc {
          // Handle member access (.property) and array access ([index])
          const postfixNode = postfix as Expression & {
            astNodeType: string;
            member?: string;
            index?: Expression;
          };

          // Check for array access by presence of index property
          if (postfixNode.index) {
            return ['[', printExpression(postfixNode.index), ']'];
          }

          switch (postfixNode.astNodeType) {
            case 'memberExpr':
              return ['.', postfixNode.member ?? ''];
            case 'arrayIndex':
              return printArrayIndexExpr(postfix as ArrayIndex);
            case 'stringExpr':
              return ['.', printStringExpr(postfix as StringExpr)];
            default:
              // For other postfix expressions, recursively print them
              return printExpression(postfix);
          }
        }

        function printBinaryOperator(node: BinaryOperator): Doc {
          return [
            printExpression(node.left),
            ' ',
            node.operator,
            ' ',
            printExpression(node.right),
          ];
        }

        function printUnaryOperator(node: UnaryOperator): Doc {
          return [node.operator, printExpression(node.right)];
        }

        function printCallExpr(node: CallExpr): Doc {
          const parts: Doc[] = [node.name, '('];

          if (node.args && node.args.length > 0) {
            parts.push(
              join(
                ', ',
                node.args.map((arg) => printExpression(arg)),
              ),
            );
          }

          parts.push(')');

          if (node.postfix) {
            parts.push(printPostfixExpression(node.postfix));
          }

          return parts;
        }

        function printCreateExpr(node: CreateExpr): Doc {
          const parts: Doc[] = [];

          if (node.type) {
            parts.push(printType(node.type));
          }

          const hasPostfix = Boolean(node.postfix);
          const hasArgs = node.args && node.args.length > 0;

          // Only add parentheses if we have arguments or no postfix
          if (hasArgs || !hasPostfix) {
            parts.push('(');

            if (hasArgs) {
              parts.push(
                join(
                  ', ',
                  node.args!.map((arg) => printExpression(arg)),
                ),
              );
            }

            parts.push(')');
          }

          if (node.postfix) {
            parts.push(printPostfixExpression(node.postfix));
          }

          return parts;
        }

        function printTemplateType(node: TemplateType): Doc {
          const parts: Doc[] = [];

          if (node.attributes) {
            parts.push(...node.attributes.map(printAttribute), ' ');
          }

          parts.push(node.name);

          if (node.format || node.access) {
            parts.push('<');
            if (node.format) {
              parts.push(printType(node.format));
              if (node.access) {
                parts.push(', ', node.access);
              }
            } else if (node.access) {
              parts.push(node.access);
            }
            parts.push('>');
          }

          return parts;
        }

        function printArrayType(node: ArrayType): Doc {
          const parts: Doc[] = ['array'];

          if (node.format || node.count > 0) {
            parts.push('<');
            if (node.format) {
              parts.push(printType(node.format));
              if (node.count > 0) {
                parts.push(', ', node.count.toString());
              }
            } else if (node.count > 0) {
              parts.push(node.count.toString());
            }
            parts.push('>');
          }

          return parts;
        }

        function printPointerType(node: PointerType): Doc {
          const parts: Doc[] = ['ptr'];

          // Cast to access storage and access properties
          const ptrNode = node;

          if (ptrNode.storage || ptrNode.access) {
            parts.push('<');
            if (ptrNode.storage) {
              parts.push(ptrNode.storage);
              if (ptrNode.type) {
                parts.push(', ', printType(ptrNode.type));
              }
              if (ptrNode.access) {
                parts.push(', ', ptrNode.access);
              }
            }
            parts.push('>');
          }

          return parts;
        }

        function printSamplerType(node: SamplerType): Doc {
          const parts: Doc[] = [node.name];

          if (node.format) {
            parts.push('<');
            if (typeof node.format === 'string') {
              parts.push(node.format);
            } else {
              parts.push(printType(node.format));
            }
            parts.push('>');
          }

          return parts;
        }

        function printArgument(node: Argument): Doc {
          const parts: Doc[] = [];

          if (node.attributes) {
            parts.push(
              ...node.attributes.map((attr) => printAttribute(attr)),
              ' ',
            );
          }

          parts.push(node.name, ': ', printType(node.type));

          return parts;
        }

        function printMember(node: Member): Doc {
          const parts: Doc[] = [];

          if (node.attributes) {
            parts.push(
              ...node.attributes.map((attr) => printAttribute(attr)),
              ' ',
            );
          }

          parts.push(node.name);

          if (node.type) {
            parts.push(': ', printType(node.type));
          }

          parts.push(',');

          return parts;
        }

        function printAttribute(node: Attribute): Doc {
          const parts: Doc[] = ['@', node.name];

          if (node.value) {
            parts.push('(');
            if (Array.isArray(node.value)) {
              parts.push(join(', ', node.value));
            } else {
              parts.push(node.value);
            }
            parts.push(')');
          }

          return parts;
        }

        function printCase(node: Case): Doc {
          const parts: Doc[] = [];

          node.selectors.forEach((selector, i) => {
            if (i > 0) parts.push(', ');
            parts.push('case ', printExpression(selector));
          });

          parts.push(': {');

          if (node.body.length > 0) {
            parts.push(
              indent([hardline, join(hardline, node.body.map(printStatement))]),
              hardline,
            );
          }

          parts.push('}');

          return parts;
        }

        function printDefault(node: Default): Doc {
          const parts: Doc[] = ['default: {'];

          if (node.body.length > 0) {
            parts.push(
              indent([hardline, join(hardline, node.body.map(printStatement))]),
              hardline,
            );
          }

          parts.push('}');

          return parts;
        }

        function printElseIf(node: ElseIf): Doc {
          const parts: Doc[] = ['if (', printExpression(node.condition), ') {'];

          if (node.body.length > 0) {
            parts.push(
              indent([hardline, join(hardline, node.body.map(printStatement))]),
              hardline,
            );
          }

          parts.push('}');

          return parts;
        }

        function printAlias(node: Alias): Doc {
          return ['alias ', node.name, ' = ', printType(node.type), ';'];
        }

        function printLoop(node: Loop): Doc {
          const parts: Doc[] = ['loop {'];

          const bodyParts: Doc[] = [];

          if (node.body.length > 0) {
            // Filter out continuing statements from body since they have
            // special handling
            const bodyStatements = node.body.filter(
              (stmt) => stmt.astNodeType !== 'continuing',
            );
            if (bodyStatements.length > 0) {
              bodyParts.push(
                join(hardline, bodyStatements.map(printStatement)),
              );
            }
          }

          // Handle continuing separately at the end of the loop
          if (node.continuing) {
            bodyParts.push(printContinuing(node.continuing));
          }

          if (bodyParts.length > 0) {
            parts.push(indent([hardline, join(hardline, bodyParts)]), hardline);
          }

          parts.push('}');

          return parts;
        }

        function printContinuing(node: Continuing): Doc {
          const parts: Doc[] = ['continuing {'];

          if (node.body.length > 0) {
            parts.push(
              indent([hardline, join(hardline, node.body.map(printStatement))]),
              hardline,
            );
          }

          parts.push('}');

          return parts;
        }

        function printEnable(node: Enable): Doc {
          return ['enable ', node.name, ';'];
        }

        function printRequires(node: Requires): Doc {
          return ['requires ', join(', ', node.extensions), ';'];
        }

        function printBitcastExpr(node: BitcastExpr): Doc {
          return [
            'bitcast<',
            node.type ? printType(node.type) : '',
            '>(',
            printExpression(node.value),
            ')',
          ];
        }

        function printDiagnostic(node: Diagnostic): Doc {
          return ['diagnostic(', node.severity, ', ', node.rule, ');'];
        }

        function printOverride(node: Override): Doc {
          const parts: Doc[] = [];

          if (node.attributes) {
            parts.push(...node.attributes.map((attr) => printAttribute(attr)));
            parts.push(hardline);
          }

          parts.push('override ');
          parts.push(node.name);

          if (node.type) {
            parts.push(': ', printType(node.type));
          }

          if (node.value) {
            parts.push(' = ', printExpression(node.value));
          }

          parts.push(';');

          return parts;
        }
      },
    },
  },
  options: {},
  defaultOptions: {},
};

export default plugin;
