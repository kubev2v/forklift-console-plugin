import React from 'react';

import { ResourceLinkProps } from '@openshift-console/dynamic-plugin-sdk';

export const ResourceLink = ({
  name,
  groupVersionKind: { group = '', version = '', kind = '' } = { version: '', kind: '' },
  namespace: ns,
}: ResourceLinkProps) => (
  <div className="ResourceLink_mock">
    {`name: ${name}, gvk: ${[group, version, kind].join('~')}, ns: ${ns}`}
  </div>
);

export const RedExclamationCircleIcon = () => (
  <div data-test-element-name="RedExclamationCircleIcon" />
);
export const GreenCheckCircleIcon = () => <div data-test-element-name="GreenCheckCircleIcon" />;
export const YellowExclamationTriangleIcon = () => (
  <div data-test-element-name="YellowExclamationTriangleIcon" />
);
export const BlueInfoCircleIcon = () => <div data-test-element-name="BlueInfoCircleIcon" />;
export const useModal = (props) => <div data-test-element-name="useModal" {...props} />;
export const ActionService = () => <div data-test-element-name="ActionService" />;
export const ActionServiceProvider = () => <div data-test-element-name="ActionServiceProvider" />;
