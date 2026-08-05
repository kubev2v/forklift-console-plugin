import type { FC } from 'react';

import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { useForkliftTranslation } from '@utils/i18n';
import { timezoneOptions } from '@utils/timezoneOptions';

type TimezoneDropdownProps = {
  value: string;
  onChange: (val: string) => void;
};

const TimezoneDropdown: FC<TimezoneDropdownProps> = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();

  return (
    <TypeaheadSelect
      options={timezoneOptions}
      value={value ?? undefined}
      onChange={(val) => {
        onChange(typeof val === 'string' ? val : '');
      }}
      allowClear
      placeholder={t('Use source provider default')}
      testId="timezone-select"
    />
  );
};

export default TimezoneDropdown;
