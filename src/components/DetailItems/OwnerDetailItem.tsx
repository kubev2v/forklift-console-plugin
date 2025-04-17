import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { OwnerReferencesItem } from 'src/modules/Providers/utils/components/DetailsPage/OwnerReferencesItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { moreInfoOwnerDetailItem } from '@utils/links';

import type { ResourceDetailsItemProps } from './utils/types';

const OwnerDetailsItem: FC<ResourceDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource,
}) => {
  const { t } = useForkliftTranslation();

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
      moreInfoLink={moreInfoLink ?? moreInfoOwnerDetailItem}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['metadata', 'ownerReferences']}
    />
  );
};

export default OwnerDetailsItem;
