import { validateContainerImage } from 'src/utils/validation/common';

describe('validateContainerImage', () => {
  it('should return true for valid container images', () => {
    const images = [
      'my-registry/my-repo/my-image:my-tag',
      'localhost:5000/my-repo/my-image:my-tag',
      'my-repo/my-image@sha256:389d6e4ec6277e14d3684195be4d0531ff666ff8a8ee9e6bb56837dec642283f',
      'my-registry/my-repo/my-image',
    ];
    for (const image of images) {
      expect(validateContainerImage(image)).toBe(true);
    }
  });

  it('should return false for invalid container images', () => {
    const images = ['my-repo/my+image:my-tag', 'my-repo/my-image@sha256'];
    for (const image of images) {
      expect(validateContainerImage(image)).toBe(false);
    }
  });
});
