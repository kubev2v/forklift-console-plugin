import React, { memo } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HorizontalNav, type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import { PlanPageHeadings } from './components';
import {
  PlanDetails,
  PlanHooks,
  PlanMappings,
  PlanResources,
  PlanVirtualMachines,
  PlanYAML,
} from './tabs';

import './PlanDetailsPage.style.css';

export type PlanDetailsPageProps = {
  kind: string;
  kindObj: K8sModel;
  match: { path: string; url: string; isExact: boolean; params: unknown };
  name: string;
  namespace?: string;
};

const PlanDetailsPage_: React.FC<{ name: string; namespace: string }> = ({ name, namespace }) => {
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

export const PlanDetailsPage = memo(PlanDetailsPage_);

export default PlanDetailsPage;
