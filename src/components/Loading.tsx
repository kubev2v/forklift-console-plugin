import type { FC } from 'react';

/**
 * A functional component that renders a loading indicator.
 *
 * @returns {JSX.Element} The JSX element representing the loading indicator.
 */
const Loading: FC = () => (
  <div className="co-m-loader co-an-fade-in-out" data-testid="loading-indicator-plan-yaml">
    <div className="co-m-loader-dot__one" />
    <div className="co-m-loader-dot__two" />
    <div className="co-m-loader-dot__three" />
  </div>
);

export default Loading;
