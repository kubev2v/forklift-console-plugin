import { act, renderHook } from '@testing-library/react';

import type { IDEntity } from '../../utils/types';
import { useIDEntities } from '../useIDEntities';

type Entity = IDEntity & { name: string };

describe('useIDEntities', () => {
  it('initializes with provided entities and unchanged flag', () => {
    const { result } = renderHook(() => useIDEntities<Entity>([{ id: 1, name: 'a' }]));

    expect(result.current.entities).toEqual([{ id: 1, name: 'a' }]);
    expect(result.current.initialEntitiesChanged).toBe(false);
  });

  it('defaults to an empty list', () => {
    const { result } = renderHook(() => useIDEntities<Entity>());

    expect(result.current.entities).toEqual([]);
  });

  it('adds entities with incremental ids starting at 0', () => {
    const { result } = renderHook(() => useIDEntities<Entity>());

    act(() => {
      result.current.onEntityAdd({ id: -1, name: 'first' });
    });
    act(() => {
      result.current.onEntityAdd({ id: -1, name: 'second' });
    });

    expect(result.current.entities).toEqual([
      { id: 0, name: 'first' },
      { id: 1, name: 'second' },
    ]);
    expect(result.current.initialEntitiesChanged).toBe(true);
  });

  it('continues ids from the last entity', () => {
    const { result } = renderHook(() =>
      useIDEntities<Entity>([
        { id: 5, name: 'a' },
        { id: 8, name: 'b' },
      ]),
    );

    act(() => {
      result.current.onEntityAdd({ id: -1, name: 'c' });
    });

    expect(result.current.entities[2]).toEqual({ id: 9, name: 'c' });
  });

  it('updates a matching entity by id', () => {
    const { result } = renderHook(() =>
      useIDEntities<Entity>([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ]),
    );

    act(() => {
      result.current.onEntityChange({ id: 2, name: 'updated' });
    });

    expect(result.current.entities).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'updated' },
    ]);
    expect(result.current.initialEntitiesChanged).toBe(true);
  });

  it('deletes an entity by id', () => {
    const { result } = renderHook(() =>
      useIDEntities<Entity>([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
      ]),
    );

    act(() => {
      result.current.onEntityDelete(1);
    });

    expect(result.current.entities).toEqual([{ id: 2, name: 'b' }]);
    expect(result.current.initialEntitiesChanged).toBe(true);
  });

  it('supports setEntities for bulk replacement', () => {
    const { result } = renderHook(() => useIDEntities<Entity>([{ id: 1, name: 'a' }]));

    act(() => {
      result.current.setEntities([{ id: 9, name: 'z' }]);
    });

    expect(result.current.entities).toEqual([{ id: 9, name: 'z' }]);
    expect(result.current.initialEntitiesChanged).toBe(false);
  });
});
