import { type FC, useCallback, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';
import { deriveMatchStatus, deriveSuggestedProduct } from 'src/storageMaps/utils/offloadMatchUtils';
import { validateOffloadFields } from 'src/storageMaps/utils/validateOffloadFields';
import { resolveProductFromCsiProvisioner } from 'src/storageMaps/utils/vendorLookupTables';

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

import {
  type OffloadMatchStatus,
  StorageMapFieldId,
  type StorageMapping,
  type StorageVendorProduct,
} from '../../utils/types';

import OffloadOptimalityHint from './OffloadOptimalityHint';
import OffloadPluginField from './OffloadPluginField';
import StorageProductField from './StorageProductField';
import StorageSecretField from './StorageSecretField';

import './OffloadStorageIndexedForm.style.scss';

type OffloadStorageIndexedFormProps = {
  index: number;
  sourceProvider: V1beta1Provider | undefined;
  datastoreVendor?: StorageVendorProduct;
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
  const { control, setValue } = useFormContext();

  const pluginFieldId = getStorageMapFieldId(StorageMapFieldId.OffloadPlugin, index);
  const secretFieldId = getStorageMapFieldId(StorageMapFieldId.StorageSecret, index);
  const productFieldId = getStorageMapFieldId(StorageMapFieldId.StorageProduct, index);

  const [offloadPlugin, storageSecret, storageProduct] = useWatch({
    control,
    name: [pluginFieldId, secretFieldId, productFieldId],
  });

  const hasAnyOffloadValue =
    Boolean(offloadPlugin) || Boolean(storageSecret) || Boolean(storageProduct);

  const storageClassVendor = useMemo(
    () => (targetProvisioner ? resolveProductFromCsiProvisioner(targetProvisioner) : undefined),
    [targetProvisioner],
  );

  const suggestedProduct = useMemo(
    () => deriveSuggestedProduct(datastoreVendor, storageClassVendor),
    [datastoreVendor, storageClassVendor],
  );

  const matchStatus = useMemo(
    (): OffloadMatchStatus =>
      deriveMatchStatus(
        datastoreVendor,
        storageClassVendor,
        storageProduct as StorageVendorProduct | undefined,
      ),
    [datastoreVendor, storageClassVendor, storageProduct],
  );

  const offloadError = useMemo((): string | undefined => {
    const mapping = {
      [StorageMapFieldId.OffloadPlugin]: offloadPlugin,
      [StorageMapFieldId.SourceStorage]: { name: '' },
      [StorageMapFieldId.StorageProduct]: storageProduct,
      [StorageMapFieldId.StorageSecret]: storageSecret,
      [StorageMapFieldId.TargetStorage]: { name: '' },
    } satisfies StorageMapping;

    return validateOffloadFields(mapping);
  }, [offloadPlugin, storageProduct, storageSecret]);

  const clearOffloadFields = useCallback((): void => {
    setValue(pluginFieldId, '', { shouldDirty: true, shouldValidate: true });
    setValue(secretFieldId, '', { shouldDirty: true, shouldValidate: true });
    setValue(productFieldId, '', { shouldDirty: true, shouldValidate: true });
  }, [pluginFieldId, productFieldId, secretFieldId, setValue]);

  return (
    <div className="offload-storage">
      <Split className="offload-storage__header">
        <SplitItem isFilled>
          <ExpandableSection
            toggleText={t('Offload options (optional)')}
            onToggle={(_e, expanded) => {
              setIsExpanded(expanded);
            }}
            isExpanded={isExpanded}
            isIndented
          >
            <Form className="offload-storage__form">
              <OffloadPluginField fieldId={pluginFieldId} />
              <StorageSecretField fieldId={secretFieldId} sourceProvider={sourceProvider} />
              <StorageProductField fieldId={productFieldId} suggestedProduct={suggestedProduct} />
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
            isInline
            variant={ButtonVariant.link}
            isDisabled={!hasAnyOffloadValue}
            onClick={clearOffloadFields}
          >
            {t('Clear offload options')}
          </Button>
        </SplitItem>
      </Split>
    </div>
  );
};

export default OffloadStorageIndexedForm;
