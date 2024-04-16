import React from 'react';

import { TextInput } from '@patternfly/react-core';

/**
 * Show a readable masked (hidden) field value.
 */
export const ShowMaskedField: React.FC = () => {
  return <TextInput value="&bull;&bull;&bull;&bull;&bull;" type="text" isDisabled />;
};
