import type { FC } from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const NodeExpressionDescriptionText: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <>
      <Content className="text-muted" component={ContentVariants.p}>
        {t('Select Nodes that must have all the following expressions.')}
      </Content>
      <Content className="text-muted" component={ContentVariants.p}>
        {t('Label selectors let you select Nodes based on the value of one or more labels.')}
      </Content>
    </>
  );
};
export default NodeExpressionDescriptionText;
