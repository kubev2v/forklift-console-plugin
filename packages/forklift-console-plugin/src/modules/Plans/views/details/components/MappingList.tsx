import React, { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, DataList } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { Mapping, MappingListItem } from './MappingListItem';

interface MappingListProps {
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
  /**
   * A function that determines whether a mapping list item is editable
   *
   * @param source The mapping source
   * @returns boolean
   */
  canEditItem?: (source: string) => boolean;
}

export const MappingList: FC<MappingListProps> = ({
  mappings,
  availableSources,
  availableDestinations,
  replaceMapping,
  deleteMapping,
  addMapping,
  generalSourcesLabel,
  noSourcesLabel,
  isDisabled = false,
  isEditable = true,
  canEditItem,
}) => {
  const { t } = useForkliftTranslation();
  return (
    <>
      <DataList isCompact aria-label="">
        {mappings?.map(({ source, destination }, index) => (
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
            canEditItem={(source) => canEditItem?.(source)}
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
