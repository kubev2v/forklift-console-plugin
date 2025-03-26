import { Map as ImmutableMap } from 'immutable';

import { NetworkMapModel } from '@kubev2v/types';

export const NetworkMapModelYAMLTemplates = ImmutableMap().setIn(
  ['default'],
  `
apiVersion: ${NetworkMapModel.apiGroup}/${NetworkMapModel.apiVersion}
kind: ${NetworkMapModel.kind}
metadata:
  name: example
spec:
  map: []
  provider:
    source: {}
    destination: {}
`,
);

export const defaultYamlTemplate = NetworkMapModelYAMLTemplates.getIn(['default']);
