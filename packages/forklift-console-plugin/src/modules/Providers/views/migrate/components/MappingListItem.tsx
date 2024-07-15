import React, { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { SelectEventType, SelectValueType } from '@kubev2v/common';
import {
  Button,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { useToggle } from '../../../hooks';
import { Mapping, MappingSource } from '../types';

import '../ProvidersCreateVmMigration.style.css';

export interface MappingListItemProps {
  source: string;
  destination: string;
  destinations: string[];
  generalSources: MappingSource[];
  usedSources: MappingSource[];
  usedSourcesLabel: string;
  generalSourcesLabel: string;
  noSourcesLabel: string;
  index: number;
  replaceMapping: (val: { current: Mapping; next: Mapping }) => void;
  deleteMapping: (mapping: Mapping) => void;
  isDisabled: boolean;
}

export const MappingListItem: FC<MappingListItemProps> = ({
  source,
  destination,
  destinations,
  generalSources,
  usedSources,
  usedSourcesLabel,
  generalSourcesLabel,
  noSourcesLabel,
  index,
  replaceMapping,
  deleteMapping,
  isDisabled,
}) => {
  const { t } = useForkliftTranslation();
  const [isSrcOpen, setToggleSrcOpen] = useToggle(false);
  const [isTrgOpen, setToggleTrgOpen] = useToggle(false);

  const onClick = () => {
    deleteMapping({ source, destination });
  };

  const onSelectSource: (
    event: SelectEventType,
    value: SelectValueType,
    isPlaceholder?: boolean,
  ) => void = (_event, value: string, isPlaceholder) => {
    !isPlaceholder &&
      replaceMapping({
        current: { source, destination },
        next: { source: value, destination },
      });
  };

  const onSelectDestination: (
    event: SelectEventType,
    value: SelectValueType,
    isPlaceholder?: boolean,
  ) => void = (_event, value: string) => {
    replaceMapping({
      current: { source, destination },
      next: { source, destination: value },
    });
  };

  return (
    <DataListItem aria-labelledby="">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="source">
              <Select
                variant={SelectVariant.single}
                aria-label=""
                onToggle={setToggleSrcOpen}
                onSelect={onSelectSource}
                selections={source}
                isOpen={isSrcOpen}
                isDisabled={isDisabled}
                aria-labelledby=""
                isGrouped
                menuAppendTo={() => document.body}
              >
                <SelectGroup label={usedSourcesLabel} key="usedSources">
                  {toGroup(usedSources, noSourcesLabel, source)}
                </SelectGroup>
                <SelectGroup label={generalSourcesLabel} key="generalSources">
                  {toGroup(generalSources, noSourcesLabel, source)}
                </SelectGroup>
              </Select>
            </DataListCell>,
            <DataListCell key="destination">
              <Select
                variant={SelectVariant.single}
                aria-label=""
                onToggle={setToggleTrgOpen}
                onSelect={onSelectDestination}
                selections={destination}
                isOpen={isTrgOpen}
                isDisabled={isDisabled}
                aria-labelledby=""
                menuAppendTo={() => document.body}
              >
                {destinations.map((label) => (
                  <SelectOption value={label} key={label} />
                ))}
              </Select>
            </DataListCell>,
          ]}
        />
        <DataListAction
          id={`mapping_list_item_${index}`}
          aria-label={t('Actions')}
          aria-labelledby=""
        >
          <Button
            onClick={onClick}
            variant="plain"
            aria-label={t('Delete mapping')}
            key="delete-action"
            icon={<MinusCircleIcon />}
            isDisabled={isDisabled}
          />
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  );
};

const toGroup = (sources: MappingSource[], noSourcesLabel: string, selectedSource: string) =>
  sources.length !== 0 ? (
    sources.map(({ label, isMapped }) => (
      <SelectOption value={label} key={label} isDisabled={isMapped && label !== selectedSource} />
    ))
  ) : (
    <SelectOption value={noSourcesLabel} isNoResultsOption />
  );
