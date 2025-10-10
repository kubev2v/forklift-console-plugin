import type { FC } from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const WorkloadExpressionDescriptionText: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <Content className="text-muted" component={ContentVariants.p}>
      {t('Select workloads that must have all the following expressions.')}
    </Content>
  );
};
export default WorkloadExpressionDescriptionText;
