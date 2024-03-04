import React from 'react';
import { PlanStartMigrationModal } from 'src/modules/Plans/modals';
import { getPlanPhase } from 'src/modules/Plans/utils';
import { ModalHOC, useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, V1beta1Plan } from '@kubev2v/types';
import { Button, DescriptionList, FlexItem } from '@patternfly/react-core';

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

  const phase = getPlanPhase({ obj });
  const canStart = ['Ready', 'Warning', 'Canceled', 'Failed'].includes(phase);

  return (
    <>
      <FlexItem>
        <div className="forklift-page-section--details-start-button">
          <Button
            isAriaDisabled={!canStart}
            variant="primary"
            onClick={() => showModal(<PlanStartMigrationModal resource={obj} model={PlanModel} />)}
          >
            {t('Start')}
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
