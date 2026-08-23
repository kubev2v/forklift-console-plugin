import { planIdentityFields } from './planIdentityFields';
import { planMetadataFields } from './planMetadataFields';
import { planStatusAndFilterFields } from './planStatusAndFilterFields';

export { migrationTypes, planPhases } from './planFieldFilterOptions';

export const planFields = [
  ...planIdentityFields,
  ...planStatusAndFilterFields,
  ...planMetadataFields,
];
