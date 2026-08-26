import { act, renderHook } from '@testing-library/react';

import { type AttributeConfig, AttributeKind } from '../../utils/types';
import { useAttributeFilters } from '../useAttributeFilters';

type Item = { name: string; power: string };

const attributes: AttributeConfig<Item>[] = [
  {
    getValue: (item) => item.name,
    id: 'name',
    kind: AttributeKind.Text,
    label: 'Name',
  },
  {
    getValues: (item) => item.power,
    id: 'power',
    kind: AttributeKind.Checkbox,
    label: 'Power',
    options: [
      { id: 'on', label: 'On' },
      { id: 'off', label: 'Off' },
    ],
  },
];

describe('useAttributeFilters - chips', () => {
  it('deleteChip clears text attributes', () => {
    const { result } = renderHook(() => useAttributeFilters(attributes));

    act(() => {
      result.current.setTextValue('name', 'web');
    });
    act(() => {
      result.current.deleteChip('name', 'web');
    });

    expect(result.current.text.name).toBe('');
    expect(result.current.chipsByAttr.name).toEqual([]);
  });

  it('deleteChip toggles matching checkbox option', () => {
    const { result } = renderHook(() => useAttributeFilters(attributes));

    act(() => {
      result.current.toggleCheck('power', 'on');
    });
    act(() => {
      result.current.deleteChip('power', 'On');
    });

    expect(result.current.checks.power.has('on')).toBe(false);
  });

  it('deleteChip and deleteChipGroup are no-ops for unknown attr ids', () => {
    const { result } = renderHook(() => useAttributeFilters(attributes));

    act(() => {
      result.current.setTextValue('name', 'web');
      result.current.toggleCheck('power', 'on');
    });
    act(() => {
      result.current.deleteChip('missing', 'web');
      result.current.deleteChipGroup('missing');
    });

    expect(result.current.text.name).toBe('web');
    expect(result.current.checks.power.has('on')).toBe(true);
  });

  it('deleteChipGroup clears text or checkbox groups', () => {
    const { result } = renderHook(() => useAttributeFilters(attributes));

    act(() => {
      result.current.setTextValue('name', 'web');
      result.current.toggleCheck('power', 'on');
      result.current.toggleCheck('power', 'off');
    });
    act(() => {
      result.current.deleteChipGroup('name');
      result.current.deleteChipGroup('power');
    });

    expect(result.current.text.name).toBe('');
    expect(result.current.checks.power.size).toBe(0);
  });

  it('clearText and clearChecks wipe individual attribute state', () => {
    const { result } = renderHook(() => useAttributeFilters(attributes));

    act(() => {
      result.current.setTextValue('name', 'web');
      result.current.toggleCheck('power', 'on');
    });
    act(() => {
      result.current.clearText('name');
      result.current.clearChecks('power');
    });

    expect(result.current.text.name).toBe('');
    expect(result.current.checks.power.size).toBe(0);
  });
});
