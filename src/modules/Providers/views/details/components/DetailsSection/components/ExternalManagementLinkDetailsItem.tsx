import type { FC } from 'react';
import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { EditProviderUIModal } from 'src/modules/Providers/modals/EditProviderUI/EditProviderUIModal';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/useModal';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionListDescription } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { ProviderDetailsItemProps } from './ProviderDetailsItem';

/**
 * @typedef {Object} ExternalManagementLinkDetailsItemProps - extends ProviderDetailsItemProps
 *
 * @property {string} [webUILinkText - A label text to be displayed as a content.
 * @property {string} [webUILink] - provider's management system external link.
 */
type ExternalManagementLinkDetailsItemProps = {
  webUILinkText?: string;
  webUILink?: string;
} & ProviderDetailsItemProps;

/**
 * Component for displaying the provider management system external link.
 *
 * @component
 * @param {DetailsItemProps} props - The props of the details item.
 */
export const ExternalManagementLinkDetailsItem: FC<ExternalManagementLinkDetailsItemProps> = ({
  canPatch,
  helpContent,
  moreInfoLink,
  resource: provider,
  webUILink,
  webUILinkText,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const canEdit = !isEmpty(provider?.metadata) && canPatch;
  const defaultHelpContent = (
    <ForkliftTrans>
      <p>Use the external web UI link to access the provider virtual machine management system.</p>
      <p>You can edit and store the link to the management system to customize the link URL.</p>
    </ForkliftTrans>
  );

  const webUILinkContent = webUILink ? (
    <ExternalLink text={webUILinkText} href={webUILink} isInline={true}>
      {webUILink}
    </ExternalLink>
  ) : (
    <span className="text-muted">
      {canEdit
        ? t('Click the pencil for setting provider web UI link')
        : t('No value for provider web UI link')}
    </span>
  );

  return (
    <DescriptionListDescription>
      <DetailsItem
        title={t('External web UI link')}
        moreInfoLink={moreInfoLink}
        helpContent={helpContent ?? defaultHelpContent}
        crumbs={['metadata', 'annotations', 'forklift.konveyor.io/providerUI']}
        content={webUILinkContent}
        onEdit={() => {
          showModal(<EditProviderUIModal resource={provider} content={webUILink} />);
        }}
        canEdit={canEdit}
      />
    </DescriptionListDescription>
  );
};
