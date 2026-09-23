import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { k8sPatch, type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { ToeholdTemplateModel } from '@utils/crds/common/models';
import { getAnnotations } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';

export type ConfirmToeholdRebuildProps = {
  toehold: K8sResourceCommon;
};

const ConfirmToeholdRebuild: OverlayComponent<ConfirmToeholdRebuildProps> = ({
  closeOverlay,
  toehold,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Rebuild')}
      onConfirm={async () => {
        const annotations = getAnnotations(toehold);
        return k8sPatch({
          data: [
            {
              op: annotations ? REPLACE : ADD,
              path: '/metadata/annotations',
              value: {
                ...(annotations ?? {}),
                'forklift.konveyor.io/rebuild-requested-at': new Date().toISOString(),
              },
            },
          ],
          model: ToeholdTemplateModel,
          resource: toehold,
        });
      }}
      title={t('Rebuild toehold template')}
    >
      {t('Destroy the existing vCenter template and rebuild it.')}
    </ModalForm>
  );
};

export default ConfirmToeholdRebuild;
