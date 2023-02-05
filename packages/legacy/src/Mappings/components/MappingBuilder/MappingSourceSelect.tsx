import * as React from 'react';
import { MappingSource } from 'legacy/src/queries/types';
import {
  SimpleSelect,
  ISimpleSelectProps,
  OptionWithValue,
} from 'legacy/src/common/components/SimpleSelect';
import { IMappingBuilderItem } from './MappingBuilder';
import { TruncatedText } from 'legacy/src/common/components/TruncatedText';

interface IMappingSourceSelectProps extends Partial<ISimpleSelectProps> {
  id: string;
  builderItems: IMappingBuilderItem[];
  itemIndex: number;
  setBuilderItems: (items: IMappingBuilderItem[]) => void;
  availableSources: MappingSource[];
}

export const MappingSourceSelect: React.FunctionComponent<IMappingSourceSelectProps> = ({
  id,
  builderItems,
  itemIndex,
  setBuilderItems,
  availableSources,
  ...props
}: IMappingSourceSelectProps) => {
  const setSource = (source: MappingSource) => {
    const newItems = [...builderItems];
    newItems[itemIndex] = { ...builderItems[itemIndex], source };
    setBuilderItems(newItems);
  };

  // Don't allow selection of sources already selected in other groups
  const filteredSources = availableSources.filter(
    (source) =>
      !builderItems.some(
        (item, index) => item.source?.selfLink === source.selfLink && index !== itemIndex
      )
  );

  const options: OptionWithValue<MappingSource>[] = filteredSources.map((source) => ({
    value: source,
    toString: () => source.name,
    props: {
      children: <TruncatedText>{source.name}</TruncatedText>,
      description: <TruncatedText>{source.path}</TruncatedText>,
    },
  }));
  const selectedOption = options.filter(
    (option) => option.value.selfLink === builderItems[itemIndex].source?.selfLink
  );

  return (
    <SimpleSelect
      id={id}
      toggleId={id}
      aria-label="Select source"
      className="mapping-item-select"
      variant="typeahead"
      isPlain
      options={options}
      value={[selectedOption]}
      onChange={(selection) => {
        setSource((selection as OptionWithValue<MappingSource>).value);
      }}
      typeAheadAriaLabel="Select source..."
      placeholderText="Select source..."
      {...props}
    />
  );
};
