import { type FC, useEffect, useMemo, useState } from 'react';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import ConnectionStatusAlert from 'src/plans/create/steps/migration-hooks/components/ConnectionStatusAlert';
import { AAP_CONNECTION_STATUS_CONNECTED } from 'src/plans/create/steps/migration-hooks/constants';
import useAapConfig from 'src/plans/create/steps/migration-hooks/hooks/useAapConfig';
import useAapConnection from 'src/plans/create/steps/migration-hooks/hooks/useAapConnection';
import {
  AAP_SELECT_MAX_MENU_HEIGHT,
  AAP_SELECT_POPPER_PROPS,
  toAapSelectOptions,
} from 'src/plans/create/steps/migration-hooks/utils';

import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import { Alert, AlertVariant, FormGroup, Spinner } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import type { AapJobTemplate } from '@utils/types/aap';

import type { HookEditFormValues } from '../../state/types';
import { HookField } from '../../state/types';

type AapHookEditFieldsProps = {
  control: Control<HookEditFormValues>;
};

const AapHookEditFields: FC<AapHookEditFieldsProps> = ({ control }) => {
  const { t } = useForkliftTranslation();
  const { aapUrl, error: configError, isConfigured, loaded: configLoaded } = useAapConfig();
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

  const templateOptions = useMemo(() => toAapSelectOptions(templates), [templates]);

  if (!configLoaded) {
    return <Spinner size="md" />;
  }

  if (configError) {
    return (
      <Alert variant={AlertVariant.danger} isInline title={t('Failed to load AAP configuration')}>
        {configError.message}
      </Alert>
    );
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
                maxMenuHeight={AAP_SELECT_MAX_MENU_HEIGHT}
                popperProps={AAP_SELECT_POPPER_PROPS}
              />
            </FormGroup>
          )}
        />
      )}
    </>
  );
};

export default AapHookEditFields;
