import {match, createMatcher} from './matsch';

test('simple matcher without capture', () => {
    const m = createMatcher(`a + b`); 
    expect(match(m, `a + b`).success).toBe(true);
    expect(match(m, `a + a`).success).toBe(false);
});

test('complex matcher without capture', () => {
    const m = createMatcher(`(a + (b + c))`); 

    expect(match(m, `(a + (b + c))`).success).toBe(true);
    expect(match(m, `a + b`).success).toBe(false);
});

test('function matcher without capture', () => {
    const m = createMatcher(`f(a, b, c)`); 

    expect(match(m, `f(a, b, c)`).success).toBe(true);
    expect(match(m, `f(a, b)`).success).toBe(false);
    expect(match(m, `f(a, b, ...c)`).success).toBe(false);
});

test('simple matcher with capture', () => {
    const m = createMatcher(`_ + _`); 
    expect(match(m, `a + a`).success).toBe(true);
    expect(match(m, `a + b`).success).toBe(false);
    expect(match(m, `b + b`).success).toBe(true);

    expect(match(m, `(a + b) + (a + b)`).success).toBe(true);
    expect(match(m, `(a + b) + (a + a)`).success).toBe(false);

    expect(match(m, `f(a) + f(a)`).success).toBe(true);
});

test('simple matcher with capture returns captures', () => {
    const m = createMatcher(`_ + _`); 
    const captures = match(m, `a + a`).captures;
    expect(captures!.size).toBe(1);
});

test('using underscore in text to capture', () => {
    const m = createMatcher(`_ + _`); 
    // Without literalOnly flag, this is infinite recursion.
    expect(match(m, `_ + a`).success).toBe(false);
});