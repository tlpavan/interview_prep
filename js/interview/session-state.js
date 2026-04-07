export const sessionState = {
  userName: null,
  interviewType: null,   // technical | hr
  domain: null,          // e.g. dsa | web development | cloud
  difficulty: null,      // easy | medium | hard
  totalQuestions: 0,
  askedQuestions: 0,
  scores: {
    confidence: 0,
    vocabulary: 0,
    technical: 0
  }
};
