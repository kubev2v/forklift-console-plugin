import { type FC, type Ref, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModelRef } from '@forklift-ui/types';
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

const NetworkMapsAddButton: FC<{ namespace?: string; testId?: string }> = ({
  namespace,
  testId,
}) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useForkliftAnalytics();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const networkMapsListUrl = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: NetworkMapModelRef,
  });

  return (
    <Dropdown
      data-testid={testId}
      isOpen={isMenuOpen}
      onOpenChange={(isOpen: boolean) => {
        setIsMenuOpen(isOpen);
      }}
      popperProps={{
        position: 'right',
      }}
      shouldFocusFirstItemOnOpen={false}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          isExpanded={isMenuOpen}
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
          ref={toggleRef}
          variant={ButtonVariant.primary}
        >
          {t('Create network map')}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem
          data-testid="create-network-map-dropdown-item-form"
          key="form"
          onClick={() => {
            trackEvent(TELEMETRY_EVENTS.NETWORK_MAP_CREATE_STARTED, {
              creationMethod: CreationMethod.Form,
              namespace,
            });
            navigate(`/k8s/networkMaps/create/form`)?.catch(() => undefined);
          }}
        >
          {t('Create with form')}
        </DropdownItem>

        <DropdownItem
          data-testid="create-network-map-dropdown-item-yaml"
          key="yaml"
          onClick={() => {
            trackEvent(TELEMETRY_EVENTS.NETWORK_MAP_CREATE_STARTED, {
              creationMethod: CreationMethod.YamlEditor,
              namespace,
            });
            navigate(`${networkMapsListUrl}/~new`)?.catch(() => undefined);
          }}
        >
          {t('Create with YAML')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default NetworkMapsAddButton;
