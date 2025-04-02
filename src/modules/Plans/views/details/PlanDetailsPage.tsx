import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import PlanPageHeadings from './components/PlanPageHeadings';
import { PlanDetails } from './tabs/Details/PlanDetails';
import { PlanHooks } from './tabs/Hooks/PlanHooks';
import { PlanMappings } from './tabs/Mappings/PlanMappings';
import { PlanResources } from './tabs/Resources/PlanResources';
import { PlanVirtualMachines } from './tabs/VirtualMachines/PlanVirtualMachines';
import { PlanYAML } from './tabs/YAML/PlanYAML';

import './PlanDetailsPage.style.css';

type PlanDetailsPageProps = {
  name: string;
  namespace: string;
};

const PlanDetailsPage: FC<PlanDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const pages = [
    {
      component: () => <PlanDetails name={name} namespace={namespace} />,
      href: '',
      name: t('Details'),
    },
    {
      component: () => <PlanYAML name={name} namespace={namespace} />,
      href: 'yaml',
      name: t('YAML'),
    },
    {
      component: () => <PlanVirtualMachines name={name} namespace={namespace} />,
      href: 'vms',
      name: t('Virtual Machines'),
    },
    {
      component: () => <PlanResources name={name} namespace={namespace} />,
      href: 'resources',
      name: t('Resources'),
    },
    {
      component: () => <PlanMappings name={name} namespace={namespace} />,
      href: 'mappings',
      name: t('Mappings'),
    },
    {
      component: () => <PlanHooks name={name} namespace={namespace} />,
      href: 'hooks',
      name: t('Hooks'),
    },
  ];

  return (
    <ModalHOC>
      <PlanPageHeadings name={name} namespace={namespace} />
      <HorizontalNav pages={pages} />
    </ModalHOC>
  );
};

export default PlanDetailsPage;
