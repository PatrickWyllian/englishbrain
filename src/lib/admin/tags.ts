export const PREDEFINED_TAGS = [
  "the-office",
  "friends",
  "tech",
  "business",
  "travel",
  "gaming",
  "science",
  "music",
  "movies",
  "food",
  "sports",
  "health",
  "education",
  "finance",
  "fashion",
  "nature",
  "history",
  "art",
] as const;

export type PredefinedTag = (typeof PREDEFINED_TAGS)[number];
