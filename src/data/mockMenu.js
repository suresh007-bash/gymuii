export const MENU_ITEMS = [
  { id: 'm1', name: 'Grilled Chicken Salad', category: 'Protein', price: 320, image: '/images/grilled_chicken_salad_1781339721580.png', rating: 4.9, prepTime: 14, calories: 380, protein: 42, carbs: 12, fat: 18, description: 'Tender grilled chicken breast on a bed of mixed greens with cherry tomatoes and light vinaigrette', tags: ['High Protein', 'Low Carb'], available: true },
  { id: 'm2', name: 'Vegan Power Bowl', category: 'Salads', price: 280, image: '/images/vegan_power_bowl_1781339735108.png', rating: 4.7, prepTime: 8, calories: 420, protein: 18, carbs: 52, fat: 14, description: 'Quinoa base with roasted vegetables, chickpeas, avocado and tahini dressing', tags: ['Vegan', 'High Fiber'], available: true },
  { id: 'm3', name: 'Salmon & Asparagus', category: 'Protein', price: 520, image: '/images/salmon_asparagus_1781339745880.png', rating: 4.8, prepTime: 18, calories: 450, protein: 38, carbs: 8, fat: 28, description: 'Pan-seared Atlantic salmon with grilled asparagus and lemon butter sauce', tags: ['High Protein', 'Keto'], available: true },
  { id: 'm4', name: 'Whey Protein Shake', category: 'Smoothies', price: 180, image: '/images/whey_protein_shake_1781339757035.png', rating: 4.6, prepTime: 5, calories: 250, protein: 30, carbs: 20, fat: 6, description: 'Premium whey protein blended with banana, almond milk and peanut butter', tags: ['High Protein', 'Post-Workout'], available: true },
  { id: 'm5', name: 'Keto Beef Bowl', category: 'Protein', price: 450, image: '/images/keto_beef_bowl_1781339778415.png', rating: 4.8, prepTime: 20, calories: 520, protein: 45, carbs: 5, fat: 35, description: 'Grass-fed beef with cauliflower rice, avocado and cheese', tags: ['Keto', 'High Protein'], available: true },
  { id: 'm6', name: 'Oatmeal & Berries', category: 'Snacks', price: 150, image: '/images/oatmeal_berries_1781339790972.png', rating: 4.5, prepTime: 6, calories: 320, protein: 12, carbs: 48, fat: 8, description: 'Steel-cut oats with fresh mixed berries, honey and chia seeds', tags: ['High Fiber', 'Breakfast'], available: true },
];

export const CATEGORIES = ['All', 'Protein', 'Salads', 'Smoothies', 'Snacks', 'Keto', 'Vegan'];

export const NUTRIENT_PACKS = [
  { id: 'np1', name: 'Lean & Clean Pack', createdBy: 'o1', creatorRole: 'owner', items: ['m1', 'm4', 'm6'], totalCalories: 950, totalProtein: 84, price: 599, description: 'Perfect for weight loss - balanced meals throughout the day', available: true },
  { id: 'np2', name: 'Muscle Builder Pack', createdBy: 't1', creatorRole: 'trainer', items: ['m5', 'm8', 'm4'], totalCalories: 1450, totalProtein: 130, price: 999, description: 'High protein pack for serious muscle gains', available: true },
  { id: 'np3', name: 'Vegan Vitality Pack', createdBy: 'k1', creatorRole: 'kitchen', items: ['m2', 'm6'], totalCalories: 740, totalProtein: 30, price: 399, description: 'Plant-based nutrition for optimal health', available: true },
  { id: 'np4', name: 'Keto Power Pack', createdBy: 'o1', creatorRole: 'owner', items: ['m3', 'm5'], totalCalories: 970, totalProtein: 83, price: 899, description: 'Ultra low-carb meals for ketogenic lifestyle', available: true },
];

export const OFFERS = [
  { id: 'of1', title: '30% Off First Order', subtitle: 'Use code FITFIRST', bg: 'linear-gradient(135deg, #FC4F04, #FF6B2B)', emoji: '🔥' },
  { id: 'of2', title: 'Free Protein Shake', subtitle: 'On orders above ₹500', bg: 'linear-gradient(135deg, #4ECDC4, #44A08D)', emoji: '🥤' },
  { id: 'of3', title: 'Weekly Meal Plan', subtitle: 'Save ₹200 on subscriptions', bg: 'linear-gradient(135deg, #667eea, #764ba2)', emoji: '📅' },
  { id: 'of4', title: 'Refer & Earn ₹100', subtitle: 'For each friend who joins', bg: 'linear-gradient(135deg, #f093fb, #f5576c)', emoji: '🎁' },
  { id: 'of5', title: 'Trainer Special', subtitle: 'Diet plans at 50% off', bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', emoji: '💪' },
  { id: 'of6', title: 'Midnight Munchies', subtitle: 'Free delivery after 10 PM', bg: 'linear-gradient(135deg, #43e97b, #38f9d7)', emoji: '🌙' },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'sp1',
    name: 'Daily Fit',
    duration: 'Daily',
    price: 299,
    meals: 3,
    description: 'Perfect starter plan for healthy daily nutrition',
    features: [
      'Macro-tracked meals',
      'Free delivery',
      'Daily menu choice',
      'Calorie tracking',
      'Healthy meal plans',
      'Basic support'
    ]
  },
  {
    id: 'sp2',
    name: 'Weekly Warrior',
    duration: 'Weekly',
    price: 1799,
    meals: 21,
    description: 'Balanced weekly plan for fitness enthusiasts',
    features: [
      'Macro-tracked meals',
      'Free delivery',
      'Weekly menu rotation',
      '5% savings',
      'Trainer diet plans',
      'Meal scheduling'
    ]
  },
  {
    id: 'sp3',
    name: 'Monthly Champion',
    duration: 'Monthly',
    price: 5999,
    meals: 90,
    description: 'Premium monthly nutrition program for serious results',
    features: [
      'Macro-tracked meals',
      'Free delivery',
      'Priority support',
      'Custom menu',
      '15% savings',
      'Personal nutritionist'
    ]
  }
];

export const ACHIEVEMENTS = [
  { id: 'ach1', name: 'First Order', icon: '🏆', description: 'Placed your first order', unlocked: true },
  { id: 'ach2', name: '7-Day Streak', icon: '🔥', description: 'Ordered for 7 consecutive days', unlocked: true },
  { id: 'ach3', name: 'Protein Champion', icon: '💪', description: 'Hit protein target 10 times', unlocked: false },
  { id: 'ach4', name: 'Calorie Master', icon: '🎯', description: 'Stayed within calorie goal for 30 days', unlocked: false },
  { id: 'ach5', name: 'Community Star', icon: '⭐', description: 'Got 50 likes on community posts', unlocked: false },
  { id: 'ach6', name: 'Meal Prep Pro', icon: '👨‍🍳', description: 'Scheduled meals for an entire week', unlocked: true },
];
