import * as React from 'react';
import {
  SimpleSelect,
  ISimpleSelectProps,
  OptionWithValue,
} from 'legacy/src/common/components/SimpleSelect';
import {
  IAnnotatedStorageClass,
  IOpenShiftNetwork,
  MappingTarget,
  MappingType,
} from 'legacy/src/queries/types';
import { IMappingBuilderItem } from './MappingBuilder';
import { getMappingName } from '../MappingDetailView/helpers';
import { TruncatedText } from 'legacy/src/common/components/TruncatedText';

interface IMappingTargetSelectProps extends Partial<ISimpleSelectProps> {
  id: string;
  builderItems: IMappingBuilderItem[];
  itemIndex: number;
  setBuilderItems: (items: IMappingBuilderItem[]) => void;
  availableTargets: MappingTarget[];
  mappingType: MappingType;
}

export const MappingTargetSelect: React.FunctionComponent<IMappingTargetSelectProps> = ({
  id,
  builderItems,
  itemIndex,
  setBuilderItems,
  availableTargets,
  mappingType,
  ...props
}: IMappingTargetSelectProps) => {
  const setTarget = React.useCallback(
    (target: MappingTarget) => {
      const newItems = [...builderItems];
      newItems[itemIndex] = { ...builderItems[itemIndex], target };
      setBuilderItems(newItems);
    },
    [builderItems, itemIndex, setBuilderItems]
  );

  const targetOptions: OptionWithValue<MappingTarget>[] = availableTargets.map((target) => {
    let name = getMappingName(target, mappingType);
    let isDefault = false;
    if (mappingType === MappingType.Storage) {
      const targetStorage = target as IAnnotatedStorageClass;
      if (targetStorage.uiMeta.isDefault) {
        isDefault = true;
      }
    } else if (mappingType === MappingType.Network) {
      const targetNetwork = target as IOpenShiftNetwork;
      isDefault = targetNetwork.type === 'pod';
    }
    if (isDefault) {
      name = `${name} (default)`;
    }
    return {
      value: target,
      toString: () => name,
      props: {
        children: <TruncatedText>{name}</TruncatedText>,
      },
    };
  });

  const selectedOption = targetOptions.find(
    (option: OptionWithValue<MappingTarget>) =>
      option.value.selfLink === builderItems[itemIndex].target?.selfLink
  );

  return (
    <SimpleSelect
      id={id}
      toggleId={id}
      aria-label="Select target"
      className="mapping-item-select"
      variant="typeahead"
      isPlain
      options={targetOptions}
      value={[selectedOption]}
      onChange={(selection) => {
        setTarget((selection as OptionWithValue<MappingTarget>).value);
      }}
      typeAheadAriaLabel="Select target..."
      placeholderText="Select target..."
      {...props}
    />
  );
};
