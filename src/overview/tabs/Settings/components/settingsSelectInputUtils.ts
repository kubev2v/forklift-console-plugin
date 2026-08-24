export type Option = {
  description?: string;
  key: number | string;
  name: string;
};

export type BlankOption = {
  description?: string;
  name: string;
};

export const BLANK_OPTION_KEY = '__blank__';

export type SettingsSelectHandler = (event?: unknown, selectedValue?: string | number) => void;

export const buildNameToKeyMap = (
  options: Option[],
  blankOption?: { name: string },
): Record<string, string | number> => {
  const dict =
    options?.reduce<Record<string, string | number>>((acc, option) => {
      acc[option.name] = option.key;
      return acc;
    }, {}) ?? {};

  if (blankOption) {
    dict[blankOption.name] = BLANK_OPTION_KEY;
  }

  return dict;
};

export const buildKeyToNameMap = (
  options: Option[],
  blankOption?: { name: string },
): Record<string, string | number> => {
  const dict =
    options?.reduce<Record<string, string | number>>((acc, option) => {
      acc[option.key] = option.name;
      return acc;
    }, {}) ?? {};

  if (blankOption) {
    dict[BLANK_OPTION_KEY] = blankOption.name;
  }

  return dict;
};

export const resolveSelectedValue = ({
  blankOption,
  keyToName,
  showKeyAsSelected,
  value,
}: {
  blankOption?: { name: string };
  keyToName: Record<string, string | number>;
  showKeyAsSelected: boolean;
  value: number | string;
}): string | number => {
  if (showKeyAsSelected) {
    return blankOption && value === '' ? blankOption.name : value;
  }

  return keyToName?.[value] ?? value;
};

export const createSettingsSelectHandler = (
  nameToKey: Record<string, string | number>,
  onChange: (value: number | string) => void,
  setIsOpen: (open: boolean) => void,
): SettingsSelectHandler => {
  return (_event?: unknown, selectedValue?: string | number): void => {
    if (selectedValue === undefined) {
      setIsOpen(false);
      return;
    }

    const key = nameToKey[selectedValue] ?? selectedValue;
    onChange(key === BLANK_OPTION_KEY ? '' : key);
    setIsOpen(false);
  };
};
