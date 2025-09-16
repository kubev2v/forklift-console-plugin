import type { FC } from 'react';

import { Text, TextVariants } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const NodeExpressionDescriptionText: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <>
      <Text className="text-muted" component={TextVariants.p}>
        {t('Select Nodes that must have all the following expressions.')}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t('Label selectors let you select Nodes based on the value of one or more labels.')}
      </Text>
    </>
  );
};
export default NodeExpressionDescriptionText;
