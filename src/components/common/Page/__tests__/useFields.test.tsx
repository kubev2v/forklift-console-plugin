import { cleanup } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { NAME, NAMESPACE } from '../../utils';
import { useFields } from '../useFields';

afterEach(cleanup);

describe('manage fields', () => {
  it('gets initialized from the defaults', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() => useFields(undefined, [{ label: '', resourceFieldId: NAME }]));
    expect(fields).toMatchObject([{ isVisible: false, resourceFieldId: NAME }]);
  });
  it('enables namespace column visibility if no namespace is chosen', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields(undefined, [
        { isVisible: true, label: '', resourceFieldId: NAME },
        { isVisible: false, label: '', resourceFieldId: NAMESPACE },
      ]),
    );
    expect(fields).toMatchObject([
      { isVisible: true, resourceFieldId: NAME },
      { isVisible: true, resourceFieldId: NAMESPACE },
    ]);
  });
  it('disables namespace column visibility if a namespace is chosen', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields('some_namespace', [
        { isVisible: true, label: '', resourceFieldId: NAME },
        { isVisible: true, label: '', resourceFieldId: NAMESPACE },
      ]),
    );
    expect(fields).toMatchObject([
      { isVisible: true, resourceFieldId: NAME },
      { isVisible: false, resourceFieldId: NAMESPACE },
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
          { isVisible: true, label: '', resourceFieldId: NAME },
          { isVisible: true, label: '', resourceFieldId: NAMESPACE },
        ],
        {
          clear: () => undefined,
          data: [
            { isVisible: true, resourceFieldId: NAMESPACE },
            { isVisible: true, resourceFieldId: NAME },
          ],
          save: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { isVisible: true, resourceFieldId: NAMESPACE },
      { isVisible: true, resourceFieldId: NAME },
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
          { isIdentity: true, isVisible: true, label: '', resourceFieldId: NAME },
          { isVisible: true, label: '', resourceFieldId: NAMESPACE },
        ],
        {
          clear: () => undefined,
          data: [
            { isVisible: false, resourceFieldId: NAME },
            { isVisible: false, resourceFieldId: NAMESPACE },
          ],
          save: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { isVisible: true, resourceFieldId: NAME },
      { isVisible: false, resourceFieldId: NAMESPACE },
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
          { isVisible: true, label: '', resourceFieldId: NAME },
          { isVisible: true, label: '', resourceFieldId: NAMESPACE },
        ],
        {
          clear: () => undefined,
          data: [
            { isVisible: false, resourceFieldId: NAME },
            { isVisible: true, resourceFieldId: NAME },
            { isVisible: false, resourceFieldId: 'foo' },
          ],
          save: () => undefined,
        },
      ),
    );
    expect(fields).toMatchObject([
      { isVisible: false, resourceFieldId: NAME },
      { isVisible: true, resourceFieldId: NAMESPACE },
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
          { isVisible: true, label: '', resourceFieldId: NAME },
          { isVisible: true, label: '', resourceFieldId: NAMESPACE },
        ],
        { clear: () => undefined, data: [], save: saveSettings },
      ),
    );
    act(() => {
      setFields([
        { isVisible: true, label: '', resourceFieldId: NAMESPACE },
        { isVisible: false, label: '', resourceFieldId: NAME },
      ]);
    });
    expect(saveSettings).toBeCalledWith([
      { isVisible: true, resourceFieldId: NAMESPACE },
      { isVisible: false, resourceFieldId: NAME },
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
          { isVisible: true, label: '', resourceFieldId: NAME },
          { isVisible: true, label: '', resourceFieldId: NAMESPACE },
        ],
        { clear: clearSettings, data: [], save: () => undefined },
      ),
    );
    act(() => {
      setFields([
        { isVisible: true, label: '', resourceFieldId: NAME },
        { isVisible: true, label: '', resourceFieldId: NAMESPACE },
      ]);
    });
    expect(clearSettings).toBeCalled();
  });
});
