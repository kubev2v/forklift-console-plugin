import { useCallback, useMemo, useState } from 'react';
import { usePlanMigration } from 'src/plans/hooks/usePlanMigration';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { ButtonVariant, Flex, FlexItem, Radio, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getName } from '@utils/crds/common/selectors';

import type { PlanModalProps } from '../types';

import { useCutoverDateTimeHandlers } from './hooks/useCutoverDateTimeHandlers';
import {
  CUTOVER_MODE_ASAP,
  CUTOVER_MODE_SCHEDULED,
  useCutoverFormState,
} from './hooks/useCutoverFormState';
import { patchMigrationCutover } from './utils/utils';
import ScheduledCutoverFields from './ScheduledCutoverFields';

import './PlanCutoverMigrationModal.scss';

const PlanCutoverMigrationModal: OverlayComponent<PlanModalProps> = ({ closeOverlay, plan }) => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const [isDateValid, setIsDateValid] = useState<boolean>(true);
  const [isTimeValid, setIsTimeValid] = useState<boolean>(true);

  const [activeMigration] = usePlanMigration(plan);

  const existingCutoverValue = activeMigration?.spec?.cutover;
  const hasExistingCutover = Boolean(existingCutoverValue);
  const { cutoverDate, cutoverMode, setCutoverDate, setCutoverMode, setTime, time } =
    useCutoverFormState(existingCutoverValue);

  const { getCutoverDateToSet, isScheduledInPast, isScheduledInvalid, onDateChange, onTimeChange } =
    useCutoverDateTimeHandlers({
      cutoverDate,
      cutoverMode,
      setCutoverDate,
      setIsDateValid,
      setIsTimeValid,
      setTime,
    });

  const onCutover = useCallback(async () => {
    if (activeMigration) {
      await patchMigrationCutover(activeMigration, getCutoverDateToSet(), trackEvent);
    }
  }, [activeMigration, getCutoverDateToSet, trackEvent]);

  const onDeleteCutover = useCallback(async () => {
    if (activeMigration) {
      await patchMigrationCutover(activeMigration, undefined, trackEvent);
    }
  }, [activeMigration, trackEvent]);

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
      closeOverlay={closeOverlay}
      confirmLabel={t('Set cutover')}
      isDisabled={isScheduledInvalid(isTimeValid, isDateValid)}
      onConfirm={onCutover}
      title={hasExistingCutover ? t('Edit cutover') : t('Schedule cutover')}
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
            isScheduledInPast={isScheduledInPast(isTimeValid, isDateValid)}
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
