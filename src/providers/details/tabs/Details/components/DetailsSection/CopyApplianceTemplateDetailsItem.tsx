import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import {
  CopyApplianceTemplateModelGroupVersionKind,
  type V1beta1CopyApplianceTemplate,
} from '@forklift-ui/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Stack, StackItem } from '@patternfly/react-core';
import { PF_LABEL_STATUS } from '@utils/constants';
import { getNamespace } from '@utils/crds/common/selectors';
import { getCopyApplianceTemplateName } from '@utils/crds/providers/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';

import type { ProviderDetailsItemProps } from './utils/types';

const phaseStatus = {
  Failed: PF_LABEL_STATUS.DANGER,
  Pending: PF_LABEL_STATUS.WARNING,
  Running: PF_LABEL_STATUS.INFO,
  Succeeded: PF_LABEL_STATUS.SUCCESS,
} as const;

const CopyApplianceTemplateDetailsItem: FC<ProviderDetailsItemProps> = ({ resource: provider }) => {
  const { t } = useForkliftTranslation();
  const namespace = getNamespace(provider);
  const templateName = getCopyApplianceTemplateName(provider);

  const [copyApplianceTemplate] = useK8sWatchResource<V1beta1CopyApplianceTemplate>(
    templateName && namespace
      ? {
          groupVersionKind: CopyApplianceTemplateModelGroupVersionKind,
          name: templateName,
          namespace,
          namespaced: true,
        }
      : null,
  );

  const { message, phase, stage, template } = copyApplianceTemplate?.status ?? {};
  const moref = template?.moref;

  return (
    <DetailsItem
      content={
        templateName && namespace ? (
          <Stack>
            <StackItem>
              <ResourceLink
                groupVersionKind={CopyApplianceTemplateModelGroupVersionKind}
                name={templateName}
                namespace={namespace}
              />
            </StackItem>
            {phase ? (
              <StackItem>
                <Label isCompact status={phaseStatus[phase]}>
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
          <span className="text-muted">-</span>
        )
      }
      helpContent={t(
        'CopyApplianceTemplate used to clone copy appliances for this provider. Shows build phase, stage, and the vCenter template reference when ready.',
      )}
      testId="copy-appliance-template-detail-item"
      title={t('Template')}
    />
  );
};

export default CopyApplianceTemplateDetailsItem;
