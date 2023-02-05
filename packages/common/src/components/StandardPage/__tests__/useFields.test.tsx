import { NAME, NAMESPACE } from 'common/src/utils/constants';

import { act, cleanup, renderHook } from '@testing-library/react-hooks';

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

describe('initialize fields from user settings', () => {
  it('uses a reverse order', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields(
        undefined,
        [
          { id: NAME, toLabel: () => '', isVisible: true },
          { id: NAMESPACE, toLabel: () => '', isVisible: true },
        ],
        {
          data: [
            { id: NAMESPACE, isVisible: true },
            { id: NAME, isVisible: true },
          ],
          save: () => undefined,
          clear: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { id: NAMESPACE, isVisible: true },
      { id: NAME, isVisible: true },
    ]);
  });

  it('tries to hide identity column', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields(
        'some-namespace',
        [
          { id: NAME, toLabel: () => '', isVisible: true, isIdentity: true },
          { id: NAMESPACE, toLabel: () => '', isVisible: true },
        ],
        {
          data: [
            { id: NAME, isVisible: false },
            { id: NAMESPACE, isVisible: false },
          ],
          save: () => undefined,
          clear: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { id: NAME, isVisible: true },
      { id: NAMESPACE, isVisible: false },
    ]);
  });
  it('filters out duplicated and unsupported fields', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields(
        undefined,
        [
          { id: NAME, toLabel: () => '', isVisible: true },
          { id: NAMESPACE, toLabel: () => '', isVisible: true },
        ],
        {
          data: [
            { id: NAME, isVisible: false },
            { id: NAME, isVisible: true },
            { id: 'foo', isVisible: false },
          ],
          save: () => undefined,
          clear: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { id: NAME, isVisible: false },
      { id: NAMESPACE, isVisible: true },
    ]);
  });
});

describe('saves fields to user settings', () => {
  it('saves re-order and hidden NAME field)', () => {
    const saveSettings = jest.fn();
    const {
      result: {
        current: [, setFields],
      },
    } = renderHook(() =>
      useFields(
        undefined,
        [
          { id: NAME, toLabel: () => '', isVisible: true },
          { id: NAMESPACE, toLabel: () => '', isVisible: true },
        ],
        { data: [], save: saveSettings, clear: () => undefined },
      ),
    );
    act(() =>
      setFields([
        { id: NAMESPACE, toLabel: () => '', isVisible: true },
        { id: NAME, toLabel: () => '', isVisible: false },
      ]),
    );
    expect(saveSettings).toBeCalledWith([
      { id: NAMESPACE, isVisible: true },
      { id: NAME, isVisible: false },
    ]);
  });
  it('clears settings if equal to defaults)', () => {
    const clearSettings = jest.fn();
    const {
      result: {
        current: [, setFields],
      },
    } = renderHook(() =>
      useFields(
        undefined,
        [
          { id: NAME, toLabel: () => '', isVisible: true },
          { id: NAMESPACE, toLabel: () => '', isVisible: true },
        ],
        { data: [], save: () => undefined, clear: clearSettings },
      ),
    );
    act(() =>
      setFields([
        { id: NAME, toLabel: () => '', isVisible: true },
        { id: NAMESPACE, toLabel: () => '', isVisible: true },
      ]),
    );
    expect(clearSettings).toBeCalled();
  });
});
