import { type FC, useState } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import {
  Button,
  ButtonVariant,
  ExpandableSection,
  Form,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { StorageVendorProduct } from '../../utils/types';
import { OffloadPlugin } from '../../utils/types';

import { useOffloadStorageFormState } from './hooks/useOffloadStorageFormState';
import DedicatedMigrationHostsField from './DedicatedMigrationHostsField';
import OffloadOptimalityHint from './OffloadOptimalityHint';
import OffloadPluginField from './OffloadPluginField';
import StorageProductField from './StorageProductField';
import StorageSecretField from './StorageSecretField';

import './OffloadStorageIndexedForm.style.scss';

type OffloadStorageIndexedFormProps = {
  datastoreVendor?: StorageVendorProduct;
  index: number;
  sourceProvider: V1beta1Provider | undefined;
  targetProvisioner?: string;
};

const OffloadStorageIndexedForm: FC<OffloadStorageIndexedFormProps> = ({
  datastoreVendor,
  index,
  sourceProvider,
  targetProvisioner,
}) => {
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    clearOffloadFields,
    hasAnyOffloadValue,
    hostsFieldId,
    matchStatus,
    offloadError,
    offloadPlugin,
    pluginFieldId,
    productFieldId,
    resolvedSuggestedProduct,
    secretFieldId,
  } = useOffloadStorageFormState({ datastoreVendor, index, targetProvisioner });

  return (
    <div className="offload-storage">
      <Split className="offload-storage__header">
        <SplitItem isFilled>
          <ExpandableSection
            isExpanded={isExpanded}
            isIndented
            onToggle={(_e, expanded) => {
              setIsExpanded(expanded);
            }}
            toggleText={t('Offload options (optional)')}
          >
            <Form className="offload-storage__form">
              <OffloadPluginField fieldId={pluginFieldId} />
              <StorageSecretField fieldId={secretFieldId} sourceProvider={sourceProvider} />
              <StorageProductField
                fieldId={productFieldId}
                offloadPlugin={offloadPlugin}
                suggestedProduct={resolvedSuggestedProduct}
              />
              {offloadPlugin === OffloadPlugin.VSphereXcopyConfig && (
                <DedicatedMigrationHostsField
                  fieldId={hostsFieldId}
                  sourceProvider={sourceProvider}
                />
              )}
              {offloadError && (
                <HelperText>
                  <HelperTextItem data-testid="offload-validation-error" variant="error">
                    {offloadError}
                  </HelperTextItem>
                </HelperText>
              )}
              {hasAnyOffloadValue && !offloadError && (
                <OffloadOptimalityHint matchStatus={matchStatus} />
              )}
            </Form>
          </ExpandableSection>
        </SplitItem>
        <SplitItem className="offload-storage__clear-button-container">
          <Button
            className="offload-storage__clear-button"
            isDisabled={!hasAnyOffloadValue}
            isInline
            onClick={clearOffloadFields}
            variant={ButtonVariant.link}
          >
            {t('Clear offload options')}
          </Button>
        </SplitItem>
      </Split>
    </div>
  );
};

export default OffloadStorageIndexedForm;
