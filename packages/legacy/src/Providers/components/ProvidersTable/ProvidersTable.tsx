import * as React from 'react';
import { ProviderType } from 'legacy/src/common/constants';
import { SourceProvidersTable } from './Source/SourceProvidersTable';
import { OpenShiftProvidersTable } from './OpenShift/OpenShiftProvidersTable';
import {
  IProviderObject,
  IProvidersByType,
  SourceInventoryProvider,
} from 'legacy/src/queries/types';
import { correlateProviders } from './helpers';

interface IProvidersTableProps {
  inventoryProvidersByType: IProvidersByType;
  clusterProviders: IProviderObject[];
  activeProviderType: ProviderType;
}

/**
 * @deprecated
 */
export const ProvidersTable: React.FunctionComponent<IProvidersTableProps> = ({
  inventoryProvidersByType,
  clusterProviders,
  activeProviderType,
}) => {
  if (activeProviderType === 'vsphere' || activeProviderType === 'ovirt') {
    return (
      <SourceProvidersTable
        providers={correlateProviders<SourceInventoryProvider>(
          clusterProviders,
          inventoryProvidersByType[activeProviderType] || [],
          activeProviderType
        )}
        providerType={activeProviderType}
      />
    );
  }
  if (activeProviderType === 'openshift') {
    return (
      <OpenShiftProvidersTable
        providers={correlateProviders(
          clusterProviders,
          inventoryProvidersByType.openshift || [],
          activeProviderType
        )}
      />
    );
  }
  return null;
};
