import { type FC, type ReactElement, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import type { RowProps } from 'src/components/common/TableView/types';
import { StandardPageWithSelection } from 'src/components/page/StandardPageWithSelection';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { GlobalActionToolbarProps, ResourceField } from '@components/common/utils/types';
import ConcernsAndConditionsTable from '@components/ConcernsAndConditionsTable/ConcernsAndConditionsTable';
import { EmptyState, EmptyStateVariant, Spinner, Title } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import type { ProviderData } from '@utils/providers/types';
import { isProviderEc2, isProviderOpenshift } from '@utils/resources';

import { getVmId } from '../utils/helpers/vmProps';

import { extraSupportedFilters, extraSupportedMatchers } from './constants';
import type { VmData } from './VMCellProps';

type ProviderVirtualMachinesListProps = {
  cellMapper: FC<RowProps<VmData>>;
  className?: string;
  fieldsMetadata: ResourceField[];
  GlobalActionToolbarItems?: FC<GlobalActionToolbarProps<VmData>>[];
  initialSelectedIds?: string[];
  loaded?: boolean;
  loadError?: unknown;
  ns?: string;
  obj: ProviderData;
  onSelect?: (selectedVMs: VmData[] | undefined) => void;
  pageId: string;
  showActions: boolean;
  title?: string;
};

type StandardPageSelectionProps =
  | {
      expandedIds?: string[];
      GlobalActionToolbarItems?: FC<GlobalActionToolbarProps<VmData>>[];
      onSelect: (selectedIds: string[]) => void;
      selectedIds: string[];
      toId: (item: VmData) => string;
    }
  | {
      expandedIds: string[];
      onExpand: () => void;
      toId: (item: VmData) => string;
    }
  | Record<string, never>;

export const ProviderVirtualMachinesList: FC<ProviderVirtualMachinesListProps> = ({
  cellMapper,
  className,
  fieldsMetadata,
  GlobalActionToolbarItems,
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
    ? (selectedIds: string[]): void => {
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

  const getStandardPageProps = (): StandardPageSelectionProps => {
    const ec2 = isProviderEc2(provider);

    if (handleSelectedIds) {
      return {
        ...(ec2 ? {} : { expandedIds: [] }),
        ...(GlobalActionToolbarItems ? { GlobalActionToolbarItems } : {}),
        onSelect: handleSelectedIds,
        selectedIds: initialSelectedIds,
        toId: getVmId,
      };
    }

    if (!isProviderOpenshift(provider) && !ec2) {
      return {
        expandedIds: [],
        onExpand: (): void => undefined,
        toId: getVmId,
      };
    }

    return {};
  };

  return (
    <StandardPageWithSelection
      cell={cellMapper}
      className={className}
      data-testid="vm-list"
      dataSource={[vmData ?? [], !vmDataLoading, null]}
      extraSupportedFilters={extraSupportedFilters}
      extraSupportedMatchers={extraSupportedMatchers}
      fieldsMetadata={fieldsMetadata}
      namespace={namespace}
      title={title ?? t('Virtual machines')}
      userSettings={userSettings}
      {...getStandardPageProps()}
      expanded={
        isProviderOpenshift(provider) || isProviderEc2(provider)
          ? undefined
          : (props): ReactElement => <ConcernsAndConditionsTable vmData={props.resourceData} />
      }
    />
  );
};
