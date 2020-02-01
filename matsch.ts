import * as ts from 'typescript';

import {makeNode} from './tshelp';

export function shallowMatch(n1: ts.Node, n2: ts.Node): boolean {
  if (n1.kind !== n2.kind) return false;
  if (ts.isIdentifier(n1) && ts.isIdentifier(n2)) {
    return n1.text === n2.text;
  }
  return true;  // recursion into children left for driver.
}

type Matcher = LiteralMatcher|CaptureMatcher;
interface LiteralMatcher {
  tag: 'literal';
  node: ts.Node;
  children: Matcher[];
}

interface CaptureMatcher {
  tag: 'capture';
  name: string;
  children: Matcher[];
}

export function matcherFromNode(n: ts.Node, literalOnly = false): Matcher {
  let matcher: Matcher;
  if (ts.isIdentifier(n) && n.text.startsWith('_') && !literalOnly) {
    matcher = {tag: 'capture', name: n.text, children: []};
  } else {
    matcher = {tag: 'literal', node: n, children: []};
  }
  ts.forEachChild(n, (child) => {
    matcher.children.push(matcherFromNode(child));
  });
  return matcher;
}

export function createMatcher(text: string, literalOnly = false) {
  const node = makeNode(text);
  // Intentionally limit to single expressions only.
  // I think statement matcher can work, but can be also very confusing.
  if (node.statements.length !== 1) {
    throw new Error(`matcher has to be a single expression.`);
  }
  const stmt = node.statements[0];
  if (!ts.isExpressionStatement(stmt)) {
    throw new Error(`matcher has to be a single expression.`);
  }
  return matcherFromNode(stmt.expression, literalOnly);
}

interface Match {
  success: boolean;
  // only if success is true.
  captures?: Map<string, CaptureState>;
}

interface CaptureState {
  node: ts.Node;
  matcher: Matcher;
}

export function match(matcher: Matcher, text: string): Match {
  const node = makeNode(text);
  // Intentionally limit to single expressions only.
  // I think statement matcher can work, but can be also very confusing.
  if (node.statements.length !== 1) {
    throw new Error(`match text has to be a single expression.`);
  }
  const stmt = node.statements[0];
  if (!ts.isExpressionStatement(stmt)) {
    throw new Error(`match text has to be a single expression.`);
  }
  return matchRec(matcher, stmt.expression , new Map<string, CaptureState>());
}

export function matchRec(
    matcher: Matcher, n: ts.Node, captures: Map<string, CaptureState>): Match {
  if (matcher.tag === 'literal') {
    if (!shallowMatch(matcher.node, n)) {
      return {success: false};
    }
  }
  if (matcher.tag === 'capture') {
    if (captures.has(matcher.name)) {
      return matchRec(captures.get(matcher.name)!.matcher, n, captures);
    } else {
      // Creating a matcher from the capture is a bit odd in case
      // there is an _ in the first match.
      captures.set(matcher.name, {node: n, matcher: matcherFromNode(n, /* literalOnly */ true)});
      return {success: true, captures};
    }
  }
  let idx = 0;
  let success = true;
  ts.forEachChild(n, child => {
    if (idx === matcher.children.length) {
      success = false;
      return;
    }
    if (!matchRec(matcher.children[idx], child, captures).success) {
      success = false;
    };
    idx += 1;
  });
  if (idx !== matcher.children.length) {
    return {success: false};
  }
  return success ? {success: true, captures} : {success};
}

export function matchInText(matcher: Matcher, text: string): string[] {
  const src = makeNode(text);
  const res: string[] = [];
  function agg(child: ts.Node) {
    if (matchRec(matcher, child, new Map()).success) {
      res.push(child.getFullText(src));
    }
    child.forEachChild(agg);
  }
  src.forEachChild(agg);
  return res;
}