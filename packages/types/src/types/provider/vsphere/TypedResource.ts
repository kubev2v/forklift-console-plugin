import { VSphereResource } from './Resource';

export interface TypedVSphereResource extends VSphereResource {
  // prop added by the UI to implement narrowing (discriminated union)
  providerType: 'vsphere';
}
