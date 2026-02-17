export type VersionTuple = [number, number, number];

export type SkippableTest = {
  skip: (condition: boolean, description: string) => void;
};
