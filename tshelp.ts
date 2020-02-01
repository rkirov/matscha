import * as ts from 'typescript';

export function makeNode(text: string): ts.SourceFile {
  return ts.createSourceFile('***synthetic***', text, ts.ScriptTarget.ESNext);
}
