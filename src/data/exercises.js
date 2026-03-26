export const EXERCISES = {
  Chest: ["Bench Press","Incline Bench Press","Decline Bench Press","Dumbbell Chest Press","Incline Dumbbell Press","Push-Ups","Chest Dips","Cable Flys","Pec Deck","Dumbbell Pullover"],
  Back: ["Pull-Ups","Chin-Ups","Deadlift","Barbell Bent-Over Row","T-Bar Row","Seated Cable Row","Lat Pulldown","Dumbbell Row","Reverse Flys","Face Pulls"],
  Shoulders: ["Overhead Press","Dumbbell Shoulder Press","Arnold Press","Lateral Raises","Front Raises","Rear Delt Flys","Upright Row","Military Press"],
  Biceps: ["Barbell Curl","Dumbbell Curl","Hammer Curl","Preacher Curl","Concentration Curl","Cable Curl","Incline Dumbbell Curl"],
  Triceps: ["Triceps Pushdown","Skull Crushers","Dips","Close-Grip Bench Press","Overhead Triceps Extension","Triceps Kickback"],
  Legs: ["Squat","Front Squat","Bulgarian Split Squat","Leg Press","Romanian Deadlift","Leg Extension","Leg Curl","Goblet Squat","Hip Thrust","Glute Bridge","Calf Raises","Kettlebell Swing"],
  Core: ["Plank","Crunches","Hanging Leg Raise","Cable Crunch","Ab Wheel Rollout"]
};

export const KEYWORD_GROUP_MAP = {
  chest: "Chest",
  back: "Back",
  shoulder: "Shoulders",
  bicep: "Biceps",
  tricep: "Triceps",
  leg: "Legs",
  quad: "Legs",
  hamstring: "Legs",
  glute: "Legs",
  calf: "Legs",
  core: "Core",
  ab: "Core",
};

export function getAutocompleteSuggestions(query, dayName) {
  if (!query || query.trim().length === 0) return [];

  const q = query.toLowerCase();
  const dayLower = (dayName || "").toLowerCase();

  // Determine boosted groups based on day name
  const boostedGroups = new Set();
  for (const [keyword, group] of Object.entries(KEYWORD_GROUP_MAP)) {
    if (dayLower.includes(keyword)) {
      boostedGroups.add(group);
    }
  }

  const matches = [];
  for (const [group, exercises] of Object.entries(EXERCISES)) {
    for (const name of exercises) {
      if (name.toLowerCase().includes(q)) {
        const score = boostedGroups.has(group) ? 2 : 1;
        matches.push({ name, score });
      }
    }
  }

  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  return matches.slice(0, 5).map(m => m.name);
}
