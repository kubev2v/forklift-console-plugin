import type { FC } from 'react';

import { SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type EmptyCategorySelectOptionProps = {
  resourceName: string;
};

const EmptyCategorySelectOption: FC<EmptyCategorySelectOptionProps> = ({ resourceName }) => {
  const { t } = useForkliftTranslation();
  return <SelectOption isDisabled={true}>{t(`No ${resourceName} in this category`)}</SelectOption>;
};

export default EmptyCategorySelectOption;
