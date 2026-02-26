import { type FC, useCallback, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { getStorageMapFieldId } from 'src/storageMaps/utils/getStorageMapFieldId';
import { validateOffloadFields } from 'src/storageMaps/utils/validateOffloadFields';

import type { V1beta1Provider } from '@forklift-ui/types';
import {
  Button,
  ButtonVariant,
  ExpandableSection,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
  Tooltip,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import { StorageMapFieldId, type StorageMapping } from '../../utils/types';

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
    <ExpandableSection
      toggleContent={
        <Split hasGutter>
          <SplitItem>{t('Offload options (optional)')}</SplitItem>
        </Split>
      }
      onToggle={(_e, expanded) => {
        setIsExpanded(expanded);
      }}
      isExpanded={isExpanded}
      isIndented
    >
      <Form className="offload-storage__form">
        <OffloadPluginField fieldId={pluginFieldId} />
        <StorageSecretField fieldId={secretFieldId} sourceProvider={sourceProvider} />
        <StorageProductField fieldId={productFieldId} />
        {offloadError && (
          <HelperText>
            <HelperTextItem variant="error">{offloadError}</HelperTextItem>
          </HelperText>
        )}
        <FormGroup className="fit-content">
          <Tooltip content={t('Clear offload options')}>
            <Button
              icon={<MinusCircleIcon />}
              isInline
              variant={ButtonVariant.plain}
              aria-label={t('Clear offload options')}
              isDisabled={!hasAnyOffloadValue}
              onClick={(e) => {
                e.stopPropagation();
                clearOffloadFields();
              }}
            >
              {t('Clear')}
            </Button>
          </Tooltip>
        </FormGroup>
      </Form>
    </ExpandableSection>
  );
};

export default OffloadStorageIndexedForm;
