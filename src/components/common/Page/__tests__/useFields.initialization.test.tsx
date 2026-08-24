import { NAME, NAMESPACE } from '@components/common/utils/constants';
import { renderHook } from '@testing-library/react';

import { useFields } from '../useFields';

describe('useFields - initialization', () => {
  it('gets initialized from the defaults', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() => useFields('', [{ label: '', resourceFieldId: NAME }]));
    expect(fields).toMatchObject([{ isVisible: false, resourceFieldId: NAME }]);
  });

  it('enables namespace column visibility if no namespace is chosen', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields('', [
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
