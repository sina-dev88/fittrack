/**
 * Canonical sub-region catalog for FitTrack's interactive anatomy view.
 *
 * `parentMuscle` stays compatible with the existing broad page filters.
 * `matchTerms` are more specific names used by better-tagged exercise records.
 * If an exercise library only stores a broad primaryMuscle (e.g. "Chest"),
 * the matching helper falls back to parent terms rather than returning nothing.
 */
export type ExerciseLike = {
  name?: string | null;
  primaryMuscle?: string | null;
  secondaryMuscles?: string | string[] | null;
};

export type MuscleRegionInfo = {
  id: string;
  name: string;
  area: string;
  view: "front" | "back";
  parentMuscle: string;
  matchTerms: readonly string[];
  parentTerms: readonly string[];
  exercises: readonly string[];
};

const chest = ["chest", "pectorals", "pecs", "pectoralis major"];
const back = ["back", "lats", "latissimus", "latissimus dorsi", "traps", "trapezius", "rhomboids"];
const shoulders = ["shoulders", "delts", "deltoids"];
const arms = ["arms", "upper arms"];
const forearms = ["forearms", "forearm", "wrist flexors", "wrist extensors"];
const core = ["core", "abs", "abdominals", "abdominal"];
const legs = ["legs", "lower body"];
const quads = ["quadriceps", "quads", "thighs"];
const hamstrings = ["hamstrings", "biceps femoris", "semitendinosus", "semimembranosus", "posterior thigh"];
const glutes = ["glutes", "gluteals", "gluteus maximus", "gluteus medius", "hips"];
const calves = ["calves", "calf", "gastrocnemius", "soleus"];

const raw: MuscleRegionInfo[] = [
  { id: "chest-upper", name: "Upper chest · clavicular head", area: "Upper / clavicular pectoralis", view: "front", parentMuscle: "chest", matchTerms: ["upper chest", "clavicular head", "clavicular pectoralis", "incline chest"], parentTerms: chest, exercises: ["Incline dumbbell press", "Incline barbell press", "Low-to-high cable fly", "Incline machine press"] },
  { id: "chest-mid", name: "Mid chest · sternal head", area: "Middle pectoralis", view: "front", parentMuscle: "chest", matchTerms: ["mid chest", "middle chest", "sternal head", "pectoralis major"], parentTerms: chest, exercises: ["Flat bench press", "Flat dumbbell press", "Machine chest press", "Cable fly"] },
  { id: "chest-lower", name: "Lower chest · abdominal head", area: "Lower pectoralis", view: "front", parentMuscle: "chest", matchTerms: ["lower chest", "abdominal head", "decline chest"], parentTerms: chest, exercises: ["Decline bench press", "High-to-low cable fly", "Chest dips", "Decline dumbbell press"] },
  { id: "front-deltoid", name: "Anterior deltoid", area: "Front shoulder", view: "front", parentMuscle: "shoulders", matchTerms: ["front delts", "anterior deltoid", "front shoulder"], parentTerms: shoulders, exercises: ["Dumbbell shoulder press", "Seated overhead press", "Front raise", "Incline press"] },
  { id: "side-deltoid", name: "Lateral deltoid", area: "Outer shoulder", view: "front", parentMuscle: "shoulders", matchTerms: ["lateral deltoid", "side delts", "middle deltoid"], parentTerms: shoulders, exercises: ["Dumbbell lateral raise", "Cable lateral raise", "Machine lateral raise", "Lean-away lateral raise"] },
  { id: "rear-deltoid", name: "Posterior deltoid", area: "Back of shoulder", view: "back", parentMuscle: "shoulders", matchTerms: ["rear delts", "posterior deltoid", "rear shoulder"], parentTerms: shoulders, exercises: ["Reverse pec deck", "Cable rear-delt fly", "Dumbbell reverse fly", "Face pull"] },
  { id: "biceps-brachii", name: "Biceps brachii", area: "Front upper arm", view: "front", parentMuscle: "biceps", matchTerms: ["biceps brachii", "biceps", "bicep"], parentTerms: ["biceps", "arms", "upper arms"], exercises: ["Incline dumbbell curl", "EZ-bar curl", "Preacher curl", "Cable curl"] },
  { id: "brachialis", name: "Brachialis", area: "Deep front / outer upper arm", view: "front", parentMuscle: "biceps", matchTerms: ["brachialis", "hammer curl", "neutral grip curl"], parentTerms: ["biceps", ...arms], exercises: ["Hammer curl", "Cross-body hammer curl", "Reverse curl"] },
  { id: "triceps-long-head", name: "Triceps · long head", area: "Back of upper arm, inner / long portion", view: "back", parentMuscle: "triceps", matchTerms: ["triceps long head", "long head triceps"], parentTerms: ["triceps", ...arms], exercises: ["Overhead cable extension", "Overhead dumbbell extension", "Incline triceps extension", "EZ-bar skull crusher"] },
  { id: "triceps-lateral-head", name: "Triceps · lateral head", area: "Outer back of upper arm", view: "back", parentMuscle: "triceps", matchTerms: ["triceps lateral head", "lateral head triceps"], parentTerms: ["triceps", ...arms], exercises: ["Rope pushdown", "Straight-bar pushdown", "Close-grip bench press", "Triceps dip"] },
  { id: "triceps-medial-head", name: "Triceps · medial head", area: "Deep / lower back of upper arm", view: "back", parentMuscle: "triceps", matchTerms: ["triceps medial head", "medial head triceps"], parentTerms: ["triceps", ...arms], exercises: ["Reverse-grip pushdown", "Rope pushdown", "Close-grip push-up"] },
  { id: "forearm-flexors", name: "Forearm flexors", area: "Front / palm-side forearm", view: "front", parentMuscle: "biceps", matchTerms: ["forearm flexors", "wrist flexors", "forearms"], parentTerms: forearms.concat(["biceps", "arms"]), exercises: ["Seated wrist curl", "Behind-the-back wrist curl", "Farmer's carry", "Dead hang"] },
  { id: "forearm-extensors", name: "Forearm extensors", area: "Back / top-side forearm", view: "back", parentMuscle: "biceps", matchTerms: ["forearm extensors", "wrist extensors", "extensor forearm"], parentTerms: forearms.concat(["biceps", "arms"]), exercises: ["Reverse wrist curl", "Reverse EZ-bar curl", "Dumbbell wrist extension", "Farmer's carry"] },
  { id: "rectus-abdominis-upper", name: "Upper rectus abdominis", area: "Upper abdominal wall", view: "front", parentMuscle: "abs", matchTerms: ["upper abs", "rectus abdominis", "abdominals"], parentTerms: core, exercises: ["Cable crunch", "Crunch", "Decline sit-up", "Ab machine crunch"] },
  { id: "rectus-abdominis-lower", name: "Lower rectus abdominis", area: "Lower abdominal wall", view: "front", parentMuscle: "abs", matchTerms: ["lower abs", "lower abdominals", "rectus abdominis"], parentTerms: core, exercises: ["Reverse crunch", "Hanging knee raise", "Hanging leg raise", "Lying leg raise"] },
  { id: "external-oblique", name: "External obliques", area: "Side abdominal wall", view: "front", parentMuscle: "abs", matchTerms: ["obliques", "external oblique", "side abs"], parentTerms: core, exercises: ["Cable woodchop", "Side plank", "Pallof press", "Cable side bend"] },
  { id: "serratus-anterior", name: "Serratus anterior", area: "Ribs below the armpit", view: "front", parentMuscle: "chest", matchTerms: ["serratus anterior", "serratus", "rib muscles"], parentTerms: chest.concat(back), exercises: ["Push-up plus", "Scapular push-up", "Cable serratus punch", "Dumbbell pullover"] },
  { id: "rectus-femoris", name: "Rectus femoris", area: "Front centre thigh", view: "front", parentMuscle: "quadriceps", matchTerms: ["rectus femoris", "quadriceps", "quads"], parentTerms: quads, exercises: ["Leg extension", "Front squat", "Hack squat", "Sissy squat"] },
  { id: "vastus-lateralis", name: "Vastus lateralis", area: "Outer quadriceps", view: "front", parentMuscle: "quadriceps", matchTerms: ["vastus lateralis", "outer quads", "quadriceps"], parentTerms: quads, exercises: ["Hack squat", "Leg press", "Narrow-stance squat", "Leg extension"] },
  { id: "vastus-medialis", name: "Vastus medialis", area: "Inner / lower quadriceps near the knee", view: "front", parentMuscle: "quadriceps", matchTerms: ["vastus medialis", "inner quads", "quadriceps"], parentTerms: quads, exercises: ["Leg extension", "Heel-elevated squat", "Split squat", "Leg press"] },
  { id: "tibialis-anterior", name: "Tibialis anterior", area: "Front of shin", view: "front", parentMuscle: "calves", matchTerms: ["tibialis anterior", "tibialis", "front shin"], parentTerms: calves.concat(legs), exercises: ["Tibialis raise", "Wall tibialis raise", "Toe raise", "Heel walk"] },
  { id: "trapezius-upper", name: "Upper trapezius", area: "Neck to shoulder ridge", view: "back", parentMuscle: "back", matchTerms: ["upper traps", "upper trapezius", "trapezius"], parentTerms: back, exercises: ["Dumbbell shrug", "Barbell shrug", "Farmer's carry", "Cable shrug"] },
  { id: "trapezius-mid", name: "Middle trapezius", area: "Between the shoulder blades", view: "back", parentMuscle: "back", matchTerms: ["middle traps", "middle trapezius", "mid traps"], parentTerms: back, exercises: ["Chest-supported row", "Seated cable row", "Face pull", "Reverse fly"] },
  { id: "trapezius-lower", name: "Lower trapezius", area: "Lower scapular region", view: "back", parentMuscle: "back", matchTerms: ["lower traps", "lower trapezius"], parentTerms: back, exercises: ["Prone Y raise", "Cable Y raise", "Face pull with external rotation", "Scapular pull-up"] },
  { id: "infraspinatus", name: "Infraspinatus", area: "Rotator cuff beneath the rear deltoid", view: "back", parentMuscle: "back", matchTerms: ["infraspinatus", "rotator cuff", "external rotators"], parentTerms: back, exercises: ["Cable external rotation", "Side-lying external rotation", "Band external rotation", "Face pull"] },
  { id: "teres-minor", name: "Teres minor", area: "Small rotator-cuff muscle along the outer scapula", view: "back", parentMuscle: "back", matchTerms: ["teres minor", "rotator cuff", "external rotators"], parentTerms: back, exercises: ["Cable external rotation", "Side-lying external rotation", "Face pull", "Reverse fly"] },
  { id: "teres-major", name: "Teres major · rear armpit fold", area: "Posterior axillary fold", view: "back", parentMuscle: "back", matchTerms: ["teres major", "rear armpit", "axillary fold"], parentTerms: back, exercises: ["Straight-arm pulldown", "Close-grip lat pulldown", "Neutral-grip pulldown", "Dumbbell pullover"] },
  { id: "lats-upper", name: "Upper latissimus dorsi", area: "Upper / outer lats beneath the armpit", view: "back", parentMuscle: "back", matchTerms: ["upper lats", "upper latissimus", "latissimus dorsi", "lats"], parentTerms: back, exercises: ["Wide-grip lat pulldown", "Pull-up", "Assisted pull-up", "Straight-arm pulldown"] },
  { id: "lats-mid", name: "Middle latissimus dorsi", area: "Middle outer back", view: "back", parentMuscle: "back", matchTerms: ["middle lats", "mid lats", "latissimus dorsi", "lats"], parentTerms: back, exercises: ["One-arm dumbbell row", "Chest-supported row", "Neutral-grip lat pulldown", "Seated cable row"] },
  { id: "lats-lower", name: "Lower latissimus dorsi", area: "Lower lat fibers toward the waist", view: "back", parentMuscle: "back", matchTerms: ["lower lats", "lower latissimus", "latissimus dorsi", "lats"], parentTerms: back, exercises: ["Close-grip pulldown", "One-arm cable pulldown", "Straight-arm pulldown", "Bench-supported dumbbell row"] },
  { id: "rhomboids", name: "Rhomboids", area: "Between medial scapular borders", view: "back", parentMuscle: "back", matchTerms: ["rhomboids", "rhomboid major", "rhomboid minor"], parentTerms: back, exercises: ["Chest-supported row", "Seated row with pause", "Face pull", "Reverse fly"] },
  { id: "erector-spinae", name: "Erector spinae · spinal erectors", area: "Long muscles alongside the spine", view: "back", parentMuscle: "back", matchTerms: ["erector spinae", "spinal erectors", "back extensors"], parentTerms: back.concat(["lower back", "lumbar"]), exercises: ["Romanian deadlift", "Back extension", "Deadlift", "Bird dog"] },
  { id: "multifidus", name: "Multifidus", area: "Deep spinal stabilizers", view: "back", parentMuscle: "back", matchTerms: ["multifidus", "deep spinal stabilizers"], parentTerms: back.concat(["lower back", "lumbar", "core"]), exercises: ["Bird dog", "Quadruped opposite arm and leg raise", "Dead bug", "Back extension"] },
  { id: "quadratus-lumborum", name: "Quadratus lumborum", area: "Deep lower-back / side waist", view: "back", parentMuscle: "back", matchTerms: ["quadratus lumborum", "ql", "side waist"], parentTerms: back.concat(["lower back", "lumbar", "core"]), exercises: ["Suitcase carry", "Side plank", "Bird dog", "Controlled side bend"] },
  { id: "gluteus-medius", name: "Gluteus medius", area: "Upper outer hip / pelvis", view: "back", parentMuscle: "glutes", matchTerms: ["gluteus medius", "glute med", "outer glutes"], parentTerms: glutes, exercises: ["Cable hip abduction", "Machine hip abduction", "Side-lying leg raise", "Lateral band walk"] },
  { id: "gluteus-maximus", name: "Gluteus maximus", area: "Main buttock muscle", view: "back", parentMuscle: "glutes", matchTerms: ["gluteus maximus", "glute max", "gluteal muscles"], parentTerms: glutes, exercises: ["Hip thrust", "Romanian deadlift", "Bulgarian split squat", "Glute bridge"] },
  { id: "biceps-femoris", name: "Biceps femoris · lateral hamstring", area: "Outer back of thigh", view: "back", parentMuscle: "hamstrings", matchTerms: ["biceps femoris", "lateral hamstring", "hamstrings"], parentTerms: hamstrings.concat(legs), exercises: ["Seated leg curl", "Lying leg curl", "Romanian deadlift", "Nordic curl"] },
  { id: "semitendinosus", name: "Semitendinosus · medial hamstring", area: "Inner back of thigh", view: "back", parentMuscle: "hamstrings", matchTerms: ["semitendinosus", "medial hamstring", "hamstrings"], parentTerms: hamstrings.concat(legs), exercises: ["Seated leg curl", "Nordic curl", "Romanian deadlift", "Single-leg deadlift"] },
  { id: "semimembranosus", name: "Semimembranosus · medial hamstring", area: "Deep inner back of thigh", view: "back", parentMuscle: "hamstrings", matchTerms: ["semimembranosus", "medial hamstring", "hamstrings"], parentTerms: hamstrings.concat(legs), exercises: ["Seated leg curl", "Lying leg curl", "Romanian deadlift", "Good morning"] },
  { id: "gastrocnemius-lateral", name: "Lateral gastrocnemius", area: "Outer calf head", view: "back", parentMuscle: "calves", matchTerms: ["lateral gastrocnemius", "outer calf", "gastrocnemius"], parentTerms: calves.concat(legs), exercises: ["Standing calf raise", "Single-leg calf raise", "Leg press calf raise", "Donkey calf raise"] },
  { id: "gastrocnemius-medial", name: "Medial gastrocnemius", area: "Inner calf head", view: "back", parentMuscle: "calves", matchTerms: ["medial gastrocnemius", "inner calf", "gastrocnemius"], parentTerms: calves.concat(legs), exercises: ["Standing calf raise", "Single-leg calf raise", "Donkey calf raise", "Smith-machine calf raise"] },
  { id: "soleus", name: "Soleus", area: "Deep lower calf", view: "back", parentMuscle: "calves", matchTerms: ["soleus", "deep calf"], parentTerms: calves.concat(legs), exercises: ["Seated calf raise", "Bent-knee calf raise", "Seated machine calf raise"] },
  { id: "popliteus", name: "Popliteus", area: "Small deep muscle behind the knee", view: "back", parentMuscle: "calves", matchTerms: ["popliteus", "back of knee"], parentTerms: calves.concat(legs), exercises: ["Controlled step-down", "Calf raise variations", "Single-leg balance"] },
  { id: "peroneals", name: "Fibularis (peroneal) muscles", area: "Outer lower leg beside the calf", view: "back", parentMuscle: "calves", matchTerms: ["peroneals", "fibularis longus", "peroneus longus", "outer lower leg"], parentTerms: calves.concat(legs), exercises: ["Band eversion", "Single-leg balance", "Calf raise variations"] },

  { id: "levator-scapulae", name: "Levator scapulae", area: "Side of neck to upper inner shoulder blade", view: "back", parentMuscle: "back", matchTerms: ["levator scapulae", "neck to scapula"], parentTerms: back, exercises: ["Dumbbell shrug", "Face pull", "Scapular pull-up", "Prone Y raise"] },
  { id: "serratus-posterior-superior", name: "Serratus posterior superior", area: "Upper posterior ribs", view: "back", parentMuscle: "back", matchTerms: ["serratus posterior superior", "upper posterior serratus"], parentTerms: back, exercises: ["Controlled breathing", "Thoracic mobility", "Cable row"] },
  { id: "serratus-posterior-inferior", name: "Serratus posterior inferior", area: "Lower posterior ribs", view: "back", parentMuscle: "back", matchTerms: ["serratus posterior inferior", "lower posterior serratus"], parentTerms: back, exercises: ["Controlled breathing", "Thoracic mobility", "Bird dog"] },
  { id: "anconeus", name: "Anconeus", area: "Small muscle just behind the elbow", view: "back", parentMuscle: "triceps", matchTerms: ["anconeus", "posterior elbow"], parentTerms: ["triceps", ...arms], exercises: ["Rope pushdown", "Reverse-grip pushdown", "Triceps extension"] },
  { id: "brachioradialis", name: "Brachioradialis", area: "Outer forearm near the elbow", view: "back", parentMuscle: "biceps", matchTerms: ["brachioradialis", "lateral forearm", "forearm"], parentTerms: forearms.concat(["arms", "biceps"]), exercises: ["Hammer curl", "Reverse curl", "Cross-body hammer curl"] },
  { id: "piriformis", name: "Piriformis", area: "Deep gluteal region beneath gluteus maximus", view: "back", parentMuscle: "glutes", matchTerms: ["piriformis", "deep gluteal muscle"], parentTerms: glutes, exercises: ["Figure-four stretch", "Single-leg bridge", "Hip external rotation"] },
  { id: "adductor-magnus", name: "Adductor magnus · posterior fibers", area: "Inner posterior thigh", view: "back", parentMuscle: "hamstrings", matchTerms: ["adductor magnus", "posterior adductor", "inner posterior thigh"], parentTerms: hamstrings.concat(legs), exercises: ["Romanian deadlift", "Sumo deadlift", "Seated leg curl"] },
  { id: "gracilis", name: "Gracilis", area: "Medial thigh edge", view: "back", parentMuscle: "hamstrings", matchTerms: ["gracilis", "medial thigh"], parentTerms: hamstrings.concat(legs), exercises: ["Cable hip adduction", "Copenhagen plank", "Lateral lunge"] },
  { id: "tibialis-posterior", name: "Tibialis posterior", area: "Deep posterior lower leg", view: "back", parentMuscle: "calves", matchTerms: ["tibialis posterior", "deep posterior shin"], parentTerms: calves.concat(legs), exercises: ["Calf raise", "Single-leg calf raise", "Foot inversion with band"] },
  { id: "plantaris", name: "Plantaris", area: "Small posterior knee-to-calf muscle", view: "back", parentMuscle: "calves", matchTerms: ["plantaris", "posterior calf"], parentTerms: calves.concat(legs), exercises: ["Calf raise variations", "Bent-knee calf raise", "Single-leg balance"] },
];

export const MUSCLE_REGION_MAP: Readonly<Record<string, MuscleRegionInfo>> = Object.freeze(
  Object.fromEntries(raw.map((region) => [region.id, region])) as Record<string, MuscleRegionInfo>,
);

export function getMuscleRegionInfo(id: string | null | undefined): MuscleRegionInfo | undefined {
  return id ? MUSCLE_REGION_MAP[id] : undefined;
}

function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[‐‑‒–—_-]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asTerms(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => item.split(/[,;|]/));
  return (value ?? "").split(/[,;|]/);
}



const BROAD_REGION_TERMS = new Set([
  "chest", "pectorals", "pecs", "pectoralis major", "shoulders", "shoulder",
  "delts", "deltoids", "arms", "upper arms", "forearms", "forearm", "core",
  "abs", "abdominals", "abdominal", "rectus abdominis", "legs", "lower body",
  "quadriceps", "quad", "quads", "hamstrings", "hamstring", "biceps", "bicep",
  "triceps", "tricep", "back", "lats", "latissimus dorsi", "traps", "trapezius",
  "rhomboids", "glutes", "gluteals", "gluteal muscles", "calves", "calf",
  "gastrocnemius", "soleus", "tibialis", "rotator cuff", "external rotators",
  "peroneals", "fibularis longus", "peroneus longus",
]);

function hasNormalizedPhrase(value: string, phrase: string): boolean {
  const normalizedValue = normalize(value);
  const normalizedPhrase = normalize(phrase);
  if (!normalizedValue || !normalizedPhrase) return false;
  return (` ${normalizedValue} `).includes(` ${normalizedPhrase} `);
}

function matchesListedMovement(value: string, listedName: string): boolean {
  const normalizedValue = normalize(value);
  const normalizedListed = normalize(listedName);
  if (!normalizedValue || !normalizedListed) return false;
  if (hasNormalizedPhrase(normalizedValue, normalizedListed)) return true;

  // Allow useful variants such as "Overhead dumbbell triceps extension"
  // matching the catalog entry "Overhead dumbbell extension".
  const words = normalizedListed.split(" ").filter(Boolean);
  if (words.length < 2) return false;
  const candidateWords = normalizedValue.split(" ");
  let cursor = 0;
  for (const word of words) {
    const index = candidateWords.indexOf(word, cursor);
    if (index < 0) return false;
    cursor = index + 1;
  }
  return true;
}

/** Score an exercise for a region: specific movement/tag before broad parent group. */
export function scoreExerciseForRegion(exercise: ExerciseLike, regionId: string): number {
  const region = getMuscleRegionInfo(regionId);
  if (!region) return 0;

  const name = normalize(exercise.name);
  const targetTags = [
    normalize(exercise.primaryMuscle),
    ...asTerms(exercise.secondaryMuscles).map(normalize),
  ].filter(Boolean);

  const listedNameMatch = region.exercises.some((listedName) =>
    matchesListedMovement(name, listedName),
  );

  const specificTerms = region.matchTerms
    .map(normalize)
    .filter((term) => term && !BROAD_REGION_TERMS.has(term));

  const specificNameMatch = specificTerms.some((term) => hasNormalizedPhrase(name, term));
  const specificTagMatch = specificTerms.some((term) =>
    targetTags.some((tag) => hasNormalizedPhrase(tag, term)),
  );

  if (listedNameMatch || specificNameMatch || specificTagMatch) return 3;

  // Broad legacy tags remain eligible but should not be mistaken for precise
  // sub-region evidence (e.g. "Quadriceps" is not enough to identify vastus medialis).
  const broadTerms = region.parentTerms.map(normalize).filter(Boolean);
  const broadTagMatch = broadTerms.some((term) =>
    targetTags.some((tag) => hasNormalizedPhrase(tag, term)),
  );
  const broadNameMatch = broadTerms.some((term) => hasNormalizedPhrase(name, term));

  return broadTagMatch || broadNameMatch ? 1 : 0;
}


export function matchesExerciseToRegion(exercise: ExerciseLike, regionId: string): boolean {
  return scoreExerciseForRegion(exercise, regionId) > 0;
}

/** Sort exact sub-region matches before general parent-group matches. */
export function rankExercisesForRegion<T extends ExerciseLike>(items: readonly T[], regionId: string): T[] {
  return items
    .map((item, index) => ({ item, index, score: scoreExerciseForRegion(item, regionId) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}

/**
 * Persian presentation labels.
 *
 * Keep `raw`, matchTerms, parentTerms and the original English exercise
 * names unchanged. These translations are for UI display only.
 */
const FA_REGION_TEXT: Record<string, { name: string; area: string }> = {
  "chest-upper": {
    name: "بخش بالایی سینه · سر ترقوه‌ای",
    area: "بخش بالایی عضله سینه‌ای",
  },
  "chest-mid": {
    name: "بخش میانی سینه · سر جناغی",
    area: "بخش میانی عضله سینه‌ای",
  },
  "chest-lower": {
    name: "بخش پایینی سینه · سر شکمی",
    area: "بخش پایینی عضله سینه‌ای",
  },
  "front-deltoid": {
    name: "دلتوئید قدامی",
    area: "جلوی سرشانه",
  },
  "side-deltoid": {
    name: "دلتوئید میانی",
    area: "بخش کناری سرشانه",
  },
  "rear-deltoid": {
    name: "دلتوئید خلفی",
    area: "پشت سرشانه",
  },
  "biceps-brachii": {
    name: "عضله دوسر بازویی",
    area: "جلوی بازو",
  },
  brachialis: {
    name: "عضله براکیالیس",
    area: "بخش عمقی و بیرونی بازو",
  },
  "triceps-long-head": {
    name: "سر بلند پشت بازو",
    area: "بخش بلند و داخلی پشت بازو",
  },
  "triceps-lateral-head": {
    name: "سر خارجی پشت بازو",
    area: "بخش بیرونی پشت بازو",
  },
  "triceps-medial-head": {
    name: "سر داخلی پشت بازو",
    area: "بخش عمقی و پایینی پشت بازو",
  },
  "forearm-flexors": {
    name: "عضلات خم‌کننده ساعد",
    area: "سطح جلویی ساعد، سمت کف دست",
  },
  "forearm-extensors": {
    name: "عضلات بازکننده ساعد",
    area: "سطح پشتی ساعد",
  },
  "rectus-abdominis-upper": {
    name: "بخش بالایی راست شکمی",
    area: "بخش بالایی دیواره شکم",
  },
  "rectus-abdominis-lower": {
    name: "بخش پایینی راست شکمی",
    area: "بخش پایینی دیواره شکم",
  },
  "external-oblique": {
    name: "عضلات مایل خارجی شکم",
    area: "بخش کناری دیواره شکم",
  },
  "serratus-anterior": {
    name: "عضله دندانه‌ای قدامی",
    area: "دنده‌ها، زیر بغل",
  },
  "rectus-femoris": {
    name: "عضله راست رانی",
    area: "مرکز جلوی ران",
  },
  "vastus-lateralis": {
    name: "عضله پهن خارجی ران",
    area: "بخش بیرونی عضلات چهارسر ران",
  },
  "vastus-medialis": {
    name: "عضله پهن داخلی ران",
    area: "بخش داخلی چهارسر ران، نزدیک زانو",
  },
  "tibialis-anterior": {
    name: "عضله درشت‌نئی قدامی",
    area: "جلوی ساق پا",
  },
  "trapezius-upper": {
    name: "بخش بالایی ذوزنقه‌ای",
    area: "از گردن تا لبه سرشانه",
  },
  "trapezius-mid": {
    name: "بخش میانی ذوزنقه‌ای",
    area: "بین دو کتف",
  },
  "trapezius-lower": {
    name: "بخش پایینی ذوزنقه‌ای",
    area: "بخش پایینی ناحیه کتف",
  },
  infraspinatus: {
    name: "عضله زیرخاری",
    area: "عضله چرخاننده شانه، زیر دلتوئید خلفی",
  },
  "teres-minor": {
    name: "عضله گرد کوچک",
    area: "عضله کوچک کاف چرخاننده، کنار کتف",
  },
  "teres-major": {
    name: "عضله گرد بزرگ",
    area: "چین خلفی زیر بغل",
  },
  "lats-upper": {
    name: "بخش بالایی عضله پشتی بزرگ",
    area: "بخش بالایی و بیرونی پشت، زیر بغل",
  },
  "lats-mid": {
    name: "بخش میانی عضله پشتی بزرگ",
    area: "بخش میانی و کناری پشت",
  },
  "lats-lower": {
    name: "بخش پایینی عضله پشتی بزرگ",
    area: "الیاف پایینی عضله پشتی بزرگ، نزدیک کمر",
  },
  rhomboids: {
    name: "عضلات لوزی‌شکل",
    area: "بین لبه‌های داخلی کتف‌ها",
  },
  "erector-spinae": {
    name: "راست‌کننده‌های ستون فقرات",
    area: "عضلات طولی در امتداد ستون فقرات",
  },
  multifidus: {
    name: "عضله مولتی‌فیدوس",
    area: "عضلات عمقی تثبیت‌کننده ستون فقرات",
  },
  "quadratus-lumborum": {
    name: "عضله مربع کمری",
    area: "بخش عمقی کمر و کنار پهلو",
  },
  "gluteus-medius": {
    name: "عضله سرینی میانی",
    area: "بخش بالایی و بیرونی لگن",
  },
  "gluteus-maximus": {
    name: "عضله سرینی بزرگ",
    area: "عضله اصلی باسن",
  },
  "biceps-femoris": {
    name: "عضله دوسر رانی",
    area: "بخش بیرونی پشت ران",
  },
  semitendinosus: {
    name: "عضله نیم‌وتری",
    area: "بخش داخلی پشت ران",
  },
  semimembranosus: {
    name: "عضله نیم‌غشایی",
    area: "بخش عمقی و داخلی پشت ران",
  },
  "gastrocnemius-lateral": {
    name: "سر خارجی عضله دوقلو ساق",
    area: "بخش بیرونی عضله دوقلو ساق پا",
  },
  "gastrocnemius-medial": {
    name: "سر داخلی عضله دوقلو ساق",
    area: "بخش داخلی عضله دوقلو ساق پا",
  },
  soleus: {
    name: "عضله نعلی",
    area: "لایه عمقی ساق پا",
  },
  popliteus: {
    name: "عضله پوپلیتئوس",
    area: "عضله عمقی کوچک پشت زانو",
  },
  peroneals: {
    name: "عضلات نازک‌نئی",
    area: "بخش بیرونی ساق پا",
  },
  "levator-scapulae": {
    name: "عضله بالابرنده کتف",
    area: "کنار گردن تا بخش داخلی بالایی کتف",
  },
  "serratus-posterior-superior": {
    name: "دندانه‌ای خلفی فوقانی",
    area: "دنده‌های بالایی در پشت بدن",
  },
  "serratus-posterior-inferior": {
    name: "دندانه‌ای خلفی تحتانی",
    area: "دنده‌های پایینی در پشت بدن",
  },
  anconeus: {
    name: "عضله آنکونئوس",
    area: "عضله کوچک پشت آرنج",
  },
  brachioradialis: {
    name: "عضله بازویی‌زندزبرینی",
    area: "بخش بیرونی ساعد، نزدیک آرنج",
  },
  piriformis: {
    name: "عضله پیریفورمیس",
    area: "بخش عمقی باسن، زیر عضله سرینی بزرگ",
  },
  "adductor-magnus": {
    name: "عضله نزدیک‌کننده بزرگ",
    area: "بخش داخلی و پشتی ران",
  },
  gracilis: {
    name: "عضله نازک",
    area: "لبه داخلی ران",
  },
  "tibialis-posterior": {
    name: "عضله درشت‌نئی خلفی",
    area: "بخش عمقی پشتی ساق پا",
  },
  plantaris: {
    name: "عضله کف‌پایی",
    area: "عضله کوچک میان پشت زانو و ساق پا",
  },
};

const FA_EXERCISE_TEXT: Record<string, string> = {
  "Incline dumbbell press": "پرس دمبل روی میز شیب‌دار",
  "Incline barbell press": "پرس هالتر روی میز شیب‌دار",
  "Low-to-high cable fly": "فلای سیم‌کش از پایین به بالا",
  "Incline machine press": "پرس دستگاه روی میز شیب‌دار",
  "Flat bench press": "پرس سینه هالتر روی میز صاف",
  "Flat dumbbell press": "پرس سینه دمبل روی میز صاف",
  "Machine chest press": "پرس سینه دستگاه",
  "Cable fly": "فلای سیم‌کش",
  "Decline bench press": "پرس سینه روی میز شیب‌دار منفی",
  "High-to-low cable fly": "فلای سیم‌کش از بالا به پایین",
  "Chest dips": "دیپ سینه",
  "Decline dumbbell press": "پرس دمبل روی میز شیب‌دار منفی",
  "Dumbbell shoulder press": "پرس سرشانه دمبل",
  "Seated overhead press": "پرس بالای سر نشسته",
  "Front raise": "نشر جلو",
  "Incline press": "پرس روی میز شیب‌دار",
  "Dumbbell lateral raise": "نشر جانب دمبل",
  "Cable lateral raise": "نشر جانب سیم‌کش",
  "Machine lateral raise": "نشر جانب دستگاه",
  "Lean-away lateral raise": "نشر جانب با تکیه به پهلو",
  "Reverse pec deck": "فلای معکوس دستگاه",
  "Cable rear-delt fly": "فلای پشت سرشانه سیم‌کش",
  "Dumbbell reverse fly": "فلای معکوس دمبل",
  "Face pull": "فیس پول سیم‌کش",
  "Incline dumbbell curl": "جلو بازو دمبل روی میز شیب‌دار",
  "EZ-bar curl": "جلو بازو با میله EZ",
  "Preacher curl": "جلو بازو لاری",
  "Cable curl": "جلو بازو سیم‌کش",
  "Hammer curl": "جلو بازو چکشی",
  "Cross-body hammer curl": "جلو بازو چکشی ضربدری",
  "Reverse curl": "جلو بازو معکوس",
  "Overhead cable extension": "پشت بازو سیم‌کش بالای سر",
  "Overhead dumbbell extension": "پشت بازو دمبل بالای سر",
  "Incline triceps extension": "پشت بازو روی میز شیب‌دار",
  "EZ-bar skull crusher": "پشت بازو خوابیده با میله EZ",
  "Rope pushdown": "پشت بازو سیم‌کش با طناب",
  "Straight-bar pushdown": "پشت بازو سیم‌کش با میله صاف",
  "Close-grip bench press": "پرس سینه دست جمع",
  "Triceps dip": "دیپ پشت بازو",
  "Reverse-grip pushdown": "پشت بازو سیم‌کش دست برعکس",
  "Close-grip push-up": "شنا سوئدی دست جمع",
  "Seated wrist curl": "مچ‌خم نشسته",
  "Behind-the-back wrist curl": "مچ‌خم از پشت بدن",
  "Farmer's carry": "راه رفتن کشاورزی",
  "Dead hang": "آویزان ماندن از میله",
  "Reverse wrist curl": "مچ‌خم معکوس",
  "Reverse EZ-bar curl": "جلو بازو معکوس با میله EZ",
  "Dumbbell wrist extension": "بازکردن مچ با دمبل",
  "Cable crunch": "کرانچ سیم‌کش",
  "Crunch": "کرانچ شکم",
  "Decline sit-up": "درازونشست روی میز شیب‌دار منفی",
  "Ab machine crunch": "کرانچ با دستگاه شکم",
  "Reverse crunch": "کرانچ معکوس",
  "Hanging knee raise": "بالا آوردن زانو در حالت آویزان",
  "Hanging leg raise": "بالا آوردن پا در حالت آویزان",
  "Lying leg raise": "بالا آوردن پا در حالت خوابیده",
  "Cable woodchop": "چرخش مورب تنه با سیم‌کش",
  "Side plank": "پلانک پهلو",
  "Pallof press": "پالوف پرس",
  "Cable side bend": "خم‌شدن به پهلو با سیم‌کش",
  "Push-up plus": "شنا سوئدی به‌همراه پروترکشن کتف",
  "Scapular push-up": "شنا سوئدی کتف",
  "Cable serratus punch": "پانچ دندانه‌ای با سیم‌کش",
  "Dumbbell pullover": "پول‌اور دمبل",
  "Leg extension": "جلو پا دستگاه",
  "Front squat": "اسکوات از جلو",
  "Hack squat": "هاک اسکوات",
  "Sissy squat": "سیسی اسکوات",
  "Leg press": "پرس پا",
  "Narrow-stance squat": "اسکوات با فاصله کم پاها",
  "Heel-elevated squat": "اسکوات با پاشنه بالا",
  "Split squat": "اسپلیت اسکوات",
  "Tibialis raise": "بالا آوردن پنجه برای عضله درشت‌نئی",
  "Wall tibialis raise": "بالا آوردن پنجه با تکیه به دیوار",
  "Toe raise": "بالا آوردن پنجه پا",
  "Heel walk": "راه رفتن روی پاشنه",
  "Dumbbell shrug": "شراگ دمبل",
  "Barbell shrug": "شراگ هالتر",
  "Cable shrug": "شراگ سیم‌کش",
  "Chest-supported row": "پارویی با تکیه‌گاه سینه",
  "Seated cable row": "قایقی سیم‌کش نشسته",
  "Reverse fly": "فلای معکوس",
  "Prone Y raise": "بالا آوردن دست به شکل Y در حالت دمر",
  "Cable Y raise": "بالا آوردن دست به شکل Y با سیم‌کش",
  "Face pull with external rotation": "فیس پول همراه با چرخش خارجی",
  "Scapular pull-up": "بارفیکس کتف",
  "Cable external rotation": "چرخش خارجی شانه با سیم‌کش",
  "Side-lying external rotation": "چرخش خارجی شانه در حالت خوابیده به پهلو",
  "Band external rotation": "چرخش خارجی شانه با کش",
  "Straight-arm pulldown": "پول‌دان دست صاف",
  "Close-grip lat pulldown": "لت سیم‌کش دست جمع",
  "Neutral-grip pulldown": "لت سیم‌کش دست خنثی",
  "Wide-grip lat pulldown": "لت سیم‌کش دست باز",
  "Pull-up": "بارفیکس",
  "Assisted pull-up": "بارفیکس کمکی",
  "One-arm dumbbell row": "پارویی دمبل تک‌دست",
  "Neutral-grip lat pulldown": "لت سیم‌کش دست خنثی",
  "One-arm cable pulldown": "پول‌دان سیم‌کش تک‌دست",
  "Bench-supported dumbbell row": "پارویی دمبل با تکیه به نیمکت",
  "Seated row with pause": "پارویی نشسته با مکث",
  "Romanian deadlift": "ددلیفت رومانیایی",
  "Back extension": "فیله کمر",
  "Deadlift": "ددلیفت",
  "Bird dog": "حرکت برد داگ",
  "Quadruped opposite arm and leg raise": "بالا آوردن دست و پای مخالف در حالت چهار دست‌وپا",
  "Dead bug": "حرکت دد باگ",
  "Suitcase carry": "راه رفتن با وزنه یک‌طرفه",
  "Controlled side bend": "خم‌شدن کنترل‌شده به پهلو",
  "Cable hip abduction": "دورکردن ران با سیم‌کش",
  "Machine hip abduction": "دورکردن ران با دستگاه",
  "Side-lying leg raise": "بالا آوردن پا در حالت خوابیده به پهلو",
  "Lateral band walk": "راه رفتن جانبی با کش",
  "Hip thrust": "هیپ تراست",
  "Bulgarian split squat": "اسپلیت اسکوات بلغاری",
  "Glute bridge": "پل باسن",
  "Seated leg curl": "پشت پا نشسته",
  "Lying leg curl": "پشت پا خوابیده",
  "Nordic curl": "نوردیک کرل",
  "Single-leg deadlift": "ددلیفت تک‌پا",
  "Good morning": "حرکت گود مورنینگ",
  "Standing calf raise": "ساق پا ایستاده",
  "Single-leg calf raise": "ساق پا تک‌پا",
  "Leg press calf raise": "ساق پا با دستگاه پرس پا",
  "Donkey calf raise": "ساق پا دانکی",
  "Smith-machine calf raise": "ساق پا با دستگاه اسمیت",
  "Seated calf raise": "ساق پا نشسته",
  "Bent-knee calf raise": "ساق پا با زانوی خم",
  "Seated machine calf raise": "ساق پا نشسته با دستگاه",
  "Controlled step-down": "پایین‌آمدن کنترل‌شده از پله",
  "Calf raise variations": "انواع حرکت ساق پا",
  "Single-leg balance": "تعادل روی یک پا",
  "Band eversion": "چرخش خارجی پا با کش",
  "Controlled breathing": "تنفس کنترل‌شده",
  "Thoracic mobility": "تمرین‌های تحرک‌پذیری ستون فقرات سینه‌ای",
  "Triceps extension": "بازکردن آرنج برای پشت بازو",
  "Figure-four stretch": "کشش شکل عدد چهار",
  "Single-leg bridge": "پل باسن تک‌پا",
  "Hip external rotation": "چرخش خارجی مفصل ران",
  "Sumo deadlift": "ددلیفت سومو",
  "Cable hip adduction": "نزدیک‌کردن ران با سیم‌کش",
  "Copenhagen plank": "پلانک کپنهاگ",
  "Lateral lunge": "لانج جانبی",
  "Calf raise": "ساق پا",
  "Foot inversion with band": "چرخاندن کف پا به داخل با کش",
};

/**
 * Return display-ready region data without mutating the canonical catalog.
 * Matching and scoring should continue using getMuscleRegionInfo().
 */
export function getLocalizedMuscleRegionInfo(
  id: string | null | undefined,
  language: "en" | "fa",
): MuscleRegionInfo | undefined {
  const region = getMuscleRegionInfo(id);

  if (!region || language !== "fa") {
    return region;
  }

  const localized = FA_REGION_TEXT[region.id];

  return {
    ...region,
    name: localized?.name ?? region.name,
    area: localized?.area ?? region.area,
    exercises: region.exercises.map(
      (exercise) => FA_EXERCISE_TEXT[exercise] ?? exercise,
    ),
  };
}
