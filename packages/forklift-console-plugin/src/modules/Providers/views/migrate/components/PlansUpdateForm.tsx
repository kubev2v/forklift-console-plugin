import React, { Dispatch, FormEvent, ReactNode } from 'react';
import { PlanMappingsInitSection } from 'src/modules/Plans/views/details/tabs/Mappings/PlanMappings';
import { PlanMappingsSectionState } from 'src/modules/Plans/views/details/tabs/Mappings/PlanMappingsSection';

import { V1beta1NetworkMap, V1beta1StorageMap } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';

import { PageAction, setPlanTargetNamespace, setPlanTargetProvider } from '../reducer/actions';
import { CreateVmMigrationPageState } from '../types';

import { PlansProvidersFields } from './PlansProvidersFields';
import { PlansTargetNamespaceField } from './PlansTargetNamespaceField';

type PlansUpdateFormProps = {
  children?: ReactNode;
  formAlerts?: ReactNode;
  formActions?: ReactNode;
  state: CreateVmMigrationPageState;
  dispatch: (action: PageAction<unknown, unknown>) => void;
  planMappingsState: PlanMappingsSectionState;
  planMappingsDispatch: Dispatch<{
    type: string;
    payload?;
  }>;
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
};

export const PlansUpdateForm = ({
  children,
  state,
  dispatch,
  formAlerts,
  formActions,
  planMappingsState,
  planMappingsDispatch,
  planNetworkMaps,
  planStorageMaps,
}: PlansUpdateFormProps) => {
  const {
    underConstruction: { plan },
    flow,
  } = state;

  const onChangeTargetProvider: (value: string, event: FormEvent<HTMLSelectElement>) => void = (
    value,
  ) => {
    dispatch(setPlanTargetProvider(value));
  };

  const onChangeTargetNamespace: (value: string) => void = (value) => {
    dispatch(setPlanTargetNamespace(value));
  };

  return (
    <>
      {children}
      <DescriptionList
        className="forklift-create-provider-edit-section"
        columnModifier={{
          default: '1Col',
        }}
      >
        {flow.editAction !== 'VMS' && (
          <>
            <PlansProvidersFields onChangeTargetProvider={onChangeTargetProvider} state={state} />
            <PlansTargetNamespaceField
              onChangeTargetNamespace={onChangeTargetNamespace}
              state={state}
            />
          </>
        )}
        <PlanMappingsInitSection
          plan={plan}
          planMappingsState={planMappingsState}
          planMappingsDispatch={planMappingsDispatch}
          planNetworkMaps={planNetworkMaps}
          planStorageMaps={planStorageMaps}
        />
      </DescriptionList>
      {formAlerts}
      <div className="forklift--create-vm-migration-plan--form-actions">{formActions}</div>
    </>
  );
};
