import * as React from 'react';
import {
  TreeView,
  Tabs,
  Tab,
  TabTitleText,
  TextContent,
  Text,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  TreeViewSearch,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useSelectionState } from '@migtools/lib-ui';
import { IndexedTree, useSourceVMsQuery } from '@app/queries';
import {
  IPlan,
  SourceInventoryProvider,
  InventoryTree,
  InventoryTreeType,
} from '@app/queries/types';
import {
  filterAndConvertInventoryTree,
  findMatchingSelectableDescendants,
  findNodesMatchingSelectedVMs,
  getAvailableVMs,
  getSelectedVMsFromPlan,
  isNodeFullyChecked,
  useIsNodeSelectableCallback,
} from './helpers';
import { PlanWizardFormState } from './PlanWizard';

import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { usePausedPollingEffect } from '@app/common/context';
import { LONG_LOADING_MESSAGE } from '@app/queries/constants';
import { UseQueryResult } from 'react-query';

interface IFilterVMsFormProps {
  form: PlanWizardFormState['filterVMs'];
  treeQuery: UseQueryResult<IndexedTree<InventoryTree>, unknown>;
  sourceProvider: SourceInventoryProvider | null;
  planBeingPrefilled: IPlan | null;
}

export const FilterVMsForm: React.FunctionComponent<IFilterVMsFormProps> = ({
  form,
  treeQuery,
  sourceProvider,
  planBeingPrefilled,
}: IFilterVMsFormProps) => {
  usePausedPollingEffect();

  const [searchText, setSearchText] = React.useState('');

  const vmsQuery = useSourceVMsQuery(sourceProvider);

  const isNodeSelectable = useIsNodeSelectableCallback(form.values.treeType);

  const treeSelection = useSelectionState({
    items: treeQuery.data?.flattenedNodes.filter(isNodeSelectable) || [],
    externalState: [form.fields.selectedTreeNodes.value, form.fields.selectedTreeNodes.setValue],
    isEqual: (a: InventoryTree, b: InventoryTree) => a.object?.selfLink === b.object?.selfLink,
  });

  const isFirstRender = React.useRef(true);
  const lastTreeType = React.useRef(form.values.treeType);
  React.useEffect(() => {
    // Clear or reset selection when the tree type tab changes
    const treeTypeChanged = form.values.treeType !== lastTreeType.current;
    if (!isFirstRender.current && treeTypeChanged) {
      if (!planBeingPrefilled || !form.values.isPrefilled) {
        treeSelection.selectAll(false);
        lastTreeType.current = form.values.treeType;
      } else if (vmsQuery.isSuccess && treeQuery.isSuccess) {
        const selectedVMs = getSelectedVMsFromPlan(planBeingPrefilled, vmsQuery.data);
        const selectedTreeNodes = findNodesMatchingSelectedVMs(
          treeQuery.data,
          selectedVMs,
          isNodeSelectable
        );
        treeSelection.setSelectedItems(selectedTreeNodes);
        lastTreeType.current = form.values.treeType;
      }
    }
    isFirstRender.current = false;
  }, [
    form.values.treeType,
    form.values.isPrefilled,
    planBeingPrefilled,
    treeQuery,
    vmsQuery,
    treeSelection,
    isNodeSelectable,
  ]);

  const getNodeBadgeContent = (node: InventoryTree, isRootNode: boolean) => {
    if (!treeQuery.data) return null;
    const { treeType } = form.values;
    const { isItemSelected, selectedItems } = treeSelection;
    const allDescendants = isRootNode
      ? treeQuery.data.flattenedNodes
      : treeQuery.data.getDescendants(node, true);
    const selectedDescendants = allDescendants.filter(isItemSelected);
    const numVMs = getAvailableVMs(
      treeQuery.data,
      selectedDescendants,
      vmsQuery.data,
      treeType
    ).length;
    const rootNodeSuffix = ` VM${numVMs !== 1 ? 's' : ''}`;
    if (numVMs || isItemSelected(node) || (isRootNode && selectedItems.length > 0)) {
      return `${numVMs}${isRootNode ? rootNodeSuffix : ''}`;
    }
    return null;
  };

  const treeViewData = filterAndConvertInventoryTree(
    treeQuery.data || null,
    searchText,
    treeSelection.isItemSelected,
    treeSelection.areAllSelected,
    isNodeSelectable,
    getNodeBadgeContent
  );

  const toolbar = (
    <Toolbar style={{ padding: 0 }}>
      <ToolbarContent style={{ padding: 0 }}>
        <ToolbarItem widths={{ default: '100%' }}>
          <TreeViewSearch
            onSearch={(event) => setSearchText(event.target.value)}
            id="inventory-search"
            name="search-inventory"
            aria-label="Search inventory"
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  return (
    <div className="plan-wizard-filter-vms-form">
      <TextContent>
        <Text component="p">
          Refine the list of VMs selectable for migration by clusters
          {sourceProvider?.type === 'vsphere' ? ' or by folders' : ''}.
        </Text>
      </TextContent>
      {sourceProvider?.type === 'vsphere' ? (
        <Tabs
          activeKey={form.values.treeType}
          onSelect={(_event, tabKey) => form.fields.treeType.setValue(tabKey as InventoryTreeType)}
          className={spacing.mtMd}
        >
          <Tab
            key={InventoryTreeType.Cluster}
            eventKey={InventoryTreeType.Cluster}
            title={<TabTitleText>By clusters</TabTitleText>}
          />
          <Tab
            key={InventoryTreeType.VM}
            eventKey={InventoryTreeType.VM}
            title={<TabTitleText>By folders</TabTitleText>}
          />
        </Tabs>
      ) : null}
      <ResolvedQueries
        results={[vmsQuery, treeQuery]}
        errorTitles={['Cannot load VMs', 'Cannot load inventory tree data']}
        emptyStateBody={LONG_LOADING_MESSAGE}
      >
        <TreeView
          key={form.fields.treeType.value}
          data={treeViewData}
          hasChecks
          hasBadges
          hasGuides
          onCheck={(_event, treeViewItem) => {
            if (treeViewItem.id === 'converted-root') {
              treeSelection.selectAll(!treeSelection.areAllSelected);
            } else if (treeQuery.data) {
              const ancestors = treeQuery.data.ancestorsBySelfLink[treeViewItem.id || ''];
              if (ancestors) {
                const matchingNode = ancestors[ancestors.length - 1];
                const isFullyChecked = isNodeFullyChecked(
                  treeQuery.data,
                  matchingNode,
                  treeSelection.isItemSelected,
                  isNodeSelectable
                );
                const nodesToSelect = findMatchingSelectableDescendants(
                  treeQuery.data,
                  matchingNode,
                  isNodeSelectable
                );
                if (nodesToSelect.length > 0) {
                  treeSelection.selectMultiple(nodesToSelect, !isFullyChecked);
                }
              }
            }
          }}
          toolbar={toolbar}
        />
      </ResolvedQueries>
    </div>
  );
};
