import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { storageMapFieldLabels } from 'src/storageMaps/utils/constants';

import MultiTypeaheadSelect from '@components/common/TypeaheadSelect/MultiTypeaheadSelect/MultiTypeaheadSelect';
import type { TypeaheadSelectOption } from '@components/common/TypeaheadSelect/utils/types';
import type { V1beta1Provider, VSphereHostInventory } from '@forklift-ui/types';
import { FormGroup, HelperText, HelperTextItem } from '@patternfly/react-core';
import useProviderInventory from '@utils/hooks/useProviderInventory';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId } from '@utils/storage/types';

type DedicatedMigrationHostsFieldProps = {
  fieldId: string;
  sourceProvider: V1beta1Provider | undefined;
};

const DedicatedMigrationHostsField: FC<DedicatedMigrationHostsFieldProps> = ({
  fieldId,
  sourceProvider,
}) => {
  const { t } = useForkliftTranslation();
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  const {
    error: inventoryError,
    inventory: inventoryHosts,
    loading: inventoryLoading,
  } = useProviderInventory<VSphereHostInventory[]>({
    disabled: !sourceProvider,
    provider: sourceProvider,
    subPath: 'hosts?detail=4',
  });

  const options: TypeaheadSelectOption[] = useMemo(
    () =>
      inventoryLoading
        ? []
        : (inventoryHosts ?? []).map((host: VSphereHostInventory) => ({
            content: host.name,
            value: host.id,
          })),
    [inventoryHosts, inventoryLoading],
  );

  const isInventoryUnavailable = inventoryLoading || Boolean(inventoryError) || !sourceProvider;

  return (
    <FormGroup
      fieldId={fieldId}
      label={storageMapFieldLabels[StorageMapFieldId.DedicatedMigrationHosts]}
    >
      <Controller
        name={fieldId}
        control={control}
        render={({ field }) => (
          <MultiTypeaheadSelect
            options={options}
            values={field.value ?? []}
            onChange={(values) => {
              field.onChange(values);
            }}
            isDisabled={isSubmitting || isInventoryUnavailable}
            placeholder={t('Select dedicated migration hosts')}
            testId={fieldId}
          />
        )}
      />
      <HelperText>
        {inventoryError ? (
          <HelperTextItem variant="error">
            {t('Unable to load hosts from the source provider.')}
          </HelperTextItem>
        ) : (
          <HelperTextItem variant="indeterminate">
            {t(
              "When no hosts are selected, each VM's registered ESXi host is used for the XCOPY operation.",
            )}
          </HelperTextItem>
        )}
      </HelperText>
    </FormGroup>
  );
};

export default DedicatedMigrationHostsField;
