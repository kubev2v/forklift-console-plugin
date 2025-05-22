import type { FC } from 'react';

import { SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

type SelectedOptionsProps = {
  options: string[] | undefined;
  noOptionsLabel?: string;
  isEditable?: boolean;
};
const SelectedOptions: FC<SelectedOptionsProps> = ({
  isEditable = true,
  noOptionsLabel = 'No options available',
  options,
}) => {
  if (!isEditable) {
    return null;
  }

  if (!options || isEmpty(options)) {
    return <SelectOption value={noOptionsLabel} isDisabled={true} />;
  }

  return options.map((option) => (
    <SelectOption value={option} key={option}>
      {option}
    </SelectOption>
  ));
};

export default SelectedOptions;
