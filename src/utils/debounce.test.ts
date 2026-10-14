import { createCancellableDebounce } from './debounce';

const WAIT_MS = 100;

describe('createCancellableDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces successive calls and keeps the latest arguments', () => {
    const callback = jest.fn<undefined, [string]>();
    const debounced = createCancellableDebounce(callback, WAIT_MS);
    debounced('first');
    jest.advanceTimersByTime(WAIT_MS / 2);
    debounced('last');
    jest.advanceTimersByTime(WAIT_MS / 2);
    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(WAIT_MS / 2);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith('last');
  });

  it('flushes once synchronously and does not run again when the old timer expires', () => {
    const callback = jest.fn<undefined, [string]>();
    const debounced = createCancellableDebounce(callback, WAIT_MS);
    debounced('first');
    debounced('last');
    debounced.flush();
    expect(callback).toHaveBeenLastCalledWith('last');
    debounced.flush();
    jest.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(1);
    debounced('next');
    jest.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('next');
  });

  it('cancels pending arguments so later flushes and timers cannot restore canceled work', () => {
    const callback = jest.fn<undefined, [string]>();
    const debounced = createCancellableDebounce(callback, WAIT_MS);
    debounced('canceled');
    debounced.cancel();
    debounced.flush();
    jest.runAllTimers();
    expect(callback).not.toHaveBeenCalled();
    debounced('next');
    debounced.flush();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith('next');
  });
});
