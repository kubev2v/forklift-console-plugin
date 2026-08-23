import { NAME, NAMESPACE } from '@components/common/utils/constants';
import { act, renderHook } from '@testing-library/react';

import { useFields } from '../useFields';

describe('useFields - persistence', () => {
  it('saves re-order and hidden NAME field)', () => {
    const saveSettings = jest.fn();
    const {
      result: {
        current: [, setFields],
      },
    } = renderHook(() =>
      useFields(
        '',
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
    expect(saveSettings).toHaveBeenCalledWith([
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
        '',
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
    expect(clearSettings).toHaveBeenCalled();
  });
});
