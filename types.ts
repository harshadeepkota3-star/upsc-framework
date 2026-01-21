
export interface PrelimsQuestion {
  type: string;
  question: string;
  options: { [key: string]: string };
  correctAnswer: string;
}

export interface MainsQuestion {
  type: string;
  question: string;
  answerStructure: string[];
}

export interface MultiDimPoint {
    points: string[];
    crux: string;
}

export interface InterviewQuestion {
    type: string;
    question: string;
    answer: string;
}

export interface PYQ {
  year: number;
  exam: string;
  question: string;
}

export interface ValidatedPoint {
  point: string;
  source: string;
  verificationStatus: 'Verified' | 'Partially Verified' | 'Data Not Found';
}

export interface NewsArticle {
  title: string;
  source: string;
  summary: string;
  publishedDate: string;
}

export interface FrameworkData {
  topicBrief: string;
  whatYouNeedToKnow: {
    introduction: string[];
    whyThisIsCritical: string;
  };
  liveNewsFeed: NewsArticle[];
  multiDimensionalAnalysis: {
    regulatoryInstitutional: MultiDimPoint;
    governancePolicyFailure: MultiDimPoint;
    technicalInfrastructure: MultiDimPoint;
    disasterSecurityConflict: MultiDimPoint;
    economicGlobalRepercussions: MultiDimPoint;
    socialCulturalEthical: MultiDimPoint;
  };
  sourceValidation: {
      summary: string;
      validatedPoints: ValidatedPoint[];
  };
  previousYearQuestions: PYQ[];
  prelimsQuestions: PrelimsQuestion[];
  mainsQuestions: MainsQuestion[];
  interviewQuestions: InterviewQuestion[];
  whatExaminerIsTesting: string[];
  finalThoughts: string;
  relatedTopics: string[];
}

export interface Source {
  web: {
    uri: string;
    title: string;
  };
}