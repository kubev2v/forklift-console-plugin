import { renderHook } from '@testing-library/react';

import { useSlug } from '../useSlug';

describe('useSlug', () => {
  it('lowercases and replaces spaces with underscores', () => {
    const { result } = renderHook(() => useSlug());
    expect(result.current('My Folder Name')).toBe('my_folder_name');
  });

  it('strips non word characters except hyphen', () => {
    const { result } = renderHook(() => useSlug());
    expect(result.current('A/B:C-D!')).toBe('abc-d');
  });

  it('returns cached values for repeated inputs', () => {
    const { result } = renderHook(() => useSlug());
    const first = result.current('Cache Me');
    const second = result.current('Cache Me');
    expect(first).toBe('cache_me');
    expect(second).toBe(first);
  });

  it('handles empty string', () => {
    const { result } = renderHook(() => useSlug());
    expect(result.current('')).toBe('');
  });
});
