import { Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { PF_LABEL_STATUS } from '@utils/constants';

export const STATUS_ICONS = {
  danger: (
    <Icon status={PF_LABEL_STATUS.DANGER}>
      <ExclamationCircleIcon />
    </Icon>
  ),
  info: (
    <Icon status={PF_LABEL_STATUS.INFO}>
      <InfoCircleIcon />
    </Icon>
  ),
  success: (
    <Icon status={PF_LABEL_STATUS.SUCCESS}>
      <CheckCircleIcon />
    </Icon>
  ),
  warning: (
    <Icon status={PF_LABEL_STATUS.WARNING}>
      <ExclamationTriangleIcon />
    </Icon>
  ),
};
