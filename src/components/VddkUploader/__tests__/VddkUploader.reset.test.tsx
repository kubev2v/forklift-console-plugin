import type { ReactElement } from 'react';

import type * as PatternFlyReactCore from '@patternfly/react-core';
import { fireEvent, render, screen } from '@testing-library/react';

import VddkUploader from '../VddkUploader';

jest.mock('@patternfly/react-core', (): object => {
  const actual = jest.requireActual<typeof PatternFlyReactCore>('@patternfly/react-core');
  return {
    ...actual,
    FileUpload: ({
      onClearClick,
      onFileInputChange,
    }: {
      onClearClick: () => void;
      onFileInputChange: (event: unknown, file: File) => void;
    }): ReactElement => (
      <>
        <button onClick={onClearClick} type="button">
          Clear archive
        </button>
        <button
          onClick={() => {
            onFileInputChange(undefined, new File(['tar'], 'new.tar'));
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
