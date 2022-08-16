import { referenceFor, referenceForObj } from './resources';

test('referenceFor', () => {
  expect(referenceFor('Group', 'Version', 'Kind')).toBe('Group~Version~Kind');
});

test('referenceForObj', () => {
  const obj = {
    apiVersion: 'Group/Version',
    kind: 'Kind',
  };
  expect(referenceForObj(obj)).toBe('Group~Version~Kind');
});
