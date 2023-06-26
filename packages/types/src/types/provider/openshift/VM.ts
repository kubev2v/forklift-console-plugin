import { Concern } from '../base';

import { OpenshiftResource } from './Resource';

export interface OpenshiftVM extends OpenshiftResource {
  concerns: Concern[];
}
