import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import TechPreviewLabel from '@components/PreviewLabels/TechPreviewLabel';
import { Flex, FlexItem, FormGroup, Radio, Split, SplitItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../../hooks/useCreatePlanFormContext';
import {
  AapFormFieldId,
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_LOCAL,
  HOOK_SOURCE_NONE,
  HooksFormFieldId,
  type HookSource,
  MigrationHookFieldId,
} from '../constants';
import { getHooksSubFieldId } from '../utils';

type HookSourceRadioProps = {
  onChange?: (newSource: HookSource) => void;
};

const HookSourceRadio: FC<HookSourceRadioProps> = ({ onChange }) => {
  const { t } = useForkliftTranslation();
  const { control, unregister } = useCreatePlanFormContext();

  const unregisterLocalFields = (): void => {
    const preFields = [
      getHooksSubFieldId(HooksFormFieldId.PreMigration, MigrationHookFieldId.EnableHook),
      getHooksSubFieldId(HooksFormFieldId.PreMigration, MigrationHookFieldId.HookRunnerImage),
      getHooksSubFieldId(HooksFormFieldId.PreMigration, MigrationHookFieldId.ServiceAccount),
      getHooksSubFieldId(HooksFormFieldId.PreMigration, MigrationHookFieldId.AnsiblePlaybook),
    ];
    const postFields = [
      getHooksSubFieldId(HooksFormFieldId.PostMigration, MigrationHookFieldId.EnableHook),
      getHooksSubFieldId(HooksFormFieldId.PostMigration, MigrationHookFieldId.HookRunnerImage),
      getHooksSubFieldId(HooksFormFieldId.PostMigration, MigrationHookFieldId.ServiceAccount),
      getHooksSubFieldId(HooksFormFieldId.PostMigration, MigrationHookFieldId.AnsiblePlaybook),
    ];
    unregister([...preFields, ...postFields]);
  };

  const unregisterAapFields = (): void => {
    unregister([AapFormFieldId.AapPreHookJobTemplateId, AapFormFieldId.AapPostHookJobTemplateId]);
  };

  return (
    <Controller
      control={control}
      name={AapFormFieldId.HookSource}
      render={({ field }) => (
        <FormGroup fieldId={AapFormFieldId.HookSource} label={t('Hook source')} role="radiogroup">
          <Split hasGutter>
            <SplitItem>
              <Radio
                data-testid="hook-source-none"
                id="hook-source-none"
                isChecked={field.value === HOOK_SOURCE_NONE}
                label={t('No hooks')}
                name="hookSource"
                onChange={() => {
                  unregisterLocalFields();
                  unregisterAapFields();
                  field.onChange(HOOK_SOURCE_NONE);
                  onChange?.(HOOK_SOURCE_NONE);
                }}
              />
            </SplitItem>
            <SplitItem>
              <Radio
                data-testid="hook-source-local"
                id="hook-source-local"
                isChecked={field.value === HOOK_SOURCE_LOCAL}
                label={t('Local playbook')}
                name="hookSource"
                onChange={() => {
                  unregisterAapFields();
                  field.onChange(HOOK_SOURCE_LOCAL);
                  onChange?.(HOOK_SOURCE_LOCAL);
                }}
              />
            </SplitItem>
            <SplitItem>
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsSm' }}
              >
                <FlexItem>
                  <Radio
                    data-testid="hook-source-aap"
                    id="hook-source-aap"
                    isChecked={field.value === HOOK_SOURCE_AAP}
                    label={t('Ansible Automation Platform')}
                    name="hookSource"
                    onChange={() => {
                      unregisterLocalFields();
                      field.onChange(HOOK_SOURCE_AAP);
                      onChange?.(HOOK_SOURCE_AAP);
                    }}
                  />
                </FlexItem>
                <FlexItem>
                  <TechPreviewLabel />
                </FlexItem>
              </Flex>
            </SplitItem>
          </Split>
        </FormGroup>
      )}
    />
  );
};

export default HookSourceRadio;
