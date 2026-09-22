import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { TableCell } from 'src/components/TableCell/TableCell';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { ProviderIssuesPanelData } from './utils/types';

type ResourceTableCellProps = {
  fieldsData: ProviderIssuesPanelData;
};

const ResourceTableCell: FC<ResourceTableCellProps> = ({ fieldsData }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const itemsCount = fieldsData?.condition?.itemsCount ?? 0;

  if (itemsCount > 0 && fieldsData.hasHostsTab) {
    return (
      <TableCell>
        <Button
          isInline
          onClick={() => {
            navigate(`${fieldsData.providerUrl}/hosts`)?.catch(() => undefined);
          }}
          variant={ButtonVariant.link}
        >
          {t('{{count}} hosts', { count: itemsCount })}
        </Button>
      </TableCell>
    );
  }

  return <TableCell>{t('Provider')}</TableCell>;
};

export default ResourceTableCell;
