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
      component: () => <PlanDetailsPage obj={plan} />,
      href: '',
      name: t('Details'),
    },
    {
      component: () => <PlanYAMLPage obj={plan} />,
      href: 'yaml',
      name: t('YAML'),
    },
    {
      component: () => <PlanVirtualMachinesPage obj={plan} />,
      href: 'vms',
      name: t('Virtual Machines'),
    },
    {
      component: () => <PlanResourcesPage obj={plan} />,
      href: 'resources',
      name: t('Resources'),
    },
    {
      component: () => <PlanMappingsPage obj={plan} />,
      href: 'mappings',
      name: t('Mappings'),
    },
    {
      component: () => <PlanHooksPage obj={plan} />,
      href: 'hooks',
      name: t('Hooks'),
    },
  ];

  return pages;
};

export default usePlanPages;
