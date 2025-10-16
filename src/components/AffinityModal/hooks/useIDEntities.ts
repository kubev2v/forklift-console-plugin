import { useCallback, useState } from 'react';

import type { IDEntity } from '../utils/types';

export const useIDEntities = <T extends IDEntity = IDEntity>(initialEntities: T[] = []) => {
  const [entities, setEntities] = useState<T[]>(initialEntities);
  const [initialEntitiesChanged, setInitialEntitiesChanged] = useState<boolean>(false);

  const onEntityAdd = useCallback(
    (newEntity: T) => {
      setInitialEntitiesChanged(true);
      const id = entities[entities.length - 1]?.id + 1 || 0;
      setEntities([...entities, { ...newEntity, id }]);
    },
    [entities],
  );

  const onEntityChange = useCallback(
    (updatedEntity: T) => {
      setInitialEntitiesChanged(true);
      setEntities(
        entities.map((entity) => {
          if (entity.id === updatedEntity.id) {
            return updatedEntity;
          }
          return entity;
        }),
      );
    },
    [entities],
  );

  const onEntityDelete = useCallback(
    (idToDelete: number) => {
      setInitialEntitiesChanged(true);
      setEntities(entities.filter(({ id }) => id !== idToDelete));
    },
    [entities],
  );

  return {
    entities,
    initialEntitiesChanged,
    onEntityAdd,
    onEntityChange,
    onEntityDelete,
    setEntities,
  };
};
