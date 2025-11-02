import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceYAMLEditorWrapper } from '@components/ResourceYAMLEditorWrapper/ResourceYAMLEditorWrapper';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import { useProvider } from '../../hooks/useProvider';
import type { ProviderDetailsPageProps } from '../../utils/types';

const ProviderYAMLTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { provider } = useProvider(name, namespace);

  return (
    <ResourceYAMLEditorWrapper>
      <ResourceYAMLEditor header={t('Provider YAML')} initialResource={provider} />
    </ResourceYAMLEditorWrapper>
  );
};

export default ProviderYAMLTabPage;
