import React from 'react';
import { useForkliftTranslation } from 'src/utils';

export type AlignedDecimalProps = {
  /**
   * The number to align.
   */
  value: number;
  /**
   * (optional) units to be displayed next to the number. E.g 'MB', 'Cores'.
   */
  unit?: string;
  /**
   * (optional) The number fractional part precision, I.e, number of fractional digits to leave.
   */
  fractionalPrecision?: number;
};

export const AlignedDecimal: React.FC<AlignedDecimalProps> = ({
  fractionalPrecision = 2,
  unit = '',
  value,
}) => {
  const { t } = useForkliftTranslation();

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
