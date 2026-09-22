import { type FC, useState } from 'react';
import { isEmpty } from 'src/utils/helpers';
import { useForkliftTranslation } from 'src/utils/i18n';
import type { ValidationRunKind } from 'src/virtualizationValidation/types';

import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Radio,
  TextInput,
} from '@patternfly/react-core';

const DEFAULT_VALIDATION_NAMESPACE = 'mtv-validation-workloads';

type ProviderValidationRunFormProps = {
  canCreate: boolean;
  creating: boolean;
  isRunActive: boolean;
  onRun: (runKind: ValidationRunKind, validationNamespace?: string) => void;
};

const ProviderValidationRunForm: FC<ProviderValidationRunFormProps> = ({
  canCreate,
  creating,
  isRunActive,
  onRun,
}) => {
  const { t } = useForkliftTranslation();
  const [runKind, setRunKind] = useState<ValidationRunKind>('workload');
  const [validationNamespace, setValidationNamespace] = useState(DEFAULT_VALIDATION_NAMESPACE);
  const requiresNamespace = runKind !== 'platform';
  const namespaceIsValid = !requiresNamespace || !isEmpty(validationNamespace.trim());

  return (
    <Form>
      {isRunActive && (
        <Alert isInline title={t('A validation is already running')} variant={AlertVariant.info}>
          {t('Wait for the active validation to complete before starting another run.')}
        </Alert>
      )}
      <FormGroup fieldId="validation-run-kind" isRequired label={t('Validation type')}>
        <Radio
          description={t('Checks the remote cluster and OpenShift Virtualization configuration.')}
          id="validation-run-kind-platform"
          isChecked={runKind === 'platform'}
          label={t('Platform validation')}
          name="validation-run-kind"
          onChange={() => {
            setRunKind('platform');
          }}
          value="platform"
        />
        <Radio
          description={t('Creates, starts, and cleans up a validation VM on the remote cluster.')}
          id="validation-run-kind-workload"
          isChecked={runKind === 'workload'}
          label={t('Workload validation')}
          name="validation-run-kind"
          onChange={() => {
            setRunKind('workload');
          }}
          value="workload"
        />
        {/* PoC-only: this requires the dedicated simulated-failure check in the forked VCV image. */}
        <Radio
          description={t(
            'Runs the workload validation, then records a deterministic demo failure.',
          )}
          id="validation-run-kind-demo-failure"
          isChecked={runKind === 'demo-failure'}
          label={t('Demo: simulated failure')}
          name="validation-run-kind"
          onChange={() => {
            setRunKind('demo-failure');
          }}
          value="demo-failure"
        />
      </FormGroup>
      {requiresNamespace && (
        <>
          <Alert
            isInline
            title={t('Use a dedicated validation namespace')}
            variant={AlertVariant.warning}
          >
            {t(
              'The workload check creates and deletes validation VM resources in this remote namespace.',
            )}
          </Alert>
          <FormGroup
            fieldId="validation-namespace"
            isRequired
            label={t('Remote validation namespace')}
          >
            <TextInput
              id="validation-namespace"
              isRequired
              onChange={(_event, value) => {
                setValidationNamespace(value);
              }}
              value={validationNamespace}
            />
          </FormGroup>
        </>
      )}
      <Button
        isDisabled={!canCreate || creating || isRunActive || !namespaceIsValid}
        isLoading={creating}
        onClick={() => {
          onRun(runKind, requiresNamespace ? validationNamespace.trim() : undefined);
        }}
        variant={ButtonVariant.primary}
      >
        {isRunActive ? t('Validation in progress') : t('Run validation')}
      </Button>
    </Form>
  );
};

export default ProviderValidationRunForm;
