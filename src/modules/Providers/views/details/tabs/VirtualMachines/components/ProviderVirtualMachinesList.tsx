import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import type { RowProps } from 'src/components/common/TableView/types';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { ResourceField } from '@components/common/utils/types';
import { EmptyState, EmptyStateVariant, Spinner, Title } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';

import { getVmId } from '../utils/helpers/vmProps';

import { ConcernsTable } from './ConcernsTable';
import { extraSupportedFilters, extraSupportedMatchers } from './constants';
import type { VmData } from './VMCellProps';

type ProviderVirtualMachinesListProps = {
  title?: string;
  obj: ProviderData;
  ns?: string;
  loaded?: boolean;
  loadError?: unknown;
  cellMapper: FC<RowProps<VmData>>;
  fieldsMetadata: ResourceField[];
  pageId: string;
  onSelect?: (selectedVMs: VmData[] | undefined) => void;
  initialSelectedIds?: string[];
  showActions: boolean;
  className?: string;
};

export const ProviderVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  cellMapper,
  className,
  fieldsMetadata,
  initialSelectedIds = [],
  obj,
  onSelect,
  pageId,
  title,
}) => {
  const { t } = useForkliftTranslation();
  const { vmData, vmDataLoading } = obj;
  const provider = obj?.provider;
  const namespace = (provider ? getNamespace(provider) : '') ?? '';

  const userSettings = useMemo(() => loadUserSettings({ pageId }), [pageId]);

  const handleSelectedIds = onSelect
    ? (selectedIds: string[]) => {
        const selectedVms = vmData?.filter((data) => selectedIds.includes(getVmId(data)));
        onSelect(selectedVms);
      }
    : undefined;

  // Render the spinner while data is loading
  if (vmDataLoading) {
    return (
      <EmptyState
        titleText={
          <Title headingLevel="h4" size="lg">
            {t('Loading virtual machines...')}
          </Title>
        }
        variant={EmptyStateVariant.sm}
      >
        <Spinner size="xl" />
      </EmptyState>
    );
  }

  return (
    <StandardPageWithSelection
      className={className}
      data-testid="vm-list"
      dataSource={[vmData ?? [], !vmDataLoading, null]}
      CellMapper={cellMapper}
      fieldsMetadata={fieldsMetadata}
      namespace={namespace}
      title={title ?? t('Virtual machines')}
      userSettings={userSettings}
      extraSupportedFilters={extraSupportedFilters}
      extraSupportedMatchers={extraSupportedMatchers}
      toId={getVmId}
      onSelect={handleSelectedIds}
      selectedIds={initialSelectedIds}
      page={1}
      expandedIds={[]}
      ExpandedComponent={(props) => <ConcernsTable {...props} />}
    />
  );
};
