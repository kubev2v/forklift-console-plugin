import { Map as ImmutableMap } from 'immutable';

import { NetworkMapModel } from '@kubev2v/types';

const NetworkMapModelYAMLTemplates = ImmutableMap().setIn(
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

const defaultYamlTemplate = NetworkMapModelYAMLTemplates.getIn(['default']);

export default defaultYamlTemplate;
