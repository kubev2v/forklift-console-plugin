import { planIdentityFields } from './planIdentityFields';
import { planMetadataFields } from './planMetadataFields';
import { planStatusAndFilterFields } from './planStatusAndFilterFields';

export const planFields = [
  ...planIdentityFields,
  ...planStatusAndFilterFields,
  ...planMetadataFields,
];
