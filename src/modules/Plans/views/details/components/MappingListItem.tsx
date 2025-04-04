import { type FC, type MouseEvent as ReactMouseEvent, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Button,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

export type Mapping = {
  source: string;
  destination: string;
};

type MappingListItemProps = {
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
};

export const MappingListItem: FC<MappingListItemProps> = ({
  deleteMapping,
  destination,
  destinations,
  generalSourcesLabel,
  index,
  isEditable,
  noSourcesLabel,
  replaceMapping,
  source,
  sources,
}) => {
  const { t } = useForkliftTranslation();
  const [isSrcOpen, setIsSrcOpen] = useState(false);
  const [isTrgOpen, setIsTrgOpen] = useState(false);
  const [srcSelected, setSrcSelected] = useState<string>(source);
  const [trgSelected, setTrgSelected] = useState<string>(destination);

  const onClick = () => {
    deleteMapping({ destination, source });
  };

  const onSrcToggleClick = () => {
    setIsSrcOpen(!isSrcOpen);
  };

  const onTrgToggleClick = () => {
    setIsTrgOpen(!isTrgOpen);
  };

  const srcToggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onSrcToggleClick}
      isExpanded={isSrcOpen}
      isDisabled={!isEditable}
      isFullWidth
    >
      {srcSelected}
    </MenuToggle>
  );

  const trgToggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onTrgToggleClick}
      isExpanded={isTrgOpen}
      isDisabled={!isEditable}
      isFullWidth
    >
      {trgSelected}
    </MenuToggle>
  );

  const onSelectSource = (
    _event: ReactMouseEvent | undefined,
    value: string | number | undefined,
  ) => {
    replaceMapping({
      current: { destination, source },
      next: { destination, source: value as string },
    });

    // Toggle the dropdown menu open state
    setSrcSelected(value as string);
    setIsSrcOpen(false);
  };

  const onSelectDestination = (
    _event: ReactMouseEvent | undefined,
    value: string | number | undefined,
  ) => {
    replaceMapping({
      current: { destination, source },
      next: { destination: value as string, source },
    });

    // Toggle the dropdown menu open state
    setTrgSelected(value as string);
    setIsTrgOpen(false);
  };

  return (
    <DataListItem aria-labelledby="">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="source">
              <Select
                role="menu"
                aria-label=""
                aria-labelledby=""
                isOpen={isSrcOpen}
                selected={srcSelected}
                onSelect={onSelectSource}
                onOpenChange={(nextOpen: boolean) => {
                  setIsSrcOpen(nextOpen);
                }}
                toggle={srcToggle}
                isScrollable
                shouldFocusFirstItemOnOpen={false}
                popperProps={{
                  direction: 'down',
                  enableFlip: true,
                }}
              >
                <SelectList>
                  <SelectGroup label={generalSourcesLabel} key="generalSources">
                    {isEditable ? toSelectedOptions(sources, noSourcesLabel) : null}
                  </SelectGroup>
                </SelectList>
                <></>
              </Select>
            </DataListCell>,
            <DataListCell key="destination">
              <Select
                role="menu"
                aria-label=""
                aria-labelledby=""
                isOpen={isTrgOpen}
                selected={trgSelected}
                onSelect={onSelectDestination}
                onOpenChange={(nextOpen: boolean) => {
                  setIsTrgOpen(nextOpen);
                }}
                toggle={trgToggle}
                shouldFocusToggleOnSelect
                shouldFocusFirstItemOnOpen={false}
                isScrollable
                popperProps={{
                  direction: 'down',
                  enableFlip: true,
                }}
              >
                <SelectList>
                  {destinations?.map((label) => (
                    <SelectOption value={label} key={label}>
                      {label}
                    </SelectOption>
                  ))}
                </SelectList>
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
    sources.map((source) => (
      <SelectOption value={source} key={source}>
        {source}
      </SelectOption>
    ))
  ) : (
    <SelectOption value={noSourcesLabel} isDisabled={true} />
  );
