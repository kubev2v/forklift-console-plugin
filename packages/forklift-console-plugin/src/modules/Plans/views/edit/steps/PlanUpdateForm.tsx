import React, { Dispatch, FormEvent, ReactNode } from 'react';
import { FormAlerts } from 'src/modules/Providers/views/migrate/components/FormAlerts';
import { PlansProvidersFields } from 'src/modules/Providers/views/migrate/components/PlansProvidersFields';
import { PlansTargetNamespaceField } from 'src/modules/Providers/views/migrate/components/PlansTargetNamespaceField';
import {
  PageAction,
  setPlanTargetNamespace,
  setPlanTargetProvider,
} from 'src/modules/Providers/views/migrate/reducer/actions';
import { isDone } from 'src/modules/Providers/views/migrate/reducer/helpers';
import { CreateVmMigrationPageState } from 'src/modules/Providers/views/migrate/types';

import { LoadingDots } from '@kubev2v/common';
import { V1beta1NetworkMap, V1beta1StorageMap } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';

import {
  PlanMappingsInitSection,
  PlanMappingsSectionState,
} from '../../details/components/UpdateMappings';

type PlanUpdateFormProps = {
  children?: ReactNode;
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

export const PlanUpdateForm = ({
  children,
  state,
  dispatch,
  formActions,
  planMappingsState,
  planMappingsDispatch,
  planNetworkMaps,
  planStorageMaps,
}: PlanUpdateFormProps) => {
  if (!isDone(state.flow.initialLoading) && !state.flow.apiError) {
    return <LoadingDots />;
  }

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
      {state.flow.apiError && <FormAlerts state={state} />}
      <div className="forklift--create-vm-migration-plan--form-actions">{formActions}</div>
    </>
  );
};

export default PlanUpdateForm;
