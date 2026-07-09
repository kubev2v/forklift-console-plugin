import type { FC, FormEvent } from 'react';

import {
  Alert,
  AlertVariant,
  DatePicker,
  FlexItem,
  InputGroup,
  TimePicker,
  yyyyMMddFormat,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type ScheduledCutoverFieldsProps = {
  cutoverDate: string | undefined;
  isScheduledInPast: boolean;
  onDateChange: (event: FormEvent<HTMLInputElement>, value: string, date?: Date) => void;
  // eslint-disable-next-line @typescript-eslint/max-params
  onTimeChange: (
    event: FormEvent<HTMLInputElement>,
    timeInput: string,
    hour?: number,
    minute?: number,
    seconds?: number,
    timeValid?: boolean,
  ) => void;
  time: string | undefined;
};

const ScheduledCutoverFields: FC<ScheduledCutoverFieldsProps> = ({
  cutoverDate,
  isScheduledInPast,
  onDateChange,
  onTimeChange,
  time,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <FlexItem>
        <InputGroup>
          <DatePicker
            onChange={onDateChange}
            aria-label={t('Cutover date')}
            placeholder="YYYY-MM-DD"
            appendTo={document.body}
            value={yyyyMMddFormat(cutoverDate ? new Date(cutoverDate) : new Date())}
          />
          <TimePicker
            aria-label={t('Cutover time')}
            onChange={onTimeChange}
            menuAppendTo={document.body}
            time={time}
          />
        </InputGroup>
      </FlexItem>
      {isScheduledInPast && (
        <FlexItem>
          <Alert
            variant={AlertVariant.info}
            isInline
            isPlain
            title={t(
              'The selected time is in the past. Cutover will begin immediately, equivalent to the ASAP option.',
            )}
          />
        </FlexItem>
      )}
    </>
  );
};

export default ScheduledCutoverFields;
