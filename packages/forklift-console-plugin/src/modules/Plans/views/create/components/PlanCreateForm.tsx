import React from 'react';
import { SelectableCard } from 'src/modules/Providers/utils/components/Gallery/SelectableCard';
import { SelectableGallery } from 'src/modules/Providers/utils/components/Gallery/SelectableGallery';
import { VmData } from 'src/modules/Providers/views';
import { useCreateVmMigrationData } from 'src/modules/Providers/views/migrate';
import {
  PageAction,
  setProjectName as setProjectNameAction,
} from 'src/modules/Providers/views/migrate/reducer/actions';
import { CreateVmMigrationPageState } from 'src/modules/Providers/views/migrate/types';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils';

import { FormGroupWithHelpText } from '@kubev2v/common';
import { V1beta1Provider } from '@kubev2v/types';
import { Flex, FlexItem, Form, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';

import { PlanCreatePageState } from '../states';

import { ChipsToolbarProviders } from './ChipsToolbarProviders';
import { createProviderCardItems } from './createProviderCardItems';
import { FiltersToolbarProviders } from './FiltersToolbarProviders';
import { ProjectNameSelect } from './ProjectNameSelect';

export type PlanCreateFormProps = {
  providers: V1beta1Provider[];
  filterState: PlanCreatePageState;
  state: CreateVmMigrationPageState;
  projectName: string;
  filterDispatch: React.Dispatch<{
    type: string;
    payload?: string | string[] | VmData[];
  }>;
  dispatch: (action: PageAction<unknown, unknown>) => void;
};

/**
 * PlanCreateForm component is responsible for rendering the form to create a migration plan.
 * It allows users to select a source provider from a gallery of available providers.
 */
export const PlanCreateForm: React.FC<PlanCreateFormProps> = ({
  providers,
  filterState,
  projectName,
  filterDispatch,
  dispatch,
}) => {
  const { t } = useForkliftTranslation();
  const { data, setData } = useCreateVmMigrationData();
  const providerCardItems = createProviderCardItems(providers);
  const providerNamespaces = [
    ...new Set(providers.map((provider) => provider.metadata?.namespace)),
  ];

  const onChange = (id: string) => {
    filterDispatch({ type: 'SELECT_PROVIDER', payload: id || '' });
  };

  return (
    <div className="forklift-create-provider-edit-section">
      <Form isWidthLimited className="forklift-section-secret-edit">
        <ProjectNameSelect
          value={projectName}
          options={providerNamespaces.map((namespace) => ({
            value: namespace,
            content: namespace,
          }))}
          onSelect={(value) => {
            dispatch(setProjectNameAction(value));
            setData({ ...data, projectName: value });
          }}
          isDisabled={!providers.length}
          popoverHelpContent={
            <ForkliftTrans>
              The project that your migration plan will be created in. Only projects with providers
              in them can be selected.
            </ForkliftTrans>
          }
        />

        <FormGroupWithHelpText fieldId="type">
          <FiltersToolbarProviders
            className="forklift--create-plan--filters-toolbar"
            filterState={filterState}
            filterDispatch={filterDispatch}
          />
          <ChipsToolbarProviders filterState={filterState} filterDispatch={filterDispatch} />

          {filterState.selectedProviderUID ? (
            <Flex>
              <FlexItem className="forklift--create-provider-edit-card-selected">
                <SelectableCard
                  title={providerCardItems[filterState.selectedProviderUID]?.title}
                  titleLogo={providerCardItems[filterState.selectedProviderUID]?.logo}
                  onChange={() => onChange('')}
                  isSelected
                  isCompact
                  content={
                    <Tooltip
                      content={
                        <div>{t('Click to select a different provider from the list.')}</div>
                      }
                    >
                      <HelperText>
                        <HelperTextItem variant="indeterminate">
                          {t('Click to unselect.')}
                        </HelperTextItem>
                      </HelperText>
                    </Tooltip>
                  }
                />
              </FlexItem>
            </Flex>
          ) : (
            <SelectableGallery
              selectedID={filterState.selectedProviderUID}
              items={providerCardItems}
              onChange={onChange}
            />
          )}
        </FormGroupWithHelpText>
      </Form>
    </div>
  );
};

export default PlanCreateForm;
