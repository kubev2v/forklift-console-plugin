import type { FC } from 'react';

const Loading: FC = () => (
  <div
    className="co-m-loader co-an-fade-in-out"
    data-testid="loading-indicator-forklift-controller-yaml"
  >
    <div className="co-m-loader-dot__one" />
    <div className="co-m-loader-dot__two" />
    <div className="co-m-loader-dot__three" />
  </div>
);

export default Loading;
