import React, { type FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, DataList } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { type Mapping, MappingListItem } from './MappingListItem';

type MappingListProps = {
  /**
   * List of existed mappings
   */
  mappings: Mapping[];
  /**
   * List of available source provider's mappings
   */
  availableSources?: string[];
  /**
   * List of available target provider's mappings
   */
  availableDestinations?: string[];
  replaceMapping?: (val: { current: Mapping; next: Mapping }) => void;
  deleteMapping?: (mapping: Mapping) => void;
  addMapping?: () => void;
  generalSourcesLabel: string;
  noSourcesLabel: string;
  /**
   * Is the 'mappings adding' buttons disabled
   */
  isDisabled?: boolean;
  /**
   * Is in edit/view mode? In case of view mode, the DataListCells are disabled and buttons are hidden
   */
  isEditable?: boolean;
};

export const MappingList: FC<MappingListProps> = ({
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
      {isEditable ? (
        <Button
          onClick={addMapping}
          type="button"
          variant="link"
          isDisabled={isDisabled}
          icon={<PlusCircleIcon />}
        >
          {t('Add mapping')}
        </Button>
      ) : (
        ''
      )}
    </>
  );
};
