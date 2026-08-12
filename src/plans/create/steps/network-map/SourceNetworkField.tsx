import type { FC } from 'react';
import SharedSourceNetworkField from 'src/components/mappings/network-mappings/SourceNetworkField';

import type { MappingValue } from '@utils/types';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
type SourceNetworkFieldProps = {
  fieldId: string;
  otherSourceNetworks: MappingValue[];
  usedSourceNetworks: MappingValue[];
};

const SourceNetworkField: FC<SourceNetworkFieldProps> = ({
  fieldId,
  otherSourceNetworks,
  usedSourceNetworks,
}) => {
  const { control, trigger } = useCreatePlanFormContext();

  return (
    <SharedSourceNetworkField
      control={control}
      fieldId={fieldId}
      otherSourceNetworks={otherSourceNetworks}
      trigger={trigger}
      usedSourceNetworks={usedSourceNetworks}
    />
  );
};

export default SourceNetworkField;
