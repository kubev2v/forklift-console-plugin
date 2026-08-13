import { type FC, useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import Select from '@components/common/Select';
import { type IoK8sApiCoreV1Secret, SecretModel, type V1beta1Provider } from '@forklift-ui/types';
import { getGroupVersionKindForModel } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, SelectList, SelectOption, Stack, StackItem } from '@patternfly/react-core';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';
import { filterOpaqueSecrets } from '@utils/secrets/opaqueSecrets';
import { StorageMapFieldId } from '@utils/storage/types';

import { offloadNestedFieldRules } from '../../utils/offloadNestedFieldRules';

type StorageSecretFieldProps = {
  fieldId: string;
  sourceProvider: V1beta1Provider | undefined;
};

const StorageSecretField: FC<StorageSecretFieldProps> = ({ fieldId, sourceProvider }) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
    setValue,
    watch,
  } = useFormContext();

  const [secrets, loaded, error] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: getGroupVersionKindForModel(SecretModel),
    isList: true,
    namespace: getNamespace(sourceProvider),
    namespaced: true,
  });

  const opaqueSecrets = useMemo(
    (): IoK8sApiCoreV1Secret[] => filterOpaqueSecrets(secrets),
    [secrets],
  );

  const selectedSecret = watch(fieldId) as string | undefined;
  const isWatchUnavailable = !loaded || Boolean(error);

  useEffect(() => {
    if (isWatchUnavailable || !selectedSecret) {
      return;
    }

    const isSelectedOpaque = opaqueSecrets.some((secret) => getName(secret) === selectedSecret);

    if (!isSelectedOpaque) {
      setValue(fieldId, '', { shouldDirty: true, shouldValidate: true });
    }
  }, [fieldId, isWatchUnavailable, opaqueSecrets, selectedSecret, setValue]);

  let placeholder = t('Loading secrets...');
  if (error) {
    placeholder = t('Failed to load secrets.');
  } else if (loaded) {
    placeholder = t('Select storage secret');
  }

  return (
    <FormGroup
      fieldId={fieldId}
      label={storageMapFieldLabels[StorageMapFieldId.StorageSecret]}
      labelHelp={
        <HelpIconPopover>
          <Stack hasGutter>
            <StackItem>
              {t(
                "Holds the authentication credentials for your storage provider, allowing the offload plugin to securely connect to and control your storage hardware's API (for example, Hitachi Vantara or NetApp ONTAP).",
              )}
            </StackItem>
            <StackItem>
              {t(
                'This secret must be created in your project beforehand, typically using details provided by your storage administrator.',
              )}
            </StackItem>
          </Stack>
        </HelpIconPopover>
      }
    >
      <Controller
        control={control}
        name={fieldId}
        render={({ field }) => (
          <Select
            id={fieldId}
            isDisabled={isSubmitting || isWatchUnavailable}
            onSelect={(_e, value) => {
              field.onChange(value);
            }}
            placeholder={placeholder}
            ref={field.ref}
            testId={fieldId}
            value={field.value as string | undefined}
          >
            <SelectList>
              {isEmpty(opaqueSecrets) ? (
                <SelectOption isDisabled key="empty">
                  {error
                    ? t('Failed to load secrets.')
                    : t('No Opaque secrets found in this project.')}
                </SelectOption>
              ) : (
                opaqueSecrets.map((secret) => {
                  const secretName = getName(secret);

                  return (
                    <SelectOption key={getUID(secret)} value={secretName}>
                      {secretName}
                    </SelectOption>
                  );
                })
              )}
            </SelectList>
          </Select>
        )}
        rules={offloadNestedFieldRules}
      />
    </FormGroup>
  );
};

export default StorageSecretField;
