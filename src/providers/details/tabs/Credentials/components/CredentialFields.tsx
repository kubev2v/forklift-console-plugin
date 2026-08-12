import type { FC } from 'react';
import type { SecretFieldsId } from 'src/providers/utils/constants';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';

import { getDecodedValue } from './utils/getDecodedValue';
import type { Fields } from './utils/types';
import CredentialContentField from './CredentialFieldContent';

type CredentialFieldsProps = {
  fields: Fields;
  reveal: boolean;
  secret: IoK8sApiCoreV1Secret;
};

const CredentialFields: FC<CredentialFieldsProps> = ({ fields, reveal, secret }) => (
  <>
    {Object.entries(fields).map(([key, field]) => {
      const value = getDecodedValue(secret?.data?.[key]);

      return (
        <DetailsItem
          content={
            <CredentialContentField
              fieldKey={key as SecretFieldsId}
              reveal={reveal}
              value={value}
            />
          }
          helpContent={field.helperTextPopover}
          key={key}
          showHelpIconNextToTitle={Boolean(field.helperTextPopover)}
          testId={`credential-${key}`}
          title={field.label}
        />
      );
    })}
  </>
);

export default CredentialFields;
