import React, { PropsWithChildren } from 'react';

import { Spinner, SpinnerProps } from '@patternfly/react-core';

type LoadingSpinnerProps = PropsWithChildren &
  SpinnerProps & {
    isLoading: boolean;
  };

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  isLoading,
  children,
  ...spinnerProps
}) => (isLoading ? <Spinner {...spinnerProps} /> : children);
