import { type FC, type FormEvent, type ReactNode, useCallback, useEffect, useState } from 'react';
import useToggle from 'src/modules/Providers/hooks/useToggle';
import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { MigrationModel, type V1beta1Migration, type V1beta1Plan } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DatePicker,
  InputGroup,
  Modal,
  ModalVariant,
  TimePicker,
  yyyyMMddFormat,
} from '@patternfly/react-core';

import { usePlanMigration } from '../hooks/usePlanMigration';
import { formatDateTo12Hours } from '../utils/helpers/AMPMFormatter';

import './PlanCutoverMigrationModal.style.css';

/**
 * Props for the DeleteModal component
 * @typedef PlanStartMigrationModalProps
 * @property {string} title - The title to display in the modal
 * @property {V1beta1Plan} resource - The resource object to delete
 * @property {K8sModel} model - The model used for deletion
 * @property {string} [redirectTo] - Optional redirect URL after deletion
 */
type PlanCutoverMigrationModalProps = {
  resource: V1beta1Plan;
  title?: string;
};

/**
 * A generic delete modal component
 * @component
 * @param {DeleteModalProps} props - Props for DeleteModal
 * @returns {Element} The DeleteModal component
 */
export const PlanCutoverMigrationModal: FC<PlanCutoverMigrationModalProps> = ({
  resource,
  title,
}) => {
  const { t } = useForkliftTranslation();
  const { toggleModal } = useModal();
  const [isLoading, toggleIsLoading] = useToggle();
  const [cutoverDate, setCutoverDate] = useState<string>();
  const [time, setTime] = useState<string>();
  const [isDateValid, setIsDateValid] = useState<boolean>(true);
  const [isTimeValid, setIsTimeValid] = useState<boolean>(true);
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);

  const title_ = title || t('Cutover');
  const { name } = resource?.metadata || {};

  const [lastMigration] = usePlanMigration(resource);

  useEffect(() => {
    const migrationCutoverDate = lastMigration?.spec?.cutover || new Date().toISOString();

    setCutoverDate(migrationCutoverDate);
    setTime(formatDateTo12Hours(new Date(migrationCutoverDate)));
  }, [lastMigration]);

  const onDateChange: (event: FormEvent<HTMLInputElement>, value: string, date?: Date) => void = (
    _event,
    value,
    date,
  ) => {
    setIsDateValid(Boolean(date));
    if (!date) return;

    const updatedFromDate = cutoverDate ? new Date(cutoverDate) : new Date();

    const [year, month, day] = value.split('-').map((num: string) => parseInt(num, 10));

    updatedFromDate.setFullYear(year);
    updatedFromDate.setMonth(month - 1);
    updatedFromDate.setDate(day);

    setCutoverDate(updatedFromDate.toISOString());
  };

  const onTimeChange: (
    event: FormEvent<HTMLInputElement>,
    timeInput: string,
    hour?: number,
    minute?: number,
    seconds?: number,
    isTimeValid?: boolean,
  ) => void = (_event, timeInput, hour, minute, _seconds, isTimeValid) => {
    setTime(timeInput);
    setIsTimeValid(isTimeValid && Boolean(timeInput));

    if (!isTimeValid) return;

    const updatedFromDate = cutoverDate ? new Date(cutoverDate) : new Date();

    updatedFromDate.setHours(hour);
    updatedFromDate.setMinutes(minute);

    setCutoverDate(updatedFromDate.toISOString());
  };

  const onCutover = useCallback(async () => {
    toggleIsLoading();

    try {
      await patchMigrationCutover(lastMigration, cutoverDate);

      toggleModal();
    } catch (err) {
      toggleIsLoading();

      setAlertMessage(<AlertMessageForModals title={t('Error')} message={err.toString()} />);
    }
  }, [cutoverDate, lastMigration]);

  const onDeleteCutover = useCallback(async () => {
    toggleIsLoading();

    try {
      await patchMigrationCutover(lastMigration, undefined);

      toggleModal();
    } catch (err) {
      toggleIsLoading();

      setAlertMessage(<AlertMessageForModals title={t('Error')} message={err.toString()} />);
    }
  }, [lastMigration]);

  const actions = [
    <Button
      key="confirm"
      onClick={onCutover}
      isLoading={isLoading}
      isDisabled={!isDateValid || !isTimeValid}
    >
      {t('Set cutover')}
    </Button>,
    <Button key="delete" variant="secondary" onClick={onDeleteCutover} isLoading={isLoading}>
      {t('Remove cutover')}
    </Button>,
    <Button key="cancel" variant="secondary" onClick={toggleModal}>
      {t('Cancel')}
    </Button>,
  ];

  return (
    <Modal
      title={title_}
      position="top"
      showClose={false}
      variant={ModalVariant.small}
      isOpen={true}
      onClose={toggleModal}
      actions={actions}
    >
      <>
        <ForkliftTrans>
          <p>
            Schedule the cutover for migration <strong className="co-break-word">{name}</strong>?
          </p>
          <br />
          <p>
            You can schedule cutover for now or a future date and time. VMs included in the
            migration plan will be shut down when cutover starts.
          </p>
        </ForkliftTrans>

        <InputGroup className="forklift-plan-cutover-migration-inputgroup">
          <DatePicker
            onChange={onDateChange}
            aria-label="Cutover date"
            placeholder="YYYY-MM-DD"
            appendTo={document.body}
            value={yyyyMMddFormat(cutoverDate ? new Date(cutoverDate) : new Date())}
          />
          <TimePicker
            aria-label="Cutover time"
            style={{ width: '150px' }}
            onChange={onTimeChange}
            menuAppendTo={document.body}
            time={time}
          />
        </InputGroup>
      </>
      {alertMessage}
    </Modal>
  );
};

const patchMigrationCutover = async (migration: V1beta1Migration, cutover: string) => {
  const op = migration?.spec?.cutover ? 'replace' : 'add';

  await k8sPatch({
    data: [
      {
        op,
        path: '/spec/cutover',
        value: cutover,
      },
    ],
    model: MigrationModel,
    resource: migration,
  });
};
