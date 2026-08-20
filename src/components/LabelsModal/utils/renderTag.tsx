import type { ReactElement } from 'react';

import { Label } from '@patternfly/react-core';

type RenderTagProps = {
  getTagDisplayValue: (tag: string) => string;
  key: number;
  onRemove: (key: number) => void;
  tag: string;
};

export const renderTag = (props: RenderTagProps): ReactElement => {
  const { getTagDisplayValue, key, onRemove, tag } = props;

  return (
    <Label
      className={'co-label tag-item-content'}
      key={key}
      onClose={() => {
        onRemove(key);
      }}
    >
      {getTagDisplayValue(tag)}
    </Label>
  );
};
