import type { FC } from 'react';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';

import type { V1beta1Plan } from '@kubev2v/types';
import { Button, ButtonVariant, HelperText, HelperTextItem } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import { canDeleteAndPatchPlanMaps, hasSomeCompleteRunningVMs } from './utils/utils';

import './PlanMappingEditButton.scss';

type PlanMappingEditButtonProps = {
  plan: V1beta1Plan;
  onEdit: () => void;
};

const PlanMappingEditButton: FC<PlanMappingEditButtonProps> = ({ onEdit, plan }) => {
  const { t } = useForkliftTranslation();

  if (!canDeleteAndPatchPlanMaps({ name: getName(plan), namespace: getNamespace(plan) })) {
    return null;
  }

  const disableEditMappings = hasSomeCompleteRunningVMs(plan) || !isPlanEditable(plan);
  return (
    <>
      <Button
        variant={ButtonVariant.secondary}
        icon={<PencilAltIcon />}
        onClick={onEdit}
        isDisabled={disableEditMappings}
        className="forklift-plan-mapping-edit-button"
        data-testid="edit-mappings-button"
      >
        {t('Edit mappings')}
      </Button>
      {disableEditMappings && (
        <HelperText className="forklift-plan-mapping-edit-button__helper-text">
          <HelperTextItem>
            {t(
              'The edit mappings button is disabled if the plan started running and at least one virtual machine was migrated successfully or when the plan status does not enable editing.',
            )}
          </HelperTextItem>
        </HelperText>
      )}
    </>
  );
};

export default PlanMappingEditButton;
