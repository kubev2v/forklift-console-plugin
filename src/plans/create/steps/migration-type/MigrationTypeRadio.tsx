import type { FC } from 'react';
import HelpIconWithLabel from 'src/plans/components/HelpIconWithLabel';
import { getMigrationTypeConfig } from 'src/plans/create/steps/migration-type/utils';
import { hasLiveMigrationProviderType } from 'src/plans/create/utils/hasLiveMigrationProviderType.ts';
import { hasWarmMigrationProviderType } from 'src/plans/create/utils/hasWarmMigrationProviderType.ts';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import type { ProviderVirtualMachine, V1beta1Provider } from '@kubev2v/types';
import { Alert, FlexItem, Radio, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { CBT_HELP_LINK } from '@utils/links';

import { migrationTypeLabels, MigrationTypeValue } from './constants';

type MigrationTypeRadioProps = {
  migrationType: MigrationTypeValue;
  value: MigrationTypeValue;
  onChange: (val: MigrationTypeValue) => void;
  sourceProvider?: V1beta1Provider;
  cbtDisabledVms?: ProviderVirtualMachine[];
};

const MigrationTypeRadio: FC<MigrationTypeRadioProps> = ({
  cbtDisabledVms = [],
  migrationType,
  onChange,
  sourceProvider,
  value,
}) => {
  const { t } = useForkliftTranslation();

  const canRender =
    migrationType === MigrationTypeValue.Cold ||
    (migrationType === MigrationTypeValue.Warm && hasWarmMigrationProviderType(sourceProvider)) ||
    (migrationType === MigrationTypeValue.Live && hasLiveMigrationProviderType(sourceProvider));

  if (!canRender) return null;

  const { description, helpBody, helpLink, PreviewLabel } = getMigrationTypeConfig(migrationType);

  return (
    <>
      <FlexItem>
        <Radio
          id={migrationType}
          name={migrationType}
          label={
            helpBody ? (
              <Split hasGutter>
                <SplitItem>
                  <HelpIconWithLabel label={migrationTypeLabels[migrationType]}>
                    <Stack hasGutter>
                      <StackItem>{helpBody}</StackItem>
                      <StackItem>
                        <ExternalLink isInline href={helpLink!}>
                          {t('Learn more')}
                        </ExternalLink>
                      </StackItem>
                    </Stack>
                  </HelpIconWithLabel>
                </SplitItem>
                {PreviewLabel && (
                  <SplitItem>
                    <PreviewLabel />
                  </SplitItem>
                )}
              </Split>
            ) : (
              migrationTypeLabels[migrationType]
            )
          }
          description={description}
          isChecked={value === migrationType}
          onChange={() => {
            onChange(migrationType);
          }}
        />
      </FlexItem>

      {migrationType === MigrationTypeValue.Warm &&
        value === MigrationTypeValue.Warm &&
        !isEmpty(cbtDisabledVms) && (
          <Alert
            isInline
            variant="warning"
            title={t('Must enable Changed Block Tracking (CBT) for warm migration')}
            className="pf-v5-u-ml-lg"
          >
            <Stack hasGutter>
              <p>
                {cbtDisabledVms.length} {t('of your selected VMs do not have CBT enabled.')}
                <br />
                {t(
                  'Switch those VMs to cold migration or enable CBT in VMware before running the plan; otherwise the migration will fail.',
                )}
              </p>
              <ExternalLink isInline href={CBT_HELP_LINK}>
                {t('Learn more')}
              </ExternalLink>
            </Stack>
          </Alert>
        )}
    </>
  );
};

export default MigrationTypeRadio;
