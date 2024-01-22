import React, { useState } from 'react';
import StandardPage from 'src/components/page/StandardPage';
import { useForkliftTranslation } from 'src/utils/i18n';
import { isProviderLocalOpenshift } from 'src/utils/resources';

import { EnumFilter, SearchableGroupedEnumFilter } from '@kubev2v/common';
import { ProviderModelGroupVersionKind } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  TextInput,
} from '@patternfly/react-core';

import { DetailsItem, getIsTarget } from '../../utils';
import { concernsMatcher, featuresMatcher, VmData } from '../details';

import { PageAction, setPlanName, setPlanTargetNamespace, setPlanTargetProvider } from './actions';
import { EditableDescriptionItem } from './EditableDescriptionItem';
import { CreateVmMigrationPageState } from './reducer';

export const PlansCreateForm = ({
  state: {
    newPlan: plan,
    validation,
    selectedVms,
    vmFieldsFactory: [vmFieldsFactory, RowMapper],
    availableProviders,
    availableTargetNamespaces,
  },
  dispatch,
}: {
  state: CreateVmMigrationPageState;
  dispatch: (action: PageAction<unknown, unknown>) => void;
}) => {
  const { t } = useForkliftTranslation();
  const vmFields = vmFieldsFactory(t);
  const [isNameEdited, setIsNameEdited] = useState(false);
  const [isTargetProviderEdited, setIsTargetProviderEdited] = useState(false);
  const [isTargetNamespaceEdited, setIsTargetNamespaceEdited] = useState(false);

  const [isVmDetails, setIsVmDetails] = useState(false);
  return (
    <Drawer isExpanded={isVmDetails}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent widths={{ default: 'width_75' }}>
            <DrawerHead>
              <DrawerActions>
                <DrawerCloseButton onClick={() => setIsVmDetails(false)} />
              </DrawerActions>
            </DrawerHead>
            <StandardPage<VmData>
              title={t('Selected VMs')}
              dataSource={[selectedVms, true, false]}
              fieldsMetadata={vmFields}
              RowMapper={RowMapper}
              namespace={plan.spec.provider?.source?.namespace}
              extraSupportedFilters={{
                concerns: SearchableGroupedEnumFilter,
                features: EnumFilter,
              }}
              extraSupportedMatchers={[concernsMatcher, featuresMatcher]}
            />
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>
          <DescriptionList
            className="forklift-create-provider-edit-section"
            columnModifier={{
              default: '1Col',
            }}
          >
            {isNameEdited || validation.name === 'error' ? (
              <Form isWidthLimited>
                <FormGroup
                  label={t('Plan name')}
                  isRequired
                  fieldId="planName"
                  validated={validation.name}
                >
                  <TextInput
                    isRequired
                    type="text"
                    id="planName"
                    value={plan.metadata.name}
                    validated={validation.name}
                    onChange={(value) => dispatch(setPlanName(value?.trim() ?? ''))}
                  />
                </FormGroup>
              </Form>
            ) : (
              <EditableDescriptionItem
                title={t('Plan name')}
                content={plan.metadata.name}
                ariaEditLabel={t('Edit plan name')}
                onEdit={() => setIsNameEdited(true)}
              />
            )}
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
                <Button onClick={() => setIsVmDetails(!isVmDetails)} variant="link" isInline>
                  {t('{{vmCount}} VMs selected ', { vmCount: plan.spec.vms?.length ?? 0 })}
                </Button>
              </DescriptionListDescription>
            </DescriptionListGroup>

            {isTargetProviderEdited ||
            validation.targetProvider === 'error' ||
            !plan.spec.provider?.destination ? (
              <Form isWidthLimited>
                <FormGroup
                  label={t('Target provider')}
                  isRequired
                  fieldId="targetProvider"
                  validated={validation.targetProvider}
                >
                  <FormSelect
                    value={plan.spec.provider?.destination?.name}
                    onChange={(value) => dispatch(setPlanTargetProvider(value))}
                    validated={validation.targetProvider}
                    id="targetProvider"
                  >
                    {availableProviders.filter(getIsTarget).map((provider, index) => (
                      <FormSelectOption
                        key={provider?.metadata?.name || index}
                        value={provider?.metadata?.name}
                        label={provider?.metadata?.name ?? provider?.metadata?.uid ?? String(index)}
                      />
                    ))}
                  </FormSelect>
                </FormGroup>
              </Form>
            ) : (
              <EditableDescriptionItem
                title={t('Target provider')}
                content={
                  <ResourceLink
                    name={plan.spec.provider?.destination?.name}
                    namespace={plan.spec.provider?.destination?.namespace}
                    groupVersionKind={ProviderModelGroupVersionKind}
                  />
                }
                ariaEditLabel={t('Edit target provider')}
                onEdit={() => setIsTargetProviderEdited(true)}
              />
            )}
            {isTargetNamespaceEdited ||
            validation.targetNamespace === 'error' ||
            !plan.spec.targetNamespace ? (
              <Form isWidthLimited>
                <FormGroup
                  label={t('Target namespace')}
                  isRequired
                  id="targetNamespace"
                  validated={validation.targetNamespace}
                >
                  <FormSelect
                    value={plan.spec.targetNamespace}
                    onChange={(value) => dispatch(setPlanTargetNamespace(value))}
                    validated={validation.targetNamespace}
                    id="targetNamespace"
                  >
                    {availableTargetNamespaces.map((ns, index) => (
                      <FormSelectOption
                        key={ns?.name || index}
                        value={ns?.name}
                        label={ns?.name ?? String(index)}
                      />
                    ))}
                  </FormSelect>
                </FormGroup>
              </Form>
            ) : (
              <EditableDescriptionItem
                title={t('Target namespace')}
                content={
                  <ResourceLink
                    name={plan.spec.targetNamespace}
                    namespace=""
                    groupVersionKind={{ kind: 'Namespace', version: 'v1', group: '' }}
                    linkTo={isProviderLocalOpenshift(
                      availableProviders.find(
                        (p) => p?.metadata?.name === plan.spec.provider?.destination?.name,
                      ),
                    )}
                  />
                }
                ariaEditLabel={t('Edit target namespace')}
                onEdit={() => setIsTargetNamespaceEdited(true)}
              />
            )}
          </DescriptionList>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
