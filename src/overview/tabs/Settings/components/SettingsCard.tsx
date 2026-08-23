import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import { useForkliftTranslation } from 'src/utils/i18n';

import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import type { V1beta1ForkliftController } from '@forklift-ui/types';
import { ForkliftControllerModel } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';

import type { EnhancedForkliftController, SettingsEditProps } from '../utils/types';

import SettingsDetailsList from './SettingsDetailsList';
import SettingsEdit from './SettingsEdit';

type SettingsCardProps = {
  obj: V1beta1ForkliftController;
};

const SettingsCard: FC<SettingsCardProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: ForkliftControllerModel,
  });

  const controller = obj as EnhancedForkliftController;

  return (
    <>
      <SectionHeadingWithEdit
        className="pf-v6-u-mb-md"
        data-testid="settings-edit-button"
        editable={canPatch}
        headingLevel="h3"
        onClick={() => {
          launchOverlay<SettingsEditProps>(SettingsEdit, { controller });
        }}
        title={t('Settings')}
      />
      <SettingsDetailsList controller={controller} />
    </>
  );
};

export default SettingsCard;
