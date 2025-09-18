import { type FC, useState } from 'react';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';

import DevPreviewLabel from '@components/PreviewLabels/DevPreviewLabel';
import type { V1beta1Provider } from '@kubev2v/types';
import { ExpandableSection, Form, Split, SplitItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { StorageMapFieldId } from '../../constants';

import OffloadPluginField from './OffloadPluginField';
import StorageProductField from './StorageProductField';
import StorageSecretField from './StorageSecretField';

import './OffloadStorageIndexedForm.style.scss';

type OffloadStorageIndexedFormProps = {
  index: number;
  sourceProvider: V1beta1Provider | undefined;
};

const OffloadStorageIndexedForm: FC<OffloadStorageIndexedFormProps> = ({
  index,
  sourceProvider,
}) => {
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection
      toggleContent={
        <Split hasGutter>
          <SplitItem>{t('Offload options (optional)')}</SplitItem>
          <SplitItem>
            <DevPreviewLabel />
          </SplitItem>
        </Split>
      }
      onToggle={(_e, expanded) => {
        setIsExpanded(expanded);
      }}
      isExpanded={isExpanded}
      isIndented
    >
      <Form className="offload-storage__form">
        <OffloadPluginField
          fieldId={getStorageMapFieldId(StorageMapFieldId.OffloadPlugin, index)}
        />
        <StorageSecretField
          fieldId={getStorageMapFieldId(StorageMapFieldId.StorageSecret, index)}
          sourceProvider={sourceProvider}
        />
        <StorageProductField
          fieldId={getStorageMapFieldId(StorageMapFieldId.StorageProduct, index)}
        />
      </Form>
    </ExpandableSection>
  );
};

export default OffloadStorageIndexedForm;
