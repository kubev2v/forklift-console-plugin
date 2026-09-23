import { type FC, useEffect, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';

import StandardPage from '@components/page/StandardPage';
import {
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelContent,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';

import { useProvider } from '../../hooks/useProvider';
import useProviderIssuesAlerts from '../../hooks/useProviderIssuesAlerts';
import { PROVIDER_ISSUES_DESC_LABEL, PROVIDER_ISSUES_TITLE_LABEL } from '../../utils/constants';

import { convertToProviderIssuesPanelData } from './utils/convertToProviderIssuesPanelData';
import { providerIssuesPanelFields } from './utils/providerIssuesPanelFields';
import type { ProviderIssuesPanelData } from './utils/types';
import ProviderIssuesRow from './ProviderIssuesRow';

type ProviderIssuesPanelProps = {
  name: string;
  namespace: string;
  setShowProviderIssuesPanel: (isOpen: boolean) => void;
  showProviderIssuesPanel: boolean;
};

const ProviderIssuesPanel: FC<ProviderIssuesPanelProps> = ({
  name,
  namespace,
  setShowProviderIssuesPanel,
  showProviderIssuesPanel,
}) => {
  const userSettings = useMemo(() => loadUserSettings({ pageId: 'ProviderIssuesPanel' }), []);
  const { loaded, loadError, provider } = useProvider(name, namespace);
  const { elevatedConditions, showElevatedConditions } = useProviderIssuesAlerts(provider);

  const providerIssuesPanelData: ProviderIssuesPanelData[] = useMemo(
    () => convertToProviderIssuesPanelData(elevatedConditions, getName(provider) ?? ''),
    [elevatedConditions, provider],
  );

  useEffect(() => {
    if (loaded && !loadError && showProviderIssuesPanel && !showElevatedConditions) {
      setShowProviderIssuesPanel(false);
    }
  }, [
    loaded,
    loadError,
    setShowProviderIssuesPanel,
    showElevatedConditions,
    showProviderIssuesPanel,
  ]);

  return (
    <DrawerPanelContent className="pfext-quick-start__base provider-issues-panel" isResizable>
      <DrawerHead>
        <div className="pfext-quick-start-panel-content__title" tabIndex={-1}>
          <Stack hasGutter>
            <StackItem>
              <Title
                className="pfext-quick-start-panel-content__name provider-issues-panel__content__title"
                headingLevel="h2"
                size="xl"
              >
                {PROVIDER_ISSUES_TITLE_LABEL}
              </Title>
            </StackItem>
            <StackItem>
              <section>{PROVIDER_ISSUES_DESC_LABEL}</section>
            </StackItem>
          </Stack>
        </div>

        <DrawerActions>
          <DrawerCloseButton
            className="pfext-quick-start-panel-content__close-button"
            onClick={() => {
              setShowProviderIssuesPanel(false);
            }}
          />
        </DrawerActions>
      </DrawerHead>
      <StandardPage
        cell={ProviderIssuesRow}
        dataSource={[providerIssuesPanelData, loaded, loadError]}
        fieldsMetadata={providerIssuesPanelFields}
        namespace={namespace}
        showManageColumns={false}
        userSettings={userSettings}
      />
    </DrawerPanelContent>
  );
};

export default ProviderIssuesPanel;
