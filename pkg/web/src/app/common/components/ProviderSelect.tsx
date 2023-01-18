import * as React from 'react';
import { useClusterProvidersQuery, useInventoryProvidersQuery } from '@app/queries';
import {
  InventoryProvider,
  IOpenShiftProvider,
  IProviderObject,
  SourceInventoryProvider,
} from '@app/queries/types';
import { getFormGroupProps, IValidatedFormField } from '@migtools/lib-ui';
import {
  Divider,
  FormGroup,
  Select,
  SelectGroup,
  SelectOption,
  SelectProps,
} from '@patternfly/react-core';
import {
  ProviderType,
  PROVIDER_TYPE_NAMES,
  SOURCE_PROVIDER_TYPES,
  TARGET_PROVIDER_TYPES,
} from '../constants';
import { getAvailableProviderTypes, hasCondition } from '../helpers';
import { ConditionalTooltip } from './ConditionalTooltip';
import { QuerySpinnerMode, ResolvedQueries } from './ResolvedQuery';

import { isSameResource } from '@app/queries/helpers';
import { OptionWithValue } from './SimpleSelect';

interface IProviderSelectBaseProps<T> extends Partial<SelectProps> {
  notReadyTooltipPosition?: 'left' | 'right';
  field: IValidatedFormField<T | null>;
  afterChange?: () => void;
  namespace: string;
}

interface ISourceProviderSelectProps extends IProviderSelectBaseProps<SourceInventoryProvider> {
  providerRole: 'source';
}

interface ITargetProviderSelectProps extends IProviderSelectBaseProps<IOpenShiftProvider> {
  providerRole: 'target';
}

type ProviderSelectProps = ISourceProviderSelectProps | ITargetProviderSelectProps;

export const ProviderSelect: React.FunctionComponent<ProviderSelectProps> = ({
  providerRole,
  field,
  notReadyTooltipPosition = 'left',
  afterChange,
  namespace,
  ...props
}: ProviderSelectProps) => {
  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery(namespace);
  const { data: inventoryData } = inventoryProvidersQuery;

  const getMatchingInventoryProvider = (clusterProvider: IProviderObject) => {
    const providers: InventoryProvider[] =
      (inventoryData && inventoryData[clusterProvider.spec.type || '']) || [];
    if (providers) {
      return providers.find((provider) => isSameResource(provider, clusterProvider.metadata));
    }
    return null;
  };

  const availableProviderTypes = getAvailableProviderTypes(clusterProvidersQuery).filter((type) =>
    (providerRole === 'source' ? SOURCE_PROVIDER_TYPES : TARGET_PROVIDER_TYPES).includes(type)
  );
  // TODO handle the empty case here, "no source/target providers available" or something

  const optionsByType: Partial<Record<ProviderType, OptionWithValue<IProviderObject>[]>> = {};
  const optionsByUid: Record<string, OptionWithValue<IProviderObject>> = {};
  availableProviderTypes.forEach((type) => {
    const clusterProviders =
      clusterProvidersQuery.data?.items.filter((provider) => provider.spec.type === type) || [];
    optionsByType[type] = clusterProviders.map((clusterProvider) => {
      const option: OptionWithValue<IProviderObject> = {
        toString: () => clusterProvider.metadata.name,
        value: clusterProvider,
      };
      if (clusterProvider.metadata.uid) {
        optionsByUid[clusterProvider.metadata.uid || ''] = option;
      }
      return option;
    });
  });

  const selectedProvider = (clusterProvidersQuery.data?.items || []).find(
    (provider) => provider.metadata.uid === field.value?.uid
  );

  const renderOption = (option: OptionWithValue<IProviderObject>) => {
    const clusterProvider = option.value;
    const inventoryProvider = getMatchingInventoryProvider(clusterProvider);
    const isReady =
      !!inventoryProvider && hasCondition(clusterProvider.status?.conditions || [], 'Ready');
    return (
      <SelectOption
        key={clusterProvider.metadata.name}
        value={option}
        isDisabled={!isReady}
        className={!isReady ? 'disabled-with-pointer-events' : ''}
      >
        <ConditionalTooltip
          isTooltipEnabled={!isReady}
          content="This provider cannot be selected because its inventory data is not ready"
          position={notReadyTooltipPosition}
        >
          <div>{clusterProvider.metadata.name}</div>
        </ConditionalTooltip>
      </SelectOption>
    );
  };

  const label = providerRole === 'source' ? 'Source provider' : 'Target provider';

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <ResolvedQueries
      results={[inventoryProvidersQuery, clusterProvidersQuery]}
      errorTitles={['Cannot load provider inventory data', 'Cannot load providers from cluster']}
      spinnerMode={QuerySpinnerMode.Inline}
    >
      <FormGroup
        label={label}
        isRequired
        fieldId={`provider-select-${providerRole}`}
        {...getFormGroupProps(field as IValidatedFormField<unknown>)}
      >
        <Select
          id={`provider-select-${providerRole}`}
          toggleId={`provider-select-${providerRole}-toggle`}
          aria-label={label}
          placeholderText="Select a provider..."
          isOpen={isOpen}
          onToggle={setIsOpen}
          selections={
            selectedProvider?.metadata.uid ? [optionsByUid[selectedProvider.metadata.uid]] : []
          }
          onSelect={(_event, selection) => {
            setIsOpen(false);
            const matchingInventoryProvider = getMatchingInventoryProvider(
              (selection as OptionWithValue<IProviderObject>).value
            );
            if (matchingInventoryProvider) {
              // There's probably some better way to make TS happy here.
              // The discriminated union of ProviderSelectProps should mean that providerRole === 'source'
              // narrows the type of `field` to IValidatedFormField<SourceInventoryProvider | null>, for example.
              if (providerRole === 'source') {
                (field as IValidatedFormField<SourceInventoryProvider | null>).setValue(
                  matchingInventoryProvider as SourceInventoryProvider
                );
              } else {
                (field as IValidatedFormField<IOpenShiftProvider | null>).setValue(
                  matchingInventoryProvider as IOpenShiftProvider
                );
              }
            }
            afterChange && afterChange();
          }}
          {...props}
        >
          {availableProviderTypes.length === 1
            ? (optionsByType[availableProviderTypes[0]] || []).map(renderOption) || []
            : availableProviderTypes.map((type, index) => (
                <React.Fragment key={type}>
                  <SelectGroup label={PROVIDER_TYPE_NAMES[type]}>
                    {(optionsByType[type] || []).map(renderOption)}
                  </SelectGroup>
                  {index !== availableProviderTypes.length - 1 ? <Divider /> : null}
                </React.Fragment>
              ))}
        </Select>
      </FormGroup>
    </ResolvedQueries>
  );
};
