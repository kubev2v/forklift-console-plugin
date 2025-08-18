import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace } from '@utils/crds/common/selectors';
import { MORE_INFO_NAMESPACE_DETAIL_ITEM } from '@utils/links';

import type { ResourceDetailsItemProps } from './utils/types';

const NamespaceDetailsItem: FC<ResourceDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const namespace = getNamespace(resource);

  const defaultHelpContent = t(
    `Namespace defines the space within which each name must be unique.
     An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation.
     Not all objects are required to be scoped to a namespace -
     the value of this field for those objects will be empty.`,
  );

  return (
    <DetailsItem
      data-testid="project-detail-item"
      title={t('Project')}
      content={
        <ResourceLink
          groupVersionKind={{ kind: 'Project', version: 'v1' }}
          name={namespace}
          namespace={namespace}
        />
      }
      moreInfoLink={moreInfoLink ?? MORE_INFO_NAMESPACE_DETAIL_ITEM}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['metadata', 'namespace']}
    />
  );
};

export default NamespaceDetailsItem;
