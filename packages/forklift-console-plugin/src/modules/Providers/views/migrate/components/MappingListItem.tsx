import React, { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

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
                onSelect={(event, value: string, isPlaceholder: boolean) =>
                  !isPlaceholder &&
                  replaceMapping({
                    current: { source, destination },
                    next: { source: value, destination },
                  })
                }
                selections={source}
                isOpen={isSrcOpen}
                isDisabled={isDisabled}
                aria-labelledby=""
                isGrouped
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
                onSelect={(event, value: string) =>
                  replaceMapping({
                    current: { source, destination },
                    next: { source, destination: value },
                  })
                }
                selections={destination}
                isOpen={isTrgOpen}
                isDisabled={isDisabled}
                aria-labelledby=""
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
            onClick={() => deleteMapping({ source, destination })}
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
