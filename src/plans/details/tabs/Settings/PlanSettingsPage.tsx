import { type FC, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { Divider, Flex, FlexItem, PageSection } from '@patternfly/react-core';

import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

import PlanSettingsSectionContent from './components/PlanSettingsSectionContent';
import PlanSettingsSideNav from './components/PlanSettingsSideNav';
import { usePlanSettingsVisibility } from './hooks/usePlanSettingsVisibility';
import {
  PLAN_SETTINGS_SECTION_QUERY_PARAM,
  type PlanSettingsSectionId,
} from './utils/planSettingsSectionIds';
import {
  getVisiblePlanSettingsSections,
  resolvePlanSettingsSection,
} from './utils/planSettingsVisibility';

import './plan-settings-page.scss';

const PlanSettingsPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { loaded: isPlanLoaded, plan } = usePlan(name, namespace);
  const visibility = usePlanSettingsVisibility(plan);
  const isReady = isPlanLoaded && visibility.isProviderLoaded;
  const [searchParams, setSearchParams] = useSearchParams();

  const visibleSections = useMemo(() => getVisiblePlanSettingsSections(visibility), [visibility]);

  const requestedSection = searchParams.get(PLAN_SETTINGS_SECTION_QUERY_PARAM);
  const activeSectionId = resolvePlanSettingsSection(requestedSection, visibleSections);

  const setActiveSection = useCallback(
    (sectionId: PlanSettingsSectionId): void => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(PLAN_SETTINGS_SECTION_QUERY_PARAM, sectionId);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (isReady && requestedSection !== activeSectionId) {
      setActiveSection(activeSectionId);
    }
  }, [activeSectionId, isReady, requestedSection, setActiveSection]);

  return (
    <PageSection
      className="forklift-plan-settings"
      data-testid="plan-settings-page"
      hasBodyWrapper={false}
    >
      <Flex
        alignItems={{ default: 'alignItemsStretch' }}
        className="forklift-plan-settings__layout"
        direction={{ default: 'row' }}
        flexWrap={{ default: 'nowrap' }}
      >
        <FlexItem className="forklift-plan-settings__nav-column" shrink={{ default: 'shrink' }}>
          <PlanSettingsSideNav
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSection}
            visibleSectionIds={visibleSections}
          />
        </FlexItem>
        <Divider
          className="forklift-plan-settings__divider"
          orientation={{ default: 'vertical' }}
        />
        <FlexItem className="forklift-plan-settings__content-column" grow={{ default: 'grow' }}>
          <PlanSettingsSectionContent sectionId={activeSectionId} visibility={visibility} />
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default PlanSettingsPage;
