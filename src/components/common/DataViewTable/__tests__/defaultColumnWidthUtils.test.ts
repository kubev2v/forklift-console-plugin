import type { DefaultColumnWidth } from '../defaultColumnWidthTypes';
import { allocateDefaultColumnWidths } from '../defaultColumnWidthUtils';

const column = (weight: number, minWidth = 50, padding = 44): DefaultColumnWidth => ({
  minWidth,
  padding,
  weight,
});

const expectTotal = (widths: number[], total: number): void => {
  expect(widths.reduce((sum, width) => sum + width, 0)).toBeCloseTo(total, 8);
};

describe('allocateDefaultColumnWidths', () => {
  it('normalizes weights within the remaining data-column budget', () => {
    expect(allocateDefaultColumnWidths(600, [column(3, 100), column(1)])).toEqual([450, 150]);
  });

  it('reserves compact minimums and distributes the rest by weight', () => {
    expect(allocateDefaultColumnWidths(300, [column(3, 100), column(1, 100)])).toEqual([200, 100]);
  });

  it('relaxes preferred minimums when they would otherwise overflow', () => {
    const widths = allocateDefaultColumnWidths(200, [
      column(3, 100),
      column(2, 100),
      column(1, 100),
    ]);
    expectTotal(widths, 200);
    expect(widths.every((width) => width >= 44)).toBe(true);
  });

  it('accounts for actual header padding rather than forcing widths below it', () => {
    expect(allocateDefaultColumnWidths(300, [column(1, 50, 80), column(3, 100, 44)])).toEqual([
      80, 220,
    ]);
  });

  it('keeps fractional measurements without rounding or storage clamping', () => {
    const widths = allocateDefaultColumnWidths(833.125, [column(3, 100), column(1)]);
    expect(widths).toEqual([624.84375, 208.28125]);
    expectTotal(widths, 833.125);
  });

  it('normalizes again when visible columns change', () => {
    const columns = [column(3, 100), column(2, 100), column(1)];
    expect(allocateDefaultColumnWidths(600, columns)).toEqual([300, 200, 100]);
    expect(allocateDefaultColumnWidths(600, columns.slice(0, 2))).toEqual([360, 240]);
    expect(columns).toEqual([column(3, 100), column(2, 100), column(1)]);
  });

  it.each([0, -1, NaN, Infinity])('ignores an invalid preference weight: %s', (weight) => {
    expect(allocateDefaultColumnWidths(600, [column(weight), column(2)])).toEqual([200, 400]);
  });

  it('does not invent columns for an empty layout', () => {
    expect(allocateDefaultColumnWidths(600, [])).toEqual([]);
  });
});
