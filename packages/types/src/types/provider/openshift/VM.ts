import { V1VirtualMachine } from '../../../generated';

import { TypedOpenshiftResource } from './TypedResource';

// https://github.com/kubev2v/forklift/blob/main/pkg/controller/provider/web/ocp/vm.go
export interface OpenshiftVM extends TypedOpenshiftResource {
  object: V1VirtualMachine;
}
