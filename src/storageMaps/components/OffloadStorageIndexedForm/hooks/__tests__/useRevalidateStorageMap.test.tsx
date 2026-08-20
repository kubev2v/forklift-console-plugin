import type { FC, ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { OffloadPlugin } from 'src/storageMaps/utils/types';

import { describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { StorageMapFieldId } from '@utils/storage/types';

import { useRevalidateStorageMap } from '../useRevalidateStorageMap';

type TriggerFn = () => Promise<boolean>;
type HookProps = { plugin: string | undefined };

const createTriggerMock = (): jest.Mock<TriggerFn> => jest.fn<TriggerFn>().mockResolvedValue(true);

const createWrapper = (trigger: jest.Mock<TriggerFn>): FC<{ children: ReactNode }> => {
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => {
    const methods = useForm({ mode: 'onChange' });
    methods.trigger = trigger;

    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return Wrapper;
};

describe('useRevalidateStorageMap', () => {
  it('does not trigger parent validation on mount', () => {
    const trigger = createTriggerMock();

    renderHook(
      () => {
        useRevalidateStorageMap(undefined, undefined, undefined);
      },
      {
        wrapper: createWrapper(trigger),
      },
    );

    expect(trigger).not.toHaveBeenCalled();
  });

  it('triggers storageMap validation when an offload field changes', () => {
    const trigger = createTriggerMock();
    const initialProps: HookProps = { plugin: undefined };

    const { rerender } = renderHook(
      ({ plugin }: HookProps) => {
        useRevalidateStorageMap(plugin, undefined, undefined);
      },
      {
        initialProps,
        wrapper: createWrapper(trigger),
      },
    );

    rerender({ plugin: OffloadPlugin.CsiVolumeImport });

    expect(trigger).toHaveBeenCalledWith(StorageMapFieldId.StorageMap);
  });
});
