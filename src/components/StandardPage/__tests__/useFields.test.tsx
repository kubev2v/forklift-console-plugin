import { NAME, NAMESPACE } from 'src/utils/constants';

import { cleanup, renderHook } from '@testing-library/react-hooks';

import { useFields } from '../useFields';

afterEach(cleanup);

describe('manage fields', () => {
  it('gets initialized from the defaults', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() => useFields(undefined, [{ id: NAME, toLabel: () => '' }]));
    expect(fields).toMatchObject([{ id: NAME, isVisible: false }]);
  });
  it('enables namespace column visibility if no namespace is chosen', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields(undefined, [
        { id: NAME, toLabel: () => '', isVisible: true },
        { id: NAMESPACE, toLabel: () => '', isVisible: false },
      ]),
    );
    expect(fields).toMatchObject([
      { id: NAME, isVisible: true },
      { id: NAMESPACE, isVisible: true },
    ]);
  });
  it('disables namespace column visibility if a namespace is chosen', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields('some_namespace', [
        { id: NAME, toLabel: () => '', isVisible: true },
        { id: NAMESPACE, toLabel: () => '', isVisible: true },
      ]),
    );
    expect(fields).toMatchObject([
      { id: NAME, isVisible: true },
      { id: NAMESPACE, isVisible: false },
    ]);
  });
});
