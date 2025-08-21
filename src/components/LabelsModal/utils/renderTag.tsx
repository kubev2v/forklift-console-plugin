import { Label } from '@patternfly/react-core';

export const renderTag = (props: {
  tag: string;
  key: string;
  onRemove: (key: string) => void;
  getTagDisplayValue: (tag: string) => string;
}) => {
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
