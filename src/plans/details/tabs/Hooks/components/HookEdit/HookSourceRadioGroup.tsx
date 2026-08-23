import type { FC } from 'react';
import { type Control, Controller } from 'react-hook-form';
import {
  HOOK_SOURCE_AAP,
  HOOK_SOURCE_LOCAL,
  HOOK_SOURCE_NONE,
} from 'src/plans/create/steps/migration-hooks/constants';

import TechPreviewLabel from '@components/PreviewLabels/TechPreviewLabel';
import { Flex, FlexItem, Radio, Split, SplitItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { HookEditFormValues } from '../../state/types';
import { HookField } from '../../state/types';

type HookSourceRadioGroupProps = {
  control: Control<HookEditFormValues>;
};

const HookSourceRadioGroup: FC<HookSourceRadioGroupProps> = ({ control }) => {
  const { t } = useForkliftTranslation();

  return (
    <Controller
      control={control}
      name={HookField.HookSource}
      render={({ field: { onChange, value } }) => (
        <Split hasGutter>
          <SplitItem>
            <Radio
              data-testid="hook-edit-source-none"
              id="hook-edit-source-none"
              isChecked={value === HOOK_SOURCE_NONE}
              label={t('No hook')}
              name="hookSource"
              onChange={() => {
                onChange(HOOK_SOURCE_NONE);
              }}
            />
          </SplitItem>
          <SplitItem>
            <Radio
              data-testid="hook-edit-source-local"
              id="hook-edit-source-local"
              isChecked={value === HOOK_SOURCE_LOCAL}
              label={t('Local playbook')}
              name="hookSource"
              onChange={() => {
                onChange(HOOK_SOURCE_LOCAL);
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
                  data-testid="hook-edit-source-aap"
                  id="hook-edit-source-aap"
                  isChecked={value === HOOK_SOURCE_AAP}
                  label={t('Ansible Automation Platform')}
                  name="hookSource"
                  onChange={() => {
                    onChange(HOOK_SOURCE_AAP);
                  }}
                />
              </FlexItem>
              <FlexItem>
                <TechPreviewLabel />
              </FlexItem>
            </Flex>
          </SplitItem>
        </Split>
      )}
    />
  );
};

export default HookSourceRadioGroup;
