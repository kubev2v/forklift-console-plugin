import React, { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Button,
  DataList,
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
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { useToggle } from '../../hooks';

import './ProvidersCreateVmMigration.style.css';

export interface Mapping {
  source: string;
  destination: string;
}

interface MappingListProps {
  mappings: Mapping[];
  sources: {
    label: string;
    usedBySelectedVms: boolean;
    isMapped: boolean;
  }[];
  availableDestinations: string[];
  replaceMapping: (val: { current: Mapping; next: Mapping }) => void;
  deleteMapping: (mapping: Mapping) => void;
  addMapping: () => void;
  usedSourcesLabel: string;
  generalSourcesLabel: string;
  noSourcesLabel: string;
  isDisabled: boolean;
}

export const MappingList: FC<MappingListProps> = ({
  mappings,
  sources,
  availableDestinations,
  replaceMapping,
  deleteMapping,
  addMapping,
  usedSourcesLabel,
  generalSourcesLabel,
  noSourcesLabel,
  isDisabled,
}) => {
  const { t } = useForkliftTranslation();
  const usedSources = sources.filter(({ usedBySelectedVms }) => usedBySelectedVms);
  const generalSources = sources.filter(({ usedBySelectedVms }) => !usedBySelectedVms);
  const allMapped = sources.every(({ isMapped }) => isMapped);
  return (
    <>
      <DataList isCompact aria-label="">
        {mappings.map(({ source, destination }, index) => (
          <MappingItem
            source={source}
            destination={destination}
            destinations={availableDestinations}
            generalSources={generalSources}
            usedSources={usedSources}
            replaceMapping={replaceMapping}
            deleteMapping={deleteMapping}
            index={index}
            key={`${source}-${destination}`}
            generalSourcesLabel={generalSourcesLabel}
            usedSourcesLabel={usedSourcesLabel}
            noSourcesLabel={noSourcesLabel}
            isDisabled={isDisabled}
          />
        ))}
      </DataList>
      <Button
        onClick={addMapping}
        type="button"
        variant="link"
        isDisabled={allMapped || isDisabled}
        icon={<PlusCircleIcon />}
      >
        {t('Add mapping')}
      </Button>
    </>
  );
};

interface MappingItemProps {
  source: string;
  destination: string;
  destinations: string[];
  generalSources: {
    label: string;
    usedBySelectedVms: boolean;
    isMapped: boolean;
  }[];
  usedSources: {
    label: string;
    usedBySelectedVms: boolean;
    isMapped: boolean;
  }[];
  usedSourcesLabel: string;
  generalSourcesLabel: string;
  noSourcesLabel: string;
  index: number;
  replaceMapping: (val: { current: Mapping; next: Mapping }) => void;
  deleteMapping: (mapping: Mapping) => void;
  isDisabled: boolean;
}
const MappingItem: FC<MappingItemProps> = ({
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

const toGroup = (
  sources: MappingListProps['sources'],
  noSourcesLabel: string,
  selectedSource: string,
) =>
  sources.length !== 0 ? (
    sources.map(({ label, isMapped }) => (
      <SelectOption value={label} key={label} isDisabled={isMapped && label !== selectedSource} />
    ))
  ) : (
    <SelectOption value={noSourcesLabel} isNoResultsOption />
  );
