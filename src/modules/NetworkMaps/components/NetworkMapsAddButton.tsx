import { type FC, type Ref, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModelRef } from '@kubev2v/types';
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
          {t('Create network map')}
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
          data-testid="create-network-map-form"
          onClick={() => {
            trackEvent(TELEMETRY_EVENTS.NETWORK_MAP_CREATE_STARTED, {
              creationMethod: CreationMethod.Form,
              namespace,
            });
            navigate(`/k8s/networkMaps/create/form`);
          }}
        >
          {t('Create with form')}
        </DropdownItem>

        <DropdownItem
          key="yaml"
          data-testid="create-network-map-yaml"
          onClick={() => {
            trackEvent(TELEMETRY_EVENTS.NETWORK_MAP_CREATE_STARTED, {
              creationMethod: CreationMethod.YamlEditor,
              namespace,
            });
            navigate(`${networkMapsListUrl}/~new`);
          }}
        >
          {t('Create with YAML')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default NetworkMapsAddButton;
