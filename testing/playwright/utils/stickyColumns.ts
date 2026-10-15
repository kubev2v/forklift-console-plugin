import { writeFile } from 'node:fs/promises';

import { expect, type Locator, test } from '@playwright/test';

const CELL_INTERIOR_INSET_PX = 1;
const FULLY_OPAQUE_ALPHA = 255;
const GEOMETRY_PRECISION = 1;
const MAX_GEOMETRY_ATTEMPTS = 3;
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;

export const expectStickyCellOpaque = async (cell: Locator): Promise<void> => {
  await expect(cell).toHaveCSS('position', 'sticky');
  const opacity = await cell.evaluate((element): number => {
    const color = getComputedStyle(element).backgroundColor;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to read the sticky cell background color');
    }
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data[3];
  });
  expect(opacity).toBe(FULLY_OPAQUE_ALPHA);
};

const screenshotCellInterior = async (cell: Locator): Promise<Buffer> => {
  const box = await cell.boundingBox();
  if (!box) {
    throw new Error('The sticky cell is not visible');
  }
  // Collapsed table borders are shared with neighboring cells; inspect the painted cell interior.
  return cell.page().screenshot({
    animations: 'disabled',
    clip: {
      height: box.height - CELL_INTERIOR_INSET_PX * 2,
      width: box.width - CELL_INTERIOR_INSET_PX * 2,
      x: box.x + CELL_INTERIOR_INSET_PX,
      y: box.y + CELL_INTERIOR_INSET_PX,
    },
  });
};

const captureStickyCellComparison = async (cell: Locator): Promise<[Buffer, Buffer]> => {
  const withUnderlyingData = await screenshotCellInterior(cell);
  await cell.evaluate((element): void => {
    for (const sibling of Array.from(element.parentElement?.children ?? [])) {
      if (sibling instanceof HTMLElement && getComputedStyle(sibling).position !== 'sticky') {
        sibling.style.opacity = '0';
      }
    }
  });
  try {
    const withoutUnderlyingData = await screenshotCellInterior(cell);
    return [withUnderlyingData, withoutUnderlyingData];
  } finally {
    await cell.evaluate((element): void => {
      for (const sibling of Array.from(element.parentElement?.children ?? [])) {
        if (sibling instanceof HTMLElement && getComputedStyle(sibling).position !== 'sticky') {
          sibling.style.removeProperty('opacity');
        }
      }
    });
  }
};

const haveSameDimensions = (before: Buffer, after: Buffer): boolean =>
  before.readUInt32BE(PNG_WIDTH_OFFSET) === after.readUInt32BE(PNG_WIDTH_OFFSET) &&
  before.readUInt32BE(PNG_HEIGHT_OFFSET) === after.readUInt32BE(PNG_HEIGHT_OFFSET);

const attachComparison = async (before: Buffer, after: Buffer): Promise<void> => {
  const beforePath = test.info().outputPath('sticky-cell-with-data.png');
  const afterPath = test.info().outputPath('sticky-cell-without-data.png');
  await writeFile(beforePath, before);
  await writeFile(afterPath, after);
  await test.info().attach('sticky-cell-with-data', { contentType: 'image/png', path: beforePath });
  await test
    .info()
    .attach('sticky-cell-without-data', { contentType: 'image/png', path: afterPath });
};

export const expectStickyCellToCoverData = async (cell: Locator): Promise<void> => {
  await cell.evaluate(async (): Promise<void> => {
    await document.fonts.ready;
  });
  for (let attempt = 0; attempt < MAX_GEOMETRY_ATTEMPTS; attempt += 1) {
    const [before, after] = await captureStickyCellComparison(cell);
    // Async row controls can change row height between screenshots; do not compare different crops.
    if (haveSameDimensions(before, after)) {
      const matches = before.equals(after);
      if (!matches) {
        await attachComparison(before, after);
      }
      expect(matches).toBe(true);
      return;
    }
  }
  throw new Error('The sticky cell geometry did not stabilize for the pixel comparison');
};

export const expectActionsPinned = async (cell: Locator): Promise<void> => {
  const geometry = await cell.evaluate((element) => {
    const scroller = element.closest('table')?.parentElement;
    return {
      cellRight: element.getBoundingClientRect().right,
      scrollRight: scroller?.getBoundingClientRect().right,
    };
  });
  expect(geometry.cellRight).toBeCloseTo(geometry.scrollRight ?? 0, GEOMETRY_PRECISION);
};
