import { type FC, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import TechPreviewLabel from '@components/PreviewLabels/TechPreviewLabel';
import { Flex, FlexItem, FormGroup, Stack } from '@patternfly/react-core';
import { getPlanIsLive } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../../SettingsSection/utils/types';

import { onConfirmLive } from './utils/utils';
import LiveSwitch from './LiveSwitch';

const EditPlanLive: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<boolean>(Boolean(getPlanIsLive(resource)));

  return (
    <ModalForm
      title={
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>{t('Set live migration')}</FlexItem>
          <FlexItem className="pf-v5-u-mb-sm">
            <TechPreviewLabel />
          </FlexItem>
        </Flex>
      }
      onConfirm={async () => onConfirmLive({ newValue: value, resource })}
    >
      <Stack hasGutter>
        {t(
          `In live migration, the source virtual machine continues to run until the migration is complete.`,
        )}
        <FormGroup label={t('Whether this is a live migration')} />
        <LiveSwitch value={value} onChange={setValue} />
      </Stack>
    </ModalForm>
  );
};

export default EditPlanLive;
