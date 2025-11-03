import type { FC } from 'react';

import { Content, ContentVariants } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const NodeFieldsDescriptionText: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <>
      <Content className="text-muted" component={ContentVariants.p}>
        {t(
          'Field selectors let you select Nodes based on the value of one or more resource fields.',
        )}
      </Content>
      <Content className="text-muted" component={ContentVariants.p}>
        {t(
          'Note that for Node field expressions, entering a full path is required in the "Key" field (e.g. "metadata.name: value").',
        )}
      </Content>
      <Content className="text-muted" component={ContentVariants.p}>
        {t('Some fields may not be supported.')}
      </Content>
    </>
  );
};
export default NodeFieldsDescriptionText;
