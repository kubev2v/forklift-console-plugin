import { NAME, NAMESPACE } from '@components/common/utils/constants';
import { renderHook } from '@testing-library/react';

import { useFields } from '../useFields';

describe('useFields - user settings', () => {
  it('uses a reverse order', () => {
    const {
      result: {
        current: [fields],
      },
    } = renderHook(() =>
      useFields(
        '',
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
        '',
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
