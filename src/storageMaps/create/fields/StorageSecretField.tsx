import type { FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import Select from '@components/common/MtvSelect';
import { type IoK8sApiCoreV1Secret, SecretModel } from '@kubev2v/types';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, SelectList, SelectOption, Stack, StackItem } from '@patternfly/react-core';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateStorageMapFormData } from '../types';

import { CreateStorageMapFieldId, createStorageMapFieldLabels } from './constants';

type StorageSecretFieldProps = { fieldId: string };

const StorageSecretField: FC<StorageSecretFieldProps> = ({ fieldId }) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<CreateStorageMapFormData>();

  const sourceProvider = useWatch({
    control,
    name: CreateStorageMapFieldId.SourceProvider,
  });

  const [secrets] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: getGroupVersionKindForModel(SecretModel),
    isList: true,
    namespace: getNamespace(sourceProvider),
    namespaced: true,
  });

  return (
    <FormGroup
      fieldId={fieldId}
      label={createStorageMapFieldLabels[CreateStorageMapFieldId.StorageSecret]}
      labelIcon={
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
        name={fieldId}
        control={control}
        render={({ field }) => (
          <Select
            id={fieldId}
            isDisabled={isSubmitting}
            value={field.value}
            onSelect={(_e, value) => {
              field.onChange(value);
            }}
            placeholder={t('Select storage secret')}
          >
            <SelectList>
              {isEmpty(secrets) ? (
                <SelectOption key="empty" isDisabled>
                  {t('No secrets available for this provider')}
                </SelectOption>
              ) : (
                secrets.map((secret) => {
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
      />
    </FormGroup>
  );
};

export default StorageSecretField;
