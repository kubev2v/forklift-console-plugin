import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import { type K8sResourceCommon, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Stack, StackItem } from '@patternfly/react-core';
import { PF_LABEL_STATUS } from '@utils/constants';
import { ToeholdTemplateModelGroupVersionKind } from '@utils/crds/common/models';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';

import type { ProviderDetailsItemProps } from './utils/types';

type ToeholdTemplate = K8sResourceCommon & {
  status?: {
    message?: string;
    phase?: string;
    stage?: string;
    template?: { moref?: string };
  };
};

const phaseStatus = {
  Failed: PF_LABEL_STATUS.DANGER,
  Pending: PF_LABEL_STATUS.WARNING,
  Running: PF_LABEL_STATUS.INFO,
  Succeeded: PF_LABEL_STATUS.SUCCESS,
} as const;

const ToeholdTemplateDetailsItem: FC<ProviderDetailsItemProps> = ({ resource: provider }) => {
  const { t } = useForkliftTranslation();
  const name = getName(provider);
  const namespace = getNamespace(provider);
  const templateName = name ? `${name}-toehold` : undefined;

  const [toehold] = useK8sWatchResource<ToeholdTemplate>(
    templateName && namespace
      ? {
          groupVersionKind: ToeholdTemplateModelGroupVersionKind,
          name: templateName,
          namespace,
          namespaced: true,
        }
      : null,
  );

  const phase = toehold?.status?.phase;
  const stage = toehold?.status?.stage;
  const message = toehold?.status?.message;
  const moref = toehold?.status?.template?.moref;

  return (
    <DetailsItem
      content={
        templateName && namespace ? (
          <Stack>
            <StackItem>
              <ResourceLink
                groupVersionKind={ToeholdTemplateModelGroupVersionKind}
                name={templateName}
                namespace={namespace}
              />
            </StackItem>
            {phase ? (
              <StackItem>
                <Label isCompact status={phaseStatus[phase as keyof typeof phaseStatus]}>
                  {phase}
                </Label>
                {stage ? ` · ${stage}` : null}
              </StackItem>
            ) : null}
            {message ? <StackItem>{message}</StackItem> : null}
            {moref ? (
              <StackItem>
                {t('MOREF')}: {moref}
              </StackItem>
            ) : null}
          </Stack>
        ) : (
          <span className="text-muted">{t('Empty')}</span>
        )
      }
      helpContent={t(
        'Toehold template used to clone copy appliances for this provider. Shows build phase, stage, and the vCenter template reference when ready.',
      )}
      testId="toehold-template-detail-item"
      title={t('Template')}
    />
  );
};

export default ToeholdTemplateDetailsItem;
