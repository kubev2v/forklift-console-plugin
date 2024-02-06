import React from 'react';
import { SelectableGallery } from 'src/modules/Providers/utils/components/Galerry/SelectableGallery';
import { VmData } from 'src/modules/Providers/views';

import { V1beta1Provider } from '@kubev2v/types';
import { Form, FormGroup } from '@patternfly/react-core';

import { PlanCreatePageState } from '../states';

import { ChipsToolbarProviders } from './ChipsToolbarProviders';
import { createProviderCardItems } from './createProviderCardItems';
import { FiltersToolbarProviders } from './FiltersToolbarProviders';

export type PlanCreateFormProps = {
  providers: V1beta1Provider[];
  filterState: PlanCreatePageState;
  filterDispatch: React.Dispatch<{
    type: string;
    payload?: string | string[] | VmData[];
  }>;
};

/**
 * PlanCreateForm component is responsible for rendering the form to create a migration plan.
 * It allows users to select a source provider from a gallery of available providers.
 */
export const PlanCreateForm: React.FC<PlanCreateFormProps> = ({
  providers,
  filterState,
  filterDispatch,
}) => {
  const providerCardItems = createProviderCardItems(providers);

  const onChange = (id: string) => {
    filterDispatch({ type: 'SELECT_PROVIDER', payload: id || '' });
  };

  return (
    <div className="forklift-create-provider-edit-section">
      <Form isWidthLimited className="forklift-section-secret-edit">
        <FormGroup fieldId="type">
          <FiltersToolbarProviders
            className="forklift--create-plan--filters-toolbar"
            filterState={filterState}
            filterDispatch={filterDispatch}
          />
          <ChipsToolbarProviders filterState={filterState} filterDispatch={filterDispatch} />

          <SelectableGallery
            selectedID={filterState.selectedProviderUID}
            items={providerCardItems}
            onChange={onChange}
          />
        </FormGroup>
      </Form>
    </div>
  );
};

export default PlanCreateForm;
