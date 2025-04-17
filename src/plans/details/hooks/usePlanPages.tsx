import type { V1beta1Plan } from '@kubev2v/types';
import type { NavPage } from '@openshift-console/dynamic-plugin-sdk';
import { useForkliftTranslation } from '@utils/i18n';

import PlanDetailsPage from '../tabs/Details/PlanDetailsPage';
import PlanHooksPage from '../tabs/Hooks/PlanHooksPage';
import PlanMappingsPage from '../tabs/Mappings/PlanMappingsPage';
import PlanResourcesPage from '../tabs/Resources/PlanResourcesPage';
import PlanVirtualMachinesPage from '../tabs/VirtualMachines/PlanVirtualMachinesPage';
import PlanYAMLPage from '../tabs/YAML/PlanYAMLPage';

const usePlanPages = (plan: V1beta1Plan) => {
  const { t } = useForkliftTranslation();
  const pages: NavPage[] = [
    {
      component: () => <PlanDetailsPage plan={plan} />,
      href: '',
      name: t('Details'),
    },
    {
      component: () => <PlanYAMLPage plan={plan} />,
      href: 'yaml',
      name: t('YAML'),
    },
    {
      component: () => <PlanVirtualMachinesPage plan={plan} />,
      href: 'vms',
      name: t('Virtual Machines'),
    },
    {
      component: () => <PlanResourcesPage plan={plan} />,
      href: 'resources',
      name: t('Resources'),
    },
    {
      component: () => <PlanMappingsPage plan={plan} />,
      href: 'mappings',
      name: t('Mappings'),
    },
    {
      component: () => <PlanHooksPage plan={plan} />,
      href: 'hooks',
      name: t('Hooks'),
    },
  ];

  return pages;
};

export default usePlanPages;
