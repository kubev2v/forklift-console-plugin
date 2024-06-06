import React, { useEffect } from 'react';
import { InputList, LazyTextInput } from 'src/components';
import {
  AlertMessageForModals,
  EditModal,
  EditModalProps,
  ModalInputComponentType,
} from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  IoK8sApiCoreV1Secret,
  Modify,
  PlanModel,
  V1beta1Plan,
  V1beta1Provider,
} from '@kubev2v/types';
import { K8sModel, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { onLUKSEncryptionPasswordsConfirm } from './onLUKSEncryptionPasswordsConfirm';

interface SecretRendererProps {
  value: string | number;
  onChange: (string) => void;
}

const EditPassphraseFactory: (initialValue: string) => ModalInputComponentType = (initialValue) => {
  const SecretRenderer: React.FC<SecretRendererProps> = ({ onChange }) => {
    const { t } = useForkliftTranslation();
    const items = initialValue && JSON.parse(initialValue);

    // Init component internal value
    useEffect(() => onChange(initialValue), [initialValue]);

    return (
      <InputList
        items={items}
        onChange={(list) => onChange(JSON.stringify(list))}
        InputRow={LazyTextInput}
        addButtonText={t('Add Passphrase')}
      />
    );
  };

  return SecretRenderer;
};

export type EditLUKSEncryptionPasswordsProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Plan;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
    destinationProvider: V1beta1Provider;
  }
>;

export const EditLUKSEncryptionPasswords: React.FC<EditLUKSEncryptionPasswordsProps> = (props) => {
  const { t } = useForkliftTranslation();

  const plan = props.resource;
  const secretName = plan.spec.vms?.[0]?.luks?.name;
  const secretNamespace = plan.metadata.namespace;

  const allVMsHasMatchingLuks = plan.spec.vms.every((vm) => vm.luks?.name === secretName);

  const [secret] = useK8sWatchResource<IoK8sApiCoreV1Secret>({
    groupVersionKind: { kind: 'Secret', version: 'v1' },
    name: secretName,
    namespace: secretNamespace,
  });
  const items = secretName && Object.values(secret?.data || {}).map(atob);
  const itemsJSONString = secretName ? JSON.stringify(items) : undefined;

  return (
    <EditModal
      {...props}
      jsonPath={() => null} // we can't get the keys from the plan
      title={props?.title || t('Disk decryption keys')}
      label={props?.label || t('Passphrases for LUKS encrypted devices')}
      model={PlanModel}
      onConfirmHook={onLUKSEncryptionPasswordsConfirm}
      body={
        <>
          {t(`Specify a list of keys for LUKS encrypted devices in order to convert the VM.`)}
          {!allVMsHasMatchingLuks && (
            <AlertMessageForModals
              variant="warning"
              title={'The plan LUKS decryption keys were manually configured'}
              message={
                <>
                  <p>
                    Warning: not all virtual machines are configures using the same LUKS secret,
                  </p>
                  <p>updating the LUKS decryption keys will override the current configuration.</p>
                </>
              }
            />
          )}
        </>
      }
      InputComponent={EditPassphraseFactory(itemsJSONString)}
    />
  );
};
