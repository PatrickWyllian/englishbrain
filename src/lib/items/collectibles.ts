export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: "badge_first_lesson", name: "Primeira Lição", description: "Complete sua primeira lição", icon: "Star", condition: "first_lesson" },
  { id: "badge_streak_7", name: "Sequência de 7", description: "Mantenha uma sequência de 7 dias", icon: "Flame", condition: "streak_7" },
  { id: "badge_level_10", name: "Nível 10", description: "Alcance o nível 10", icon: "Trophy", condition: "level_10" },
  { id: "badge_100_lessons", name: "Centenário", description: "Complete 100 lições", icon: "BookOpen", condition: "lessons_100" },
  { id: "badge_first_craft", name: "Primeira Forja", description: "Crafe seu primeiro item", icon: "Hammer", condition: "first_craft" },
  { id: "badge_vocab_master", name: "Mestre do Vocabulário", description: "Aprenda 500 palavras", icon: "Brain", condition: "vocab_500" },
];

export interface SceneCard {
  id: string;
  series: string;
  character: string;
  quote: string;
  episode?: string;
}

export const SCENE_CARDS: SceneCard[] = [
  { id: "card_office_1", series: "The Office", character: "Michael Scott", quote: "That's what she said.", episode: "The Injury" },
  { id: "card_office_2", series: "The Office", character: "Dwight Schrute", quote: "Identity theft is not a joke, Jim!", episode: "Product Recall" },
  { id: "card_office_3", series: "The Office", character: "Kevin Malone", quote: "Why waste time say lot word when few word do trick?", episode: "Customer Survey" },
  { id: "card_friends_1", series: "Friends", character: "Joey Tribbiani", quote: "How you doin'?", episode: "Pilot" },
  { id: "card_friends_2", series: "Friends", character: "Ross Geller", quote: "We were on a break!", episode: "The One Where Ross and Rachel Take a Break" },
  { id: "card_friends_3", series: "Friends", character: "Chandler Bing", quote: "Could this BE any more obvious?", episode: "The One With The Yeti" },
  { id: "card_office_4", series: "The Office", character: "Jim Halpert", quote: "Right, right, right, right, right... oh yeah, no, I agree with you.", episode: "Diversity Day" },
  { id: "card_friends_4", series: "Friends", character: "Phoebe Buffay", quote: "Smelly cat, smelly cat, what are they feeding you?", episode: "The One With The Baby On The Bus" },
];
