import { type FC, useMemo } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { ModalHOC, useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  type CnoConfig,
  type OpenShiftNetworkAttachmentDefinition,
  ProviderModel,
} from '@kubev2v/types';
import { Button, ButtonVariant, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DEFAULT_NETWORK, EMPTY_MSG } from '@utils/constants';

import { useProvider } from '../../hooks/useProvider';
import type { ProviderDetailsPageProps } from '../../utils/types';

import DefaultNetworkLabel from './components/DefaultNetworkLabel';
import EditProviderDefaultTransferNetwork from './components/EditProviderDefaultTransferNetwork';

const ProviderNetworksTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { provider } = useProvider(name, namespace);

  const { showModal } = useModal();

  const {
    error,
    inventory: networks,
    loading,
  } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    provider,
    subPath: 'networkattachmentdefinitions?detail=4',
  });

  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });

  const defaultNetworkName = useMemo(
    () => provider?.metadata?.annotations?.['forklift.konveyor.io/defaultTransferNetwork'],
    [provider?.metadata?.annotations],
  );

  const networksDataList = useMemo(
    () =>
      !loading && !error && Array.isArray(networks)
        ? networks?.map((network) => {
            const config = network?.object?.spec?.config;
            return {
              config: JSON.parse(config?.length ? config : '{}') as CnoConfig,
              isDefault: `${network?.namespace}/${network?.name}` === defaultNetworkName,
              name: network?.name,
              namespace: network?.namespace,
            };
          })
        : [],
    [defaultNetworkName, error, loading, networks],
  );

  const onClick = () => {
    showModal(
      <EditProviderDefaultTransferNetwork
        resource={provider}
        defaultNetworkName={defaultNetworkName}
      />,
    );
  };

  return (
    <ModalHOC>
      <div>
        <PageSection variant={PageSectionVariants.light}>
          <SectionHeading text={t('NetworkAttachmentDefinitions')} />
          {permissions.canPatch && (
            <div>
              <Button key="editTransferNetwork" variant={ButtonVariant.secondary} onClick={onClick}>
                {t('Set provider default transfer network')}
              </Button>
            </div>
          )}
          <Table variant={TableVariant.compact}>
            <Thead>
              <Tr>
                <Th width={30}>{t('Name')}</Th>
                <Th width={30}>{t('Project')}</Th>
                <Th width={30}>{t('Type')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr key={DEFAULT_NETWORK}>
                <Td>
                  {DEFAULT_NETWORK} {!defaultNetworkName && <DefaultNetworkLabel />}
                </Td>
                <Td>{EMPTY_MSG}</Td>
                <Td modifier="truncate">{DEFAULT_NETWORK}</Td>
              </Tr>
              {networksDataList?.map((data) => (
                <Tr key={data.name}>
                  <Td>
                    {data.name} {data.isDefault && <DefaultNetworkLabel />}
                  </Td>
                  <Td modifier="truncate"> {data?.namespace || EMPTY_MSG}</Td>
                  <Td modifier="truncate">{data?.config?.type || EMPTY_MSG}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </PageSection>
      </div>
    </ModalHOC>
  );
};

export default ProviderNetworksTabPage;
