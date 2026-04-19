import { type FC, useEffect, useMemo, useState } from 'react';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import ConnectionStatusAlert from 'src/plans/create/steps/migration-hooks/components/ConnectionStatusAlert';
import { AAP_CONNECTION_STATUS_CONNECTED } from 'src/plans/create/steps/migration-hooks/constants';
import useAapConfig from 'src/plans/create/steps/migration-hooks/hooks/useAapConfig';
import useAapConnection from 'src/plans/create/steps/migration-hooks/hooks/useAapConnection';

import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import type { TypeaheadSelectOption } from '@components/common/TypeaheadSelect/utils/types';
import { Alert, AlertVariant, FormGroup, Spinner } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import type { AapJobTemplate } from '@utils/types/aap';

import type { HookEditFormValues } from '../../state/types';
import { HookField } from '../../state/types';

const MAX_MENU_HEIGHT = '200px';
const POPPER_PROPS = { direction: 'up' as const };

type AapHookEditFieldsProps = {
  control: Control<HookEditFormValues>;
};

const toSelectOptions = (templates: AapJobTemplate[]): TypeaheadSelectOption[] =>
  templates.map((tpl) => ({
    content: tpl.name,
    optionProps: { description: tpl.description },
    value: tpl.id,
  }));

const AapHookEditFields: FC<AapHookEditFieldsProps> = ({ control }) => {
  const { t } = useForkliftTranslation();
  const { aapUrl, isConfigured, loaded: configLoaded } = useAapConfig();
  const { connect, error, status } = useAapConnection();
  const [templates, setTemplates] = useState<AapJobTemplate[]>([]);

  useEffect(() => {
    if (!configLoaded || !isConfigured) {
      return undefined;
    }

    let cancelled = false;

    connect().then(
      (result) => {
        if (!cancelled && result?.status === AAP_CONNECTION_STATUS_CONNECTED) {
          setTemplates(result.templates);
        }
      },
      () => {
        // errors handled inside useAapConnection
      },
    );

    return () => {
      cancelled = true;
    };
  }, [configLoaded, isConfigured, connect]);

  const templateOptions = useMemo(() => toSelectOptions(templates), [templates]);

  if (!configLoaded) {
    return <Spinner size="md" />;
  }

  if (!isConfigured) {
    return (
      <Alert variant={AlertVariant.info} isInline title={t('AAP is not configured')}>
        {t(
          'An administrator must set the AAP URL and token secret in the ForkliftController settings.',
        )}
      </Alert>
    );
  }

  return (
    <>
      {aapUrl && (
        <Alert
          variant={AlertVariant.info}
          isInline
          isPlain
          title={t('AAP: {{url}}', { url: aapUrl })}
        />
      )}

      <ConnectionStatusAlert status={status} error={error} templateCount={templates.length} />

      {status === AAP_CONNECTION_STATUS_CONNECTED && (
        <Controller
          control={control}
          name={HookField.AapJobTemplateId}
          render={({ field }) => (
            <FormGroup label={t('Job template')} fieldId={HookField.AapJobTemplateId}>
              <TypeaheadSelect
                options={templateOptions}
                value={field.value}
                onChange={(selected) => {
                  field.onChange(
                    selected !== undefined && selected !== '' ? Number(selected) : undefined,
                  );
                }}
                allowClear
                placeholder={t('Select a job template...')}
                testId="hook-edit-aap-template-select"
                maxMenuHeight={MAX_MENU_HEIGHT}
                popperProps={POPPER_PROPS}
              />
            </FormGroup>
          )}
        />
      )}
    </>
  );
};

export default AapHookEditFields;
