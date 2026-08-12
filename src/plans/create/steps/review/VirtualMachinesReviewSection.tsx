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
  ModalBody,
  ModalFooter,
  ModalHeader,
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
      onEditClick={() => {
        goToStepById(PlanWizardStepId.VirtualMachines);
      }}
      testId="review-virtual-machines-section"
      title={planStepNames[PlanWizardStepId.VirtualMachines]}
    >
      <DescriptionList horizontalTermWidthModifier={{ default: '18ch' }} isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Selected VMs')}</DescriptionListTerm>

          <DescriptionListDescription data-testid="review-vm-count">
            <Button
              isInline
              onClick={() => {
                setIsModalOpen(true);
              }}
              variant={ButtonVariant.link}
            >
              {t('{{count}} virtual machine selected', { count: vmCount })}
            </Button>
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      {isModalOpen && (
        <Modal
          isOpen
          onClose={() => {
            setIsModalOpen(false);
          }}
          variant={ModalVariant.large}
        >
          <ModalHeader title={t('Selected VMs')} />
          <ModalBody>
            <VirtualMachinesTable showSelectedOnly value={vms} />
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                setIsModalOpen(!isModalOpen);
              }}
            >
              {t('Close')}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ExpandableReviewSection>
  );
};

export default VirtualMachinesReviewSection;
