import * as React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import ResourcesAlmostFullIcon from '@patternfly/react-icons/dist/esm/icons/resources-almost-full-icon';
import ResourcesFullIcon from '@patternfly/react-icons/dist/esm/icons/resources-full-icon';
import {
  global_danger_color_100 as dangerColor,
  global_disabled_color_200 as disabledColor,
  global_disabled_color_100 as canceledColor,
  global_info_color_100 as infoColor,
  global_success_color_100 as successColor,
} from '@patternfly/react-tokens';

import { IVMStatus } from 'legacy/src/queries/types';
import { StepType } from 'legacy/src/common/constants';
import './PipelineSummary.css';
import { findCurrentStep, getStepType, isStepOnError } from '../helpers';
import { TruncatedText } from './TruncatedText';

interface IDashProps {
  isReached: boolean;
}

const Dash: React.FunctionComponent<IDashProps> = ({ isReached }: IDashProps) => {
  return (
    <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
      {isReached ? <div className="dash dashReached" /> : <div className="dash dashNotReached" />}
    </FlexItem>
  );
};

export const getPipelineSummaryTitle = (status: IVMStatus): string => {
  const { currentStep } = findCurrentStep(status.pipeline);
  if (status.conditions?.find((condition) => condition.type === 'Canceled')) return 'Canceled';
  if (status.completed && !status.error) {
    return 'Complete';
  }
  if ((status.started && !status.completed) || status.error) {
    if (status.error) return `Error - ${currentStep?.description}`;
    if (currentStep?.description) return currentStep.description;
  }
  return 'Not started';
};

interface IGetStepTypeIcon {
  status: IVMStatus;
  index: number;
  isCanceled: boolean;
}

// TODO this is mostly redundant with the Step component. We should refactor.
const GetStepTypeIcon: React.FunctionComponent<IGetStepTypeIcon> = ({
  status,
  index,
  isCanceled,
}: IGetStepTypeIcon) => {
  const res = getStepType(status, index, isCanceled);
  const { currentStepIndex } = findCurrentStep(status.pipeline);
  let icon: React.ReactNode;
  if (res === StepType.Full) {
    icon = (
      <ResourcesFullIcon
        color={isStepOnError(status, index) ? dangerColor.value : successColor.value}
      />
    );
  } else if (res === StepType.Half) {
    icon = (
      <ResourcesAlmostFullIcon
        color={isStepOnError(status, index) || status.error ? dangerColor.value : infoColor.value}
      />
    );
  } else if (res === StepType.Canceled) {
    icon = (
      <ResourcesAlmostFullIcon
        color={
          isStepOnError(status, index) || status.error ? dangerColor.value : canceledColor.value
        }
      />
    );
  } else {
    icon = <ResourcesEmptyIcon key={index} color={disabledColor.value} />;
  }
  return (
    <>
      {icon}
      {index < status.pipeline.length - 1 ? <Dash isReached={index < currentStepIndex} /> : null}
    </>
  );
};

interface IPipelineSummaryProps {
  status: IVMStatus;
  isCanceled: boolean;
}

export const PipelineSummary: React.FunctionComponent<IPipelineSummaryProps> = ({
  status,
  isCanceled,
}: IPipelineSummaryProps) => {
  const title = getPipelineSummaryTitle(status);

  return (
    <Flex direction={{ default: 'column' }}>
      <FlexItem>
        <TruncatedText>{title}</TruncatedText>
        <Flex
          spaceItems={{ default: 'spaceItemsNone' }}
          alignContent={{ default: 'alignContentCenter' }}
          flexWrap={{ default: 'nowrap' }}
        >
          {status.pipeline.map((_, index) => (
            <GetStepTypeIcon key={index} status={status} index={index} isCanceled={isCanceled} />
          ))}
        </Flex>
      </FlexItem>
    </Flex>
  );
};
