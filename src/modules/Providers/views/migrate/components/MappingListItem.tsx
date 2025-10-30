import { type FC, useEffect, useState } from 'react';
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
  SelectGroup,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';

import type { Mapping, MappingSource } from '../types';

import MappingSelect from './MappingSelect';

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
  const [srcSelected, setSrcSelected] = useState<string>(source);
  const [trgSelected, setTrgSelected] = useState<string>(destination);

  useEffect(() => {
    setSrcSelected(source);
  }, [source]);

  useEffect(() => {
    setTrgSelected(destination);
  }, [destination]);

  const onClick = () => {
    deleteMapping({ destination, source });
  };

  const onSelectSource = (value: string) => {
    replaceMapping({
      current: { destination, source },
      next: { destination, source: value },
    });

    setSrcSelected(value);
  };

  const onSelectDestination = (value: string) => {
    replaceMapping({
      current: { destination, source },
      next: { destination: value, source },
    });

    setTrgSelected(value);
  };

  return (
    <DataListItem aria-labelledby="">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="source">
              <Form>
                <FormGroup label={t('Source')}>
                  <MappingSelect selected={srcSelected} setSelected={onSelectSource}>
                    <SelectList>
                      {!isEmpty(usedSources) && (
                        <SelectGroup label={usedSourcesLabel} key="usedSources">
                          {toGroup(usedSources, noSourcesLabel, source)}
                        </SelectGroup>
                      )}
                      <SelectGroup label={generalSourcesLabel} key="generalSources">
                        {toGroup(generalSources, noSourcesLabel, source)}
                      </SelectGroup>
                    </SelectList>
                  </MappingSelect>
                </FormGroup>
              </Form>
            </DataListCell>,
            <DataListCell key="destination">
              <Form>
                <FormGroup label={t('Target')}>
                  <MappingSelect selected={trgSelected} setSelected={onSelectDestination}>
                    <SelectList>
                      {destinations.map((label) => (
                        <SelectOption value={label} key={label}>
                          {label}
                        </SelectOption>
                      ))}
                    </SelectList>
                  </MappingSelect>
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
