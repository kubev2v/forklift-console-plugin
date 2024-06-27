import React from 'react';
import { SelectableCard } from 'src/modules/Providers/utils/components/Gallery/SelectableCard';
import { SelectableGallery } from 'src/modules/Providers/utils/components/Gallery/SelectableGallery';
import { VmData } from 'src/modules/Providers/views';
import { useForkliftTranslation } from 'src/utils';

import { FormGroupWithHelpText } from '@kubev2v/common';
import { V1beta1Provider } from '@kubev2v/types';
import { Flex, FlexItem, Form, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';

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
  const { t } = useForkliftTranslation();

  const providerCardItems = createProviderCardItems(providers);

  const onChange = (id: string) => {
    filterDispatch({ type: 'SELECT_PROVIDER', payload: id || '' });
  };

  return (
    <div className="forklift-create-provider-edit-section">
      <Form isWidthLimited className="forklift-section-secret-edit">
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
