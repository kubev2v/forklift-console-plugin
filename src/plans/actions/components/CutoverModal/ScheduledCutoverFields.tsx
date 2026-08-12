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
            appendTo={document.body}
            aria-label={t('Cutover date')}
            onChange={onDateChange}
            placeholder="YYYY-MM-DD"
            value={yyyyMMddFormat(cutoverDate ? new Date(cutoverDate) : new Date())}
          />
          <TimePicker
            aria-label={t('Cutover time')}
            menuAppendTo={document.body}
            onChange={onTimeChange}
            time={time}
          />
        </InputGroup>
      </FlexItem>
      {isScheduledInPast && (
        <FlexItem>
          <Alert
            isInline
            isPlain
            title={t(
              'The selected time is in the past. Cutover will begin immediately, equivalent to the ASAP option.',
            )}
            variant={AlertVariant.info}
          />
        </FlexItem>
      )}
    </>
  );
};

export default ScheduledCutoverFields;
