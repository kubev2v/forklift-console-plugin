import type { FC } from 'react';
import SharedSourceNetworkField from 'src/components/mappings/network-mappings/SourceNetworkField';

import type { MappingValue } from '@utils/types';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
type SourceNetworkFieldProps = {
  fieldId: string;
  usedSourceNetworks: MappingValue[];
  otherSourceNetworks: MappingValue[];
};

const SourceNetworkField: FC<SourceNetworkFieldProps> = ({
  fieldId,
  otherSourceNetworks,
  usedSourceNetworks,
}) => {
  const { control, trigger } = useCreatePlanFormContext();

  return (
    <SharedSourceNetworkField
      fieldId={fieldId}
      control={control}
      trigger={trigger}
      usedSourceNetworks={usedSourceNetworks}
      otherSourceNetworks={otherSourceNetworks}
    />
  );
};

export default SourceNetworkField;
