import React from 'react';

import { Bullseye } from '@patternfly/react-core';

import { Loading } from './Loading';

export type SuspendProps = {
  obj: object;
  loaded: boolean;
  loadError: unknown;
  children?: React.ReactNode;
};

/**
 * A wrapper component that uses React Suspense to handle loading states.
 * Renders the children only when the data has been loaded successfully and there are no errors.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.obj - The object representing the data to be displayed.
 * @param {boolean} props.loaded - Indicates whether the data has finished loading.
 * @param {unknown} props.loadError - Any error that occurred during the loading process.
 * @param {React.ReactNode} [props.children] - The content to be rendered once the data is loaded.
 *
 * @returns {JSX.Element} The JSX element containing the children or a loading indicator.
 */
export const Suspend: React.FC<SuspendProps> = ({ children, loaded, loadError, obj }) => {
  if (obj && loaded && !loadError) {
    return <>{children}</>;
  }

  return (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
};
