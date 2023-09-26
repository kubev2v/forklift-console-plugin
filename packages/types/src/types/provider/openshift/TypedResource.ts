import { OpenshiftResource } from './Resource';

export interface TypedOpenshiftResource extends OpenshiftResource {
  // prop added by the UI to implement narrowing (discriminated union)
  providerType: 'openshift';
}
