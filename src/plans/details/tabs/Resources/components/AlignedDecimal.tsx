import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { EMPTY_MSG } from '@utils/constants';

import './AlignedDecimel.scss';

type AlignedDecimalProps = {
  value: number;
  unit?: string;
  fractionalPrecision?: number;
};

const AlignedDecimal: FC<AlignedDecimalProps> = ({ fractionalPrecision = 2, unit = '', value }) => {
  const { t } = useForkliftTranslation();

  if (!value || isNaN(value)) {
    return EMPTY_MSG;
  }

  const [integerPart, fractionalPart] = value.toFixed(fractionalPrecision).split('.');
  const formattedFractionalPart = fractionalPrecision === 0 ? ' ' : `.${fractionalPart}`;

  return (
    <div>
      <div className="forklift-page-plan-resources-td-integer">{integerPart}</div>
      <div className="forklift-page-plan-resources-td-fractional">
        {formattedFractionalPart}&nbsp;&nbsp;{t(unit)}
      </div>
    </div>
  );
};

export default AlignedDecimal;
