import type { FC } from 'react';

import { Bullseye, Spinner, Stack, StackItem, Title } from '@patternfly/react-core';

import './CreateProviderPlacementLoading.style.scss';

type CreateProviderPlacementLoadingProps = {
  label: string;
};

const CreateProviderPlacementLoading: FC<CreateProviderPlacementLoadingProps> = ({ label }) => (
  <Bullseye className="create-provider-placement-loading">
    <Stack hasGutter>
      <StackItem>
        <Bullseye>
          <Spinner aria-label={label} size="lg" />
        </Bullseye>
      </StackItem>
      <StackItem>
        <Title headingLevel="h4" size="md">
          {label}
        </Title>
      </StackItem>
    </Stack>
  </Bullseye>
);

export default CreateProviderPlacementLoading;
