import React from 'react';
import { EditProviderUIModal, useModal } from 'src/modules/Providers/modals';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ExternalLink } from '@kubev2v/common';
import { V1beta1Provider } from '@kubev2v/types';
import { DescriptionListDescription } from '@patternfly/react-core';

import { DetailsItem } from '../../../../../utils';

import { ProviderDetailsItemProps } from './ProviderDetailsItem';

/**
 * @typedef {Object} NameDetailsItemProps - extends ProviderDetailsItemProps

 * @property {string} [webUILinkText - A text to be displayed as a content.
 * @property {function} [calcWebUILink] - A method for auto calculating the provider's UI path.
 **/

export interface NameAndUiLinkDetailsItemProps extends ProviderDetailsItemProps {
  webUILinkText?: string;
  calcWebUILink?: (provider: V1beta1Provider) => string;
}

const getProviderUIAnnotation = (provider: V1beta1Provider): string =>
  provider?.metadata?.annotations?.['forklift.konveyor.io/providerUI'];

/**
 * Component for displaying the provider name details item.
 * It includes a title and two content items:
 * 1. The provider name (non-editable)
 * 2. The provider web UI link (editable, can be auto calculated or taken from YAML)
 *
 * @component
 * @param {DetailsItemProps} props - The props of the details item.
 */
export const NameAndUiLinkDetailsItem: React.FC<NameAndUiLinkDetailsItemProps> = ({
  resource: provider,
  moreInfoLink,
  helpContent,
  canPatch,
  webUILinkText,
  calcWebUILink,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const defaultMoreInfoLink =
    'https://kubernetes.io/docs/concepts/overview/working-with-objects/names';

  const defaultHelpContent = (
    <ForkliftTrans>
      Name is a client-provided string that refers to an object in a resource URL. <br />
      Only one object of a given kind can have a given name at a time. However, if you delete the
      object, you can make a new object with the same name.
      <br />
      <br />
      Use the link below to access the web-based user interface for the provider virtual machine
      management.
      <br />
      You can edit and store the link to the management system in the Provider metadata annotations
      value under the <strong>forklift.konveyor.io/providerUI</strong> annotation.
    </ForkliftTrans>
  );
  const nameContent = provider?.metadata?.name;

  // Read the annotation for getting the web UI link and only if empty, try to auto calculate the provider web UI path
  const webUILink =
    getProviderUIAnnotation(provider) ?? (calcWebUILink ? calcWebUILink(provider) : null);

  const webUILinkContent = (
    <ExternalLink text={webUILinkText} href={webUILink} isInline={true}>
      {webUILink}
    </ExternalLink>
  );

  const webUILinkEmpty = (
    <span className="text-muted">
      {canPatch && provider?.metadata
        ? t('Click the pencil for setting provider web UI link')
        : t('No value for provider web UI link')}
    </span>
  );

  return (
    <DescriptionListDescription>
      <DetailsItem
        title={t('Name')}
        moreInfoLink={moreInfoLink ?? defaultMoreInfoLink}
        helpContent={helpContent ?? defaultHelpContent}
        crumbs={['Provider', 'metadata', 'name']}
        content={[nameContent, webUILink ? webUILinkContent : webUILinkEmpty]}
        onEdit={[
          null,
          canPatch &&
            provider?.metadata &&
            (() => showModal(<EditProviderUIModal resource={provider} content={webUILink} />)),
        ]}
      />
    </DescriptionListDescription>
  );
};
