import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, ButtonVariant, DataList } from '@patternfly/react-core';
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
  testId?: string;
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
  testId,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <DataList isCompact aria-label="" data-testid={testId}>
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
            testId={testId}
          />
        ))}
      </DataList>
      {isEditable && (
        <Button
          onClick={addMapping}
          type="button"
          variant={ButtonVariant.link}
          isDisabled={isDisabled}
          icon={<PlusCircleIcon />}
          data-testid={
            testId ? `add-${testId.replace('-mappings-list', '')}-mapping-button` : undefined
          }
        >
          {t('Add mapping')}
        </Button>
      )}
    </>
  );
};

export default MappingList;
