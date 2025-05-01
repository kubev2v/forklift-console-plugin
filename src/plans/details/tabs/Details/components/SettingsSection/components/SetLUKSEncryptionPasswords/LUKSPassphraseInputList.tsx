import type { FC } from 'react';

import { InputList } from '@components/InputList/InputList';
import { LazyTextInput } from '@components/InputList/LazyTextInput';
import { useForkliftTranslation } from '@utils/i18n';

type Props = {
  value: string[];
  onChange: (list: string[]) => void;
};

const LUKSPassphraseInputList: FC<Props> = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();

  return (
    <InputList
      items={value}
      onChange={onChange}
      InputRow={LazyTextInput}
      addButtonText={t('Add passphrase')}
    />
  );
};

export default LUKSPassphraseInputList;
