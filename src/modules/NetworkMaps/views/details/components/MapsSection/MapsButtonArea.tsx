import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, ButtonVariant, Flex, FlexItem, Spinner } from '@patternfly/react-core';

type MapsButtonAreaProps = {
  hasChanges: boolean;
  updating: boolean;
  onUpdate: () => void;
  onCancel: () => void;
};

const MapsButtonArea: FC<MapsButtonAreaProps> = ({ hasChanges, onCancel, onUpdate, updating }) => {
  const { t } = useForkliftTranslation();

  return (
    <Flex className="forklift-network-map__details-tab--update-button">
      <FlexItem>
        <Button
          variant={ButtonVariant.primary}
          onClick={onUpdate}
          isDisabled={!hasChanges || updating}
          icon={updating ? <Spinner size="sm" /> : undefined}
        >
          {t('Update mappings')}
        </Button>
      </FlexItem>
      <FlexItem>
        <Button
          variant={ButtonVariant.secondary}
          onClick={onCancel}
          isDisabled={!hasChanges || updating}
        >
          {t('Cancel')}
        </Button>
      </FlexItem>
    </Flex>
  );
};

export default MapsButtonArea;
