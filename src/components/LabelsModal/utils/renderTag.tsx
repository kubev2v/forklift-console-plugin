import { Label } from '@patternfly/react-core';

export const renderTag = (props: {
  getTagDisplayValue: (tag: string) => string;
  key: number;
  onRemove: (key: number) => void;
  tag: string;
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
