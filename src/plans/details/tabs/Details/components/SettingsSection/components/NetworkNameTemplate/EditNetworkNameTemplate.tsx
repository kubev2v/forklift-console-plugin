import type { FC } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

import type { EnhancedPlan } from '../../utils/types';
import NameTemplateBody from '../EditNameTemplate/components/NameTemplateBody';
import NameTemplateHelper from '../EditNameTemplate/components/NameTemplateHelper';
import EditNameTemplate from '../EditNameTemplate/EditNameTemplate';

import {
  networkNameTemplateAllowedVariables,
  networkNameTemplateHelperExamples,
} from './utils/constants';

type EditNetworkNameTemplateProps = {
  resource: V1beta1Plan;
  onConfirmNetworkNameTemplate: (options: {
    resource: V1beta1Plan;
    newValue: string | undefined;
  }) => Promise<V1beta1Plan>;
};

const EditNetworkNameTemplate: FC<EditNetworkNameTemplateProps> = ({
  onConfirmNetworkNameTemplate,
  resource,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <EditNameTemplate
      title={t('Edit network name template')}
      value={(resource as EnhancedPlan)?.spec?.networkNameTemplate}
      onConfirm={async (newValue) => onConfirmNetworkNameTemplate({ newValue, resource })}
      body={
        <NameTemplateBody
          bodyText={t(
            'Network name template is a template for generating network interface names in the target virtual machine.',
          )}
          allowedVariables={networkNameTemplateAllowedVariables}
        />
      }
      helperText={<NameTemplateHelper examples={networkNameTemplateHelperExamples} />}
    />
  );
};

export default EditNetworkNameTemplate;
