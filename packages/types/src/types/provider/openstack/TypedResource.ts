import { OpenstackResource } from './Resource';

export interface TypedOpenstackResource extends OpenstackResource {
  // prop added by the UI to implement narrowing (discriminated union)
  providerType: 'openstack';
}
