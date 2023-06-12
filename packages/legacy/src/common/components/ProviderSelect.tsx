import * as React from 'react';
import { useClusterProvidersQuery, useInventoryProvidersQuery } from 'legacy/src/queries';
import {
  InventoryProvider,
  IOpenShiftProvider,
  IProviderObject,
  SourceInventoryProvider,
} from 'legacy/src/queries/types';
import { getFormGroupProps, IValidatedFormField } from '@migtools/lib-ui';
import {
  Divider,
  FormGroup,
  List,
  ListItem,
  Select,
  SelectGroup,
  SelectOption,
  SelectProps,
} from '@patternfly/react-core';
import { ProviderType, PROVIDER_TYPE_NAMES } from '../constants';
import { getAvailableProviderTypes, hasCondition, isProviderLocalTarget } from '../helpers';
import { ConditionalTooltip } from './ConditionalTooltip';
import { QuerySpinnerMode, ResolvedQueries } from './ResolvedQuery';

import { isSameResource } from 'legacy/src/queries/helpers';
import { OptionWithValue } from './SimpleSelect';

interface IProviderSelectBaseProps<T> extends Partial<SelectProps> {
  tooltipPosition?: 'left' | 'right';
  field: IValidatedFormField<T>;
  providerRole: 'source' | 'target';
  providerAllowRemote?: boolean;
  providerAllowRemoteTooltip?: string;
  onProviderSelect?: (inventoryProvider: T) => void;
  namespace: string;
}

interface ISourceProviderSelectProps extends IProviderSelectBaseProps<SourceInventoryProvider> {
  providerRole: 'source';
}

interface ITargetProviderSelectProps extends IProviderSelectBaseProps<IOpenShiftProvider> {
  providerRole: 'target';
}

type ProviderSelectProps = ISourceProviderSelectProps | ITargetProviderSelectProps;

function toOptionWithValue(provider: IProviderObject) {
  return {
    toString: () => provider.metadata.name,
    value: provider,
  } as OptionWithValue<IProviderObject>;
}

export const ProviderSelect: React.FunctionComponent<ProviderSelectProps> = ({
  providerRole,
  providerAllowRemote = true,
  providerAllowRemoteTooltip,
  field,
  onProviderSelect,
  tooltipPosition = 'left',
  namespace,
  ...props
}: ProviderSelectProps) => {
  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery(namespace);

  const inventoryData = inventoryProvidersQuery?.data;
  const providerItems = clusterProvidersQuery?.data?.items ?? [];

  const getMatchingInventoryProvider = (clusterProvider: IProviderObject): typeof field.value => {
    const providers: InventoryProvider[] =
      (inventoryData && inventoryData[clusterProvider.spec.type || '']) || [];
    if (providers) {
      return providers.find((provider) => isSameResource(provider, clusterProvider.metadata));
    }
    return null;
  };

  const availableProviderTypes = getAvailableProviderTypes(clusterProvidersQuery, providerRole);
  // TODO handle the empty case here, "no source/target providers available" or something

  const optionsByType: Record<ProviderType, OptionWithValue<IProviderObject>[]> =
    availableProviderTypes.reduce((byType, type) => {
      byType[type] = providerItems
        .filter((provider) => provider.spec.type === type)
        .map(toOptionWithValue);
      return byType;
    }, {} as Record<ProviderType, OptionWithValue<IProviderObject>[]>);

  const optionsByUid: Record<string, OptionWithValue<IProviderObject>> = providerItems.reduce(
    (options, provider) => {
      options[provider.metadata.uid] = toOptionWithValue(provider);
      return options;
    },
    {}
  );

  const selectedOptions = field.value?.uid ? [optionsByUid[field.value?.uid]] : [];

  const renderOption = (option: OptionWithValue<IProviderObject>) => {
    const clusterProvider = option.value;
    const inventoryProvider = getMatchingInventoryProvider(clusterProvider);

    const isProviderRemote = providerRole === 'target' && !isProviderLocalTarget(clusterProvider);
    const isReady =
      !!inventoryProvider && hasCondition(clusterProvider.status?.conditions || [], 'Ready');

    const disabled = (!providerAllowRemote && isProviderRemote) || !isReady;

    return (
      <SelectOption
        key={clusterProvider.metadata.name}
        value={option}
        isDisabled={disabled}
        className={disabled ? 'disabled-with-pointer-events' : ''}
      >
        <ConditionalTooltip
          isTooltipEnabled={disabled}
          content={
            <List isPlain>
              {[
                !providerAllowRemote && isProviderRemote
                  ? providerAllowRemoteTooltip ||
                    'This is a remote target provider and cannot currently be selected.'
                  : '',
                !isReady
                  ? 'This provider cannot be selected because its inventory data is not ready'
                  : '',
              ]
                .filter(Boolean)
                .map((c, index) => (
                  <ListItem key={index}>{c}</ListItem>
                ))}
            </List>
          }
          position={tooltipPosition}
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
          selections={selectedOptions}
          onSelect={(_event, selection) => {
            setIsOpen(false);
            const provider = (selection as OptionWithValue<IProviderObject>).value;
            const matchingInventoryProvider = getMatchingInventoryProvider(provider);

            if (onProviderSelect) {
              // Since we don't have access to the field.value's actual type, we have to do this:
              if (providerRole === 'source') {
                return onProviderSelect(matchingInventoryProvider as SourceInventoryProvider);
              } else {
                return onProviderSelect(matchingInventoryProvider as IOpenShiftProvider);
              }
            }
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
