import { useCallback, useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';

import ModalForm from '@components/ModalForm/ModalForm';
import {
  NetworkMapModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Stack, StackItem, TextInput } from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import {
  getPlanNetworkMapName,
  getPlanNetworkMapNamespace,
  getPlanStorageMapName,
  getPlanStorageMapNamespace,
} from '@utils/crds/plans/selectors';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import type { PlanModalProps } from '../types';

import { createDuplicatePlanAndMapResources } from './utils/utils';

const DuplicateModal: ModalComponent<PlanModalProps> = ({ plan, ...rest }) => {
  const { t } = useForkliftTranslation();
  const name = getName(plan);
  const [newName, setNewName] = useState<string>(`copy-of-${name}`);

  const [networkMap] = useK8sWatchResource<V1beta1NetworkMap>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: false,
    name: getPlanNetworkMapName(plan),
    namespace: getPlanNetworkMapNamespace(plan),
    namespaced: true,
  });

  const [storageMap] = useK8sWatchResource<V1beta1StorageMap>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: false,
    name: getPlanStorageMapName(plan),
    namespace: getPlanStorageMapNamespace(plan),
    namespaced: true,
  });

  const onChange = (value: string): void => {
    setNewName(value);
  };

  const onDuplicate = useCallback(
    async () =>
      createDuplicatePlanAndMapResources({ networkMap, newPlanName: newName, plan, storageMap }),
    [newName, networkMap, storageMap, plan],
  );

  return (
    <ModalForm
      confirmLabel={t('Duplicate')}
      title={t('Duplicate migration plan')}
      onConfirm={onDuplicate}
      {...rest}
    >
      <ForkliftTrans>
        <Stack hasGutter>
          <StackItem>
            Duplicate plan <strong className="co-break-word">{name}</strong>?
          </StackItem>
          <FormGroupWithHelpText
            label={t('New migration plan name')}
            fieldId="name"
            helperText={t('Kubernetes name of the new migration Plan resource')}
          >
            <TextInput
              spellCheck="false"
              value={newName}
              id="name"
              onChange={(_, value) => {
                onChange(value);
              }}
            />
          </FormGroupWithHelpText>
          <StackItem>
            All needed Mappings and Hooks will be duplicated and attached to the new Plan.
          </StackItem>
          <StackItem>
            Storage map: <strong className="co-break-word">{storageMap?.metadata?.name}</strong>
          </StackItem>
          <StackItem>
            Network map: <strong className="co-break-word">{networkMap?.metadata?.name}</strong>
          </StackItem>
        </Stack>
      </ForkliftTrans>
    </ModalForm>
  );
};

export default DuplicateModal;
