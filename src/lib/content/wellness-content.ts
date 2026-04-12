import type { RecipeData } from '@/types/ai';

export interface WellnessVideo {
  title: string;
  url: string;
}

export interface InspireItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'mindfulness' | 'breathing' | 'meditation' | string;
  link: string;
}

/** Deterministic shuffle / pick without mutating source */
export function pickRotatingItems<T extends { id: string }>(items: T[], seed: number, count: number): T[] {
  if (!items.length || count <= 0) return [];
  const n = items.length;
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed % 1_000_000_007;
  for (let k = 0; k < count; k++) {
    s = (s * 48271 + k) % 1_000_000_007;
    let idx = s % n;
    let guard = 0;
    while (used.has(idx) && guard < n) {
      idx = (idx + 1) % n;
      guard++;
    }
    used.add(idx);
    out.push(items[idx]!);
  }
  return out;
}

export const fallbackVideos: WellnessVideo[] = [
  {
    title: '10 Min Morning Yoga Full Body Stretch',
    url: 'https://www.youtube.com/watch?v=2cxcGwDZNWQ',
  },
  {
    title: '15 Min Beginner Full Body Workout (No Equipment)',
    url: 'https://www.youtube.com/watch?v=xCSaHRtgw1w',
  },
];

export const fallbackInspiration: InspireItem[] = [
  {
    id: 'inspire-1',
    title: 'Mindful Reset',
    description:
      'Take 2 minutes to observe your breath and body sensations before your next task.',
    duration: '2 min',
    category: 'mindfulness',
    link: 'https://www.youtube.com/watch?v=C5L8Z3qA1DA',
  },
  {
    id: 'inspire-2',
    title: 'Deep Breath Before Sleep',
    description: 'Use slow inhale-exhale cycles to reduce stress before bedtime.',
    duration: '5 min',
    category: 'breathing',
    link: 'https://www.youtube.com/watch?v=Evgx9yX2Vw8',
  },
  {
    id: 'inspire-3',
    title: 'Meditation Starter',
    description: 'Practice stillness with a guided beginner meditation.',
    duration: '10 min',
    category: 'meditation',
    link: 'https://www.youtube.com/watch?v=GqB5kYFD7bk',
  },
  {
    id: 'inspire-4',
    title: 'Simple Evening Unwind',
    description: 'Lower mental load by breathing slowly and relaxing your shoulders and jaw.',
    duration: '4 min',
    category: 'breathing',
    link: 'https://www.youtube.com/watch?v=2K4T9HmEhWE',
  },
];

export const fallbackRecipes: RecipeData[] = [
  {
    id: 'r1',
    name: 'Green Moong & Cucumber Chaat',
    description: 'Refreshing Indian-style salad with moong sprouts, cucumber, herbs, and lemon.',
    prepTime: '15 min',
    cookTime: '0 min',
    servings: 2,
    difficulty: 'Easy',
    ingredients: ['Moong sprouts', 'Cucumber', 'Mint', 'Coriander', 'Roasted cumin', 'Lemon', 'Black salt'],
    instructions: [
      'Rinse sprouts and chopped cucumber.',
      'Mix with chopped mint and coriander.',
      'Season with cumin, black salt, and lemon.',
      'Serve chilled.',
    ],
    dietaryTags: ['Plant Based', 'Vegan', 'Gluten-free', 'Green Salad', 'Balanced'],
    cookVideoTitle: 'Sprouted Moong Chaat Recipe',
    cookVideoUrl: 'https://www.youtube.com/embed/2Y_qvWgs34Q?cc_load_policy=1',
    foodFact: 'Moong sprouts provide plant protein, fiber, and micronutrients with very low calories.',
  },
  {
    id: 'r2',
    name: 'Palak Apple Peanut Salad',
    description: 'Crunchy spinach salad with apple, roasted peanuts, and citrus dressing.',
    prepTime: '12 min',
    cookTime: '0 min',
    servings: 2,
    difficulty: 'Easy',
    ingredients: ['Spinach', 'Apple', 'Roasted peanuts', 'Carrot', 'Lime', 'Black pepper'],
    instructions: [
      'Wash and dry spinach thoroughly.',
      'Slice apple and grate carrot.',
      'Whisk lime juice with pepper.',
      'Toss all ingredients and top with peanuts.',
    ],
    dietaryTags: ['Plant Based', 'Vegetarian', 'Green Salad', 'Balanced'],
    cookVideoTitle: 'Spinach Apple Salad Tutorial',
    cookVideoUrl: 'https://www.youtube.com/embed/yIoWLkMRryY?cc_load_policy=1',
    foodFact: 'Spinach and citrus together can improve iron absorption from plant foods.',
  },
  {
    id: 'r3',
    name: 'Vegan Millet Stuffed Bell Peppers',
    description: 'Baked bell peppers filled with seasoned millet, peas, and herbs.',
    prepTime: '15 min',
    cookTime: '25 min',
    servings: 3,
    difficulty: 'Moderate',
    ingredients: ['Bell peppers', 'Cooked millet', 'Green peas', 'Onion', 'Ginger', 'Turmeric', 'Coriander'],
    instructions: [
      'Preheat oven to 190C.',
      'Saute onion, ginger, spices, and peas.',
      'Mix in cooked millet and herbs.',
      'Stuff peppers and bake until tender.',
    ],
    dietaryTags: ['Plant Based', 'Vegan', 'Gluten-free', 'Balanced'],
    cookVideoTitle: 'Vegan Stuffed Peppers Guide',
    cookVideoUrl: 'https://www.youtube.com/embed/AWdEO9F_ukQ?cc_load_policy=1',
    foodFact: 'Millets are naturally gluten-free and provide slow-release carbohydrates.',
  },
  {
    id: 'r4',
    name: 'Ragi Vegetable Wrap',
    description: 'High-fiber ragi wrap with sauteed vegetables and mint chutney.',
    prepTime: '20 min',
    cookTime: '15 min',
    servings: 2,
    difficulty: 'Moderate',
    ingredients: ['Ragi flour', 'Onion', 'Capsicum', 'Cabbage', 'Mint chutney', 'Lemon'],
    instructions: [
      'Prepare soft ragi dough and cook thin rotis.',
      'Saute vegetables briefly on medium heat.',
      'Spread mint chutney on roti.',
      'Fill and roll into wraps.',
    ],
    dietaryTags: ['Plant Based', 'Vegan', 'High Protein', 'Balanced'],
    cookVideoTitle: 'High Protein Ragi Wrap Recipe',
    cookVideoUrl: 'https://www.youtube.com/embed/_r66qwUszNk?cc_load_policy=1',
    foodFact: 'Ragi is rich in calcium and supports satiety due to its fiber content.',
  },
  {
    id: 'r5',
    name: 'Tofu Methi Stir Bowl',
    description: 'Quick vegan bowl with tofu, fenugreek leaves, and mixed vegetables.',
    prepTime: '10 min',
    cookTime: '15 min',
    servings: 2,
    difficulty: 'Easy',
    ingredients: ['Firm tofu', 'Fresh methi leaves', 'Bell pepper', 'Garlic', 'Soy sauce', 'Sesame'],
    instructions: [
      'Pan-sear tofu cubes until golden.',
      'Saute garlic and vegetables.',
      'Add methi and soy sauce, then toss tofu back in.',
      'Top with sesame and serve warm.',
    ],
    dietaryTags: ['Plant Based', 'Vegan', 'Green Meal', 'Low Carb', 'Balanced'],
    cookVideoTitle: 'Healthy Tofu Stir Fry Tutorial',
    cookVideoUrl: 'https://www.youtube.com/embed/iVfxS9Bu_14?cc_load_policy=1',
    foodFact: 'Fenugreek leaves are nutrient-dense and add a naturally bitter-sweet flavor profile.',
  },
];
