import { type FC, useMemo } from 'react';

import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { useForkliftTranslation } from '@utils/i18n';

type TimezoneDropdownProps = {
  value: string;
  onChange: (val: string) => void;
};

const TimezoneDropdown: FC<TimezoneDropdownProps> = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();

  const timezoneOptions = useMemo(
    () =>
      Intl.supportedValuesOf('timeZone').map((tz) => ({
        content: tz,
        value: tz,
      })),
    [],
  );

  return (
    <TypeaheadSelect
      options={timezoneOptions}
      value={value || undefined}
      onChange={(val) => {
        onChange((val as string) ?? '');
      }}
      allowClear
      placeholder={t('Use source provider default')}
      testId="timezone-select"
    />
  );
};

export default TimezoneDropdown;
