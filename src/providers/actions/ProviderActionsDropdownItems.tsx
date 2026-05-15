import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import InspectVirtualMachinesModal, {
  type InspectVirtualMachinesModalProps,
} from 'src/components/InspectVirtualMachines/InspectVirtualMachinesModal';
import { DeleteModal, type DeleteModalProps } from 'src/components/modals/DeleteModal/DeleteModal';
import { useCanInspectProvider } from 'src/providers/details/hooks/useCanInspectProvider';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';

import { PROVIDER_TYPES } from '../utils/constants';
import { getProviderDetailsPageUrl } from '../utils/getProviderDetailsPageUrl';

type ProviderActionsDropdownItemsProps = {
  data: ProviderData;
};

const ProviderActionsDropdownItems: FC<ProviderActionsDropdownItemsProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const navigate = useNavigate();

  const { provider } = data;
  const { canInspect, disabledReason, isVsphere } = useCanInspectProvider(provider);

  if (!provider || !getName(provider) || !getNamespace(provider)) return null;

  const providerURL = getProviderDetailsPageUrl(provider);

  const onProviderDelete = () => {
    launcher<DeleteModalProps>(DeleteModal, { model: ProviderModel, resource: provider });
  };

  const onInspectVms = (): void => {
    launcher<InspectVirtualMachinesModalProps>(InspectVirtualMachinesModal, { provider });
  };

  return (
    <DropdownList>
      <DropdownItem
        value={0}
        key="EditProvider"
        onClick={() => {
          navigate(providerURL);
        }}
      >
        {t('Edit provider')}
      </DropdownItem>
      {provider?.spec?.type !== PROVIDER_TYPES.ova && (
        <DropdownItem
          value={1}
          key="EditCredentials"
          href={`${providerURL}/credentials`}
          onClick={() => {
            navigate(`${providerURL}/credentials`);
          }}
        >
          {t('Edit provider credentials')}
        </DropdownItem>
      )}
      {isVsphere && (
        <DropdownItem
          value={2}
          key="inspectVms"
          isDisabled={!canInspect}
          isAriaDisabled={!canInspect}
          description={disabledReason}
          onClick={onInspectVms}
          data-testid="provider-actions-inspect-menuitem"
        >
          {t('Inspect VMs')}
        </DropdownItem>
      )}
      <DropdownItem
        value={3}
        key="delete"
        isDisabled={!data?.permissions?.canDelete}
        onClick={onProviderDelete}
      >
        {t('Delete provider')}
      </DropdownItem>
    </DropdownList>
  );
};

export default ProviderActionsDropdownItems;
