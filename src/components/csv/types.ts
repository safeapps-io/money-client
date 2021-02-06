export type FileParsedToBinary = {
  filename: string;
  data: ArrayBuffer;
};

export type SetSchemeOnboardingSteps =
  | 'unknown'
  | 'isBank'
  | 'notBank'
  | 'settings'
  | 'main'
  | 'finish';
