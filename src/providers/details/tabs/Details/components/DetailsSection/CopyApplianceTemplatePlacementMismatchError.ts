import { t } from '@utils/i18n';

export class CopyApplianceTemplatePlacementMismatchError extends Error {
  constructor() {
    super(
      t(
        'A copy appliance template already exists with different placement. Close this form and edit disk transfer from the provider Details tab.',
      ),
    );
    this.name = 'CopyApplianceTemplatePlacementMismatchError';
  }
}
