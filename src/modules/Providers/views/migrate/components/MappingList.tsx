import React, { type FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, DataList } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import type { Mapping, MappingSource } from '../types';

import { MappingListItem } from './MappingListItem';

import '../ProvidersCreateVmMigration.style.css';

type MappingListProps = {
  mappings?: Mapping[];
  sources: MappingSource[];
  availableDestinations: string[];
  replaceMapping: (val: { current: Mapping; next: Mapping }) => void;
  deleteMapping: (mapping: Mapping) => void;
  addMapping: () => void;
  usedSourcesLabel: string;
  generalSourcesLabel: string;
  noSourcesLabel: string;
  isDisabled: boolean;
};

export const MappingList: FC<MappingListProps> = ({
  addMapping,
  availableDestinations,
  deleteMapping,
  generalSourcesLabel,
  isDisabled,
  mappings,
  noSourcesLabel,
  replaceMapping,
  sources,
  usedSourcesLabel,
}) => {
  const { t } = useForkliftTranslation();
  const usedSources = sources.filter(({ usedBySelectedVms }) => usedBySelectedVms);
  const generalSources = sources.filter(({ usedBySelectedVms }) => !usedBySelectedVms);
  const allMapped = sources.every(({ isMapped }) => isMapped);
  return (
    <>
      <DataList isCompact aria-label="">
        {mappings?.map(({ destination, source }, index) => (
          <MappingListItem
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
