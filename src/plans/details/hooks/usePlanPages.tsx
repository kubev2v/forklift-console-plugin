import { type ReactElement, useMemo } from 'react';

import type { NavPage } from '@openshift-console/dynamic-plugin-sdk';
import { useForkliftTranslation } from '@utils/i18n';

import PlanAutomationPage from '../tabs/Automation/PlanAutomationPage';
import PlanDetailsPage from '../tabs/Details/PlanDetailsPage';
import PlanHooksPage from '../tabs/Hooks/PlanHooksPage';
import PlanMappingsPage from '../tabs/Mappings/PlanMappingsPage';
import PlanResourcesPage from '../tabs/Resources/PlanResourcesPage';
import PlanVirtualMachinesPage from '../tabs/VirtualMachines/PlanVirtualMachinesPage';
import PlanYAMLPage from '../tabs/YAML/PlanYAMLPage';
const usePlanPages = (name: string, namespace: string): NavPage[] => {
  const { t } = useForkliftTranslation();

  const pages: NavPage[] = useMemo(
    () => [
      {
        component: (): ReactElement => <PlanDetailsPage name={name} namespace={namespace} />,
        href: '',
        name: t('Details'),
      },
      {
        component: (): ReactElement => <PlanYAMLPage name={name} namespace={namespace} />,
        href: 'yaml',
        name: t('YAML'),
      },
      {
        component: (): ReactElement => (
          <PlanVirtualMachinesPage name={name} namespace={namespace} />
        ),
        href: 'vms',
        name: t('Virtual machines'),
      },
      {
        component: (): ReactElement => <PlanResourcesPage name={name} namespace={namespace} />,
        href: 'resources',
        name: t('Utilization'),
      },
      {
        component: (): ReactElement => <PlanMappingsPage name={name} namespace={namespace} />,
        href: 'mappings',
        name: t('Mappings'),
      },
      {
        component: (): ReactElement => <PlanAutomationPage name={name} namespace={namespace} />,
        href: 'automation',
        name: t('Automation'),
      },
      {
        component: (): ReactElement => <PlanHooksPage name={name} namespace={namespace} />,
        href: 'hooks',
        name: t('Hooks'),
      },
    ],
    [name, namespace, t],
  );

  return pages;
};

export default usePlanPages;
