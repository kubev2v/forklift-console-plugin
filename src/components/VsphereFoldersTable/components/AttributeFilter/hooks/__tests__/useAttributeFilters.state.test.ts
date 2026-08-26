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

describe('useAttributeFilters - state', () => {
  it('initializes with first attribute active and no filters', () => {
    const { result } = renderHook(() => useAttributeFilters(attributes));

    expect(result.current.activeId).toBe('name');
    expect(result.current.hasAttrFilters).toBe(false);
    expect(result.current.text).toEqual({});
    expect(result.current.checks).toEqual({});
    expect(result.current.predicate({ name: 'any', power: 'on' })).toBe(true);
  });

  it('sets text values and builds chips', () => {
    const { result } = renderHook(() => useAttributeFilters(attributes));

    act(() => {
      result.current.setTextValue('name', 'web');
    });

    expect(result.current.text.name).toBe('web');
    expect(result.current.hasAttrFilters).toBe(true);
    expect(result.current.chipsByAttr.name).toEqual(['web']);
    expect(result.current.predicate({ name: 'web-01', power: 'on' })).toBe(true);
    expect(result.current.predicate({ name: 'db-01', power: 'on' })).toBe(false);
  });

  it('toggles checkbox options and filters by selected values', () => {
    const { result } = renderHook(() => useAttributeFilters(attributes));

    act(() => {
      result.current.toggleCheck('power', 'on');
    });
    expect(result.current.checks.power.has('on')).toBe(true);
    expect(result.current.chipsByAttr.power).toEqual(['On']);
    expect(result.current.predicate({ name: 'a', power: 'on' })).toBe(true);
    expect(result.current.predicate({ name: 'a', power: 'off' })).toBe(false);

    act(() => {
      result.current.toggleCheck('power', 'on');
    });
    expect(result.current.checks.power.has('on')).toBe(false);
  });

  it('clearAll resets text, checks, and activeId', () => {
    const { result } = renderHook(() => useAttributeFilters(attributes));

    act(() => {
      result.current.setActiveId('power');
      result.current.setTextValue('name', 'web');
      result.current.toggleCheck('power', 'on');
    });
    act(() => {
      result.current.clearAll();
    });

    expect(result.current.text).toEqual({});
    expect(result.current.checks).toEqual({});
    expect(result.current.activeId).toBe('name');
    expect(result.current.hasAttrFilters).toBe(false);
  });

  it('uses empty activeId when attributes array is empty', () => {
    const { result } = renderHook(() => useAttributeFilters<Item>([]));
    expect(result.current.activeId).toBe('');
  });
});
