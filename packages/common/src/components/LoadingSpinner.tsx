import React, { FC, PropsWithChildren } from 'react';

import { Spinner, SpinnerProps } from '@patternfly/react-core';

type LoadingSpinnerProps = PropsWithChildren &
  SpinnerProps & {
    isLoading: boolean;
  };

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ isLoading, children, ...spinnerProps }) =>
  isLoading ? <Spinner {...spinnerProps} /> : <>{children}</>;

export default LoadingSpinner;
