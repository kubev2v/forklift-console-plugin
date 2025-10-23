import type { FC, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import SmartLinkify from '@components/common/SmartLinkify';
import type { V1beta1Plan, V1beta1PlanStatusConditions } from '@kubev2v/types';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Stack,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { getPlanURL } from '@utils/crds/plans/utils';
import { isEmpty } from '@utils/helpers';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

type PlanPreserveIPWarningsAlertsProps = PropsWithChildren & {
  plan: V1beta1Plan;
  conditions: V1beta1PlanStatusConditions[] | undefined;
};
const PlanPreserveIPWarningsAlerts: FC<PlanPreserveIPWarningsAlertsProps> = ({
  conditions,
  plan,
}) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();

  if (isEmpty(conditions)) return null;

  return (
    <>
      {conditions?.map((condition) => (
        <Alert
          title={t('The plan migration might not work as expected')}
          variant={AlertVariant.warning}
        >
          <Stack hasGutter>
            <TextContent className="forklift-providers-list-header__alert">
              <Text component={TextVariants.p}>
                <SmartLinkify>{condition?.message ?? ''}</SmartLinkify>
                {isEmpty(condition?.items) ? (
                  ' '
                ) : (
                  <ForkliftTrans>
                    {' '}
                    To troubleshoot, check the{' '}
                    <Button
                      isInline
                      variant={ButtonVariant.link}
                      onClick={() => {
                        navigate(`${getPlanURL(plan)}/vms`);
                      }}
                    >
                      Virtual machines tab
                    </Button>
                    .
                  </ForkliftTrans>
                )}
              </Text>
            </TextContent>
          </Stack>
        </Alert>
      ))}
    </>
  );
};

export default PlanPreserveIPWarningsAlerts;
