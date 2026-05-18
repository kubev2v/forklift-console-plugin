export type VersionTuple = [number, number, number];

export type SkippableTest = {
  beforeEach: (fn: () => void) => void;
  skip: (condition: boolean, description: string) => void;
};
