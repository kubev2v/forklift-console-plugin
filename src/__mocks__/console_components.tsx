import type { ResourceLinkProps } from '@openshift-console/dynamic-plugin-sdk';

export const ResourceLink = ({
  groupVersionKind: { group = '', kind = '', version = '' } = { kind: '', version: '' },
  name,
  namespace: ns,
}: ResourceLinkProps) => (
  <div className="ResourceLink_mock">
    {`name: ${name}, gvk: ${[group, version, kind].join('~')}, ns: ${ns}`}
  </div>
);

export const ActionService = () => <div data-test-element-name="ActionService" />;
export const ActionServiceProvider = () => <div data-test-element-name="ActionServiceProvider" />;
