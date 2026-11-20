import { type FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  Button,
  ButtonVariant,
  ExpandableSection,
  Form,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { isDefaultNetworkTarget } from '@utils/mappings/constants';

import { isNetworkIPModeEditableForTargetName } from './networkIPModeUtils';
import NetworkIPModeField from './NetworkIPModeField';

import './NetworkIPModeRow.style.scss';

type NetworkIPModeRowProps = {
  index: number;
  isDisabled?: boolean;
  targetNetworkFieldId: string;
};

const getNetworkIPModeFieldId = (index: number): string => `networkMap.${index}.networkIPMode`;

const NetworkIPModeRow: FC<NetworkIPModeRowProps> = ({ index, isDisabled, targetNetworkFieldId }) => {
  const { t } = useForkliftTranslation();
  const { setValue, watch } = useFormContext();
  const target = watch(targetNetworkFieldId) as { name?: string } | undefined;
  const show = isNetworkIPModeEditableForTargetName(target?.name, isDefaultNetworkTarget);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!show) {
    return null;
  }

  const fieldId = getNetworkIPModeFieldId(index);

  return (
    <div className="network-ip-mode">
      <Split className="network-ip-mode__header">
        <SplitItem isFilled>
          <ExpandableSection
            isExpanded={isExpanded}
            isIndented
            onToggle={(_e, expanded) => {
              setIsExpanded(expanded);
            }}
            toggleText={t('Network IP mode (optional)')}
          >
            <Form className="network-ip-mode__form">
              <NetworkIPModeField
                fieldId={fieldId}
                isDisabled={isDisabled}
                targetNetworkFieldId={targetNetworkFieldId}
              />
            </Form>
          </ExpandableSection>
        </SplitItem>
        <SplitItem className="network-ip-mode__clear-button-container">
          <Button
            className="network-ip-mode__clear-button"
            data-testid={`networkMap.${index}.networkIPMode-clear`}
            isInline
            onClick={() => {
              setValue(fieldId, undefined, { shouldDirty: true, shouldValidate: true });
              setIsExpanded(false);
            }}
            variant={ButtonVariant.link}
          >
            {t('Clear')}
          </Button>
        </SplitItem>
      </Split>
    </div>
  );
};

export default NetworkIPModeRow;
export { getNetworkIPModeFieldId };
