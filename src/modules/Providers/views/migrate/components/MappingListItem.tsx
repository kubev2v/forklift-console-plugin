import { type FC, type MouseEvent, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Button,
  ButtonVariant,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Form,
  FormGroup,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';

import type { Mapping, MappingSource } from '../types';

import '../ProvidersCreateVmMigration.style.css';

const toGroup = (sources: MappingSource[], noSourcesLabel: string, selectedSource: string) =>
  isEmpty(sources) ? (
    <SelectOption value={noSourcesLabel} isDisabled={true}>
      {noSourcesLabel}
    </SelectOption>
  ) : (
    sources.map(({ isMapped, label }) => (
      <SelectOption value={label} key={label} isDisabled={isMapped && label !== selectedSource}>
        {label}
      </SelectOption>
    ))
  );

type MappingListItemProps = {
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
};

export const MappingListItem: FC<MappingListItemProps> = ({
  deleteMapping,
  destination,
  destinations,
  generalSources,
  generalSourcesLabel,
  index,
  isDisabled,
  noSourcesLabel,
  replaceMapping,
  source,
  usedSources,
  usedSourcesLabel,
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
    <MenuToggle ref={toggleRef} onClick={onSrcToggleClick} isExpanded={isSrcOpen} isFullWidth>
      {srcSelected}
    </MenuToggle>
  );

  const trgToggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onTrgToggleClick} isExpanded={isTrgOpen} isFullWidth>
      {trgSelected}
    </MenuToggle>
  );

  // Callback functions to handle selection in the dropdown menus
  const onSelectSource = (_event: MouseEvent | undefined, value: string | number | undefined) => {
    replaceMapping({
      current: { destination, source },
      next: { destination, source: value as string },
    });

    // Toggle the dropdown menu open state
    setSrcSelected(value as string);
    setIsSrcOpen(false);
  };

  const onSelectDestination = (
    _event: MouseEvent | undefined,
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
              <Form>
                <FormGroup label={t('Source')}>
                  {/* Custom select does not support the complex toggle being used here */}
                  {/* eslint-disable-next-line no-restricted-syntax */}
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
                    shouldFocusToggleOnSelect
                    shouldFocusFirstItemOnOpen={false}
                    isScrollable
                    popperProps={{
                      direction: 'down',
                      enableFlip: true,
                    }}
                  >
                    <SelectList>
                      <SelectGroup label={usedSourcesLabel} key="usedSources">
                        {toGroup(usedSources, noSourcesLabel, source)}
                      </SelectGroup>
                      <SelectGroup label={generalSourcesLabel} key="generalSources">
                        {toGroup(generalSources, noSourcesLabel, source)}
                      </SelectGroup>
                    </SelectList>
                  </Select>
                </FormGroup>
              </Form>
            </DataListCell>,
            <DataListCell key="destination">
              <Form>
                <FormGroup label={t('Target')}>
                  {/* Custom select does not support the complex toggle being used here */}
                  {/* eslint-disable-next-line no-restricted-syntax */}
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
                      {destinations.map((label) => (
                        <SelectOption value={label} key={label}>
                          {label}
                        </SelectOption>
                      ))}
                    </SelectList>
                  </Select>
                </FormGroup>
              </Form>
            </DataListCell>,
          ]}
        />
        <DataListAction
          id={`mapping_list_item_${index}`}
          aria-label={t('Actions')}
          aria-labelledby=""
          className="pf-v6-u-align-items-center"
        >
          <Button
            onClick={onClick}
            variant={ButtonVariant.plain}
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
