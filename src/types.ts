import {Statement} from 'wgsl_reflect';

export type ParsedWgsl = {
  text: string;
  statements: Statement[];
};
