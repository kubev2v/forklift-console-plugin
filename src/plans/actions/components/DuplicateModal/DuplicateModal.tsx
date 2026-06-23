import { useCallback, useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { CONFIG_MAP_GVK } from 'src/plans/create/steps/customization-scripts/constants';

import ModalForm from '@components/ModalForm/ModalForm';
import {
  HookModelGroupVersionKind,
  type IoK8sApiCoreV1ConfigMap,
  NetworkMapModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  type V1beta1Hook,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Stack, StackItem, TextInput } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import {
  getPlanNetworkMapName,
  getPlanNetworkMapNamespace,
  getPlanStorageMapName,
  getPlanStorageMapNamespace,
  getPlanVirtualMachines,
} from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import type { PlanModalProps } from '../types';

import { createDuplicatePlanAndMapResources } from './utils/utils';

const getPlanHookNames = (plan: V1beta1Plan): { postHookName?: string; preHookName?: string } => {
  const allHooks = getPlanVirtualMachines(plan).flatMap((vm) => vm.hooks ?? []);

  if (isEmpty(allHooks)) {
    return {};
  }

  const preHookName = allHooks.find((hook) => hook.step === 'PreHook')?.hook?.name;
  const postHookName = allHooks.find((hook) => hook.step === 'PostHook')?.hook?.name;

  return { postHookName, preHookName };
};

const DuplicateModal: ModalComponent<PlanModalProps> = ({ plan, ...rest }) => {
  const { t } = useForkliftTranslation();
  const name = getName(plan);
  const [newName, setNewName] = useState<string>(`copy-of-${name}`);

  const networkMapName = getPlanNetworkMapName(plan);
  const [networkMap] = useK8sWatchResource<V1beta1NetworkMap>(
    networkMapName
      ? {
          groupVersionKind: NetworkMapModelGroupVersionKind,
          isList: false,
          name: networkMapName,
          namespace: getPlanNetworkMapNamespace(plan),
          namespaced: true,
        }
      : null,
  );

  const storageMapName = getPlanStorageMapName(plan);
  const [storageMap] = useK8sWatchResource<V1beta1StorageMap>(
    storageMapName
      ? {
          groupVersionKind: StorageMapModelGroupVersionKind,
          isList: false,
          name: storageMapName,
          namespace: getPlanStorageMapNamespace(plan),
          namespaced: true,
        }
      : null,
  );

  const { postHookName, preHookName } = getPlanHookNames(plan);
  const planNamespace = getNamespace(plan);

  const [preHook] = useK8sWatchResource<V1beta1Hook>(
    preHookName
      ? {
          groupVersionKind: HookModelGroupVersionKind,
          isList: false,
          name: preHookName,
          namespace: planNamespace,
          namespaced: true,
        }
      : null,
  );

  const [postHook] = useK8sWatchResource<V1beta1Hook>(
    postHookName
      ? {
          groupVersionKind: HookModelGroupVersionKind,
          isList: false,
          name: postHookName,
          namespace: planNamespace,
          namespaced: true,
        }
      : null,
  );

  const scriptsRef = plan?.spec?.customizationScripts;
  const [configMap] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
    scriptsRef?.name
      ? {
          groupVersionKind: CONFIG_MAP_GVK,
          isList: false,
          name: scriptsRef.name,
          namespace: scriptsRef.namespace,
          namespaced: true,
        }
      : null,
  );

  const onChange = (value: string): void => {
    setNewName(value);
  };

  const onDuplicate = useCallback(
    async () =>
      createDuplicatePlanAndMapResources({
        configMap,
        networkMap,
        newPlanName: newName,
        plan,
        postHook,
        preHook,
        storageMap,
      }),
    [configMap, networkMap, newName, plan, postHook, preHook, storageMap],
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
