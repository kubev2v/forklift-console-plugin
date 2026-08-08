import type { FC, PropsWithChildren, ReactNode } from 'react';

const HTTP_URL_PATTERN = /\bhttps?:\/\/[^\s<>'")\]]+/giu;

/**
 * Renders children text with http(s) URLs converted to clickable links.
 * Only http: and https: schemes are linkified — all others are left as plain text.
 */
const SmartLinkify: FC<PropsWithChildren> = ({ children }) => {
  if (typeof children !== 'string') {
    return <>{children}</>;
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  HTTP_URL_PATTERN.lastIndex = 0;

  for (
    let match = HTTP_URL_PATTERN.exec(children);
    match;
    match = HTTP_URL_PATTERN.exec(children)
  ) {
    const { index: matchStart } = match;
    const [url] = match;

    if (matchStart > lastIndex) {
      parts.push(children.slice(lastIndex, matchStart));
    }

    parts.push(
      <a href={url} key={`link-${matchStart}`} target="_blank" rel="noopener noreferrer">
        {url}
      </a>,
    );

    ({ lastIndex } = HTTP_URL_PATTERN);
  }

  if (lastIndex < children.length) {
    parts.push(children.slice(lastIndex));
  }

  return <>{parts}</>;
};

export default SmartLinkify;
