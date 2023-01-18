import * as React from 'react';
import {
  Form,
  FormGroup,
  Select,
  SelectGroup,
  SelectOption,
  TextArea,
  TextContent,
  Text,
  Title,
  Button,
  Popover,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { getFormGroupProps, ValidatedTextInput } from '@migtools/lib-ui';

import { POD_NETWORK } from '@app/queries/types';
import {
  useClusterProvidersQuery,
  useInventoryProvidersQuery,
  useOpenShiftNetworksQuery,
  useNamespacesQuery,
} from '@app/queries';
import { PlanWizardFormState, PlanWizardMode } from './PlanWizard';
import { QuerySpinnerMode, ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { ProviderSelect } from '@app/common/components/ProviderSelect';
import { SelectOpenShiftNetworkModal } from '@app/common/components/SelectOpenShiftNetworkModal';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { usePausedPollingEffect } from '@app/common/context';
import { isSameResource } from '@app/queries/helpers';
import { PROVIDER_TYPE_NAMES } from '@app/common/constants';

interface IGeneralFormProps {
  form: PlanWizardFormState['general'];
  wizardMode: PlanWizardMode;
  afterProviderChange: () => void;
  afterTargetNamespaceChange: () => void;
  namespace: string;
}

export const GeneralForm: React.FunctionComponent<IGeneralFormProps> = ({
  form,
  wizardMode,
  afterProviderChange,
  afterTargetNamespaceChange,
  namespace,
}: IGeneralFormProps) => {
  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery(namespace);
  const namespacesQuery = useNamespacesQuery(form.values.targetProvider);
  const targetNsFoundInQueriesNs = !!namespacesQuery.data?.find(
    (namespace) => form.values.targetNamespace === namespace.name
  );

  const [isNamespaceSelectOpen, setIsNamespaceSelectOpen] = React.useState(false);
  usePausedPollingEffect(isNamespaceSelectOpen);

  const getFilteredOptions = (searchText?: string) => {
    const namespaceOptions = namespacesQuery.data?.map((namespace) => namespace.name) || [];
    const filteredNamespaces = !searchText
      ? namespaceOptions
      : namespaceOptions.filter((option) => {
          try {
            return !!option.toLowerCase().match(searchText.toLowerCase());
          } catch (e) {
            return false;
          }
        });
    return [
      <SelectGroup key="group" label="Select or type to create a namespace">
        {filteredNamespaces.map((option) => (
          <SelectOption key={option.toString()} value={option} />
        ))}
      </SelectGroup>,
    ];
  };

  const [isSelectNetworkModalOpen, toggleSelectNetworkModal] = React.useReducer(
    (isOpen) => !isOpen,
    false
  );

  const openshiftNetworksQuery = useOpenShiftNetworksQuery(form.values.targetProvider);

  const onTargetNamespaceChange = (targetNamespace: string) => {
    form.fields.targetNamespace.setValue(targetNamespace);
    form.fields.targetNamespace.setIsTouched(true);
    setIsNamespaceSelectOpen(false);
    if (targetNamespace !== form.values.targetNamespace) {
      const targetProviderCR = clusterProvidersQuery.data?.items.find((provider) =>
        isSameResource(form.values.targetProvider, provider.metadata)
      );
      const providerDefaultNetworkName =
        targetProviderCR?.metadata.annotations?.['forklift.konveyor.io/defaultTransferNetwork'] ||
        null;
      const matchingNetwork = openshiftNetworksQuery.data?.find(
        (network) =>
          network.name === providerDefaultNetworkName && network.namespace === targetNamespace
      );
      form.fields.migrationNetwork.prefill(matchingNetwork?.name || null);
      afterTargetNamespaceChange();
    }
  };

  return (
    <ResolvedQueries
      results={[inventoryProvidersQuery, clusterProvidersQuery]}
      errorTitles={['Cannot load provider inventory data', 'Cannot load providers from cluster']}
    >
      <Form className={spacing.pbXl}>
        <Title headingLevel="h2" size="md">
          Give your plan a name and a description
        </Title>
        <ValidatedTextInput
          field={form.fields.planName}
          isRequired
          fieldId="plan-name"
          inputProps={{ isDisabled: wizardMode === 'edit' }}
        />
        <ValidatedTextInput
          component={TextArea}
          field={form.fields.planDescription}
          fieldId="plan-description"
        />
        <Title headingLevel="h3" size="md">
          Select source and target providers
        </Title>
        <ProviderSelect
          providerRole="source"
          field={form.fields.sourceProvider}
          afterChange={afterProviderChange}
          namespace={namespace}
        />
        <ProviderSelect
          providerRole="target"
          field={form.fields.targetProvider}
          afterChange={afterProviderChange}
          namespace={namespace}
        />
        <FormGroup
          label="Target namespace"
          isRequired
          fieldId="target-namespace"
          id="target-namespace-group"
          {...getFormGroupProps(form.fields.targetNamespace)}
        >
          <ResolvedQueries
            results={[namespacesQuery, openshiftNetworksQuery]}
            errorTitles={['Cannot load namespaces', 'Cannot load networks']}
            spinnerProps={{ className: spacing.mXs }}
            spinnerMode={QuerySpinnerMode.Inline}
          >
            <Select
              isInputValuePersisted
              placeholderText="Select a namespace"
              isOpen={isNamespaceSelectOpen}
              onToggle={(isOpen) => {
                setIsNamespaceSelectOpen(isOpen);
                if (isOpen) {
                  setTimeout(() => {
                    document
                      .getElementById('target-namespace-group')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }, 0);
                }
              }}
              onSelect={(_event, selection) => onTargetNamespaceChange(selection as string)}
              onFilter={(_event, value) => getFilteredOptions(value)}
              onClear={() => onTargetNamespaceChange('')}
              selections={form.values.targetNamespace}
              variant="typeahead"
              isCreatable
              isGrouped
              id="target-namespace"
              aria-label="Target namespace"
              isDisabled={!form.values.targetProvider || !openshiftNetworksQuery.data}
            >
              {getFilteredOptions()}
            </Select>
          </ResolvedQueries>
        </FormGroup>
        {form.values.targetNamespace ? (
          <div>
            <TextContent>
              <Text component="p">
                The migration transfer network for this migration plan is:{' '}
                <strong>{form.values.migrationNetwork || POD_NETWORK.name}</strong>.
                <Popover
                  bodyContent={`The default migration network defined for the ${PROVIDER_TYPE_NAMES.openshift} provider is used if it exists in the target namespace. Otherwise, the pod network is used. You can select a different network for this migration plan.`}
                >
                  <Button
                    variant="plain"
                    aria-label="More info for migration transfer network field"
                    onClick={(e) => e.preventDefault()}
                    className="pf-c-form__group-label-help"
                  >
                    <HelpIcon noVerticalAlign />
                  </Button>
                </Popover>
              </Text>
            </TextContent>
            {targetNsFoundInQueriesNs && (
              <Button
                variant="link"
                isInline
                onClick={toggleSelectNetworkModal}
                className={spacing.mtXs}
              >
                Select a different network
              </Button>
            )}
          </div>
        ) : null}
      </Form>
      {isSelectNetworkModalOpen ? (
        <SelectOpenShiftNetworkModal
          targetProvider={form.values.targetProvider}
          targetNamespace={form.values.targetNamespace}
          initialSelectedNetwork={form.values.migrationNetwork}
          instructions="Select the network that will be used for migrating data to the namespace."
          onClose={toggleSelectNetworkModal}
          onSubmit={(network) => {
            form.fields.migrationNetwork.setValue(network?.name || null);
            toggleSelectNetworkModal();
          }}
        />
      ) : null}
    </ResolvedQueries>
  );
};
