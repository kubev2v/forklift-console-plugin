import type { FC } from 'react';

import { Flex, FlexItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { hasInspectionPassed } from '@utils/crds/conversion/selectors';
import type { InspectionResult } from '@utils/crds/conversion/types';
import { useForkliftTranslation } from '@utils/i18n';

import InspectionIssuesTable from './InspectionIssuesTable';
import InspectionOsInfo from './InspectionOsInfo';
import InspectionPassedLabel from './InspectionPassedLabel';

type InspectionResultsSectionProps = {
  result: InspectionResult;
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
            <InspectionPassedLabel passed={Boolean(passed)} />
          </FlexItem>
        </Flex>
      </StackItem>

      <InspectionOsInfo filesystems={result.filesystems} osInfo={result.osInfo} />
      <InspectionIssuesTable concerns={result.concerns} />
    </Stack>
  );
};

export default InspectionResultsSection;
