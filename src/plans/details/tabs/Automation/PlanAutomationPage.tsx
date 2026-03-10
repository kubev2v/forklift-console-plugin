import type { FC } from 'react';

import LoadingSuspend from '@components/LoadingSuspend';
import { Flex, PageSection } from '@patternfly/react-core';

import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

import ScriptsSection from './components/ScriptsSection/ScriptsSection';
import { usePlanCustomScripts } from './hooks/usePlanCustomScripts';

const PlanAutomationPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { loaded: loadedPlan, loadError: planError, plan } = usePlan(name, namespace);
  const {
    configMap,
    error: scriptsError,
    loaded: loadedScripts,
    scripts,
  } = usePlanCustomScripts(plan);

  return (
    <LoadingSuspend
      obj={plan}
      loaded={loadedPlan && loadedScripts}
      loadError={planError ?? scriptsError}
    >
      <PageSection hasBodyWrapper={false} className="pf-v6-u-h-100">
        <Flex direction={{ default: 'column' }}>
          <ScriptsSection configMap={configMap} plan={plan} scripts={scripts} />
        </Flex>
      </PageSection>
    </LoadingSuspend>
  );
};

export default PlanAutomationPage;
