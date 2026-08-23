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

  const namespace = getNamespace(sourceProvider);
  const [secrets, loaded, error] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>(
    namespace
      ? {
          groupVersionKind: getGroupVersionKindForModel(SecretModel),
          isList: true,
          namespace,
          namespaced: true,
        }
      : null,
  );

  const opaqueSecrets = useMemo(
    (): IoK8sApiCoreV1Secret[] => filterOpaqueSecrets(secrets),
    [secrets],
  );

  const selectedSecretValue = watch(fieldId);
  const selectedSecret =
    typeof selectedSecretValue === 'string' ? selectedSecretValue : undefined;
  const hasOpaqueSecrets = !isEmpty(opaqueSecrets);
  // Keep the select usable when the list returned Opaque secrets even if a later
  // watch/stream error is set (common in e2e mocks without a secrets watch WS).
  const isSelectDisabled = isSubmitting || !loaded || (Boolean(error) && !hasOpaqueSecrets);

  useEffect(() => {
    if (!loaded || !selectedSecret) {
      return;
    }

    // Preserve the selection only while loading failed and we have no Opaque list to trust.
    if (error && !hasOpaqueSecrets) {
      return;
    }

    const isSelectedOpaque = opaqueSecrets.some((secret) => getName(secret) === selectedSecret);

    if (!isSelectedOpaque) {
      setValue(fieldId, '', { shouldDirty: true, shouldValidate: true });
    }
  }, [error, fieldId, hasOpaqueSecrets, loaded, opaqueSecrets, selectedSecret, setValue]);

  let placeholder = t('Loading secrets...');
  if (loaded && hasOpaqueSecrets) {
    placeholder = t('Select storage secret');
  } else if (loaded && error) {
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
            isDisabled={isSelectDisabled}
            onSelect={(_e, value) => {
              field.onChange(value);
            }}
            placeholder={placeholder}
            ref={field.ref}
            testId={fieldId}
            value={typeof field.value === 'string' ? field.value : undefined}
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
