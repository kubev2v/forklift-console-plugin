import React, { ReactNode } from 'react';
import { FilterableSelect } from 'src/components';
import SectionHeading from 'src/components/headers/SectionHeading';
import { PlanMappingsInitSection } from 'src/modules/Plans/views/details/tabs/Mappings/PlanMappings';
import { PlanMappingsSectionState } from 'src/modules/Plans/views/details/tabs/Mappings/PlanMappingsSection';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@kubev2v/common';
import {
  ProviderModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Form,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';

import { DetailsItem, getIsTarget } from '../../../utils';
import { PageAction, setPlanTargetNamespace, setPlanTargetProvider } from '../reducer/actions';
import { CreateVmMigrationPageState } from '../types';

export type PlansUpdateFormProps = {
  children?: ReactNode;
  formAlerts?: ReactNode;
  formActions?: ReactNode;
  state: CreateVmMigrationPageState;
  dispatch: (action: PageAction<unknown, unknown>) => void;
  planMappingsState: PlanMappingsSectionState;
  planMappingsDispatch: React.Dispatch<{
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
  const { t } = useForkliftTranslation();

  const {
    underConstruction: { plan },
    validation,
    calculatedOnce: { namespacesUsedBySelectedVms },
    existingResources: {
      providers: availableProviders,
      targetNamespaces: availableTargetNamespaces,
    },
    flow,
  } = state;

  const onChangeTargetProvider: (
    value: string,
    event: React.FormEvent<HTMLSelectElement>,
  ) => void = (value) => {
    dispatch(setPlanTargetProvider(value));
  };

  const mappingsSection = (
    <PlanMappingsInitSection
      plan={plan}
      planMappingsState={planMappingsState}
      planMappingsDispatch={planMappingsDispatch}
      planNetworkMaps={planNetworkMaps}
      planStorageMaps={planStorageMaps}
    />
  );

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
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Plan name')}</DescriptionListTerm>
              <DescriptionListDescription>
                <div className="forklift-page-editable-description-item">{plan.metadata.name}</div>
              </DescriptionListDescription>
            </DescriptionListGroup>

            <SectionHeading
              text={t('Source provider')}
              className="forklift--create-vm-migration-plan--section-header"
            />

            <DetailsItem
              title={t('Source provider')}
              content={
                <ResourceLink
                  name={plan.spec.provider?.source?.name}
                  namespace={plan.spec.provider?.source?.namespace}
                  groupVersionKind={ProviderModelGroupVersionKind}
                />
              }
            />
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Selected VMs')}</DescriptionListTerm>
              <DescriptionListDescription>
                {t('{{vmCount}} VMs selected ', { vmCount: plan.spec.vms?.length ?? 0 })}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <SectionHeading
              text={t('Target provider')}
              className="forklift--create-vm-migration-plan--section-header"
            />

            <Form isWidthLimited>
              <FormGroupWithHelpText
                label={t('Target provider')}
                isRequired
                fieldId="targetProvider"
                validated={validation.targetProvider}
                helperTextInvalid={
                  availableProviders.filter(getIsTarget).length === 0
                    ? t('No provider is available')
                    : t('The chosen provider is no longer available.')
                }
              >
                <FormSelect
                  value={plan.spec.provider?.destination?.name}
                  onChange={(e, v) => onChangeTargetProvider(v, e)}
                  id="targetProvider"
                  isDisabled={flow.editingDone}
                >
                  {[
                    <FormSelectOption
                      key="placeholder"
                      value={''}
                      label={t('Select a provider')}
                      isPlaceholder
                      isDisabled
                    />,
                    ...availableProviders
                      .filter(getIsTarget)
                      .map((provider, index) => (
                        <FormSelectOption
                          key={provider?.metadata?.name || index}
                          value={provider?.metadata?.name}
                          label={
                            provider?.metadata?.name ?? provider?.metadata?.uid ?? String(index)
                          }
                        />
                      )),
                  ]}
                </FormSelect>
              </FormGroupWithHelpText>
            </Form>

            <Form isWidthLimited>
              <FormGroupWithHelpText
                label={t('Target namespace')}
                isRequired
                id="targetNamespace"
                validated={validation.targetNamespace}
                placeholder={t('Select a namespace')}
              >
                <FilterableSelect
                  selectOptions={availableTargetNamespaces.map((ns) => ({
                    itemId: ns?.name,
                    isDisabled:
                      namespacesUsedBySelectedVms.includes(ns?.name) &&
                      plan.spec.provider?.destination?.name === plan.spec.provider.source.name,
                    children: ns?.name,
                  }))}
                  value={plan.spec.targetNamespace}
                  onSelect={(value) => dispatch(setPlanTargetNamespace(value as string))}
                  isDisabled={flow.editingDone}
                  isScrollable
                  canCreate
                  createNewOptionLabel={t('Create new namespace:')}
                />
              </FormGroupWithHelpText>
            </Form>
          </>
        )}
        {mappingsSection}
      </DescriptionList>
      {formAlerts}
      <div className="forklift--create-vm-migration-plan--form-actions">{formActions}</div>
    </>
  );
};
