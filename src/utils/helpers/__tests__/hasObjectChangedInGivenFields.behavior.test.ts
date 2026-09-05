import { hasObjectChangedInGivenFields } from '../hasObjectChangedInGivenFields';

describe('hasObjectChangedInGivenFields - behavior', () => {
  it('returns false when objects are deeply equal', () => {
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: { a: 1, nested: { b: 2 } },
        oldObject: { a: 1, nested: { b: 2 } },
      }),
    ).toBe(false);
  });

  it('returns true when a compared field changes', () => {
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: { a: 2 },
        oldObject: { a: 1 },
      }),
    ).toBe(true);
  });

  it('ignores avoided fields when deciding change', () => {
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: ['revision'],
        newObject: { name: 'x', revision: 9 },
        oldObject: { name: 'x', revision: 1 },
      }),
    ).toBe(false);
  });

  it('still reports changed when avoided field causes key-length mismatch', () => {
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: ['revision'],
        newObject: { name: 'x', revision: 1 },
        oldObject: { name: 'x' },
      }),
    ).toBe(true);
  });

  it('handles primitives, null, undefined, and empty objects', () => {
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: 1 as never,
        oldObject: 1 as never,
      }),
    ).toBe(false);
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: null as never,
        oldObject: null as never,
      }),
    ).toBe(false);
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: undefined,
        oldObject: undefined,
      }),
    ).toBe(false);
    expect(
      hasObjectChangedInGivenFields({ fieldsToAvoidComparing: [], newObject: {}, oldObject: {} }),
    ).toBe(false);
  });

  it('detects array length and content differences', () => {
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: [1, 2],
        oldObject: [1, 2],
      }),
    ).toBe(false);
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: [1, 3],
        oldObject: [1, 2],
      }),
    ).toBe(true);
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: [1],
        oldObject: [1, 2],
      }),
    ).toBe(true);
  });

  it('returns true when comparing object vs array', () => {
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: { 0: 1 } as never,
        oldObject: [1] as never,
      }),
    ).toBe(true);
  });

  it('returns true when key sets differ', () => {
    expect(
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: { a: 1, b: 2 },
        oldObject: { a: 1 },
      }),
    ).toBe(true);
  });
});
