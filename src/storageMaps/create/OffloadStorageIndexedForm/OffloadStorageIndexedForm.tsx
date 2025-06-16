import { type FC, useState } from 'react';

import { ExpandableSection, Form } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { CreateStorageMapFieldId } from '../fields/constants';
import OffloadPluginField from '../fields/OffloadPluginField';
import StorageProductField from '../fields/StorageProductField';
import StorageSecretField from '../fields/StorageSecretField';
import { getCreateStorageMapFieldId } from '../fields/utils';

import './OffloadStorageIndexedForm.style.scss';

type OffloadStorageIndexedFormProps = {
  index: number;
};

const OffloadStorageIndexedForm: FC<OffloadStorageIndexedFormProps> = ({ index }) => {
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection
      toggleText={t('Offload options (optional)')}
      onToggle={(_e, expanded) => {
        setIsExpanded(expanded);
      }}
      isExpanded={isExpanded}
      isIndented
    >
      <Form className="offload-storage__form">
        <OffloadPluginField
          fieldId={getCreateStorageMapFieldId(CreateStorageMapFieldId.OffloadPlugin, index)}
        />
        <StorageSecretField
          fieldId={getCreateStorageMapFieldId(CreateStorageMapFieldId.StorageSecret, index)}
        />
        <StorageProductField
          fieldId={getCreateStorageMapFieldId(CreateStorageMapFieldId.StorageProduct, index)}
        />
      </Form>
    </ExpandableSection>
  );
};

export default OffloadStorageIndexedForm;
