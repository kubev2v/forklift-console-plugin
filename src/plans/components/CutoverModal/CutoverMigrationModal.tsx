import { type FC, type ReactNode, useCallback, useMemo, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import { ButtonVariant, Flex, FlexItem, Radio } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCutoverDateTimeHandlers } from './hooks/useCutoverDateTimeHandlers';
import {
  CUTOVER_MODE_ASAP,
  CUTOVER_MODE_INHERIT,
  CUTOVER_MODE_SCHEDULED,
  type CutoverMode,
  useCutoverFormState,
} from './hooks/useCutoverFormState';
import ScheduledCutoverFields from './ScheduledCutoverFields';

import './CutoverMigrationModal.scss';

type CutoverMigrationModalProps = {
  closeOverlay: () => void;
  description: ReactNode;
  existingCutover: string | undefined;
  inheritOption?: boolean;
  onRemoveCutover: () => Promise<unknown>;
  onSetCutover: (cutover: string) => Promise<unknown>;
  removeActionMode: CutoverMode;
};

const CutoverMigrationModal: FC<CutoverMigrationModalProps> = ({
  closeOverlay,
  description,
  existingCutover,
  inheritOption,
  onRemoveCutover,
  onSetCutover,
  removeActionMode,
}) => {
  const { t } = useForkliftTranslation();
  const [isDateValid, setIsDateValid] = useState<boolean>(true);
  const [isTimeValid, setIsTimeValid] = useState<boolean>(true);

  const hasExistingCutover = Boolean(existingCutover);
  const { cutoverDate, cutoverMode, setCutoverDate, setCutoverMode, setTime, time } =
    useCutoverFormState(existingCutover, Boolean(inheritOption));

  const { getCutoverDateToSet, isScheduledInPast, isScheduledInvalid, onDateChange, onTimeChange } =
    useCutoverDateTimeHandlers({
      cutoverDate,
      cutoverMode,
      existingCutover,
      setCutoverDate,
      setIsDateValid,
      setIsTimeValid,
      setTime,
    });
  const isRemovePrimary = cutoverMode === CUTOVER_MODE_INHERIT;

  const onConfirm = useCallback(async () => {
    await onSetCutover(getCutoverDateToSet());
  }, [getCutoverDateToSet, onSetCutover]);

  const handleRemoveCutover = useCallback(async () => {
    await onRemoveCutover();
    closeOverlay();
  }, [onRemoveCutover, closeOverlay]);

  const additionalAction = useMemo(
    () =>
      cutoverMode === removeActionMode && hasExistingCutover && !isRemovePrimary
        ? {
            children: t('Remove cutover'),
            onClick: handleRemoveCutover,
            variant: ButtonVariant.danger,
          }
        : undefined,
    [cutoverMode, hasExistingCutover, handleRemoveCutover, t, removeActionMode, isRemovePrimary],
  );

  return (
    <ModalForm
      additionalAction={additionalAction}
      closeOverlay={closeOverlay}
      confirmLabel={isRemovePrimary ? t('Remove cutover') : t('Set cutover')}
      confirmVariant={isRemovePrimary ? ButtonVariant.danger : undefined}
      isDisabled={
        isRemovePrimary ? !hasExistingCutover : isScheduledInvalid(isTimeValid, isDateValid)
      }
      onConfirm={isRemovePrimary ? onRemoveCutover : onConfirm}
      title={hasExistingCutover ? t('Edit cutover') : t('Schedule cutover')}
    >
      {description}
      <Flex
        className="forklift-cutover-migration-inputgroup"
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
        {inheritOption && (
          <FlexItem>
            <Radio
              data-testid="cutover-mode-inherit"
              description={t(
                'Inherit cutover time from the plan. If the plan has no cutover scheduled, this VM will pause until cutover is scheduled.',
              )}
              id="cutover-mode-inherit"
              isChecked={cutoverMode === CUTOVER_MODE_INHERIT}
              label={t('Inherit cutover from plan')}
              name="cutoverMode"
              onChange={() => {
                setCutoverMode(CUTOVER_MODE_INHERIT);
              }}
            ></Radio>
          </FlexItem>
        )}
      </Flex>
    </ModalForm>
  );
};

export default CutoverMigrationModal;
