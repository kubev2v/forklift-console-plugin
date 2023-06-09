import { act, cleanup, renderHook } from '@testing-library/react-hooks';

import { NAME, NAMESPACE } from '../../../utils';
import { useFields } from '../useFields';

afterEach(cleanup);

describe('manage fields', () => {
  it('gets initialized from the defaults', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() => useFields(undefined, [{ resourceFieldId: NAME, label: '' }]));
    expect(fields).toMatchObject([{ resourceFieldId: NAME, isVisible: false }]);
  });
  it('enables namespace column visibility if no namespace is chosen', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields(undefined, [
        { resourceFieldId: NAME, label: '', isVisible: true },
        { resourceFieldId: NAMESPACE, label: '', isVisible: false },
      ]),
    );
    expect(fields).toMatchObject([
      { resourceFieldId: NAME, isVisible: true },
      { resourceFieldId: NAMESPACE, isVisible: true },
    ]);
  });
  it('disables namespace column visibility if a namespace is chosen', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields('some_namespace', [
        { resourceFieldId: NAME, label: '', isVisible: true },
        { resourceFieldId: NAMESPACE, label: '', isVisible: true },
      ]),
    );
    expect(fields).toMatchObject([
      { resourceFieldId: NAME, isVisible: true },
      { resourceFieldId: NAMESPACE, isVisible: false },
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
          { resourceFieldId: NAME, label: '', isVisible: true },
          { resourceFieldId: NAMESPACE, label: '', isVisible: true },
        ],
        {
          data: [
            { resourceFieldId: NAMESPACE, isVisible: true },
            { resourceFieldId: NAME, isVisible: true },
          ],
          save: () => undefined,
          clear: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { resourceFieldId: NAMESPACE, isVisible: true },
      { resourceFieldId: NAME, isVisible: true },
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
          { resourceFieldId: NAME, label: '', isVisible: true, isIdentity: true },
          { resourceFieldId: NAMESPACE, label: '', isVisible: true },
        ],
        {
          data: [
            { resourceFieldId: NAME, isVisible: false },
            { resourceFieldId: NAMESPACE, isVisible: false },
          ],
          save: () => undefined,
          clear: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { resourceFieldId: NAME, isVisible: true },
      { resourceFieldId: NAMESPACE, isVisible: false },
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
          { resourceFieldId: NAME, label: '', isVisible: true },
          { resourceFieldId: NAMESPACE, label: '', isVisible: true },
        ],
        {
          data: [
            { resourceFieldId: NAME, isVisible: false },
            { resourceFieldId: NAME, isVisible: true },
            { resourceFieldId: 'foo', isVisible: false },
          ],
          save: () => undefined,
          clear: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { resourceFieldId: NAME, isVisible: false },
      { resourceFieldId: NAMESPACE, isVisible: true },
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
          { resourceFieldId: NAME, label: '', isVisible: true },
          { resourceFieldId: NAMESPACE, label: '', isVisible: true },
        ],
        { data: [], save: saveSettings, clear: () => undefined },
      ),
    );
    act(() =>
      setFields([
        { resourceFieldId: NAMESPACE, label: '', isVisible: true },
        { resourceFieldId: NAME, label: '', isVisible: false },
      ]),
    );
    expect(saveSettings).toBeCalledWith([
      { resourceFieldId: NAMESPACE, isVisible: true },
      { resourceFieldId: NAME, isVisible: false },
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
          { resourceFieldId: NAME, label: '', isVisible: true },
          { resourceFieldId: NAMESPACE, label: '', isVisible: true },
        ],
        { data: [], save: () => undefined, clear: clearSettings },
      ),
    );
    act(() =>
      setFields([
        { resourceFieldId: NAME, label: '', isVisible: true },
        { resourceFieldId: NAMESPACE, label: '', isVisible: true },
      ]),
    );
    expect(clearSettings).toBeCalled();
  });
});
