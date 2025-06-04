import { type FC, useState } from 'react';
import { useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  Button,
  ButtonVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Modal,
  ModalVariant,
  useWizardContext,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { VmFormFieldId } from '../virtual-machines/constants';
import VirtualMachinesTable from '../virtual-machines/VirtualMachinesTable';

const VirtualMachinesReviewSection: FC = () => {
  const { t } = useForkliftTranslation();
  const { goToStepById } = useWizardContext();
  const { control } = useCreatePlanFormContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const vms = useWatch({
    control,
    name: VmFormFieldId.Vms,
  });
  const vmCount = Object.values(vms).length;

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.VirtualMachines]}
      onEditClick={() => {
        goToStepById(PlanWizardStepId.VirtualMachines);
      }}
    >
      <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Selected VMs')}</DescriptionListTerm>

          <DescriptionListDescription>
            <Button
              isInline
              variant={ButtonVariant.link}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              {t('{{count}} virtual machine selected', { count: vmCount })}
            </Button>
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      {isModalOpen && (
        <Modal
          isOpen
          variant={ModalVariant.large}
          title={t('Selected VMs')}
          onClose={() => {
            setIsModalOpen(false);
          }}
          actions={[
            <Button
              onClick={() => {
                setIsModalOpen(!isModalOpen);
              }}
            >
              {t('Close')}
            </Button>,
          ]}
        >
          <VirtualMachinesTable value={vms} showSelectedOnly />
        </Modal>
      )}
    </ExpandableReviewSection>
  );
};

export default VirtualMachinesReviewSection;
