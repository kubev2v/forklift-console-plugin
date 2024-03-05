import React, { FC } from 'react';
import { useToggle } from 'src/modules/Providers/hooks';
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
                isDisabled={!isEditable}
                aria-labelledby=""
                isGrouped
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
                onSelect={(event, value: string) =>
                  replaceMapping({
                    current: { source, destination },
                    next: { source, destination: value },
                  })
                }
                selections={destination}
                isOpen={isTrgOpen}
                isDisabled={!isEditable}
                aria-labelledby=""
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
              onClick={() => deleteMapping({ source, destination })}
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
