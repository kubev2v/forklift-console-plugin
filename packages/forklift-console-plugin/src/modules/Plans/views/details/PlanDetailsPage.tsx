import React, { memo } from 'react';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { PageHeadings, ProvidersPermissionStatus } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelGroupVersionKind, V1beta1Plan } from '@kubev2v/types';
import {
  HorizontalNav,
  K8sModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { PlanActionsDropdown } from '../../actions';

import { Suspend } from './components';
import { PlanDetails, PlanHooks, PlanMappings, PlanVirtualMachines, PlanYAML } from './tabs';

import './PlanDetailsPage.style.css';

export type PlanDetailsPageProps = {
  kind: string;
  kindObj: K8sModel;
  match: { path: string; url: string; isExact: boolean; params: unknown };
  name: string;
  namespace?: string;
};

export type PlanDetailsTabProps = {
  plan: V1beta1Plan;
  permissions: ProvidersPermissionStatus;
  loaded?: boolean;
  loadError?: unknown;
};

const PlanDetailsPage_: React.FC<{
  name: string;
  namespace: string;
  obj: V1beta1Plan;
  permissions: ProvidersPermissionStatus;
  loaded: boolean;
  loadError: unknown;
}> = ({ namespace, obj, permissions, loaded, loadError }) => {
  const { t } = useForkliftTranslation();

  const pages = [
    {
      href: '',
      name: t('Details'),
      component: () => (
        <PlanDetails plan={obj} loaded={loaded} loadError={loadError} permissions={permissions} />
      ),
    },
    {
      href: 'yaml',
      name: t('YAML'),
      component: () => (
        <PlanYAML plan={obj} loaded={loaded} loadError={loadError} permissions={permissions} />
      ),
    },
    {
      href: 'vms',
      name: t('Virtual Machines'),
      component: () => (
        <PlanVirtualMachines
          obj={{ plan: obj, permissions: permissions }}
          loaded={loaded}
          loadError={loadError}
        />
      ),
    },
    {
      href: 'mappings',
      name: t('Mappings'),
      component: () => (
        <PlanMappings plan={obj} loaded={loaded} loadError={loadError} permissions={permissions} />
      ),
    },
    {
      href: 'hooks',
      name: t('Hooks'),
      component: () => (
        <PlanHooks plan={obj} loaded={loaded} loadError={loadError} permissions={permissions} />
      ),
    },
  ];

  return (
    <>
      <PageHeadings
        model={PlanModel}
        obj={obj}
        namespace={namespace}
        actions={<PlanActionsDropdown data={{ obj, permissions }} fieldId={''} fields={[]} />}
      ></PageHeadings>
      <HorizontalNav pages={pages} />
    </>
  );
};
PlanDetailsPage_.displayName = 'PlanDetailsPage_';

const MemoPlanDetailsPage = memo(PlanDetailsPage_);

/**
 * A page component that displays detailed information about a migration plan.
 * It uses the Suspend component to handle loading states and displays different tabs
 * for viewing plan details, YAML, hooks, virtual machines, mappings, etc.
 *
 * @param {PlanDetailsPageProps} props - The properties passed to the component.
 * @param {string} props.kind - The kind of the resource.
 * @param {K8sModel} props.kindObj - The Kubernetes model object for the resource.
 * @param {Object} props.match - The match object from react-router.
 * @param {string} props.name - The name of the migration plan.
 * @param {string} [props.namespace] - The namespace of the migration plan.
 *
 * @returns {JSX.Element} The JSX element representing the plan details page.
 */
export const PlanDetailsPage: React.FC<PlanDetailsPageProps> = ({ name, namespace }) => {
  const [plan, loaded, error] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  return (
    <Suspend obj={plan} loaded={loaded} loadError={error}>
      <MemoPlanDetailsPage
        name={name}
        namespace={namespace}
        obj={plan}
        permissions={permissions}
        loaded={loaded}
        loadError={error}
      />
    </Suspend>
  );
};
PlanDetailsPage.displayName = 'PlanDetailsPage';

export default PlanDetailsPage;
