import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import { type K8sResourceCommon, useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { PF_LABEL_STATUS } from '@utils/constants';
import { ToeholdTemplateModelGroupVersionKind } from '@utils/crds/common/models';
import { getAnnotations, getName, getNamespace } from '@utils/crds/common/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';

import type { ProviderDetailsItemProps } from './utils/types';
import ConfirmToeholdRebuild, { type ConfirmToeholdRebuildProps } from './ConfirmToeholdRebuild';

const REBUILD_REQUESTED_AT = 'forklift.konveyor.io/rebuild-requested-at';

type ToeholdTemplate = K8sResourceCommon & {
  status?: { rebuildRequestedAt?: string };
};

const ToeholdRebuildDetailsItem: FC<ProviderDetailsItemProps> = ({
  canPatch,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const name = getName(provider);
  const namespace = getNamespace(provider);
  const templateName = name ? `${name}-toehold` : undefined;

  const [toehold, loaded] = useK8sWatchResource<ToeholdTemplate>(
    templateName && namespace
      ? {
          groupVersionKind: ToeholdTemplateModelGroupVersionKind,
          name: templateName,
          namespace,
          namespaced: true,
        }
      : null,
  );

  const requestedAt = getAnnotations(toehold)?.[REBUILD_REQUESTED_AT];
  const pending = Boolean(requestedAt) && requestedAt !== toehold?.status?.rebuildRequestedAt;
  const hasToehold = loaded && Boolean(getName(toehold));

  let content = <span className="text-muted">{t('Empty')}</span>;
  if (hasToehold && pending) {
    content = (
      <Label isCompact status={PF_LABEL_STATUS.WARNING}>
        {t('Pending')}
      </Label>
    );
  } else if (hasToehold) {
    content = <Label isCompact>{t('Idle')}</Label>;
  }

  return (
    <DetailsItem
      canEdit={canPatch && hasToehold}
      content={content}
      crumbs={['ToeholdTemplate', 'metadata', 'annotations', REBUILD_REQUESTED_AT]}
      helpContent={t('Request a rebuild of the vCenter toehold template.')}
      onEdit={() => {
        launchOverlay<ConfirmToeholdRebuildProps>(ConfirmToeholdRebuild, { toehold });
      }}
      testId="toehold-rebuild-detail-item"
      title={t('Rebuild template')}
    />
  );
};

export default ToeholdRebuildDetailsItem;
