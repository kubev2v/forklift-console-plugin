import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import SharedSourceNetworkField from 'src/components/mappings/network-mappings/SourceNetworkField';
import type { NetworkMappingId } from 'src/networkMaps/utils/getNetworkMapFieldId';
import type { MappingValue } from 'src/plans/create/types';

import type { PlanNetworkEditFormValues } from '../utils/types';

type SourceNetworkFieldProps = {
  fieldId: NetworkMappingId;
  usedSourceNetworks: MappingValue[];
  otherSourceNetworks: MappingValue[];
};

const SourceNetworkField: FC<SourceNetworkFieldProps> = ({
  fieldId,
  otherSourceNetworks,
  usedSourceNetworks,
}) => {
  const { control, trigger } = useFormContext<PlanNetworkEditFormValues>();

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
