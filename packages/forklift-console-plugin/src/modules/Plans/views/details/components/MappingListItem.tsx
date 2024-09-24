import React, { FC } from 'react';
import { useToggle } from 'src/modules/Providers/hooks';
import { useForkliftTranslation } from 'src/utils/i18n';

import { SelectEventType, SelectValueType } from '@kubev2v/common';
import {
  Button,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';
import {
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { MinusCircleIcon } from '@patternfly/react-icons';

export interface Mapping {
  source: string;
  destination: string;
}

interface MappingListItemProps {
  source: string;
  destination: string;
  sources?: string[];
  destinations?: string[];
  generalSourcesLabel: string;
  noSourcesLabel: string;
  index: number;
  replaceMapping: (val: { current: Mapping; next: Mapping }) => void;
  deleteMapping: (mapping: Mapping) => void;
  isEditable: boolean;
}

export const MappingListItem: FC<MappingListItemProps> = ({
  source,
  destination,
  sources,
  destinations,
  generalSourcesLabel,
  noSourcesLabel,
  index,
  replaceMapping,
  deleteMapping,
  isEditable,
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
                isDisabled={!isEditable}
                aria-labelledby=""
                isGrouped
                menuAppendTo={() => document.body}
              >
                <SelectGroup label={generalSourcesLabel} key="generalSources">
                  {isEditable ? toSelectedOptions(sources, noSourcesLabel) : null}
                </SelectGroup>
                <></>
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
                isDisabled={!isEditable}
                aria-labelledby=""
                menuAppendTo={() => document.body}
              >
                {destinations?.map((label) => (
                  <SelectOption value={label} key={label} />
                ))}
              </Select>
            </DataListCell>,
          ]}
        />
        {isEditable ? (
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
            />
          </DataListAction>
        ) : null}
      </DataListItemRow>
    </DataListItem>
  );
};

const toSelectedOptions = (sources: string[], noSourcesLabel: string) =>
  sources && sources.length !== 0 ? (
    sources.map((source) => <SelectOption value={source} key={source} />)
  ) : (
    <SelectOption value={noSourcesLabel} isNoResultsOption />
  );
