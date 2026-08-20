import type { ReactElement } from 'react';

import type { ResourceLinkProps } from '@openshift-console/dynamic-plugin-sdk';

export const ResourceLink = ({
  groupVersionKind: { group = '', kind = '', version = '' } = { kind: '', version: '' },
  name,
  namespace: ns,
}: ResourceLinkProps): ReactElement => (
  <div className="ResourceLink_mock">
    {`name: ${name}, gvk: ${[group, version, kind].join('~')}, ns: ${ns}`}
  </div>
);

export const ActionService = (): ReactElement => <div data-test-element-name="ActionService" />;
export const ActionServiceProvider = (): ReactElement => (
  <div data-test-element-name="ActionServiceProvider" />
);
