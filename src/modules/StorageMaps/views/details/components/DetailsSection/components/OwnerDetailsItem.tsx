import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { OwnerReferencesItem } from 'src/modules/Providers/utils/components/DetailsPage/OwnerReferencesItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { StorageDetailsItemProps } from './StorageDetailsItemProps';

export const OwnerDetailsItem: FC<StorageDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource,
}) => {
  const { t } = useForkliftTranslation();

  const defaultMoreInfoLink =
    'https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/';
  const defaultHelpContent = t(
    `List of objects depended by this object. If ALL objects in the list have been deleted,
    this object will be garbage collected. If this object is managed by a controller,
    then an entry in this list will point to this controller, with the controller field set to true.
    There cannot be more than one managing controller.`,
  );

  return (
    <DetailsItem
      title={t('Owner')}
      content={<OwnerReferencesItem resource={resource} />}
      moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['metadata', 'ownerReferences']}
    />
  );
};
