import { type FC, type Ref, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModelRef } from '@forklift-ui/types';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { CreationMethod, TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getResourceUrl } from '@utils/getResourceUrl';

const StorageMapsAddButton: FC<{ namespace?: string; testId?: string }> = ({
  namespace,
  testId,
}) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const storageMapsListUrl = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: StorageMapModelRef,
  });

  return (
    <Dropdown
      isOpen={isMenuOpen}
      onOpenChange={(isOpen: boolean) => {
        setIsMenuOpen(isOpen);
      }}
      data-testid={testId}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
          isExpanded={isMenuOpen}
          variant={ButtonVariant.primary}
        >
          {t('Create storage map')}
        </MenuToggle>
      )}
      shouldFocusFirstItemOnOpen={false}
      popperProps={{
        position: 'right',
      }}
    >
      <DropdownList>
        <DropdownItem
          key="form"
          onClick={() => {
            trackEvent(TELEMETRY_EVENTS.STORAGE_MAP_CREATE_STARTED, {
              creationMethod: CreationMethod.Form,
              namespace,
            });
            navigate(`/k8s/storageMaps/create/form`);
          }}
        >
          {t('Create with form')}
        </DropdownItem>

        <DropdownItem
          key="yaml"
          onClick={() => {
            trackEvent(TELEMETRY_EVENTS.STORAGE_MAP_CREATE_STARTED, {
              creationMethod: CreationMethod.YamlEditor,
              namespace,
            });
            navigate(`${storageMapsListUrl}/~new`);
          }}
        >
          {t('Create with YAML')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default StorageMapsAddButton;
