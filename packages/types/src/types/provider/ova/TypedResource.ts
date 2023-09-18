import { OvaResource } from './Resource';

export interface TypedOvaResource extends OvaResource {
  // prop added by the UI to implement narrowing (discriminated union)
  providerType: 'ova';
}
