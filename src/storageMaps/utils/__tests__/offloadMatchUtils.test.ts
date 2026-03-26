import { deriveMatchStatus, deriveSuggestedProduct } from '../offloadMatchUtils';
import { OffloadMatchStatus, StorageVendorProduct } from '../types';

describe('deriveMatchStatus', () => {
  const { Ontap, PureFlashArray, PowerStore } = StorageVendorProduct;

  describe('returns Incomplete when fewer than 2 values are defined', () => {
    it.each([
      ['all undefined', undefined, undefined, undefined],
      ['only datastoreVendor', Ontap, undefined, undefined],
      ['only storageClassVendor', undefined, Ontap, undefined],
      ['only selectedProduct', undefined, undefined, Ontap],
    ])('%s', (_label, dsVendor, scVendor, product) => {
      expect(deriveMatchStatus(dsVendor, scVendor, product)).toBe(OffloadMatchStatus.Incomplete);
    });
  });

  describe('returns Optimal when all defined values are equal', () => {
    it.each([
      ['all three equal', Ontap, Ontap, Ontap],
      ['datastoreVendor + storageClassVendor equal', Ontap, Ontap, undefined],
      ['datastoreVendor + selectedProduct equal', Ontap, undefined, Ontap],
      ['storageClassVendor + selectedProduct equal', undefined, Ontap, Ontap],
    ])('%s', (_label, dsVendor, scVendor, product) => {
      expect(deriveMatchStatus(dsVendor, scVendor, product)).toBe(OffloadMatchStatus.Optimal);
    });
  });

  describe('returns Suboptimal when defined values differ', () => {
    it.each([
      ['all three differ', Ontap, PureFlashArray, PowerStore],
      ['all three, two same one different', Ontap, Ontap, PureFlashArray],
      ['datastoreVendor + storageClassVendor differ, no product', Ontap, PureFlashArray, undefined],
      [
        'datastoreVendor + selectedProduct differ, no storageClassVendor',
        Ontap,
        undefined,
        PureFlashArray,
      ],
      [
        'storageClassVendor + selectedProduct differ, no datastoreVendor',
        undefined,
        Ontap,
        PureFlashArray,
      ],
    ])('%s', (_label, dsVendor, scVendor, product) => {
      expect(deriveMatchStatus(dsVendor, scVendor, product)).toBe(OffloadMatchStatus.Suboptimal);
    });
  });
});

describe('deriveSuggestedProduct', () => {
  const { Ontap, PureFlashArray } = StorageVendorProduct;

  it('returns the common vendor when both match', () => {
    expect(deriveSuggestedProduct(Ontap, Ontap)).toBe(Ontap);
  });

  it('returns datastoreVendor when both defined but differ', () => {
    expect(deriveSuggestedProduct(Ontap, PureFlashArray)).toBe(Ontap);
  });

  it('returns datastoreVendor when only it is defined', () => {
    expect(deriveSuggestedProduct(Ontap, undefined)).toBe(Ontap);
  });

  it('returns storageClassVendor when only it is defined', () => {
    expect(deriveSuggestedProduct(undefined, PureFlashArray)).toBe(PureFlashArray);
  });

  it('returns undefined when neither is defined', () => {
    expect(deriveSuggestedProduct(undefined, undefined)).toBeUndefined();
  });
});
