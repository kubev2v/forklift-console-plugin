import type { FC, PropsWithChildren } from 'react';

import type { V1beta1PlanStatusConditions } from '@kubev2v/types';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type PlanCriticalAlertsProps = PropsWithChildren & {
  conditions: V1beta1PlanStatusConditions[] | undefined;
  concerns: Map<string, number>;
  setIsDrawerOpen?: (isOpen: boolean) => void;
};

const PlanCriticalAlerts: FC<PlanCriticalAlertsProps> = ({
  concerns,
  conditions,
  setIsDrawerOpen,
}) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(conditions) && isEmpty(concerns)) return null;

  return (
    <Alert
      data-testid="plan-critical-alert"
      title={`${(conditions?.length ?? 0) + concerns?.size} ${t('critical concerns impacting your migration plan')}`}
      variant={AlertVariant.danger}
    >
      <Content component={ContentVariants.p}>
        <Stack hasGutter>
          <StackItem>
            {t('Migration can not start until these critical concerns are resolved.')}
          </StackItem>
          <StackItem>
            <Button
              data-testid="view-all-critical-concerns-button"
              variant={ButtonVariant.link}
              isInline
              onClick={() => {
                setIsDrawerOpen?.(true);
              }}
            >
              {t('View all critical concerns')}
            </Button>
          </StackItem>
        </Stack>
      </Content>
    </Alert>
  );
};

export default PlanCriticalAlerts;
