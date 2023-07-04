import React, { useEffect, useRef, useState } from 'react';

export interface LoadingDotsProps {
  /**
   * Delay in Milliseconds
   */
  delayInMs?: number;
}

/**
 *  Port of the LoadingBox component from the console.
 *  Note that the component uses directly the CSS from the Console.
 *
 *  This components addresses following problems:
 *  1. flickering due to different spinners used by the Console and by the plugin. Solved by using the same component.
 *  2. loading state (which results in flickering) when user enters for the second time an extension page (although data is cached). Solved by using a delay.
 *
 * `See` https://github.com/openshift/console/blob/52cf627de2e8e4164176fc49edbea9c8a5ed4c92/frontend/public/components/utils/status-box.tsx#L70
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/LoadingDots/LoadingDots.tsx)
 */
export const LoadingDots = ({ delayInMs = 500 }: LoadingDotsProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [showDots, setShowDots] = useState(false);
  useEffect(() => {
    timerRef.current = setTimeout(() => setShowDots(true), delayInMs);
    return () => clearTimeout(timerRef.current);
  });

  if (!showDots) {
    return null;
  }

  return (
    <div className="cos-status-box cos-status-box--loading loading-box loading-box__loading">
      <div className="co-m-loader co-an-fade-in-out" data-test="loading-indicator">
        <div className="co-m-loader-dot__one" />
        <div className="co-m-loader-dot__two" />
        <div className="co-m-loader-dot__three" />
      </div>
    </div>
  );
};
