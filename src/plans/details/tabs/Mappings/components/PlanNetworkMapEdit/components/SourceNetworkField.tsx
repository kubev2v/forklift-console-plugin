import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import SharedSourceNetworkField from 'src/components/mappings/network-mappings/SourceNetworkField';
import type { NetworkMappingId } from 'src/networkMaps/utils/getNetworkMapFieldId';

import type { MappingValue } from '@utils/types';

import type { PlanNetworkEditFormValues } from '../utils/types';

type SourceNetworkFieldProps = {
  fieldId: NetworkMappingId;
  otherSourceNetworks: MappingValue[];
  usedSourceNetworks: MappingValue[];
};

const SourceNetworkField: FC<SourceNetworkFieldProps> = ({
  fieldId,
  otherSourceNetworks,
  usedSourceNetworks,
}) => {
  const { control, trigger } = useFormContext<PlanNetworkEditFormValues>();

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
