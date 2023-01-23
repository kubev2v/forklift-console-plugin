/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { ResourceLinkProps } from '@openshift-console/dynamic-plugin-sdk';

// This dummy file is used to resolve @Console imports from @openshift-console for JEST
// You can add any exports needed by your tests here
// Check "moduleNameMapper" in package.json

export const ResourceLink = ({
  name,
  groupVersionKind: { group = '', version = '', kind = '' } = { version: '', kind: '' },
  namespace: ns,
}: ResourceLinkProps) => (
  <div className="ResourceLink_mock">
    {`name: ${name}, gvk: ${[group, version, kind].join('~')}, ns: ${ns}`}
  </div>
);
