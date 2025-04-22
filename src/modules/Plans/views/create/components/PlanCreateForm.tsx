import { type Dispatch, type FC, useCallback, useMemo } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { SelectableCard } from 'src/modules/Providers/utils/components/Gallery/SelectableCard';
import { SelectableGallery } from 'src/modules/Providers/utils/components/Gallery/SelectableGallery';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import { useCreateVmMigrationData } from 'src/modules/Providers/views/migrate/ProvidersCreateVmMigrationContext';
import {
  type PageAction,
  setPlanName,
  setProjectName as setProjectNameAction,
} from 'src/modules/Providers/views/migrate/reducer/actions';
import type { CreateVmMigrationPageState } from 'src/modules/Providers/views/migrate/types';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  ProjectNameSelect,
  useProjectNameSelectOptions,
} from '@components/common/ProjectNameSelect';
import type { V1beta1Provider } from '@kubev2v/types';
import {
  Flex,
  FlexItem,
  Form,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';

import type { PlanCreatePageState } from '../states/PlanCreatePageStore';

import { PlanNameTextField } from './PlanName/PlanNameTextField';
import { ChipsToolbarProviders } from './ChipsToolbarProviders';
import { createProviderCardItems } from './createProviderCardItems';
import { FiltersToolbarProviders } from './FiltersToolbarProviders';
import { ProviderCardEmptyState } from './ProvidersEmptyState';

type PlanCreateFormProps = {
  providers: V1beta1Provider[];
  filterState: PlanCreatePageState;
  state: CreateVmMigrationPageState;
  projectName: string;
  filterDispatch: Dispatch<{
    type: string;
    payload?: string | string[] | VmData[];
  }>;
  dispatch: (action: PageAction<unknown, unknown>) => void;
};

/**
 * PlanCreateForm component is responsible for rendering the form to create a migration plan.
 * It allows users to select a source provider from a gallery of available providers.
 */
const PlanCreateForm: FC<PlanCreateFormProps> = ({
  dispatch,
  filterDispatch,
  filterState,
  projectName,
  providers,
  state,
}) => {
  const { t } = useForkliftTranslation();
  const { data, setData } = useCreateVmMigrationData();
  const [projectNameOptions] = useProjectNameSelectOptions(projectName);
  const providerCardItems = useMemo(
    () =>
      createProviderCardItems(
        providers.filter((provider) => provider.metadata.namespace === projectName),
      ),
    [projectName, providers],
  );
  const { selectedProviderUID: selectedProviderId } = filterState;
  const selectedProviderCardItem = providerCardItems[selectedProviderId];

  const onProviderChange = useCallback((id: string) => {
    filterDispatch({ payload: id || '', type: 'SELECT_PROVIDER' });
  }, []);

  return (
    <div className="forklift-create-provider-edit-section">
      <Form isWidthLimited className="forklift-section-secret-edit">
        <PlanNameTextField
          isRequired
          value={state.underConstruction.plan.metadata.name}
          validated={state.validation.planName}
          isDisabled={state.flow.editingDone}
          onChange={(_, value) => {
            dispatch(setPlanName(value?.trim() ?? ''));
            setData({ ...data, planName: value });
          }}
        />

        <ProjectNameSelect
          value={projectName}
          options={projectNameOptions}
          onSelect={(value) => {
            dispatch(setProjectNameAction(value));
            setData({ ...data, projectName: value });

            // Reset provider when target project name changes
            if (value !== projectName) {
              onProviderChange('');
            }
          }}
          popoverHelpContent={
            <Stack hasGutter>
              <StackItem>
                <ForkliftTrans>
                  The project that your migration plan will be created in. Only projects with
                  providers in them can be selected.
                </ForkliftTrans>
              </StackItem>

              <StackItem>
                <ForkliftTrans>
                  Projects, also known as namespaces, separate resources within clusters.
                </ForkliftTrans>
              </StackItem>
            </Stack>
          }
        />

        {Object.values(providerCardItems).length ? (
          <FormGroupWithHelpText fieldId="type">
            <FiltersToolbarProviders
              className="forklift--create-plan--filters-toolbar"
              filterState={filterState}
              filterDispatch={filterDispatch}
            />
            <ChipsToolbarProviders filterState={filterState} filterDispatch={filterDispatch} />

            {selectedProviderId ? (
              <Flex>
                <FlexItem className="forklift--create-provider-edit-card-selected">
                  <SelectableCard
                    title={selectedProviderCardItem.title}
                    titleLogo={selectedProviderCardItem.logo}
                    onChange={() => {
                      onProviderChange('');
                    }}
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
                selectedID={selectedProviderId}
                items={providerCardItems}
                onChange={onProviderChange}
              />
            )}
          </FormGroupWithHelpText>
        ) : (
          <ProviderCardEmptyState projectName={projectName} />
        )}
      </Form>
    </div>
  );
};

export default PlanCreateForm;
