import type { FC, PropsWithChildren } from 'react';
import Linkify from 'react-linkify';

const SmartLinkify: FC<PropsWithChildren> = ({ children }) => {
  const linkifyDecorator = (decoratedHref: string, decoratedText: string, key: number) => {
    // Only linkify if the original text actually contains http/https protocol
    if (decoratedText.includes('http://') || decoratedText.includes('https://')) {
      return (
        <a href={decoratedHref} key={key} rel="noopener noreferrer" target="_blank">
          {decoratedText}
        </a>
      );
    }

    return decoratedText;
  };

  return <Linkify componentDecorator={linkifyDecorator}>{children}</Linkify>;
};

export default SmartLinkify;
