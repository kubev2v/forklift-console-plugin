import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import ExcludeDisksSelectTable from '../../ExcludeDisks/ExcludeDisksSelectTable';
import type { ExcludeDiskRowData } from '../../ExcludeDisks/types';
import type { EditVmWizardFormValues } from '../types';

type EditVmExcludeDisksFieldProps = {
  diskLoadError: Error | null;
  isInventoryLoading: boolean;
  rows: ExcludeDiskRowData[];
};

const EditVmExcludeDisksField: FC<EditVmExcludeDisksFieldProps> = ({
  diskLoadError,
  isInventoryLoading,
  rows,
}) => {
  const { control } = useFormContext<EditVmWizardFormValues>();

  return (
    <Controller
      control={control}
      name="excludeDisks"
      render={({ field: { onChange, value } }) => (
        <ExcludeDisksSelectTable
          isLoading={isInventoryLoading}
          loadError={diskLoadError}
          onSelect={onChange}
          resizableColumns={false}
          rows={rows}
          selectedIds={value}
        />
      )}
    />
  );
};

export default EditVmExcludeDisksField;
