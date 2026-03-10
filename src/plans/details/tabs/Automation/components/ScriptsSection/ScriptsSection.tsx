import type { FC } from 'react';
import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import SectionHeading from '@components/headers/SectionHeading';
import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import type { IoK8sApiCoreV1ConfigMap, V1beta1Plan } from '@forklift-ui/types';
import {
  getGroupVersionKindForModel,
  ResourceLink,
  useOverlay,
} from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Flex } from '@patternfly/react-core';
import { ConfigMapModel } from '@utils/constants';
import { getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import ScriptDetails from '../ScriptDetails/ScriptDetails';
import ScriptEdit from '../ScriptEdit/ScriptEdit';

type ScriptsSectionProps = {
  configMap: IoK8sApiCoreV1ConfigMap | undefined;
  plan: V1beta1Plan;
  scripts: CustomScript[];
};

const ScriptsSection: FC<ScriptsSectionProps> = ({ configMap, plan, scripts }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const planEditable = isPlanEditable(plan);
  const hasScripts = !isEmpty(scripts);

  const configMapName = configMap?.metadata?.name;
  const configMapNamespace = configMap?.metadata?.namespace ?? getNamespace(plan);

  return (
    <Flex direction={{ default: 'column' }}>
      {hasScripts && configMap ? (
        <>
          <SectionHeadingWithEdit
            editable={planEditable}
            title={t('Customization scripts')}
            onClick={() => {
              launchOverlay(ScriptEdit, { configMap, scripts });
            }}
            data-testid="scripts-section-edit-button"
            headingLevel="h3"
          />
          <DescriptionList>
            <DetailsItem
              testId="scripts-configmap"
              title={t('ConfigMap')}
              content={
                <ResourceLink
                  groupVersionKind={getGroupVersionKindForModel(ConfigMapModel)}
                  name={configMapName}
                  namespace={configMapNamespace}
                />
              }
            />
          </DescriptionList>
          {scripts.map((script) => (
            <ScriptDetails key={script.name} script={script} />
          ))}
        </>
      ) : (
        <>
          <SectionHeading text={t('Customization scripts')} headingLevel="h3" />
          <DescriptionList>
            <DetailsItem testId="scripts-none" title={t('Configured')} content={t('None')} />
          </DescriptionList>
        </>
      )}
    </Flex>
  );
};

export default ScriptsSection;
