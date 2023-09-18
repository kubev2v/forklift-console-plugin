import { OVirtResource } from './Resource';

export interface TypedOVirtResource extends OVirtResource {
  // prop added by the UI to implement narrowing (discriminated union)
  providerType: 'ovirt';
}
