import * as React from 'react';
import { ConfirmModal, IConfirmModalProps } from '@app/common/components/ConfirmModal';
import { IPlan } from '@app/queries/types';
import {
  TextContent,
  Text,
  Radio,
  InputGroup,
  DatePicker,
  TimePicker,
  isValidDate,
  HelperText,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import text from '@patternfly/react-styles/css/utilities/Text/text';
import { useSetCutoverMutation } from '@app/queries';

interface ICutoverConfirmModalProps
  extends Pick<IConfirmModalProps, 'isOpen' | 'toggleOpen' | 'mutateResult'> {
  plan: IPlan;
  setCutoverMutation: ReturnType<typeof useSetCutoverMutation>;
}

export const CutoverConfirmModal: React.FunctionComponent<ICutoverConfirmModalProps> = ({
  isOpen,
  toggleOpen,
  setCutoverMutation,
  plan,
}: ICutoverConfirmModalProps) => {
  const [cutoverScheduleMode, setCutoverScheduleMode] = React.useState<'now' | 'later'>('now');
  const [cutoverDay, setCutoverDay] = React.useState<Date | null>(null);
  const [cutoverTime, setCutoverTime] = React.useState<{ hour: number; minute: number } | null>(
    null
  );

  let cutoverDate: Date | null = null;
  if (cutoverDay !== null && cutoverTime !== null) {
    cutoverDate = new Date(cutoverDay);
    cutoverDate.setHours(cutoverTime.hour);
    cutoverDate.setMinutes(cutoverTime.minute);
  }

  let cutoverDateInvalidReason: string | null = null;
  if (cutoverDate && new Date().getTime() > cutoverDate.getTime()) {
    cutoverDateInvalidReason = 'Cutover time must be in the future';
  }

  return (
    <ConfirmModal
      variant="medium"
      position="top"
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      mutateFn={() => {
        if (cutoverScheduleMode === 'now') {
          setCutoverMutation.mutate({ plan, cutover: new Date().toISOString() });
        } else if (cutoverDate) {
          setCutoverMutation.mutate({ plan, cutover: cutoverDate.toISOString() });
        }
      }}
      mutateResult={setCutoverMutation}
      title="Schedule cutover?"
      confirmButtonDisabled={
        cutoverScheduleMode === 'later' && (!cutoverDate || !!cutoverDateInvalidReason)
      }
      body={
        <>
          <TextContent>
            <Text>
              Schedule the cutover for plan &quot;
              {plan.metadata.name}&quot;?
            </Text>
            <Text>
              You can start cutover immediately or schedule cutover for a future date and time. VMs
              included in the migration plan will be shut down when cutover starts.
            </Text>
          </TextContent>
          <div className={`${spacing.mtLg} ${spacing.mlMd}`}>
            <Radio
              id="cutover-schedule-now"
              name="cutover-schedule"
              label="Start cutover now"
              isChecked={cutoverScheduleMode === 'now'}
              onChange={() => {
                setCutoverScheduleMode('now');
                setCutoverDay(null);
                setCutoverTime(null);
              }}
              className={spacing.mbSm}
            />
            <Radio
              id="cutover-schedule-later"
              name="cutover-schedule"
              label="Schedule cutover for later"
              isChecked={cutoverScheduleMode === 'later'}
              onChange={() => setCutoverScheduleMode('later')}
              className={spacing.mbSm}
              description={
                cutoverScheduleMode === 'later' ? (
                  <>
                    <InputGroup className={spacing.mtSm}>
                      <DatePicker
                        onChange={(_inputDate, newDate) => {
                          if (newDate && isValidDate(newDate)) {
                            setCutoverDay(newDate);
                          } else {
                            setCutoverDay(null);
                          }
                        }}
                        aria-label="Cutover scheduled date"
                        placeholder="YYYY-MM-DD"
                        appendTo={document.querySelector('body') as HTMLElement}
                      />
                      <TimePicker
                        aria-label="Cutover scheduled time"
                        style={{ width: '150px' }}
                        onChange={(_time, hour, minute) => {
                          if ((hour || hour === 0) && (minute || minute === 0)) {
                            setCutoverTime({ hour, minute });
                          } else {
                            setCutoverTime(null);
                          }
                        }}
                        menuAppendTo={document.querySelector('body') as HTMLElement}
                      />
                    </InputGroup>
                    {cutoverDateInvalidReason ? (
                      <HelperText className={`${spacing.mtXs} ${text.dangerColor_100}`}>
                        {cutoverDateInvalidReason}
                      </HelperText>
                    ) : null}
                  </>
                ) : null
              }
            />
          </div>
        </>
      }
      confirmButtonText={cutoverScheduleMode === 'now' ? 'Cutover' : 'Schedule cutover'}
      errorText="Cannot schedule cutover"
    />
  );
};
