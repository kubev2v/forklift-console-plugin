import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, DataList } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import type { Mapping } from '../utils/types';

import { MappingListItem } from './MappingListItem';

type MappingListProps = {
  mappings: Mapping[];
  availableSources?: string[];
  availableDestinations?: string[];
  additionalDestinations?: string[];
  replaceMapping?: (val: { current: Mapping; next: Mapping }) => void;
  deleteMapping?: (mapping: Mapping) => void;
  addMapping?: () => void;
  generalSourcesLabel: string;
  noSourcesLabel: string;
  isDisabled?: boolean;
  isEditable?: boolean;
};

const MappingList: FC<MappingListProps> = ({
  additionalDestinations,
  addMapping,
  availableDestinations,
  availableSources,
  deleteMapping,
  generalSourcesLabel,
  isDisabled = false,
  isEditable = true,
  mappings,
  noSourcesLabel,
  replaceMapping,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <DataList isCompact aria-label="">
        {mappings?.map(({ destination, source }, index) => (
          <MappingListItem
            source={source}
            destination={destination}
            sources={availableSources}
            destinations={availableDestinations}
            additionalDestinations={additionalDestinations}
            replaceMapping={replaceMapping}
            deleteMapping={deleteMapping}
            index={index}
            key={`${source}-${destination}`}
            generalSourcesLabel={generalSourcesLabel}
            noSourcesLabel={noSourcesLabel}
            isEditable={isEditable}
          />
        ))}
      </DataList>
      {isEditable && (
        <Button
          onClick={addMapping}
          type="button"
          variant="link"
          isDisabled={isDisabled}
          icon={<PlusCircleIcon />}
        >
          {t('Add mapping')}
        </Button>
      )}
    </>
  );
};

export default MappingList;
