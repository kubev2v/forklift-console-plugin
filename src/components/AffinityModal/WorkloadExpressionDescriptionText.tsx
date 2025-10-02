import type { FC } from 'react';

import { Text, TextVariants } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const WorkloadExpressionDescriptionText: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Text className="text-muted" component={TextVariants.p}>
      {t('Select workloads that must have all the following expressions.')}
    </Text>
  );
};
export default WorkloadExpressionDescriptionText;
