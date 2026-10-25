import type { ReactElement } from 'react';

import type { FileUploadProps } from '@patternfly/react-core';
import { fireEvent, render, screen } from '@testing-library/react';

import VddkUploader from '../VddkUploader';

jest.mock('@patternfly/react-core', (): object => {
  const actual = jest.requireActual<Record<string, unknown>>('@patternfly/react-core');
  return {
    ...actual,
    FileUpload: ({
      onClearClick,
      onFileInputChange,
    }: Pick<FileUploadProps, 'onClearClick' | 'onFileInputChange'>): ReactElement => (
      <>
        <button onClick={(event) => onClearClick?.(event)} type="button">
          Clear archive
        </button>
        <button
          onClick={(event) => {
            onFileInputChange?.(
              event as unknown as Parameters<NonNullable<FileUploadProps['onFileInputChange']>>[0],
              new File(['tar'], 'new.tar'),
            );
          }}
          type="button"
        >
          Replace archive
        </button>
      </>
    ),
  };
});
jest.mock('src/utils/i18n', (): object => ({
  useForkliftTranslation: (): object => ({ t: (key: string): string => key }),
}));
jest.mock('../hooks/useVddkBuildImage', (): object => ({
  useVddkBuildImage: (): object => ({ body: 'previous-image', isBuildSucceeded: true }),
}));
jest.mock('../utils/utils', (): object => ({
  getUploadButtonText: (): string => 'Upload',
  uploadVddkTarball: (): Promise<object> => Promise.resolve({ 'build-name': 'new-build' }),
}));

describe('VddkUploader', () => {
  it.each(['Clear archive', 'Replace archive', 'Upload'])(
    'invalidates a completed image when using %s',
    (action): void => {
      const onChangeVddk = jest.fn();
      render(<VddkUploader onChangeVddk={onChangeVddk} />);
      expect(onChangeVddk).toHaveBeenLastCalledWith('previous-image');

      if (action === 'Upload') {
        fireEvent.click(screen.getByRole('button', { name: 'Replace archive' }));
      }
      fireEvent.click(screen.getByRole('button', { name: action }));

      expect(onChangeVddk).toHaveBeenLastCalledWith('');
    },
  );
});
