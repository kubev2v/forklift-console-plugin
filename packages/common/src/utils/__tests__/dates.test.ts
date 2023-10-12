import {
  areSameDayInUTCZero,
  changeFormatToISODate,
  changeTimeZoneToUTCZero,
  isValidDate,
  parseISOtoJSDate,
  toISODate,
} from '../dates';

describe('changeTimeZoneToUTCZero', () => {
  test('from UTC+02:00', () => {
    expect(changeTimeZoneToUTCZero('2023-10-31T01:30:00.000+02:00')).toBe(
      '2023-10-30T23:30:00.000Z',
    );
  });
  test('invalid input', () => {
    expect(changeTimeZoneToUTCZero('2023-broken-10-31T01:30:00.000+02:00')).toBe(undefined);
  });
});

describe('changeFormatToISODate', () => {
  test('from ISO date time with zone', () => {
    expect(changeFormatToISODate('2023-10-31T01:30:00.000+02:00')).toBe('2023-10-31');
  });
  test('invalid input', () => {
    expect(changeFormatToISODate('2023-broken-10-31T01:30:00.000+02:00')).toBe(undefined);
  });
});

describe('toISODate', () => {
  test('unix epoch', () => {
    expect(toISODate(new Date(0))).toBe('1970-01-01');
  });
  test('missing date', () => {
    expect(toISODate(undefined)).toBe(undefined);
  });
  test('invalid date', () => {
    expect(toISODate(new Date('foo'))).toBe(undefined);
  });
});

describe('isValidDate', () => {
  test('2023-10-31T01:30:00.000+02:00', () => {
    expect(isValidDate('2023-10-31T01:30:00.000+02:00')).toBeTruthy();
  });
  test('invalid string', () => {
    expect(isValidDate('2023-broken-10-31')).toBeFalsy();
  });
  test('invalid number of days', () => {
    expect(isValidDate('2023-10-60')).toBeFalsy();
  });
});

describe('parseISOtoJSDate', () => {
  test('2023-10-31T01:30:00.000+02:00', () => {
    const date = parseISOtoJSDate('2023-10-31T01:30:00.000+02:00');
    expect(date.toUTCString()).toBe('Mon, 30 Oct 2023 23:30:00 GMT');
  });
  test('invalid input', () => {
    expect(parseISOtoJSDate('2023-broken-10-31T01:30:00.000+02:00')).toBe(undefined);
  });
});

describe('areSameDayInUTCZero', () => {
  test('the same date', () => {
    expect(areSameDayInUTCZero('2023-10-31T01:30:00.000+02:00', '2023-10-30')).toBeTruthy();
  });
  test('the different dates', () => {
    expect(areSameDayInUTCZero('2023-10-31T01:30:00.000+02:00', '2023-10-31')).toBeFalsy();
  });
  test('one date invalid', () => {
    expect(areSameDayInUTCZero('2023-10-31T10:00:00.000+02:00', '2023-foo')).toBeFalsy();
  });
  test('one date missing, one invalid', () => {
    expect(areSameDayInUTCZero(undefined, '2023-foo')).toBeFalsy();
  });
});
