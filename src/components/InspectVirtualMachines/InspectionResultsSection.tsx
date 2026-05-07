import type { FC } from 'react';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import {
  DescriptionList,
  Flex,
  FlexItem,
  Icon,
  Label,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { hasInspectionPassed } from '@utils/crds/conversion/selectors';
import type { InspectionResult } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type InspectionResultsSectionProps = {
  result: InspectionResult;
};

const getConcernCategoryStatus = (category: string): 'danger' | 'info' | 'warning' => {
  switch (category) {
    case 'Critical':
    case 'Error':
      return 'danger';
    case 'Information':
    case 'Advisory':
      return 'info';
    default:
      return 'warning';
  }
};

const InspectionResultsSection: FC<InspectionResultsSectionProps> = ({ result }) => {
  const { t } = useForkliftTranslation();
  const passed = hasInspectionPassed(result);

  return (
    <Stack hasGutter className="pf-v6-u-mb-md">
      <StackItem className="pf-v6-u-mt-md">
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Title headingLevel="h5">{t('Inspection results')}</Title>
          </FlexItem>
          <FlexItem>
            {passed ? (
              <Label
                variant="outline"
                status="success"
                icon={
                  <Icon isInline>
                    <CheckCircleIcon />
                  </Icon>
                }
              >
                {t('Inspection passed')}
              </Label>
            ) : (
              <Label
                variant="outline"
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

      <DescriptionList isCompact columnModifier={{ default: '2Col' }}>
        {result.osInfo?.name && <DetailsItem title={t('OS')} content={result.osInfo?.name} />}
        {result.osInfo?.distro && (
          <DetailsItem title={t('Distribution')} content={result.osInfo?.distro} />
        )}
        {result.osInfo?.version && (
          <DetailsItem title={t('Version')} content={result.osInfo?.version} />
        )}
        {!isEmpty(result.filesystems) && (
          <DetailsItem
            title={t('Filesystems')}
            content={result.filesystems!.map((fs) => `${fs.device} (${fs.type})`).join(', ')}
          />
        )}
        {result.osInfo?.arch && (
          <DetailsItem title={t('Architecture')} content={result.osInfo?.arch} />
        )}
      </DescriptionList>
      <DescriptionList isCompact columnModifier={{ default: '1Col' }}>
        <DetailsItem
          title={t('Issues found')}
          content={
            isEmpty(result.concerns) ? (
              <>{t('None')}</>
            ) : (
              <Table aria-label={t('Issues found')} variant={TableVariant.compact}>
                <Thead>
                  <Tr>
                    <Th>{t('Issue')}</Th>
                    <Th>{t('Severity')}</Th>
                    <Th>{t('Description')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {result.concerns!.map((concern) => (
                    <Tr key={concern.id}>
                      <Td>{concern.label}</Td>
                      <Td>
                        <Label status={getConcernCategoryStatus(concern.category)}>
                          {concern.category}
                        </Label>
                      </Td>
                      <Td>{concern.message}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )
          }
        />
      </DescriptionList>
    </Stack>
  );
};

export default InspectionResultsSection;
