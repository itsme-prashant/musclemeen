/* =====================================================================
   MuscularMen – Indian food database (approximate values per serving)
   ---------------------------------------------------------------------
   Values are typical for home-style cooking and are estimates only;
   restaurant food usually has more oil. Extend freely:
     id, name, serving (description), kcal, p (protein g), c (carbs g),
     f (fat g), diet ('veg' | 'egg' | 'nonveg'), cat (grocery aisle),
     raw (optional: [ingredient to buy, grams per serving])
   ===================================================================== */
const FOOD_DB = [
  // ---------- grains & breads ----------
  { id: 'roti', name: 'Roti / chapati', serving: '1 medium (no ghee)', kcal: 110, p: 3.5, c: 21, f: 1.5, diet: 'veg', cat: 'Grains', raw: ['Whole-wheat atta', 35] },
  { id: 'millet-roti', name: 'Jowar / bajra roti', serving: '1 medium', kcal: 120, p: 3.5, c: 22, f: 2, diet: 'veg', cat: 'Grains', raw: ['Jowar / bajra flour', 35] },
  { id: 'paratha', name: 'Plain paratha', serving: '1 medium', kcal: 230, p: 5, c: 30, f: 10, diet: 'veg', cat: 'Grains', raw: ['Whole-wheat atta', 50] },
  { id: 'aloo-paratha', name: 'Aloo paratha', serving: '1 medium', kcal: 290, p: 6, c: 40, f: 11, diet: 'veg', cat: 'Grains', raw: ['Whole-wheat atta', 50] },
  { id: 'rice', name: 'White rice, cooked', serving: '1 cup (150 g)', kcal: 195, p: 4, c: 43, f: 0.4, diet: 'veg', cat: 'Grains', raw: ['Rice', 50] },
  { id: 'brown-rice', name: 'Brown rice, cooked', serving: '1 cup (150 g)', kcal: 215, p: 5, c: 45, f: 1.8, diet: 'veg', cat: 'Grains', raw: ['Brown rice', 50] },
  { id: 'jeera-rice', name: 'Jeera rice', serving: '1 cup', kcal: 240, p: 4, c: 43, f: 5, diet: 'veg', cat: 'Grains', raw: ['Rice', 50] },
  { id: 'veg-pulao', name: 'Vegetable pulao', serving: '1 cup', kcal: 250, p: 5, c: 40, f: 8, diet: 'veg', cat: 'Grains', raw: ['Rice', 50] },
  { id: 'khichdi', name: 'Dal khichdi', serving: '1 bowl (250 g)', kcal: 250, p: 9, c: 40, f: 6, diet: 'veg', cat: 'Grains', raw: ['Rice + moong dal', 70] },
  { id: 'poha', name: 'Poha', serving: '1 plate (200 g)', kcal: 270, p: 5, c: 45, f: 8, diet: 'veg', cat: 'Grains', raw: ['Poha (flattened rice)', 60] },
  { id: 'upma', name: 'Rava upma', serving: '1 plate (200 g)', kcal: 280, p: 6, c: 40, f: 10, diet: 'veg', cat: 'Grains', raw: ['Rava / sooji', 60] },
  { id: 'idli', name: 'Idli', serving: '2 pieces', kcal: 120, p: 4, c: 25, f: 0.5, diet: 'veg', cat: 'Grains', raw: ['Idli batter', 120] },
  { id: 'dosa', name: 'Plain dosa', serving: '1 medium', kcal: 170, p: 4, c: 28, f: 5, diet: 'veg', cat: 'Grains', raw: ['Dosa batter', 100] },
  { id: 'masala-dosa', name: 'Masala dosa', serving: '1 large', kcal: 350, p: 7, c: 50, f: 13, diet: 'veg', cat: 'Grains', raw: ['Dosa batter', 120] },
  { id: 'oats', name: 'Oats (dry)', serving: '40 g', kcal: 150, p: 5, c: 27, f: 2.8, diet: 'veg', cat: 'Grains', raw: ['Rolled oats', 40] },
  { id: 'bread', name: 'Whole-wheat bread', serving: '1 slice', kcal: 70, p: 3.5, c: 12, f: 1, diet: 'veg', cat: 'Grains', raw: ['Whole-wheat bread (slices)', 1] },
  { id: 'quinoa', name: 'Quinoa, cooked', serving: '1 cup', kcal: 220, p: 8, c: 39, f: 3.5, diet: 'veg', cat: 'Grains', raw: ['Quinoa', 60] },
  { id: 'sweet-potato', name: 'Sweet potato, boiled', serving: '150 g', kcal: 130, p: 2.4, c: 30, f: 0.2, diet: 'veg', cat: 'Vegetables', raw: ['Sweet potato', 150] },
  // ---------- pulses & legumes ----------
  { id: 'dal', name: 'Dal (moong / toor)', serving: '1 bowl (200 ml)', kcal: 180, p: 10, c: 26, f: 4, diet: 'veg', cat: 'Pulses', raw: ['Moong / toor dal', 45] },
  { id: 'rajma', name: 'Rajma curry', serving: '1 bowl', kcal: 230, p: 12, c: 33, f: 6, diet: 'veg', cat: 'Pulses', raw: ['Rajma (dry)', 50] },
  { id: 'chole', name: 'Chole', serving: '1 bowl', kcal: 260, p: 12, c: 35, f: 8, diet: 'veg', cat: 'Pulses', raw: ['Kabuli chana (dry)', 50] },
  { id: 'sambar', name: 'Sambar', serving: '1 bowl', kcal: 140, p: 6, c: 20, f: 4, diet: 'veg', cat: 'Pulses', raw: ['Toor dal', 25] },
  { id: 'sprouts', name: 'Sprouts chaat', serving: '1 bowl (150 g)', kcal: 150, p: 10, c: 24, f: 2, diet: 'veg', cat: 'Pulses', raw: ['Moong sprouts', 150] },
  { id: 'besan-chilla', name: 'Besan chilla', serving: '1 medium', kcal: 150, p: 7, c: 17, f: 6, diet: 'veg', cat: 'Pulses', raw: ['Besan', 40] },
  { id: 'moong-chilla', name: 'Moong dal chilla', serving: '1 medium', kcal: 140, p: 8, c: 18, f: 4, diet: 'veg', cat: 'Pulses', raw: ['Moong dal', 40] },
  { id: 'roasted-chana', name: 'Roasted chana', serving: '40 g', kcal: 150, p: 8, c: 23, f: 2.4, diet: 'veg', cat: 'Snacks', raw: ['Roasted chana', 40] },
  { id: 'soya-chunks', name: 'Soya chunks (dry)', serving: '50 g', kcal: 172, p: 26, c: 16, f: 0.3, diet: 'veg', cat: 'Protein', raw: ['Soya chunks', 50] },
  { id: 'soya-curry', name: 'Soya chunk curry', serving: '1 bowl (50 g dry soya)', kcal: 250, p: 27, c: 20, f: 7, diet: 'veg', cat: 'Protein', raw: ['Soya chunks', 50] },
  { id: 'tofu', name: 'Tofu (firm)', serving: '100 g', kcal: 145, p: 15, c: 3, f: 8.5, diet: 'veg', cat: 'Protein', raw: ['Tofu', 100] },
  { id: 'tofu-bhurji', name: 'Tofu bhurji', serving: '1 bowl (150 g tofu)', kcal: 250, p: 21, c: 7, f: 15, diet: 'veg', cat: 'Protein', raw: ['Tofu', 150] },
  { id: 'dhokla', name: 'Dhokla', serving: '4 pieces', kcal: 160, p: 6, c: 25, f: 4, diet: 'veg', cat: 'Snacks', raw: ['Besan', 40] },
  // ---------- dairy ----------
  { id: 'paneer', name: 'Paneer', serving: '100 g', kcal: 265, p: 18, c: 3.5, f: 20, diet: 'veg', cat: 'Dairy', raw: ['Paneer', 100] },
  { id: 'lowfat-paneer', name: 'Low-fat paneer', serving: '100 g', kcal: 180, p: 20, c: 4, f: 9, diet: 'veg', cat: 'Dairy', raw: ['Low-fat paneer', 100] },
  { id: 'paneer-bhurji', name: 'Paneer bhurji', serving: '1 bowl (100 g paneer)', kcal: 320, p: 19, c: 8, f: 24, diet: 'veg', cat: 'Dairy', raw: ['Paneer', 100] },
  { id: 'paneer-tikka', name: 'Paneer tikka', serving: '150 g', kcal: 360, p: 26, c: 8, f: 25, diet: 'veg', cat: 'Dairy', raw: ['Paneer', 150] },
  { id: 'palak-paneer', name: 'Palak paneer', serving: '1 bowl (75 g paneer)', kcal: 300, p: 15, c: 10, f: 22, diet: 'veg', cat: 'Dairy', raw: ['Paneer', 75] },
  { id: 'curd', name: 'Curd / dahi (toned)', serving: '1 cup (200 g)', kcal: 120, p: 7, c: 9, f: 6, diet: 'veg', cat: 'Dairy', raw: ['Curd', 200] },
  { id: 'hung-curd', name: 'Hung curd / Greek yogurt', serving: '200 g', kcal: 150, p: 18, c: 8, f: 5, diet: 'veg', cat: 'Dairy', raw: ['Greek yogurt / hung curd', 200] },
  { id: 'milk', name: 'Milk (toned)', serving: '250 ml', kcal: 150, p: 8, c: 12, f: 7.5, diet: 'veg', cat: 'Dairy', raw: ['Milk (ml)', 250] },
  { id: 'skim-milk', name: 'Skimmed milk', serving: '250 ml', kcal: 85, p: 8.5, c: 12, f: 0.3, diet: 'veg', cat: 'Dairy', raw: ['Skimmed milk (ml)', 250] },
  { id: 'buttermilk', name: 'Buttermilk / chaas', serving: '250 ml', kcal: 40, p: 2.5, c: 4.5, f: 1, diet: 'veg', cat: 'Dairy', raw: ['Curd', 60] },
  { id: 'lassi', name: 'Sweet lassi', serving: '250 ml', kcal: 220, p: 7, c: 35, f: 6, diet: 'veg', cat: 'Dairy' },
  { id: 'raita', name: 'Raita', serving: '1 bowl', kcal: 90, p: 4, c: 7, f: 5, diet: 'veg', cat: 'Dairy', raw: ['Curd', 120] },
  { id: 'whey', name: 'Whey protein', serving: '1 scoop (30 g)', kcal: 120, p: 24, c: 3, f: 1.5, diet: 'veg', cat: 'Protein', raw: ['Whey protein (scoops)', 1] },
  { id: 'cheese', name: 'Cheese slice', serving: '1 slice', kcal: 60, p: 3.5, c: 1.5, f: 4.5, diet: 'veg', cat: 'Dairy' },
  // ---------- eggs ----------
  { id: 'egg', name: 'Boiled egg', serving: '1 large', kcal: 72, p: 6.3, c: 0.4, f: 4.8, diet: 'egg', cat: 'Protein', raw: ['Eggs (count)', 1] },
  { id: 'egg-white', name: 'Egg white', serving: '1 large', kcal: 17, p: 3.6, c: 0.2, f: 0, diet: 'egg', cat: 'Protein', raw: ['Eggs (count)', 1] },
  { id: 'omelette', name: 'Masala omelette', serving: '2 eggs', kcal: 200, p: 13, c: 3, f: 15, diet: 'egg', cat: 'Protein', raw: ['Eggs (count)', 2] },
  { id: 'egg-bhurji', name: 'Egg bhurji', serving: '2 eggs', kcal: 220, p: 13, c: 4, f: 17, diet: 'egg', cat: 'Protein', raw: ['Eggs (count)', 2] },
  { id: 'egg-curry', name: 'Egg curry', serving: '1 bowl (2 eggs)', kcal: 280, p: 14, c: 9, f: 21, diet: 'egg', cat: 'Protein', raw: ['Eggs (count)', 2] },
  // ---------- chicken, fish & meat ----------
  { id: 'chicken-breast', name: 'Chicken breast, grilled', serving: '100 g cooked', kcal: 165, p: 31, c: 0, f: 3.6, diet: 'nonveg', cat: 'Protein', raw: ['Chicken breast (raw)', 130] },
  { id: 'chicken-curry', name: 'Chicken curry', serving: '1 bowl (150 g chicken)', kcal: 330, p: 32, c: 8, f: 19, diet: 'nonveg', cat: 'Protein', raw: ['Chicken (raw)', 180] },
  { id: 'tandoori-chicken', name: 'Tandoori chicken', serving: '2 leg pieces (200 g)', kcal: 300, p: 38, c: 4, f: 14, diet: 'nonveg', cat: 'Protein', raw: ['Chicken legs (raw)', 260] },
  { id: 'chicken-tikka', name: 'Chicken tikka', serving: '6 pieces (150 g)', kcal: 250, p: 36, c: 5, f: 9, diet: 'nonveg', cat: 'Protein', raw: ['Chicken breast (raw)', 190] },
  { id: 'chicken-keema', name: 'Chicken keema', serving: '1 bowl (150 g)', kcal: 280, p: 30, c: 6, f: 15, diet: 'nonveg', cat: 'Protein', raw: ['Chicken mince (raw)', 180] },
  { id: 'chicken-biryani', name: 'Chicken biryani', serving: '1 plate (300 g)', kcal: 500, p: 25, c: 60, f: 17, diet: 'nonveg', cat: 'Protein' },
  { id: 'fish-curry', name: 'Fish curry', serving: '1 bowl (150 g fish)', kcal: 260, p: 28, c: 6, f: 13, diet: 'nonveg', cat: 'Protein', raw: ['Fish (rohu / surmai)', 180] },
  { id: 'grilled-fish', name: 'Grilled / tandoori fish', serving: '150 g', kcal: 210, p: 33, c: 2, f: 8, diet: 'nonveg', cat: 'Protein', raw: ['Fish fillet', 180] },
  { id: 'prawns', name: 'Prawns, cooked', serving: '100 g', kcal: 100, p: 24, c: 0.2, f: 0.3, diet: 'nonveg', cat: 'Protein', raw: ['Prawns', 120] },
  { id: 'mutton-curry', name: 'Mutton curry', serving: '1 bowl (150 g)', kcal: 400, p: 30, c: 8, f: 28, diet: 'nonveg', cat: 'Protein', raw: ['Mutton', 180] },
  // ---------- vegetables ----------
  { id: 'mixed-veg', name: 'Mixed vegetable sabzi', serving: '1 bowl', kcal: 120, p: 3, c: 12, f: 7, diet: 'veg', cat: 'Vegetables', raw: ['Mixed vegetables', 150] },
  { id: 'bhindi', name: 'Bhindi sabzi', serving: '1 bowl', kcal: 130, p: 3, c: 12, f: 8, diet: 'veg', cat: 'Vegetables', raw: ['Bhindi', 150] },
  { id: 'aloo-gobi', name: 'Aloo gobi', serving: '1 bowl', kcal: 160, p: 4, c: 18, f: 8, diet: 'veg', cat: 'Vegetables', raw: ['Cauliflower + potato', 170] },
  { id: 'aloo-sabzi', name: 'Potato sabzi', serving: '1 bowl', kcal: 180, p: 3, c: 25, f: 8, diet: 'veg', cat: 'Vegetables', raw: ['Potatoes', 150] },
  { id: 'salad', name: 'Green salad', serving: '1 bowl', kcal: 40, p: 2, c: 8, f: 0.3, diet: 'veg', cat: 'Vegetables', raw: ['Cucumber, tomato, onion, carrot', 150] },
  // ---------- fruit ----------
  { id: 'banana', name: 'Banana', serving: '1 medium', kcal: 105, p: 1.3, c: 27, f: 0.4, diet: 'veg', cat: 'Fruit', raw: ['Bananas (count)', 1] },
  { id: 'apple', name: 'Apple', serving: '1 medium', kcal: 95, p: 0.5, c: 25, f: 0.3, diet: 'veg', cat: 'Fruit', raw: ['Apples (count)', 1] },
  { id: 'papaya', name: 'Papaya', serving: '1 cup', kcal: 60, p: 0.7, c: 15, f: 0.4, diet: 'veg', cat: 'Fruit', raw: ['Papaya', 150] },
  { id: 'orange', name: 'Orange', serving: '1 medium', kcal: 62, p: 1.2, c: 15, f: 0.2, diet: 'veg', cat: 'Fruit', raw: ['Oranges (count)', 1] },
  { id: 'guava', name: 'Guava', serving: '1 medium', kcal: 68, p: 2.6, c: 14, f: 1, diet: 'veg', cat: 'Fruit', raw: ['Guavas (count)', 1] },
  { id: 'mango', name: 'Mango', serving: '1 cup', kcal: 100, p: 1.4, c: 25, f: 0.6, diet: 'veg', cat: 'Fruit', raw: ['Mango', 165] },
  // ---------- nuts, snacks, drinks ----------
  { id: 'peanuts', name: 'Peanuts', serving: '30 g', kcal: 170, p: 7.5, c: 5, f: 14, diet: 'veg', cat: 'Nuts', raw: ['Peanuts', 30] },
  { id: 'almonds', name: 'Almonds', serving: '20 g (~14)', kcal: 116, p: 4.2, c: 4.3, f: 10, diet: 'veg', cat: 'Nuts', raw: ['Almonds', 20] },
  { id: 'makhana', name: 'Roasted makhana', serving: '30 g', kcal: 105, p: 3, c: 23, f: 0.6, diet: 'veg', cat: 'Snacks', raw: ['Makhana', 30] },
  { id: 'peanut-butter', name: 'Peanut butter', serving: '1 tbsp (16 g)', kcal: 95, p: 4, c: 3, f: 8, diet: 'veg', cat: 'Nuts', raw: ['Peanut butter', 16] },
  { id: 'protein-bar', name: 'Protein bar', serving: '1 bar', kcal: 200, p: 20, c: 20, f: 7, diet: 'veg', cat: 'Snacks' },
  { id: 'chai', name: 'Chai (milk + sugar)', serving: '1 cup', kcal: 90, p: 2.5, c: 12, f: 3, diet: 'veg', cat: 'Drinks' },
  { id: 'coffee', name: 'Coffee with milk', serving: '1 cup', kcal: 70, p: 3, c: 8, f: 3, diet: 'veg', cat: 'Drinks' },
  { id: 'samosa', name: 'Samosa', serving: '1 piece', kcal: 260, p: 4, c: 30, f: 14, diet: 'veg', cat: 'Snacks' },
  { id: 'pakora', name: 'Pakora', serving: '1 plate', kcal: 300, p: 6, c: 28, f: 18, diet: 'veg', cat: 'Snacks' },
  { id: 'vada-pav', name: 'Vada pav', serving: '1 piece', kcal: 290, p: 6, c: 40, f: 12, diet: 'veg', cat: 'Snacks' },
  { id: 'pav-bhaji', name: 'Pav bhaji', serving: '1 plate (2 pav)', kcal: 400, p: 9, c: 55, f: 16, diet: 'veg', cat: 'Snacks' },
  { id: 'gulab-jamun', name: 'Gulab jamun', serving: '1 piece', kcal: 150, p: 2, c: 22, f: 6, diet: 'veg', cat: 'Snacks' },
  { id: 'ghee', name: 'Ghee', serving: '1 tsp', kcal: 45, p: 0, c: 0, f: 5, diet: 'veg', cat: 'Oils' },
  { id: 'oil', name: 'Cooking oil', serving: '1 tsp', kcal: 40, p: 0, c: 0, f: 4.5, diet: 'veg', cat: 'Oils' },
  { id: 'sugar', name: 'Sugar', serving: '1 tsp', kcal: 16, p: 0, c: 4, f: 0, diet: 'veg', cat: 'Other' },
];
const FOOD = Object.fromEntries(FOOD_DB.map(f => [f.id, f]));

/* Meal templates for the meal-plan generator: lists of [food id, servings].
   Each option is tagged with the most restrictive diet it needs. */
const MEAL_TEMPLATES = {
  breakfast: [
    { diet: 'veg', items: [['moong-chilla', 2], ['hung-curd', 1]] },
    { diet: 'veg', items: [['besan-chilla', 2], ['curd', 1]] },
    { diet: 'veg', items: [['oats', 1], ['milk', 1], ['banana', 1], ['almonds', 1]] },
    { diet: 'veg', items: [['poha', 1], ['curd', 1], ['roasted-chana', 0.5]] },
    { diet: 'veg', items: [['idli', 2], ['sambar', 1], ['paneer-bhurji', 0.5]] },
    { diet: 'egg', items: [['omelette', 1], ['egg-white', 2], ['bread', 2], ['banana', 1]] },
    { diet: 'egg', items: [['egg-bhurji', 1], ['roti', 2], ['milk', 1]] },
  ],
  lunch: [
    { diet: 'veg', items: [['roti', 2], ['rajma', 1], ['salad', 1], ['curd', 1]] },
    { diet: 'veg', items: [['rice', 1], ['dal', 1], ['paneer-tikka', 0.7], ['salad', 1]] },
    { diet: 'veg', items: [['roti', 2], ['chole', 1], ['raita', 1], ['salad', 1]] },
    { diet: 'veg', items: [['brown-rice', 1], ['soya-curry', 1], ['mixed-veg', 1]] },
    { diet: 'nonveg', items: [['rice', 1], ['chicken-curry', 1], ['salad', 1], ['buttermilk', 1]] },
    { diet: 'nonveg', items: [['roti', 2], ['chicken-keema', 1], ['raita', 1]] },
    { diet: 'nonveg', items: [['rice', 1], ['fish-curry', 1], ['dal', 0.5], ['salad', 1]] },
  ],
  snack: [
    { diet: 'veg', items: [['roasted-chana', 1], ['buttermilk', 1]] },
    { diet: 'veg', items: [['hung-curd', 1], ['banana', 1]] },
    { diet: 'veg', items: [['whey', 1], ['milk', 1]] },
    { diet: 'veg', items: [['sprouts', 1], ['guava', 1]] },
    { diet: 'veg', items: [['makhana', 1], ['peanuts', 0.5], ['apple', 1]] },
    { diet: 'egg', items: [['egg', 2], ['banana', 1]] },
  ],
  dinner: [
    { diet: 'veg', items: [['roti', 2], ['palak-paneer', 1], ['salad', 1]] },
    { diet: 'veg', items: [['rice', 1], ['soya-curry', 1], ['raita', 1]] },
    { diet: 'veg', items: [['tofu-bhurji', 1], ['roti', 2], ['salad', 1]] },
    { diet: 'veg', items: [['khichdi', 1], ['curd', 1], ['paneer-tikka', 0.5]] },
    { diet: 'egg', items: [['egg-curry', 1], ['brown-rice', 1], ['salad', 1]] },
    { diet: 'nonveg', items: [['grilled-fish', 1], ['roti', 2], ['mixed-veg', 1]] },
    { diet: 'nonveg', items: [['tandoori-chicken', 1], ['roti', 2], ['salad', 1]] },
    { diet: 'nonveg', items: [['chicken-breast', 1.5], ['quinoa', 1], ['mixed-veg', 1]] },
  ],
};
/* Lean protein add-ons used when a plan falls short of the protein target */
const PROTEIN_BOOSTERS = { veg: ['whey', 'lowfat-paneer', 'soya-chunks', 'hung-curd'], egg: ['whey', 'egg-white', 'hung-curd', 'lowfat-paneer'], nonveg: ['whey', 'chicken-breast', 'egg-white', 'hung-curd'] };
const DIET_RANK = { veg: 0, egg: 1, nonveg: 2 };
