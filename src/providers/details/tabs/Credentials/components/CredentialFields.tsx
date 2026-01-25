import type { FC } from 'react';
import type { SecretFieldsId } from 'src/providers/utils/constants';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';

import { getDecodedValue } from './utils/getDecodedValue';
import type { Fields } from './utils/types';
import CredentialContentField from './CredentialFieldContent';

type CredentialFieldsProps = {
  fields: Fields;
  secret: IoK8sApiCoreV1Secret;
  reveal: boolean;
};

const CredentialFields: FC<CredentialFieldsProps> = ({ fields, reveal, secret }) => (
  <>
    {Object.entries(fields).map(([key, field]) => {
      const value = getDecodedValue(secret?.data?.[key]);

      return (
        <DetailsItem
          key={key}
          testId={`credential-${key}`}
          title={field.label}
          helpContent={field.helperTextPopover}
          showHelpIconNextToTitle={Boolean(field.helperTextPopover)}
          content={
            <CredentialContentField
              value={value}
              fieldKey={key as SecretFieldsId}
              reveal={reveal}
            />
          }
        />
      );
    })}
  </>
);

export default CredentialFields;
