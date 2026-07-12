import { type FC, useMemo } from 'react';

import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getName } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { TypeaheadSelectOption } from '../common/TypeaheadSelect/utils/types';

const SECRET_GVK = {
  group: '',
  kind: 'Secret',
  version: 'v1',
};

type LUKSSecretSelectProps = {
  id: string;
  namespace: string;
  onSelect: (event: unknown, secret: IoK8sApiCoreV1Secret) => void;
  testId?: string;
  value: string;
};

const LUKSSecretSelect: FC<LUKSSecretSelectProps> = ({
  id,
  namespace,
  onSelect,
  testId,
  value,
}) => {
  const { t } = useForkliftTranslation();

  const [allSecrets, loaded, error] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: SECRET_GVK,
    isList: true,
    namespace,
  });

  const opaqueSecrets = useMemo((): IoK8sApiCoreV1Secret[] => {
    if (!allSecrets) {
      return [];
    }

    return allSecrets.filter((secret) => secret.type === 'Opaque');
  }, [allSecrets]);

  const options: TypeaheadSelectOption[] = useMemo(
    () =>
      opaqueSecrets.map((secret) => {
        const name = getName(secret) ?? '';

        return { content: name, value: name };
      }),
    [opaqueSecrets],
  );

  return (
    <TypeaheadSelect
      id={id}
      testId={testId}
      options={options}
      value={value}
      onChange={(selectedName) => {
        const match = opaqueSecrets.find((secret) => getName(secret) === selectedName);

        if (match) {
          onSelect(undefined, match);
        }
      }}
      isDisabled={!loaded || Boolean(error)}
      placeholder={loaded ? t('Select a secret') : t('Loading secrets...')}
      noOptionsMessage={
        error ? t('Failed to load secrets.') : t('No Opaque secrets found in this project.')
      }
    />
  );
};

export default LUKSSecretSelect;
