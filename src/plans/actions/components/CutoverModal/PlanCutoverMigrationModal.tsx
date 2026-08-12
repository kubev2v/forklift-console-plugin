// Ignoring above eslint rule as onTimeChange signature from PF has 6 params
import { type FormEvent, useCallback, useMemo, useState } from 'react';
import { usePlanMigration } from 'src/plans/hooks/usePlanMigration';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ButtonVariant, Flex, FlexItem, Radio, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getName } from '@utils/crds/common/selectors';

import type { PlanModalProps } from '../types';

import {
  CUTOVER_MODE_ASAP,
  CUTOVER_MODE_SCHEDULED,
  useCutoverFormState,
} from './hooks/useCutoverFormState';
import { patchMigrationCutover } from './utils/utils';
import ScheduledCutoverFields from './ScheduledCutoverFields';

import './PlanCutoverMigrationModal.scss';

const PlanCutoverMigrationModal: ModalComponent<PlanModalProps> = ({ plan, ...rest }) => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const [isDateValid, setIsDateValid] = useState<boolean>(true);
  const [isTimeValid, setIsTimeValid] = useState<boolean>(true);

  const [activeMigration] = usePlanMigration(plan);

  const existingCutoverValue = activeMigration?.spec?.cutover;
  const hasExistingCutover = Boolean(existingCutoverValue);
  const { cutoverDate, cutoverMode, setCutoverDate, setCutoverMode, setTime, time } =
    useCutoverFormState(existingCutoverValue);

  const onDateChange: (event: FormEvent<HTMLInputElement>, value: string, date?: Date) => void = (
    _event,
    value,
    date,
  ) => {
    setIsDateValid(Boolean(date));
    if (!date) {
      return;
    }

    const updatedFromDate = cutoverDate ? new Date(cutoverDate) : new Date();

    const [year, month, day] = value.split('-').map((num: string) => parseInt(num, 10));

    updatedFromDate.setFullYear(year);
    updatedFromDate.setMonth(month - 1);
    updatedFromDate.setDate(day);

    setCutoverDate(updatedFromDate.toISOString());
  };

  // eslint-disable-next-line @typescript-eslint/max-params
  const onTimeChange: (
    event: FormEvent<HTMLInputElement>,
    timeInput: string,
    hour?: number,
    minute?: number,
    seconds?: number,
    timeValid?: boolean,
    // eslint-disable-next-line @typescript-eslint/max-params
  ) => void = (_event, timeInput, hour, minute, _seconds, timeValid) => {
    setTime(timeInput);
    setIsTimeValid(Boolean(timeValid) && Boolean(timeInput));

    if (!timeValid) {
      return;
    }

    const updatedFromDate = cutoverDate ? new Date(cutoverDate) : new Date();

    updatedFromDate.setHours(hour ?? 0);
    updatedFromDate.setMinutes(minute ?? 0);

    setCutoverDate(updatedFromDate.toISOString());
  };

  const onCutover = useCallback(async () => {
    if (activeMigration) {
      const dateToSet = cutoverMode === CUTOVER_MODE_ASAP ? new Date().toISOString() : cutoverDate;
      await patchMigrationCutover(activeMigration, dateToSet, trackEvent);
    }
  }, [cutoverMode, cutoverDate, activeMigration, trackEvent]);

  const onDeleteCutover = useCallback(async () => {
    if (activeMigration) {
      await patchMigrationCutover(activeMigration, undefined, trackEvent);
    }
  }, [activeMigration, trackEvent]);

  const isScheduledInvalid =
    cutoverMode === CUTOVER_MODE_SCHEDULED && (!isTimeValid || !isDateValid);

  const isScheduledInPast =
    cutoverMode === CUTOVER_MODE_SCHEDULED &&
    isDateValid &&
    isTimeValid &&
    cutoverDate !== undefined &&
    new Date(cutoverDate) < new Date();

  const additionalAction = useMemo(
    () =>
      cutoverMode === CUTOVER_MODE_SCHEDULED && hasExistingCutover
        ? {
            children: t('Remove cutover'),
            onClick: onDeleteCutover,
            variant: ButtonVariant.secondary,
          }
        : undefined,
    [cutoverMode, hasExistingCutover, onDeleteCutover, t],
  );

  return (
    <ModalForm
      additionalAction={additionalAction}
      confirmLabel={t('Set cutover')}
      isDisabled={isScheduledInvalid}
      onConfirm={onCutover}
      title={hasExistingCutover ? t('Edit cutover') : t('Schedule cutover')}
      {...rest}
    >
      <ForkliftTrans>
        <Stack hasGutter>
          <StackItem>
            Schedule the cutover for migration{' '}
            <strong className="co-break-word">{getName(plan)}</strong>?
          </StackItem>
          <StackItem>
            VMs included in the migration plan will be shut down when cutover starts.
          </StackItem>
        </Stack>
      </ForkliftTrans>
      <Flex
        className="forklift-plan-cutover-migration-inputgroup"
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsMd' }}
      >
        <FlexItem>
          <Radio
            data-testid="cutover-mode-asap"
            description={t('Migration will begin final cutover immediately.')}
            id="cutover-mode-asap"
            isChecked={cutoverMode === CUTOVER_MODE_ASAP}
            label={t('Cutover as soon as possible')}
            name="cutoverMode"
            onChange={() => {
              setCutoverMode(CUTOVER_MODE_ASAP);
            }}
          />
        </FlexItem>
        <FlexItem>
          <Radio
            data-testid="cutover-mode-scheduled"
            description={t('Schedule cutover for a future date and time.')}
            id="cutover-mode-scheduled"
            isChecked={cutoverMode === CUTOVER_MODE_SCHEDULED}
            label={t('Cutover at a specific time')}
            name="cutoverMode"
            onChange={() => {
              setCutoverMode(CUTOVER_MODE_SCHEDULED);
            }}
          />
        </FlexItem>
        {cutoverMode === CUTOVER_MODE_SCHEDULED && (
          <ScheduledCutoverFields
            cutoverDate={cutoverDate}
            isScheduledInPast={isScheduledInPast}
            onDateChange={onDateChange}
            onTimeChange={onTimeChange}
            time={time}
          />
        )}
      </Flex>
    </ModalForm>
  );
};

export default PlanCutoverMigrationModal;
