export type CreateLearningExperienceContextData = {
  showLearningPanelByContext?: boolean;
  learningExperienceContext?: number;
};

export type CreateLearningExperienceContextType = {
  userData?: CreateLearningExperienceContextData;
  setUserData: (userData: CreateLearningExperienceContextData) => void;
};
