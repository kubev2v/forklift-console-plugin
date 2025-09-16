import type { FC } from 'react';

import { Text, TextVariants } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

const NodeFieldsDescriptionText: FC = () => {
  const { t } = useForkliftTranslation();
  return (
    <>
      <Text className="text-muted" component={TextVariants.p}>
        {t(
          'Field selectors let you select Nodes based on the value of one or more resource fields.',
        )}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t(
          'Note that for Node field expressions, entering a full path is required in the "Key" field (e.g. "metadata.name: value").',
        )}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t('Some fields may not be supported.')}
      </Text>
    </>
  );
};
export default NodeFieldsDescriptionText;
