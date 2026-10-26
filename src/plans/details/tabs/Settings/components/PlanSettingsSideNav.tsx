import type { FC } from 'react';

import { Nav, NavItem, NavList } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { PlanSettingsSectionId } from '../utils/planSettingsSectionIds';
import { getPlanSettingsSectionLabel } from '../utils/planSettingsSectionLabels';

type PlanSettingsSideNavProps = {
  activeSectionId: PlanSettingsSectionId;
  onSelectSection: (sectionId: PlanSettingsSectionId) => void;
  visibleSectionIds: PlanSettingsSectionId[];
};

const PlanSettingsSideNav: FC<PlanSettingsSideNavProps> = ({
  activeSectionId,
  onSelectSection,
  visibleSectionIds,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <Nav aria-label={t('Plan settings categories')} className="forklift-plan-settings__nav">
      <NavList>
        {visibleSectionIds.map((sectionId) => (
          <NavItem
            id={`plan-settings-nav-${sectionId}`}
            isActive={sectionId === activeSectionId}
            key={sectionId}
            onClick={() => {
              onSelectSection(sectionId);
            }}
          >
            {getPlanSettingsSectionLabel(sectionId, t)}
          </NavItem>
        ))}
      </NavList>
    </Nav>
  );
};

export default PlanSettingsSideNav;
