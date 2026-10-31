import type { Language, TranslationKey } from "@/lib/i18n/translations";

type Translate = (key: TranslationKey) => string;

type ExerciseLabelType = "muscle" | "equipment" | "difficulty";

const muscleKeys: Record<string, TranslationKey> = {
  chest: "exerciseMuscleChest",
  back: "exerciseMuscleBack",
  shoulders: "exerciseMuscleShoulders",
  shoulder: "exerciseMuscleShoulders",
  biceps: "exerciseMuscleBiceps",
  triceps: "exerciseMuscleTriceps",
  quadriceps: "exerciseMuscleQuadriceps",
  quads: "exerciseMuscleQuadriceps",
  hamstrings: "exerciseMuscleHamstrings",
  glutes: "exerciseMuscleGlutes",
  calves: "exerciseMuscleCalves",
  abs: "exerciseMuscleAbs",
};


const equipmentKeys: Record<string, TranslationKey> = {
  barbell: "exerciseEquipmentBarbell",
  dumbbell: "exerciseEquipmentDumbbell",
  dumbbells: "exerciseEquipmentDumbbell",
  cable: "exerciseEquipmentCable",
  machine: "exerciseEquipmentMachine",
  bodyweight: "exerciseEquipmentBodyweight",
  "body weight": "exerciseEquipmentBodyweight",
  kettlebell: "exerciseEquipmentKettlebell",
  "resistance band": "exerciseEquipmentResistanceBand",
  "resistance bands": "exerciseEquipmentResistanceBand",
};


const difficultyKeys: Record<string, TranslationKey> = {
  beginner: "exerciseDifficultyBeginner",
  intermediate: "exerciseDifficultyIntermediate",
  advanced: "exerciseDifficultyAdvanced",
};

const dictionaries = {
  muscle: muscleKeys,
  equipment: equipmentKeys,
  difficulty: difficultyKeys,
} as const;

function normalizeLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[‐‑‒–—_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Persian labels for additional muscle tags used by the exercise seed.
 * Existing translation keys above remain the source for common labels.
 */
const persianMuscleLabels: Record<string, string> = {
  core: "عضلات میان‌تنه",
  forearms: "ساعد",
  forearm: "ساعد",
  traps: "عضلات ذوزنقه‌ای",
  trapezius: "عضله ذوزنقه‌ای",
  "rear delts": "پشت سرشانه",
  "lower traps": "بخش پایینی ذوزنقه‌ای",
  "hip flexors": "عضلات خم‌کننده ران",
  "wrist extensors": "بازکننده‌های مچ دست",
  "wrist flexors": "خم‌کننده‌های مچ دست",
  "erector spinae": "راست‌کننده‌های ستون فقرات",
  "rotator cuff": "کاف چرخاننده شانه",
  "shin muscles": "عضلات جلوی ساق",
  abdominals: "عضلات شکم",
  brachioradialis: "عضله بازویی‌زندزبرینی",
  "tibialis anterior": "عضله درشت‌نئی قدامی",
  soleus: "عضله نعلی",
  gastrocnemius: "عضله دوقلوی ساق",
  hips: "عضلات ناحیه لگن",
  "ankle evertors": "عضلات برگرداننده مچ پا به بیرون",
  "gluteus medius": "عضله سرینی میانی",
  "gluteus maximus": "عضله سرینی بزرگ",
  "rear shoulder": "پشت سرشانه",
};

/**
 * Extra equipment labels used by seed records.
 */
const persianEquipmentLabels: Record<string, string> = {
  "pull up bar": "میله بارفیکس",
  mat: "زیرانداز",
  "resistance band": "کش مقاومتی",
  "resistance bands": "کش‌های مقاومتی",
  dumbbells: "دمبل",
  none: "بدون تجهیزات",
};

/**
 * Translate muscle, equipment and difficulty labels.
 * Unknown values are preserved instead of being discarded.
 */
export function translateExerciseLabel(
  value: string | null | undefined,
  type: ExerciseLabelType,
  t: Translate,
  language?: Language,
): string {
  if (!value) return "";

  const dictionary = dictionaries[type];

  return value
    .split(/([,/&])/)
    .map((part) => {
      const normalized = normalizeLabel(part);
      const key = dictionary[normalized];

      if (key) return t(key);

      if (language === "fa") {
        if (type === "muscle") {
          return persianMuscleLabels[normalized] ?? part;
        }

        if (type === "equipment") {
          return persianEquipmentLabels[normalized] ?? part;
        }
      }

      return part;
    })
    .join("");
}

/**
 * Canonical Persian display names for the exercise names in seed.ts.
 * Database names and API values must remain in English.
 */
const persianExerciseNames: Record<string, string> = {
  "barbell bench press": "پرس سینه هالتر",
  "incline dumbbell press": "پرس بالاسینه دمبل",
  "dumbbell fly": "فلای سینه دمبل",
  "push up": "شنا سوئدی",
  "cable chest fly": "فلای سینه سیم‌کش",

  "pull up": "بارفیکس",
  "lat pulldown": "لت سیم‌کش",
  "barbell row": "زیربغل هالتر خم",
  "seated cable row": "قایقی سیم‌کش نشسته",
  "one arm dumbbell row": "زیربغل دمبل تک‌دست",
  "straight arm pulldown": "پول‌دان دست صاف",

  "overhead press": "پرس سرشانه",
  "dumbbell lateral raise": "نشر جانب دمبل",
  "reverse dumbbell fly": "نشر خم دمبل",
  "face pull": "فیس پول",

  "dumbbell curl": "جلو بازو دمبل",
  "hammer curl": "جلو بازو چکشی",
  "barbell curl": "جلو بازو هالتر",

  "triceps pushdown": "پشت بازو سیم‌کش",
  "overhead dumbbell triceps extension": "پشت بازو دمبل بالای سر",
  "close grip push up": "شنا دست جمع",

  "barbell squat": "اسکوات هالتر",
  "goblet squat": "اسکوات جام",
  "leg press": "پرس پا",
  "leg extension": "جلو پا دستگاه",
  "bodyweight split squat": "اسپلیت اسکوات وزن بدن",

  "romanian deadlift": "ددلیفت رومانیایی",
  "leg curl": "پشت پا دستگاه",
  "hip thrust": "هیپ تراست",
  "glute bridge": "پل باسن",
  deadlift: "ددلیفت",

  plank: "پلانک",
  "dead bug": "دد باگ",
  "reverse crunch": "کرانچ معکوس",

  "flat bench press": "پرس سینه تخت",
  "flat dumbbell press": "پرس سینه دمبل تخت",
  "decline dumbbell press": "پرس زیرسینه دمبل",
  "high to low cable fly": "فلای سیم‌کش از بالا به پایین",
  "low to high cable fly": "فلای سیم‌کش از پایین به بالا",
  "chest dips": "دیپ سینه",

  "dumbbell shoulder press": "پرس سرشانه دمبل",
  "cable lateral raise": "نشر جانب سیم‌کش",
  "cable rear delt fly": "فلای پشت سرشانه سیم‌کش",
  "cable external rotation": "چرخش خارجی شانه با سیم‌کش",
  "band external rotation": "چرخش خارجی شانه با کش",
  "prone y raise": "بالا آوردن دست به شکل Y در حالت دمر",

  "chest supported row": "زیربغل قایقی با تکیه‌گاه سینه",
  "neutral grip lat pulldown": "لت سیم‌کش دست موازی",
  "close grip lat pulldown": "لت سیم‌کش دست جمع",
  "dumbbell pullover": "پول‌اور دمبل",
  "dumbbell shrug": "شراگ دمبل",
  "back extension": "فیله کمر",
  "bird dog": "برد داگ",
  "face pull with external rotation": "فیس پول همراه با چرخش خارجی",

  "incline dumbbell curl": "جلو بازو دمبل روی میز شیب‌دار",
  "reverse curl": "جلو بازو معکوس",
  "seated wrist curl": "مچ‌خم نشسته",
  "reverse wrist curl": "مچ‌خم معکوس",

  "cable crunch": "کرانچ سیم‌کش",
  "hanging knee raise": "بالا آوردن زانو در حالت آویزان",
  "side plank": "پلانک پهلو",
  "pallof press": "پالوف پرس",

  "front squat": "اسکوات از جلو",
  "heel elevated squat": "اسکوات با پاشنه بالا",
  "seated leg curl": "پشت پا نشسته",
  "nordic curl": "نوردیک کرل",
  "bulgarian split squat": "اسپلیت اسکوات بلغاری",
  "cable hip abduction": "دورکردن ران با سیم‌کش",
  "lateral band walk": "راه رفتن جانبی با کش",

  "standing calf raise": "ساق پا ایستاده",
  "seated calf raise": "ساق پا نشسته",
  "single leg calf raise": "ساق پا تک‌پا",
  "tibialis raise": "بالا آوردن پنجه پا",
  "band ankle eversion": "چرخش خارجی مچ پا با کش",
};

/**
 * Translate an exercise name for display only.
 * Returns the original English value when language is English
 * or when no Persian translation is available.
 */
export function translateExerciseName(
  value: string | null | undefined,
  language: Language,
): string {
  if (!value) return "";
  if (language !== "fa") return value;

  const normalized = normalizeLabel(value);

  return persianExerciseNames[normalized] ?? value;
}

/**
 * Workout split/day labels generated by FitTrack.
 * These labels are for UI only and do not affect stored workout data.
 */
const persianWorkoutDayNames: Record<string, string> = {
  "full body a": "تمرین تمام‌بدن A",
  "full body b": "تمرین تمام‌بدن B",
  push: "تمرین حرکات فشاری",
  "push day": "روز حرکات فشاری",
  "push a": "روز حرکات فشاری A",
  "push b": "روز حرکات فشاری B",
  pull: "تمرین حرکات کششی",
  "pull day": "روز حرکات کششی",
  "pull a": "روز حرکات کششی A",
  "pull b": "روز حرکات کششی B",
  legs: "تمرین پا",
  "legs and core": "تمرین پا و میان‌تنه",
  "legs core": "تمرین پا و میان‌تنه",
  "legs a": "تمرین پا A",
  "legs b": "تمرین پا B",
  "upper a": "بالاتنه A",
  "upper b": "بالاتنه B",
  "lower a": "پایین‌تنه A",
  "lower b": "پایین‌تنه B",
  "upper body": "بالاتنه",
  "lower body and arms": "پایین‌تنه و بازو",
};

/**
 * Translate known workout split names without changing API values.
 */
export function translateWorkoutDayName(
  value: string | null | undefined,
  language: Language,
): string {
  if (!value) return "";
  if (language !== "fa") return value;

  const normalized = normalizeLabel(value);
  const dayMatch = normalized.match(/^day\s*(\d+)$/);

  if (dayMatch) {
    const dayNumber = new Intl.NumberFormat("fa-IR").format(
      Number(dayMatch[1]),
    );

    return `روز ${dayNumber}`;
  }
  return persianWorkoutDayNames[normalized] ?? value;
}

const persianWorkoutPlanNames: Record<string, string> = {
  "my training plan": "برنامه تمرینی من",
  "my workout plan": "برنامه ورزشی من",
  "workout plan": "برنامه تمرینی",
};

export function translateWorkoutPlanName(
  value: string | null | undefined,
  language: Language,
): string {
  if (!value || language !== "fa") return value ?? "";

  const normalized = normalizeLabel(value);
  return persianWorkoutPlanNames[normalized] ?? value;
}

const persianWorkoutGoals: Record<string, string> = {
  "muscle gain": "عضله‌سازی",
  strength: "افزایش قدرت",
  "fat loss": "کاهش چربی",
  "general fitness": "تناسب اندام عمومی",
  maintenance: "حفظ وضعیت فعلی",
  endurance: "افزایش استقامت",
};

const persianExperienceLevels: Record<string, string> = {
  beginner: "مبتدی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
};

export function translateWorkoutPlanDescription(
  value: string | null | undefined,
  language: Language,
): string {
  if (!value || language !== "fa") return value ?? "";

  const normalized = value.trim().replace(/\s+/g, " ");

  const match = normalized.match(
    /^Generated\s+(.+?)\s+plan\s+for\s+(\d+)\s+days?\s+per\s+week\.?\s*Level:\s*(beginner|intermediate|advanced)\.?$/i,
  );

  // Preserve custom descriptions written by the user.
  if (!match) return value;

  const goal = persianWorkoutGoals[normalizeLabel(match[1])];
  const level = persianExperienceLevels[normalizeLabel(match[3])];

  // Preserve the original description when its format is unknown.
  if (!goal || !level) return value;

  const days = new Intl.NumberFormat("fa-IR").format(Number(match[2]));

  return `برنامه ${goal} برای ${days} روز در هفته · سطح: ${level}`;
}
