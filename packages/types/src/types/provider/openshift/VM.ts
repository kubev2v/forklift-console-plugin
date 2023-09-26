import { V1VirtualMachine } from '../../k8s/V1VirtualMachine';
import { Concern } from '../base';

import { TypedOpenshiftResource } from './TypedResource';

// https://github.com/kubev2v/forklift/blob/main/pkg/controller/provider/web/ocp/vm.go
export interface OpenshiftVM extends TypedOpenshiftResource {
  concerns: Concern[];
  object: V1VirtualMachine;
}
