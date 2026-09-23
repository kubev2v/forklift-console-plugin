import { useMemo, useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import {
  Form,
  ModalVariant,
  type SelectOptionProps,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  getCopyApplianceResourcePool,
  getToeholdDatastore,
  getToeholdFolder,
  getToeholdNetwork,
} from '@utils/crds/common/selectors';
import { useSourceNetworks } from '@utils/hooks/useNetworks';
import useProviderInventory from '@utils/hooks/useProviderInventory';
import { useSourceStorages } from '@utils/hooks/useStorages';

import onUpdateToeholdSetting, { type ToeholdSettingField } from './onUpdateToeholdPlacement';

export type EditToeholdPlacementProps = {
  field: ToeholdSettingField;
  provider: V1beta1Provider;
};

type PathItem = { path?: string };

const toOptions = (values: string[]): SelectOptionProps[] =>
  [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      children: <>{value}</>,
      itemId: value,
    }));

const getters: Record<ToeholdSettingField, (provider: V1beta1Provider) => string | undefined> = {
  datastore: getToeholdDatastore,
  folder: getToeholdFolder,
  network: getToeholdNetwork,
  resourcePool: getCopyApplianceResourcePool,
};

const EditToeholdPlacement: OverlayComponent<EditToeholdPlacementProps> = ({
  closeOverlay,
  field,
  provider,
}) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState(getters[field](provider) ?? '');

  const [storages, storagesLoading] = useSourceStorages(provider);
  const [networks, networksLoading] = useSourceNetworks(provider);
  const { inventory: folders, loading: foldersLoading } = useProviderInventory<PathItem[]>({
    provider,
    subPath: 'folders?detail=1',
  });
  const { inventory: resourcePools, loading: poolsLoading } = useProviderInventory<PathItem[]>({
    provider,
    subPath: 'resourcepools?detail=1',
  });

  const options = useMemo(() => {
    switch (field) {
      case 'datastore':
        return toOptions(storages.map((storage) => storage.name));
      case 'folder':
        return toOptions((Array.isArray(folders) ? folders : []).map((item) => item.path ?? ''));
      case 'network':
        return toOptions(networks.map((item) => item.name));
      case 'resourcePool': {
        const paths = (Array.isArray(resourcePools) ? resourcePools : []).map(
          (item) => item.path ?? '',
        );
        if (value) {
          paths.push(value);
        }
        return toOptions(paths);
      }
      default:
        return [];
    }
  }, [field, folders, networks, resourcePools, storages, value]);

  const loading =
    (field === 'datastore' && storagesLoading) ||
    (field === 'folder' && foldersLoading) ||
    (field === 'network' && networksLoading) ||
    (field === 'resourcePool' && poolsLoading);

  const labels: Record<
    ToeholdSettingField,
    { help: string; label: string; placeholder: string; title: string }
  > = {
    datastore: {
      help: t('Datastore used to store the toehold template disk.'),
      label: t('Datastore'),
      placeholder: t('Select a datastore'),
      title: t('Edit datastore'),
    },
    folder: {
      help: t('Inventory folder path for the toehold template VM.'),
      label: t('Folder'),
      placeholder: t('Select a folder'),
      title: t('Edit folder'),
    },
    network: {
      help: t('Network attached to the toehold template VM.'),
      label: t('Network'),
      placeholder: t('Select a network'),
      title: t('Edit network'),
    },
    resourcePool: {
      help: t('Resource pool for copy appliance clones.'),
      label: t('Resource pool'),
      placeholder: t('Select a resource pool'),
      title: t('Edit resource pool'),
    },
  };

  const { help, label, placeholder, title } = labels[field];

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      onConfirm={async () => {
        await onUpdateToeholdSetting(provider, field, value);
      }}
      title={title}
      variant={ModalVariant.small}
    >
      <Stack hasGutter>
        <StackItem>
          <Form>
            <FormGroupWithHelpText fieldId={`toehold-${field}`} helperText={help} label={label}>
              <FilterableSelect
                isDisabled={loading}
                isScrollable
                onSelect={(selected) => {
                  setValue(selected.toString());
                }}
                placeholder={placeholder}
                selectOptions={options}
                value={value}
              />
            </FormGroupWithHelpText>
          </Form>
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default EditToeholdPlacement;
