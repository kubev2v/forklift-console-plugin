import { Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';

export const STATUS_ICONS = {
  danger: (
    <Icon status="danger">
      <ExclamationCircleIcon />
    </Icon>
  ),
  info: (
    <Icon status="info">
      <InfoCircleIcon />
    </Icon>
  ),
  success: (
    <Icon status="success">
      <CheckCircleIcon />
    </Icon>
  ),
  warning: (
    <Icon status="warning">
      <ExclamationTriangleIcon />
    </Icon>
  ),
};
