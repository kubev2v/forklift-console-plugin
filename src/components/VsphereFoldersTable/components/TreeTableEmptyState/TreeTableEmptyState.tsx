import type { FC } from 'react';

import { NoResultsFound, NoResultsMatchFilter } from '@components/common/Page/PageStates';
import { Bullseye } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

type TreeTableEmptyStateProps = {
  clearAllFilters: () => void;
  colSpan: number;
  hasFiltersApplied: boolean;
};

const TreeTableEmptyState: FC<TreeTableEmptyStateProps> = ({
  clearAllFilters,
  colSpan,
  hasFiltersApplied,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <Tr>
      <Td colSpan={colSpan}>
        <Bullseye>
          {hasFiltersApplied ? (
            <NoResultsMatchFilter
              clearAllFilters={clearAllFilters}
              clearAllLabel={t('Clear all filters')}
              description={t(
                'No results match the filter criteria. Clear all filters and try again.',
              )}
              key="no_match"
              title={t('No results found')}
            />
          ) : (
            <NoResultsFound key="no_result" title={t('No results found')} />
          )}
        </Bullseye>
      </Td>
    </Tr>
  );
};

export default TreeTableEmptyState;
