import React from 'react';
import { PlanStartMigrationModal } from 'src/modules/Plans/modals';
import {
  canPlanReStart,
  canPlanStart,
  isPlanExecuting,
  isPlanSucceeded,
} from 'src/modules/Plans/utils';
import { ModalHOC, useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, V1beta1Plan } from '@kubev2v/types';
import { Button, DescriptionList, FlexItem, Level, LevelItem } from '@patternfly/react-core';
import StartIcon from '@patternfly/react-icons/dist/esm/icons/play-icon';
import ReStartIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';

import {
  CreatedAtDetailsItem,
  NameDetailsItem,
  NamespaceDetailsItem,
  OwnerDetailsItem,
  StatusDetailsItem,
} from './components';

export const DetailsSection: React.FC<DetailsSectionProps> = (props) => (
  <ModalHOC>
    <DetailsSectionInternal {...props} />
  </ModalHOC>
);

export type DetailsSectionProps = {
  obj: V1beta1Plan;
};

export const DetailsSectionInternal: React.FC<DetailsSectionProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const canStart = canPlanStart(obj);
  const canReStart = canPlanReStart(obj);
  const isExecuting = isPlanExecuting(obj);
  const isSucceeded = isPlanSucceeded(obj);

  const buttonStartLabel = canReStart ? t('Restart migration') : t('Start migration');
  const buttonStartIcon = canReStart ? (
    <ReStartIcon color="green" className="forklift-page-section--details-start-button__icon" />
  ) : (
    <StartIcon color="green" className="forklift-page-section--details-start-button__icon" />
  );

  const canNotRunIcon = (
    <StartIcon color="gray" className="forklift-page-section--details-start-button__icon" />
  );
  let canNotRunLabel: string;
  if (isExecuting) {
    canNotRunLabel = t('Plan running');
  } else if (isSucceeded) {
    canNotRunLabel = t('Plane Succeeded');
  } else {
    canNotRunLabel = t('Plane not ready');
  }

  return (
    <>
      <FlexItem>
        <div className="forklift-page-section--details-start-button">
          <Button
            isAriaDisabled={!canStart}
            variant="link"
            onClick={() =>
              showModal(
                <PlanStartMigrationModal
                  resource={obj}
                  model={PlanModel}
                  title={buttonStartLabel}
                />,
              )
            }
          >
            <Level hasGutter>
              {canStart ? (
                <>
                  <LevelItem>{buttonStartIcon}</LevelItem>
                  <LevelItem>{buttonStartLabel}</LevelItem>
                </>
              ) : (
                <>
                  <LevelItem>{canNotRunIcon}</LevelItem>
                  <LevelItem>{canNotRunLabel}</LevelItem>
                </>
              )}
            </Level>
          </Button>
        </div>
      </FlexItem>

      <DescriptionList
        className="forklift-page-section--details-status"
        columnModifier={{
          default: '1Col',
        }}
      >
        <StatusDetailsItem resource={obj} />

        <NameDetailsItem resource={obj} />

        <NamespaceDetailsItem resource={obj} />

        <CreatedAtDetailsItem resource={obj} />

        <OwnerDetailsItem resource={obj} />
      </DescriptionList>
    </>
  );
};
