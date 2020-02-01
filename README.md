# maTScha

A library for performing syntactic (AST-based) matches for JS and TS.


## How to use a CLI tool

Basic usage is:

> node matscha <matcher> <file1> <file2> ...

The matcher is matched against each node and the fullText of the matching node is printed.

## How to use as library

Basic matching is performed with `createMatcher` and `match`. Since this is AST
based white-space and comments are ignored.

```
const m = createMatcher(`a + b`);
match(m, `a + b`).success  // true
match(m, `a + /* don't forget b */ b`).success  // true
match(m, `a * b`).success  // false
```

The matcher text can be any valid JavaScript or TypeScript text. Every token is
interpreted to only match itself, except symbols that start with `_`. Such
symbols create capture variables. Such variables match every expression, but
the match has to be consistent on every recurring mention in the matcher. 

```
const m = createMatcher(`_ + _`);
match(m, `a + a`).success  // true
match(m, `a + b`).success  // false
match(m, `(a + b) + (a + b)`).success  // true

--
```

The captures made during a successful match can be accessed by `match(...).captures`.

## Replace

Matches can be used together with replacements. The captured variables are accessible
using the same names.

```
const m = createMatcher(`_ + _`);
after = replace(m, `2 * _`, before); 

BEFORE
1 + 1
f(1) + f(1)

AFTER
2 * 1
2 * f(1) 
```

TODO: not implemented because I need a library to swap AST nodes and reprint the rest.

## Problems

- Does not make use of type info or module/symbol resolution. It would be nice
  to be able to match all API calls even if they are renamed through
  import/export or aliases.

- Currently, we rely on structural recursion using ts.forEachChild which is not
  perfect as it ignores names of properties we recurse into. I can imagine cases where

- Need some escaping mechanism for actual variables that use underscores to be used in the matcher.

- Statement matching needs a differnt mechanism. For example, function() {...} to () => {...} is
  hard to write now.

## Reference 

- Refaster is very similar but also uses type information for matching.
https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/41876.pdf

## Pronunciation

You can just say `matcha`.
