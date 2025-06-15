import { type FC, type MouseEvent as ReactMouseEvent, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Button,
  ButtonVariant,
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
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import type { Mapping } from '../utils/types';

import SelectedOptions from './SelectedOptions';

type MappingListItemProps = {
  source: string;
  destination: string;
  sources?: string[];
  destinations?: string[];
  generalSourcesLabel: string;
  noSourcesLabel: string;
  index: number;
  replaceMapping?: (val: { current: Mapping; next: Mapping }) => void;
  deleteMapping?: (mapping: Mapping) => void;
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

  const onSrcToggleClick = () => {
    setIsSrcOpen(!isSrcOpen);
  };

  const onTrgToggleClick = () => {
    setIsTrgOpen(!isTrgOpen);
  };

  const toggle =
    (selected: string, isOpen: boolean, onToggleClick: () => void) =>
    (toggleRef: Ref<MenuToggleElement>) => (
      <MenuToggle
        ref={toggleRef}
        onClick={onToggleClick}
        isExpanded={isOpen}
        isDisabled={!isEditable}
        isFullWidth
      >
        {selected}
      </MenuToggle>
    );

  const onSelectSource = (
    _event: ReactMouseEvent | undefined,
    value: string | number | undefined,
  ) => {
    replaceMapping?.({
      current: { destination, source },
      next: { destination, source: value as string },
    });

    setSrcSelected(value as string);
    setIsSrcOpen(false);
  };

  const onSelectDestination = (
    _event: ReactMouseEvent | undefined,
    value: string | number | undefined,
  ) => {
    replaceMapping?.({
      current: { destination, source },
      next: { destination: value as string, source },
    });

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
                isOpen={isSrcOpen}
                selected={srcSelected}
                onSelect={onSelectSource}
                onOpenChange={(nextOpen: boolean) => {
                  setIsSrcOpen(nextOpen);
                }}
                toggle={toggle(srcSelected, isSrcOpen, onSrcToggleClick)}
                isScrollable
                shouldFocusFirstItemOnOpen={false}
              >
                <SelectList>
                  <SelectGroup label={generalSourcesLabel} key="generalSources">
                    <SelectedOptions
                      isEditable={isEditable}
                      noOptionsLabel={noSourcesLabel}
                      options={sources}
                    />
                  </SelectGroup>
                </SelectList>
              </Select>
            </DataListCell>,
            <DataListCell key="destination">
              <Select
                isOpen={isTrgOpen}
                selected={trgSelected}
                onSelect={onSelectDestination}
                onOpenChange={(nextOpen: boolean) => {
                  setIsTrgOpen(nextOpen);
                }}
                toggle={toggle(trgSelected, isTrgOpen, onTrgToggleClick)}
                shouldFocusFirstItemOnOpen={false}
                isScrollable
              >
                <SelectList>
                  <SelectedOptions options={destinations} />
                </SelectList>
              </Select>
            </DataListCell>,
          ]}
        />
        {isEditable && (
          <DataListAction
            id={`mapping_list_item_${index}`}
            aria-label={t('Actions')}
            aria-labelledby=""
          >
            <Button
              onClick={() => {
                deleteMapping?.({ destination, source });
              }}
              variant={ButtonVariant.plain}
              aria-label={t('Delete mapping')}
              key="delete-action"
              icon={<MinusCircleIcon />}
            />
          </DataListAction>
        )}
      </DataListItemRow>
    </DataListItem>
  );
};
