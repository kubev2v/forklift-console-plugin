import { toMap } from '../useSearchParams';

describe('verify search string mapping', () => {
  test('search is empty', () => {
    expect(toMap('')).toEqual({});
  });

  test('search is only "?", therefore empty', () => {
    expect(toMap('?')).toEqual({});
  });

  test('search has a single key, no value', () => {
    expect(toMap('keyName')).toEqual({ keyName: '' });
  });

  test('search has a single key and value', () => {
    expect(toMap('foo=bar')).toEqual({ foo: 'bar' });
  });

  test('search has a single key and complex value', () => {
    expect(toMap('strange+key=this+is+complex')).toEqual({ 'strange key': 'this is complex' });
  });

  test('search has a single repeated key and multiple values', () => {
    expect(toMap('foo=bar1&foo=bar2')).toEqual({ foo: 'bar2' });
  });

  test('search has a multiple keys and values', () => {
    expect(
      toMap('alpha&bravo=charlie&delta=echo&delta=foxtrot&golf=123&hotel=india%20juliet'),
    ).toEqual({
      alpha: '',
      bravo: 'charlie',
      delta: 'foxtrot', // ['echo', 'foxtrot'],
      golf: '123',
      hotel: 'india juliet',
    });
  });
});
