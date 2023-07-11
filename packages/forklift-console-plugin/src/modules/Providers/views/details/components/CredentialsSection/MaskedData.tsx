import React from 'react';

import { TextInput } from '@patternfly/react-core';

export const MaskedData: React.FC = () => {
  return <TextInput value="&bull;&bull;&bull;&bull;&bull;" type="text" isDisabled />;
};
