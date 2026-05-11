import type { FC } from 'react';

import { Content } from '@patternfly/react-core';
import type { ConversionCondition, InspectionResult } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import InspectionResultsSection from './InspectionResultsSection';

type InspectionRowExpandedContentProps = {
  criticalConditions: ConversionCondition[];
  inspectionResult: InspectionResult | undefined;
};

const InspectionRowExpandedContent: FC<InspectionRowExpandedContentProps> = ({
  criticalConditions,
  inspectionResult,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      {!isEmpty(criticalConditions) && (
        <Content className="pf-v6-u-py-sm pf-v6-u-pl-xl">
          {criticalConditions.map((condition, index) => (
            <Content key={`${condition.type}-${index}`}>{condition.message}</Content>
          ))}
        </Content>
      )}
      {inspectionResult && <InspectionResultsSection result={inspectionResult} />}
      {!inspectionResult && isEmpty(criticalConditions) && (
        <Content className="pf-v6-u-py-md pf-v6-u-pl-xl">
          <Content>{t('No results available yet.')}</Content>
        </Content>
      )}
    </>
  );
};

export default InspectionRowExpandedContent;
