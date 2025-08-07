/* eslint-disable @typescript-eslint/max-params */
// Ignoring above eslint rule as onTimeChange signature from PF has 6 params
import { type FC, type FormEvent, useCallback, useEffect, useState } from 'react';
import { usePlanMigration } from 'src/plans/hooks/usePlanMigration';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan } from '@kubev2v/types';
import {
  ButtonVariant,
  DatePicker,
  InputGroup,
  Stack,
  StackItem,
  TimePicker,
  yyyyMMddFormat,
} from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';

import { formatDateTo12Hours, patchMigrationCutover } from './utils/utils';

import './PlanCutoverMigrationModal.scss';

type PlanCutoverMigrationModalProps = {
  plan: V1beta1Plan;
};

const PlanCutoverMigrationModal: FC<PlanCutoverMigrationModalProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const [cutoverDate, setCutoverDate] = useState<string>();
  const [time, setTime] = useState<string>();
  const [isDateValid, setIsDateValid] = useState<boolean>(true);
  const [isTimeValid, setIsTimeValid] = useState<boolean>(true);

  const [lastMigration] = usePlanMigration(plan);

  useEffect(() => {
    const migrationCutoverDate = lastMigration?.spec?.cutover ?? new Date().toISOString();

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
    timeValid?: boolean,
  ) => void = (_event, timeInput, hour, minute, _seconds, timeValid) => {
    setTime(timeInput);
    setIsTimeValid(Boolean(timeValid) && Boolean(timeInput));

    if (!timeValid) return;

    const updatedFromDate = cutoverDate ? new Date(cutoverDate) : new Date();

    updatedFromDate.setHours(hour!);
    updatedFromDate.setMinutes(minute!);

    setCutoverDate(updatedFromDate.toISOString());
  };

  const onCutover = useCallback(
    async () => patchMigrationCutover(lastMigration, cutoverDate),
    [cutoverDate, lastMigration],
  );

  const onDeleteCutover = useCallback(
    async () => patchMigrationCutover(lastMigration),
    [lastMigration],
  );

  return (
    <ModalForm
      title={lastMigration?.spec?.cutover ? t('Edit cutover') : t('Schedule cutover')}
      onConfirm={onCutover}
      confirmLabel={t('Set cutover')}
      additionalAction={{
        children: t('Remove cutover'),
        onClick: onDeleteCutover,
        variant: ButtonVariant.secondary,
      }}
      isDisabled={!isTimeValid || !isDateValid}
    >
      <ForkliftTrans>
        <Stack hasGutter>
          <StackItem>
            Schedule the cutover for migration{' '}
            <strong className="co-break-word">{getName(plan)}</strong>?
          </StackItem>
          <StackItem>
            You can schedule cutover for now or a future date and time. VMs included in the
            migration plan will be shut down when cutover starts.
          </StackItem>
        </Stack>
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
          onChange={onTimeChange}
          menuAppendTo={document.body}
          time={time}
        />
      </InputGroup>
    </ModalForm>
  );
};

export default PlanCutoverMigrationModal;
