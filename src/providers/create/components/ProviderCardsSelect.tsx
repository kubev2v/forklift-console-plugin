import type { FC } from 'react';
import { SelectableCard } from 'src/modules/Providers/utils/components/Gallery/SelectableCard';
import { SelectableGallery } from 'src/modules/Providers/utils/components/Gallery/SelectableGallery';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import type { V1beta1Provider } from '@kubev2v/types';
import { Flex, FlexItem, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getType } from '@utils/crds/common/selectors';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';
import { useForkliftTranslation } from '@utils/i18n';

import { providerCardItems } from '../utils/providerCardItems';

type ProviderCardsSelectProps = {
  newProvider: V1beta1Provider;
  handleProviderTypeChange: (type: string | null) => void;
};

const ProviderCardsSelect: FC<ProviderCardsSelectProps> = ({
  handleProviderTypeChange,
  newProvider,
}) => {
  const { t } = useForkliftTranslation();
  const isDarkTheme = useIsDarkTheme();
  const providerItems = providerCardItems(isDarkTheme);

  return (
    <FormGroupWithHelpText label={t('Provider type')} isRequired fieldId="ProviderType">
      {getType(newProvider) ? (
        <Flex>
          <FlexItem className="forklift--create-provider-edit-card-selected">
            <SelectableCard
              title={providerItems[getType(newProvider) ?? '']?.title}
              titleLogo={providerItems[getType(newProvider) ?? '']?.logo}
              onChange={() => {
                handleProviderTypeChange(null);
              }}
              isSelected
              isCompact
              content={
                <Tooltip
                  isVisible
                  content={<div>{t('Click to select a different provider from the list.')}</div>}
                >
                  <HelperText>
                    <HelperTextItem variant="default">{t('Click to unselect')}</HelperTextItem>
                  </HelperText>
                </Tooltip>
              }
            />
          </FlexItem>
        </Flex>
      ) : (
        <SelectableGallery
          selectedID={getType(newProvider)}
          items={providerItems}
          onChange={handleProviderTypeChange}
        />
      )}
    </FormGroupWithHelpText>
  );
};

export default ProviderCardsSelect;
