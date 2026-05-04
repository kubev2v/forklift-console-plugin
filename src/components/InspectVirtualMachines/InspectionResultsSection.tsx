import type { FC } from 'react';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Icon,
  Label,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import type { InspectionResult } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type InspectionResultsSectionProps = {
  result: InspectionResult;
};

const InspectionResultsSection: FC<InspectionResultsSectionProps> = ({ result }) => {
  const { t } = useForkliftTranslation();

  return (
    <Stack hasGutter className="pf-v6-u-mb-md">
      <StackItem className="pf-v6-u-mt-md">
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Title headingLevel="h5">{t('Inspection results')}</Title>
          </FlexItem>
          <FlexItem>
            {result.allChecksPassed ? (
              <Label
                status="success"
                icon={
                  <Icon isInline>
                    <CheckCircleIcon />
                  </Icon>
                }
              >
                {t('All checks passed')}
              </Label>
            ) : (
              <Label
                status="warning"
                icon={
                  <Icon isInline>
                    <ExclamationTriangleIcon />
                  </Icon>
                }
              >
                {t('Issues found')}
              </Label>
            )}
          </FlexItem>
        </Flex>
      </StackItem>

      {result.osInfo && (
        <StackItem>
          <DescriptionList isHorizontal isCompact>
            {result.osInfo.name && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('OS')}</DescriptionListTerm>
                <DescriptionListDescription>{result.osInfo.name}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {result.osInfo.distro && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Distribution')}</DescriptionListTerm>
                <DescriptionListDescription>{result.osInfo.distro}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {result.osInfo.version && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Version')}</DescriptionListTerm>
                <DescriptionListDescription>{result.osInfo.version}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {result.osInfo.arch && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Architecture')}</DescriptionListTerm>
                <DescriptionListDescription>{result.osInfo.arch}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </StackItem>
      )}

      {!isEmpty(result.concerns) && (
        <StackItem>
          <Title headingLevel="h6">{t('Concerns')}</Title>
          <Stack>
            {result.concerns!.map((concern) => (
              <StackItem key={concern.id}>
                <Label isCompact status={concern.category === 'Critical' ? 'danger' : 'warning'}>
                  {concern.category}
                </Label>{' '}
                <strong>{concern.label}</strong> — {concern.message}
              </StackItem>
            ))}
          </Stack>
        </StackItem>
      )}

      {!isEmpty(result.filesystems) && (
        <StackItem>
          <DescriptionList isHorizontal isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Filesystems')}</DescriptionListTerm>
              <DescriptionListDescription>
                {result.filesystems!.map((fs) => `${fs.device} (${fs.type})`).join(', ')}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </StackItem>
      )}
    </Stack>
  );
};

export default InspectionResultsSection;
