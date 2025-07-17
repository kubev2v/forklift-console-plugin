import type { FC } from 'react';
import progressIcon from 'src/components/images/resources/progress.svg';

const ProgressIcon: FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <img src={progressIcon} alt="Progress" {...props} />
);

export default ProgressIcon;
