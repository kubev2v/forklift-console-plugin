import type { FC } from 'react';

import { InputList } from '@components/InputList/InputList';
import { LazyTextInput } from '@components/InputList/LazyTextInput';
import { useForkliftTranslation } from '@utils/i18n';

type Props = {
  onChange: (list: string[]) => void;
  value: string[];
};

const LUKSPassphraseInputList: FC<Props> = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();

  return (
    <InputList
      addButtonText={t('Add passphrase')}
      InputRow={LazyTextInput}
      items={value}
      onChange={onChange}
    />
  );
};

export default LUKSPassphraseInputList;
