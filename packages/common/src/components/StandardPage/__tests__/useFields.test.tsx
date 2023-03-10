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
    } = renderHook(() => useFields(undefined, [{ resourceFieldID: NAME, label: '' }]));
    expect(fields).toMatchObject([{ resourceFieldID: NAME, isVisible: false }]);
  });
  it('enables namespace column visibility if no namespace is chosen', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields(undefined, [
        { resourceFieldID: NAME, label: '', isVisible: true },
        { resourceFieldID: NAMESPACE, label: '', isVisible: false },
      ]),
    );
    expect(fields).toMatchObject([
      { resourceFieldID: NAME, isVisible: true },
      { resourceFieldID: NAMESPACE, isVisible: true },
    ]);
  });
  it('disables namespace column visibility if a namespace is chosen', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields('some_namespace', [
        { resourceFieldID: NAME, label: '', isVisible: true },
        { resourceFieldID: NAMESPACE, label: '', isVisible: true },
      ]),
    );
    expect(fields).toMatchObject([
      { resourceFieldID: NAME, isVisible: true },
      { resourceFieldID: NAMESPACE, isVisible: false },
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
          { resourceFieldID: NAME, label: '', isVisible: true },
          { resourceFieldID: NAMESPACE, label: '', isVisible: true },
        ],
        {
          data: [
            { resourceFieldID: NAMESPACE, isVisible: true },
            { resourceFieldID: NAME, isVisible: true },
          ],
          save: () => undefined,
          clear: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { resourceFieldID: NAMESPACE, isVisible: true },
      { resourceFieldID: NAME, isVisible: true },
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
          { resourceFieldID: NAME, label: '', isVisible: true, isIdentity: true },
          { resourceFieldID: NAMESPACE, label: '', isVisible: true },
        ],
        {
          data: [
            { resourceFieldID: NAME, isVisible: false },
            { resourceFieldID: NAMESPACE, isVisible: false },
          ],
          save: () => undefined,
          clear: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { resourceFieldID: NAME, isVisible: true },
      { resourceFieldID: NAMESPACE, isVisible: false },
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
          { resourceFieldID: NAME, label: '', isVisible: true },
          { resourceFieldID: NAMESPACE, label: '', isVisible: true },
        ],
        {
          data: [
            { resourceFieldID: NAME, isVisible: false },
            { resourceFieldID: NAME, isVisible: true },
            { resourceFieldID: 'foo', isVisible: false },
          ],
          save: () => undefined,
          clear: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { resourceFieldID: NAME, isVisible: false },
      { resourceFieldID: NAMESPACE, isVisible: true },
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
          { resourceFieldID: NAME, label: '', isVisible: true },
          { resourceFieldID: NAMESPACE, label: '', isVisible: true },
        ],
        { data: [], save: saveSettings, clear: () => undefined },
      ),
    );
    act(() =>
      setFields([
        { resourceFieldID: NAMESPACE, label: '', isVisible: true },
        { resourceFieldID: NAME, label: '', isVisible: false },
      ]),
    );
    expect(saveSettings).toBeCalledWith([
      { resourceFieldID: NAMESPACE, isVisible: true },
      { resourceFieldID: NAME, isVisible: false },
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
          { resourceFieldID: NAME, label: '', isVisible: true },
          { resourceFieldID: NAMESPACE, label: '', isVisible: true },
        ],
        { data: [], save: () => undefined, clear: clearSettings },
      ),
    );
    act(() =>
      setFields([
        { resourceFieldID: NAME, label: '', isVisible: true },
        { resourceFieldID: NAMESPACE, label: '', isVisible: true },
      ]),
    );
    expect(clearSettings).toBeCalled();
  });
});
