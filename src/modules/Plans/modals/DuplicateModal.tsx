import React, { type ReactNode, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { useToggle } from 'src/modules/Providers/hooks';
import { AlertMessageForModals, useModal } from 'src/modules/Providers/modals';
import type { Validation } from 'src/modules/Providers/utils/types';
import { validateK8sName } from 'src/modules/Providers/utils/validators';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  type K8sResourceCommon,
  NetworkMapModel,
  NetworkMapModelGroupVersionKind,
  PlanModel,
  PlanModelGroupVersionKind,
  StorageMapModel,
  StorageMapModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import {
  k8sCreate,
  type K8sModel,
  k8sPatch,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Form, Modal, ModalVariant, TextInput } from '@patternfly/react-core';

import { Suspend } from '../views/details/components/Suspend';

/**
 * Props for the DeleteModal component
 * @typedef DuplicateModalProps
 * @property {string} title - The title to display in the modal
 * @property {V1beta1Plan} resource - The resource object to delete
 * @property {K8sModel} model - The model used for deletion
 * @property {string} [redirectTo] - Optional redirect URL after deletion
 */
type DuplicateModalProps = {
  resource: V1beta1Plan;
  model: K8sModel;
  title?: string;
  redirectTo?: string;
};

/**
 * A generic delete modal component
 * @component
 * @param {DuplicateModalProps} props - Props for DeleteModal
 * @returns {React.Element} The DeleteModal component
 */
export const DuplicateModal: React.FC<DuplicateModalProps> = ({ redirectTo, resource, title }) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [isLoading, toggleIsLoading] = useToggle();
  const navigate = useNavigate();
  const [newName, setNewName] = useState<string>(`copy-of-${resource.metadata.name}`);
  const [newNameValidation, setNewNameValidation] = useState<Validation>('default');
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);

  const [plans, plansLoaded, plansLoadError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
    namespace: resource?.metadata?.namespace,
    namespaced: true,
  });

  const [networkMap, networkMapLoaded, networkMapLoadError] =
    useK8sWatchResource<V1beta1NetworkMap>({
      groupVersionKind: NetworkMapModelGroupVersionKind,
      isList: false,
      name: resource?.spec?.map?.network.name,
      namespace: resource?.spec?.map?.network.namespace,
      namespaced: true,
    });

  const [storageMap, storageMapLoaded, storageMapLoadError] =
    useK8sWatchResource<V1beta1StorageMap>({
      groupVersionKind: StorageMapModelGroupVersionKind,
      isList: false,
      name: resource?.spec?.map?.storage.name,
      namespace: resource?.spec?.map?.storage.namespace,
      namespaced: true,
    });

  const title_ = title || t('Duplicate migration plan');
  const { name } = resource?.metadata || {};

  const validateName = (name: string) => {
    if (!validateK8sName(name)) {
      setNewNameValidation('error');
      return;
    }

    if (plansLoaded && !plansLoadError && plans?.map((p) => p?.metadata?.name)?.includes(name)) {
      setNewNameValidation('error');
      return;
    }

    setNewNameValidation('success');
  };

  const onChange: (value: string, event: React.FormEvent<HTMLInputElement>) => void = (value) => {
    validateName(value);
    setNewName(value);
  };

  const onDuplicate = useCallback(async () => {
    toggleIsLoading();
    try {
      // Duplicate network map
      const newNetworkMap_: V1beta1NetworkMap = {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'NetworkMap',
        metadata: {
          generateName: `${newName}-`,
          namespace: resource.metadata.namespace,
        },
        spec: networkMap.spec,
      };
      const newNetworkMap = await k8sCreate({ data: newNetworkMap_, model: NetworkMapModel });

      // Duplicate storage map
      const newStorageMap_: V1beta1StorageMap = {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'StorageMap',
        metadata: {
          generateName: `${newName}-`,
          namespace: resource.metadata.namespace,
        },
        spec: storageMap.spec,
      };
      const newStorageMap = await k8sCreate({ data: newStorageMap_, model: StorageMapModel });

      // Duplicate plan
      const newPlan_: V1beta1Plan = {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Plan',
        metadata: {
          name: newName,
          namespace: resource.metadata.namespace,
        },
        spec: {
          ...resource.spec,
          archived: false,
          map: {
            network: {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              kind: 'NetworkMap',
              name: newNetworkMap.metadata.name,
              namespace: newNetworkMap.metadata.namespace,
            },
            storage: {
              apiVersion: 'forklift.konveyor.io/v1beta1',
              kind: 'StorageMap',
              name: newStorageMap.metadata.name,
              namespace: newStorageMap.metadata.namespace,
            },
          },
        },
      };
      const newPlan = await k8sCreate({ data: newPlan_, model: PlanModel });

      // Patch owner in network map
      await patchOwner(newNetworkMap, NetworkMapModel, {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Plan',
        name: newPlan.metadata.name,
        uid: newPlan.metadata.uid,
      });

      // Patch owner in storage map
      await patchOwner(newStorageMap, StorageMapModel, {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Plan',
        name: newPlan.metadata.name,
        uid: newPlan.metadata.uid,
      });

      if (redirectTo) {
        navigate(redirectTo);
      }

      toggleModal();
    } catch (err) {
      toggleIsLoading();

      setAlertMessage(<AlertMessageForModals title={t('Error')} message={err.toString()} />);
    }
  }, [resource, networkMap, storageMap, navigate, newName]);

  const actions = [
    <Button
      key="confirm"
      isDisabled={newNameValidation === 'error'}
      onClick={onDuplicate}
      isLoading={isLoading}
    >
      {t('Duplicate')}
    </Button>,
    <Button key="cancel" variant="secondary" onClick={toggleModal}>
      {t('Cancel')}
    </Button>,
  ];

  return (
    <Modal
      title={title_}
      position="top"
      showClose={false}
      variant={ModalVariant.small}
      isOpen={true}
      onClose={toggleModal}
      actions={actions}
    >
      {
        <Suspend
          obj={plans}
          loaded={plansLoaded && networkMapLoaded && storageMapLoaded}
          loadError={plansLoadError || networkMapLoadError || storageMapLoadError}
        >
          <ForkliftTrans>
            <p>
              Duplicate plan <strong className="co-break-word">{name}</strong>?
            </p>
            <br />

            <Form>
              <FormGroupWithHelpText
                label="New migration plan name"
                fieldId="name"
                validated={newNameValidation}
                helperText={t('Kubernetes name of the new migration Plan resource')}
                helperTextInvalid={t(
                  'Invalid name, name should be unique in this namespace and a valid Kubernetes name',
                )}
              >
                <TextInput
                  spellCheck="false"
                  validated={newNameValidation}
                  value={newName}
                  id="name"
                  aria-describedby="name-helper"
                  onChange={(e, v) => {
                    onChange(v, e);
                  }}
                />
              </FormGroupWithHelpText>
            </Form>
            <br />

            <p>All needed Mappings and Hooks will be duplicated and attached to the new Plan.</p>
            <br />

            <p>
              Storage map: <strong className="co-break-word">{storageMap?.metadata?.name}</strong>
            </p>
            <p>
              Network map: <strong className="co-break-word">{networkMap?.metadata?.name}</strong>
            </p>
          </ForkliftTrans>
        </Suspend>
      }
      {alertMessage}
    </Modal>
  );
};

async function patchOwner(
  resource: K8sResourceCommon,
  model: K8sModel,
  ownerRef: { name: string; uid: string; kind: string; apiVersion: string },
) {
  const patchedSecret = await k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/metadata/ownerReferences',
        value: [
          {
            apiVersion: ownerRef.apiVersion,
            kind: ownerRef.kind,
            name: ownerRef.name,
            uid: ownerRef.uid,
          },
        ],
      },
    ],
    model,
    resource,
  });

  return patchedSecret;
}
