import type { FC } from 'react';

import { TextInput } from '@patternfly/react-core';

/**
 * Show a readable masked (hidden) field value.
 */
export const MaskedField: FC = () => {
  return (
    <TextInput spellCheck="false" value="&bull;&bull;&bull;&bull;&bull;" type="text" isDisabled />
  );
};
