"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import { Canvas } from "@react-three/fiber";
import { getLocalizedMuscleRegionInfo } from "@/lib/anatomy/muscle-region-map";
import { ContactShadows, OrbitControls } from "@react-three/drei";

import * as THREE from "three";

import { getMuscleRegionInfo } from "@/lib/anatomy/muscle-region-map";

/**

 * FitTrack — sculpted interactive muscle atlas

 *

 * Drop-in API retained from the existing page:

 * <AnatomyViewer selectedMuscle="back" onSelectMuscle={...} view="back" />

 *

 * This is an original procedural anatomical-style illustration, not a clinical

 * scan or a substitute for a named-mesh anatomical asset. The forms are lofted

 * meshes with tapered ends and smooth cross-sections (not piles of spheres).

 * The front view preserves the anterior meshes. The posterior view has its own

 * explicitly projected set of muscle meshes, placed on the mannequin's rear skin

 * envelope before the body turns, with built-in Front/Back controls for reliable

 * switching even when the parent page's view state is not wired correctly.

 */

type View = "front" | "back";

type Node = readonly [
  x: number,
  y: number,
  z: number,
  width: number,
  depth: number,
];

type GroupId =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "serratus"
  | "quadriceps"
  | "tibialis"
  | "back"
  | "traps"
  | "lats"
  | "lower-back"
  | "glutes"
  | "glute-med"
  | "hamstrings"
  | "calves";

type MuscleSpec = {
  key: string;

  regionId: string;

  id: GroupId;

  name: string;

  view: View;

  nodes: readonly Node[];

  tone?: string;
};

type Props = {
  selectedMuscle: string;

  onSelectMuscle: (id: string) => void;

  /** Accepts existing page values such as front/back, anterior/posterior or dorsal. */

  view: View | string;

  className?: string;

  /** Optional exact-region synchronization with the side exercise panel. */

  selectedRegion?: string;

  onSelectRegion?: (regionId: string) => void;

  /** Optional callback for synchronizing the page's own front/back controls. */

  onViewChange?: (view: View) => void;

  /** Set false only when the surrounding page provides the sole view control. */

  showViewControls?: boolean;
};

const BASE_MUSCLE = "#984b4d";

const BASE_MUSCLE_LIGHT = "#b96b68";

const HIGHLIGHT = "#c6ff55";

const n = (x: number, y: number, z: number, w: number, d: number): Node => [
  x,
  y,
  z,
  w,
  d,
];

/** Create the mirrored half without changing the target muscle group. */

function pair(
  key: string,

  id: GroupId,

  name: string,

  view: View,

  nodes: readonly Node[],

  tone?: string,

  regionId: string = key,
): MuscleSpec[] {
  return [
    {
      key: `${key}-L`,
      regionId,
      id,
      name: `${name} (left)`,
      view,
      nodes,
      tone,
    },

    {
      key: `${key}-R`,
      regionId,
      id,
      name: `${name} (right)`,
      view,

      nodes: nodes.map(([x, y, z, w, d]) => n(-x, y, z, w, d)).reverse(),
      tone,
    },
  ];
}

const MUSCLES: MuscleSpec[] = [
  // FRONT — chest and shoulder girdle

  // Pectoralis major is split into clavicular, sternal and abdominal regions.

  ...pair(
    "pec-upper",
    "chest",
    "Upper chest · clavicular head",
    "front",
    [
      n(0.055, 3.59, 0.265, 0.012, 0.01),
      n(0.19, 3.6, 0.305, 0.075, 0.052),

      n(0.36, 3.55, 0.32, 0.11, 0.067),
      n(0.51, 3.48, 0.3, 0.09, 0.052),

      n(0.62, 3.37, 0.235, 0.012, 0.01),
    ],
    undefined,
    "chest-upper",
  ),

  ...pair(
    "pec-mid",
    "chest",
    "Mid chest · sternal head",
    "front",
    [
      n(0.055, 3.47, 0.285, 0.012, 0.01),
      n(0.2, 3.45, 0.326, 0.09, 0.065),

      n(0.39, 3.42, 0.34, 0.12, 0.072),
      n(0.54, 3.35, 0.3, 0.085, 0.052),

      n(0.63, 3.27, 0.235, 0.012, 0.01),
    ],
    undefined,
    "chest-mid",
  ),

  ...pair(
    "pec-lower",
    "chest",
    "Lower chest · abdominal head",
    "front",
    [
      n(0.07, 3.34, 0.27, 0.012, 0.01),
      n(0.2, 3.31, 0.305, 0.08, 0.052),

      n(0.38, 3.29, 0.31, 0.1, 0.057),
      n(0.52, 3.28, 0.265, 0.07, 0.04),

      n(0.61, 3.23, 0.205, 0.01, 0.01),
    ],
    undefined,
    "chest-lower",
  ),

  ...pair("front-deltoid", "shoulders", "Anterior deltoid", "front", [
    n(0.57, 3.72, 0.19, 0.015, 0.01),
    n(0.69, 3.67, 0.205, 0.105, 0.08),

    n(0.75, 3.53, 0.17, 0.095, 0.075),
    n(0.69, 3.42, 0.13, 0.018, 0.015),
  ]),

  ...pair(
    "side-deltoid",
    "shoulders",
    "Lateral deltoid",
    "front",
    [
      n(0.63, 3.72, 0.1, 0.012, 0.01),
      n(0.73, 3.65, 0.12, 0.082, 0.07),

      n(0.78, 3.52, 0.12, 0.083, 0.065),
      n(0.73, 3.43, 0.09, 0.012, 0.01),
    ],
    undefined,
    "side-deltoid",
  ),

  ...pair("biceps-brachii", "biceps", "Biceps brachii", "front", [
    n(0.72, 3.37, 0.15, 0.018, 0.012),
    n(0.78, 3.18, 0.185, 0.072, 0.065),

    n(0.8, 2.98, 0.17, 0.064, 0.055),
    n(0.78, 2.84, 0.135, 0.012, 0.012),
  ]),

  ...pair(
    "brachialis",
    "biceps",
    "Brachialis",
    "front",
    [
      n(0.765, 3.2, 0.195, 0.01, 0.01),
      n(0.81, 3.02, 0.205, 0.035, 0.038),

      n(0.8, 2.88, 0.16, 0.012, 0.01),
    ],
    "#a65a57",
  ),

  ...pair("forearm-flexors", "forearms", "Forearm flexors", "front", [
    n(0.8, 2.82, 0.13, 0.015, 0.01),
    n(0.85, 2.65, 0.15, 0.06, 0.05),

    n(0.88, 2.44, 0.13, 0.047, 0.04),
    n(0.87, 2.3, 0.09, 0.012, 0.01),
  ]),

  // FRONT — abdomen, obliques and serratus slips

  ...pair("rectus-abdominis-upper", "abs", "Rectus abdominis", "front", [
    n(0.105, 3.12, 0.285, 0.012, 0.01),
    n(0.105, 2.98, 0.302, 0.074, 0.042),

    n(0.105, 2.84, 0.29, 0.07, 0.039),
    n(0.105, 2.76, 0.27, 0.012, 0.008),
  ]),

  ...pair("rectus-abdominis-lower", "abs", "Lower rectus abdominis", "front", [
    n(0.095, 2.74, 0.26, 0.01, 0.008),
    n(0.09, 2.61, 0.265, 0.065, 0.035),

    n(0.09, 2.48, 0.245, 0.048, 0.03),
    n(0.08, 2.39, 0.21, 0.009, 0.008),
  ]),

  ...pair("external-oblique", "obliques", "External oblique", "front", [
    n(0.39, 3.12, 0.235, 0.012, 0.01),
    n(0.37, 2.98, 0.265, 0.075, 0.04),

    n(0.32, 2.8, 0.28, 0.083, 0.045),
    n(0.23, 2.63, 0.25, 0.045, 0.026),

    n(0.16, 2.51, 0.2, 0.008, 0.008),
  ]),

  ...pair("serratus-anterior", "serratus", "Serratus anterior", "front", [
    n(0.54, 3.25, 0.255, 0.01, 0.01),
    n(0.48, 3.17, 0.29, 0.045, 0.03),

    n(0.42, 3.09, 0.3, 0.05, 0.035),
    n(0.37, 3.0, 0.3, 0.01, 0.01),
  ]),

  // FRONT — thigh compartments and shin

  ...pair("rectus-femoris", "quadriceps", "Rectus femoris", "front", [
    n(0.22, 2.2, 0.18, 0.012, 0.01),
    n(0.24, 1.96, 0.21, 0.091, 0.067),

    n(0.24, 1.67, 0.2, 0.096, 0.07),
    n(0.22, 1.43, 0.15, 0.035, 0.028),

    n(0.21, 1.36, 0.12, 0.008, 0.008),
  ]),

  ...pair("vastus-lateralis", "quadriceps", "Vastus lateralis", "front", [
    n(0.3, 2.16, 0.12, 0.01, 0.01),
    n(0.38, 1.96, 0.14, 0.082, 0.055),

    n(0.39, 1.69, 0.14, 0.084, 0.06),
    n(0.31, 1.43, 0.13, 0.015, 0.01),
  ]),

  ...pair("vastus-medialis", "quadriceps", "Vastus medialis", "front", [
    n(0.17, 1.68, 0.18, 0.01, 0.01),
    n(0.17, 1.53, 0.18, 0.065, 0.047),

    n(0.21, 1.4, 0.145, 0.048, 0.035),
    n(0.22, 1.34, 0.11, 0.008, 0.008),
  ]),

  ...pair("tibialis-anterior", "tibialis", "Tibialis anterior", "front", [
    n(0.22, 1.28, 0.11, 0.01, 0.01),
    n(0.23, 1.02, 0.13, 0.045, 0.04),

    n(0.24, 0.7, 0.12, 0.034, 0.03),
    n(0.25, 0.49, 0.07, 0.008, 0.008),
  ]),

  // FRONT — refined superficial anatomy (additive; existing front/back meshes retained)
  ...pair(
    "sternocleidomastoid",
    "shoulders",
    "Sternocleidomastoid",
    "front",
    [
      n(0.055, 4.24, 0.105, 0.008, 0.008),
      n(0.095, 4.06, 0.145, 0.032, 0.025),
      n(0.15, 3.88, 0.185, 0.035, 0.028),
      n(0.245, 3.69, 0.185, 0.027, 0.022),
      n(0.31, 3.63, 0.15, 0.006, 0.006),
    ],
    "#a45b59",
    "sternocleidomastoid",
  ),

  ...pair(
    "coracobrachialis",
    "biceps",
    "Coracobrachialis",
    "front",
    [
      n(0.655, 3.43, 0.14, 0.006, 0.006),
      n(0.705, 3.27, 0.19, 0.027, 0.023),
      n(0.73, 3.1, 0.185, 0.024, 0.02),
      n(0.755, 2.99, 0.13, 0.006, 0.006),
    ],
    "#a65a57",
    "coracobrachialis",
  ),

  // Anterior-lateral forearm anatomy: distinct from the broad flexor mass.
  ...pair(
    "brachioradialis-anterior",
    "forearms",
    "Brachioradialis · lateral forearm",
    "front",
    [
      n(0.79, 2.84, 0.115, 0.006, 0.006),
      n(0.835, 2.68, 0.16, 0.042, 0.03),
      n(0.86, 2.49, 0.145, 0.037, 0.027),
      n(0.86, 2.34, 0.095, 0.006, 0.006),
    ],
    "#a65a57",
    "brachioradialis-anterior",
  ),
  ...pair(
    "pronator-teres",
    "forearms",
    "Pronator teres",
    "front",
    [
      n(0.78, 2.82, 0.14, 0.006, 0.006),
      n(0.81, 2.72, 0.18, 0.028, 0.022),
      n(0.85, 2.6, 0.175, 0.025, 0.02),
      n(0.875, 2.52, 0.13, 0.006, 0.006),
    ],
    "#a65a57",
    "pronator-teres",
  ),
  ...pair(
    "flexor-carpi-radialis",
    "forearms",
    "Flexor carpi radialis",
    "front",
    [
      n(0.82, 2.78, 0.13, 0.005, 0.005),
      n(0.84, 2.61, 0.165, 0.024, 0.018),
      n(0.86, 2.43, 0.14, 0.018, 0.014),
      n(0.87, 2.32, 0.09, 0.005, 0.005),
    ],
    "#a65a57",
    "flexor-carpi-radialis",
  ),

  // FRONT — pelvic and medial/lateral thigh compartments.
  ...pair(
    "tensor-fasciae-latae",
    "quadriceps",
    "Tensor fasciae latae",
    "front",
    [
      n(0.36, 2.2, 0.12, 0.006, 0.006),
      n(0.39, 2.1, 0.16, 0.042, 0.03),
      n(0.38, 1.98, 0.15, 0.036, 0.026),
      n(0.35, 1.88, 0.11, 0.006, 0.006),
    ],
    "#a65a57",
    "tensor-fasciae-latae",
  ),
  ...pair(
    "sartorius",
    "quadriceps",
    "Sartorius",
    "front",
    [
      n(0.33, 2.16, 0.145, 0.005, 0.005),
      n(0.3, 2.0, 0.19, 0.028, 0.022),
      n(0.255, 1.8, 0.185, 0.026, 0.02),
      n(0.205, 1.59, 0.155, 0.023, 0.018),
      n(0.165, 1.4, 0.12, 0.005, 0.005),
    ],
    "#a65a57",
    "sartorius",
  ),
  ...pair(
    "adductor-longus",
    "quadriceps",
    "Adductor longus",
    "front",
    [
      n(0.085, 2.1, 0.13, 0.005, 0.005),
      n(0.125, 1.97, 0.19, 0.045, 0.03),
      n(0.16, 1.79, 0.19, 0.043, 0.029),
      n(0.19, 1.6, 0.155, 0.025, 0.018),
      n(0.2, 1.49, 0.12, 0.005, 0.005),
    ],
    "#a65a57",
    "adductor-longus",
  ),
  ...pair(
    "gracilis-anterior",
    "quadriceps",
    "Gracilis · medial thigh edge",
    "front",
    [
      n(0.055, 2.02, 0.1, 0.004, 0.004),
      n(0.065, 1.82, 0.145, 0.021, 0.016),
      n(0.085, 1.6, 0.13, 0.019, 0.014),
      n(0.12, 1.37, 0.09, 0.004, 0.004),
    ],
    "#93464a",
    "gracilis-anterior",
  ),

  // Distinct anterolateral shin muscles improve the front/three-quarter silhouette.
  ...pair(
    "extensor-digitorum-longus",
    "tibialis",
    "Extensor digitorum longus",
    "front",
    [
      n(0.29, 1.24, 0.08, 0.005, 0.005),
      n(0.31, 1.04, 0.125, 0.032, 0.024),
      n(0.31, 0.82, 0.11, 0.025, 0.019),
      n(0.29, 0.58, 0.075, 0.007, 0.006),
    ],
    "#a65a57",
    "extensor-digitorum-longus",
  ),
  ...pair(
    "fibularis-longus-anterior",
    "tibialis",
    "Fibularis (peroneus) longus · anterolateral",
    "front",
    [
      n(0.35, 1.2, 0.045, 0.005, 0.005),
      n(0.36, 1.01, 0.085, 0.028, 0.021),
      n(0.34, 0.82, 0.075, 0.022, 0.017),
      n(0.3, 0.64, 0.045, 0.005, 0.005),
    ],
    "#a65a57",
    "fibularis-longus-anterior",
  ),

  // Individual serratus slips: same region ID means one click selects the whole muscle.
  ...pair(
    "serratus-slip-1",
    "serratus",
    "Serratus anterior · superior slip",
    "front",
    [
      n(0.5, 3.23, 0.3, 0.004, 0.004),
      n(0.46, 3.19, 0.335, 0.027, 0.016),
      n(0.405, 3.16, 0.322, 0.004, 0.004),
    ],
    "#a65a57",
    "serratus-anterior",
  ),
  ...pair(
    "serratus-slip-2",
    "serratus",
    "Serratus anterior · second slip",
    "front",
    [
      n(0.47, 3.15, 0.3, 0.004, 0.004),
      n(0.43, 3.11, 0.333, 0.029, 0.016),
      n(0.38, 3.08, 0.32, 0.004, 0.004),
    ],
    "#a65a57",
    "serratus-anterior",
  ),
  ...pair(
    "serratus-slip-3",
    "serratus",
    "Serratus anterior · third slip",
    "front",
    [
      n(0.43, 3.07, 0.305, 0.004, 0.004),
      n(0.39, 3.03, 0.337, 0.028, 0.016),
      n(0.34, 3.0, 0.32, 0.004, 0.004),
    ],
    "#a65a57",
    "serratus-anterior",
  ),
  ...pair(
    "serratus-slip-4",
    "serratus",
    "Serratus anterior · fourth slip",
    "front",
    [
      n(0.39, 2.99, 0.3, 0.004, 0.004),
      n(0.35, 2.95, 0.329, 0.025, 0.014),
      n(0.31, 2.92, 0.309, 0.004, 0.004),
    ],
    "#a65a57",
    "serratus-anterior",
  ),

  // Subtle pectoral fiber bundles add direction and separation without changing selection IDs.
  ...pair(
    "pec-upper-fibers",
    "chest",
    "Upper chest · fiber detail",
    "front",
    [
      n(0.13, 3.59, 0.357, 0.006, 0.004),
      n(0.28, 3.57, 0.389, 0.012, 0.005),
      n(0.43, 3.51, 0.368, 0.009, 0.004),
      n(0.52, 3.45, 0.331, 0.004, 0.004),
    ],
    "#a85e5c",
    "chest-upper",
  ),
  ...pair(
    "pec-mid-fibers",
    "chest",
    "Mid chest · fiber detail",
    "front",
    [
      n(0.12, 3.46, 0.359, 0.006, 0.004),
      n(0.29, 3.43, 0.408, 0.012, 0.005),
      n(0.44, 3.38, 0.374, 0.009, 0.004),
      n(0.54, 3.32, 0.326, 0.004, 0.004),
    ],
    "#a85e5c",
    "chest-mid",
  ),
  ...pair(
    "pec-lower-fibers",
    "chest",
    "Lower chest · fiber detail",
    "front",
    [
      n(0.13, 3.33, 0.33, 0.006, 0.004),
      n(0.29, 3.3, 0.373, 0.011, 0.005),
      n(0.43, 3.28, 0.348, 0.008, 0.004),
      n(0.52, 3.27, 0.301, 0.004, 0.004),
    ],
    "#a85e5c",
    "chest-lower",
  ),

  // BACK — trapezius, scapular muscles and latissimus

  ...pair("trapezius-upper", "traps", "Upper trapezius", "back", [
    n(0.035, 3.94, -0.12, 0.01, 0.01),
    n(0.14, 3.77, -0.245, 0.08, 0.05),

    n(0.34, 3.64, -0.29, 0.105, 0.055),
    n(0.56, 3.6, -0.245, 0.015, 0.01),
  ]),

  ...pair("trapezius-mid", "traps", "Middle trapezius", "back", [
    n(0.08, 3.48, -0.3, 0.01, 0.01),
    n(0.23, 3.43, -0.32, 0.09, 0.045),

    n(0.39, 3.36, -0.3, 0.08, 0.04),
    n(0.49, 3.28, -0.26, 0.01, 0.01),
  ]),

  ...pair("rear-deltoid", "shoulders", "Posterior deltoid", "back", [
    n(0.58, 3.7, -0.16, 0.012, 0.01),
    n(0.7, 3.63, -0.22, 0.1, 0.075),

    n(0.76, 3.49, -0.19, 0.085, 0.07),
    n(0.68, 3.4, -0.13, 0.01, 0.01),
  ]),

  ...pair("infraspinatus", "back", "Infraspinatus", "back", [
    n(0.16, 3.45, -0.265, 0.01, 0.01),
    n(0.29, 3.43, -0.31, 0.09, 0.038),

    n(0.42, 3.35, -0.28, 0.055, 0.028),
    n(0.49, 3.28, -0.23, 0.008, 0.008),
  ]),

  ...pair("teres-minor", "back", "Teres minor · rotator cuff", "back", [
    n(0.39, 3.48, -0.25, 0.008, 0.008),
    n(0.47, 3.43, -0.285, 0.036, 0.025),

    n(0.54, 3.36, -0.245, 0.024, 0.018),
    n(0.57, 3.31, -0.2, 0.006, 0.006),
  ]),

  ...pair("teres-major", "lats", "Teres major / axillary fold", "back", [
    n(0.47, 3.35, -0.24, 0.01, 0.01),
    n(0.55, 3.28, -0.275, 0.065, 0.035),

    n(0.62, 3.2, -0.24, 0.045, 0.025),
    n(0.68, 3.16, -0.18, 0.009, 0.008),
  ]),

  // The lat is separated into upper, middle and lower fibers; each region is

  // each posterior region is positioned on the negative-Z side and rotated into view.

  ...pair(
    "latissimus-upper",
    "lats",
    "Upper latissimus dorsi",
    "back",
    [
      n(0.57, 3.32, -0.25, 0.012, 0.01),
      n(0.51, 3.2, -0.3, 0.1, 0.055),

      n(0.4, 3.08, -0.32, 0.13, 0.067),
      n(0.3, 2.98, -0.31, 0.09, 0.05),

      n(0.16, 2.93, -0.25, 0.012, 0.01),
    ],
    undefined,
    "lats-upper",
  ),

  ...pair(
    "latissimus-mid",
    "lats",
    "Mid latissimus dorsi",
    "back",
    [
      n(0.48, 3.08, -0.28, 0.012, 0.01),
      n(0.43, 2.94, -0.32, 0.13, 0.065),

      n(0.32, 2.78, -0.32, 0.14, 0.067),
      n(0.2, 2.65, -0.3, 0.09, 0.05),

      n(0.1, 2.59, -0.24, 0.008, 0.008),
    ],
    undefined,
    "lats-mid",
  ),

  ...pair(
    "latissimus-lower",
    "lats",
    "Lower latissimus dorsi",
    "back",
    [
      n(0.33, 2.82, -0.28, 0.01, 0.01),
      n(0.27, 2.68, -0.3, 0.1, 0.055),

      n(0.2, 2.54, -0.28, 0.08, 0.045),
      n(0.12, 2.48, -0.22, 0.012, 0.01),
    ],
    undefined,
    "lats-lower",
  ),

  ...pair("rhomboids", "back", "Rhomboids", "back", [
    n(0.07, 3.49, -0.29, 0.006, 0.005),
    n(0.18, 3.39, -0.335, 0.07, 0.028),

    n(0.25, 3.29, -0.315, 0.05, 0.024),
    n(0.09, 3.22, -0.285, 0.006, 0.005),
  ]),

  ...pair(
    "trapezius-lower",
    "traps",
    "Lower trapezius",
    "back",
    [
      n(0.045, 3.4, -0.27, 0.008, 0.008),
      n(0.12, 3.25, -0.3, 0.055, 0.03),

      n(0.23, 3.1, -0.3, 0.075, 0.038),
      n(0.3, 3.02, -0.27, 0.012, 0.01),
    ],
    undefined,
    "trapezius-lower",
  ),

  // BACK — arms and forearms

  ...pair("triceps-long-head", "triceps", "Triceps long head", "back", [
    n(0.66, 3.41, -0.135, 0.012, 0.01),
    n(0.75, 3.2, -0.18, 0.064, 0.055),

    n(0.78, 3.0, -0.155, 0.058, 0.048),
    n(0.77, 2.86, -0.11, 0.012, 0.01),
  ]),

  ...pair("triceps-lateral-head", "triceps", "Triceps lateral head", "back", [
    n(0.75, 3.27, -0.17, 0.01, 0.01),
    n(0.81, 3.1, -0.17, 0.044, 0.04),

    n(0.81, 2.94, -0.13, 0.012, 0.01),
  ]),

  ...pair("forearm-extensors", "forearms", "Forearm extensors", "back", [
    n(0.79, 2.83, -0.12, 0.01, 0.01),
    n(0.85, 2.65, -0.16, 0.059, 0.045),

    n(0.88, 2.44, -0.14, 0.04, 0.032),
    n(0.87, 2.3, -0.08, 0.01, 0.008),
  ]),

  ...pair(
    "triceps-medial-head",
    "triceps",
    "Triceps medial head",
    "back",
    [
      n(0.69, 3.22, -0.25, 0.01, 0.01),
      n(0.76, 3.05, -0.27, 0.041, 0.033),

      n(0.77, 2.91, -0.23, 0.032, 0.028),
      n(0.77, 2.85, -0.15, 0.008, 0.008),
    ],
    undefined,
    "triceps-medial-head",
  ),

  // BACK — lumbar area / lower back

  ...pair("erector-spinae", "lower-back", "Erector spinae", "back", [
    n(0.065, 3.16, -0.285, 0.01, 0.01),
    n(0.08, 2.96, -0.32, 0.046, 0.034),

    n(0.09, 2.73, -0.31, 0.048, 0.035),
    n(0.1, 2.49, -0.265, 0.042, 0.03),

    n(0.12, 2.36, -0.205, 0.008, 0.008),
  ]),

  ...pair(
    "longissimus-thoracis",
    "lower-back",
    "Longissimus · thoracic spinal erector",
    "back",
    [
      n(0.13, 3.28, -0.27, 0.008, 0.008),
      n(0.15, 3.06, -0.3, 0.035, 0.026),

      n(0.15, 2.85, -0.3, 0.038, 0.027),
      n(0.13, 2.66, -0.275, 0.028, 0.02),
    ],
    "#a65a57",
    "erector-spinae",
  ),

  ...pair(
    "iliocostalis-lumborum",
    "lower-back",
    "Iliocostalis · lumbar spinal erector",
    "back",
    [
      n(0.18, 2.83, -0.255, 0.008, 0.008),
      n(0.24, 2.65, -0.26, 0.034, 0.024),

      n(0.27, 2.48, -0.225, 0.025, 0.018),
      n(0.23, 2.38, -0.18, 0.006, 0.006),
    ],
    "#a65a57",
    "erector-spinae",
  ),

  ...pair(
    "multifidus",
    "lower-back",
    "Multifidus / deep lumbar stabilizers",
    "back",
    [
      n(0.035, 2.91, -0.27, 0.006, 0.006),
      n(0.055, 2.77, -0.3, 0.03, 0.022),

      n(0.06, 2.61, -0.29, 0.028, 0.02),
      n(0.08, 2.48, -0.25, 0.006, 0.006),
    ],
    "#8b4145",
    "multifidus",
  ),

  ...pair("quadratus-lumborum", "lower-back", "Quadratus lumborum", "back", [
    n(0.15, 2.77, -0.28, 0.01, 0.01),
    n(0.22, 2.62, -0.29, 0.05, 0.03),

    n(0.25, 2.47, -0.24, 0.018, 0.014),
  ]),

  // BACK — pelvis and gluteal group

  ...pair("gluteus-medius", "glute-med", "Gluteus medius", "back", [
    n(0.19, 2.45, -0.19, 0.008, 0.008),
    n(0.31, 2.4, -0.265, 0.09, 0.055),

    n(0.43, 2.31, -0.27, 0.08, 0.05),
    n(0.48, 2.22, -0.2, 0.008, 0.008),
  ]),

  ...pair("gluteus-maximus", "glutes", "Gluteus maximus", "back", [
    n(0.12, 2.3, -0.235, 0.008, 0.008),
    n(0.22, 2.22, -0.315, 0.105, 0.075),

    n(0.31, 2.08, -0.33, 0.105, 0.08),
    n(0.3, 1.96, -0.26, 0.06, 0.04),

    n(0.22, 1.91, -0.18, 0.008, 0.008),
  ]),

  // BACK — hamstrings, behind the knee and calves

  ...pair("biceps-femoris", "hamstrings", "Biceps femoris", "back", [
    n(0.29, 1.94, -0.15, 0.01, 0.01),
    n(0.34, 1.72, -0.17, 0.065, 0.047),

    n(0.33, 1.47, -0.15, 0.058, 0.043),
    n(0.29, 1.27, -0.12, 0.012, 0.01),
  ]),

  ...pair("semitendinosus", "hamstrings", "Semitendinosus", "back", [
    n(0.17, 1.92, -0.16, 0.008, 0.008),
    n(0.19, 1.7, -0.19, 0.055, 0.04),

    n(0.2, 1.45, -0.15, 0.046, 0.035),
    n(0.22, 1.25, -0.1, 0.008, 0.008),
  ]),

  ...pair("semimembranosus", "hamstrings", "Semimembranosus", "back", [
    n(0.13, 1.86, -0.13, 0.008, 0.008),
    n(0.15, 1.63, -0.17, 0.04, 0.033),

    n(0.16, 1.42, -0.13, 0.035, 0.028),
    n(0.18, 1.28, -0.09, 0.008, 0.008),
  ]),

  ...pair("gastrocnemius-lateral", "calves", "Lateral gastrocnemius", "back", [
    n(0.24, 1.25, -0.11, 0.01, 0.01),
    n(0.3, 1.08, -0.16, 0.067, 0.052),

    n(0.29, 0.91, -0.15, 0.055, 0.044),
    n(0.26, 0.73, -0.1, 0.015, 0.01),
  ]),

  ...pair("gastrocnemius-medial", "calves", "Medial gastrocnemius", "back", [
    n(0.18, 1.24, -0.11, 0.01, 0.01),
    n(0.17, 1.08, -0.17, 0.063, 0.05),

    n(0.2, 0.91, -0.15, 0.05, 0.04),
    n(0.23, 0.74, -0.1, 0.012, 0.01),
  ]),

  ...pair(
    "soleus",
    "calves",
    "Soleus",
    "back",
    [
      n(0.22, 0.9, -0.1, 0.008, 0.008),
      n(0.23, 0.72, -0.12, 0.043, 0.035),

      n(0.24, 0.56, -0.09, 0.025, 0.02),
      n(0.25, 0.48, -0.06, 0.006, 0.006),
    ],
    "#a75a59",
  ),

  ...pair(
    "popliteus",
    "calves",
    "Popliteus · back of knee",
    "back",
    [
      n(0.22, 1.31, -0.105, 0.006, 0.006),
      n(0.25, 1.25, -0.135, 0.024, 0.018),

      n(0.29, 1.2, -0.12, 0.018, 0.014),
      n(0.31, 1.18, -0.09, 0.005, 0.005),
    ],
    "#8f4347",
    "popliteus",
  ),

  ...pair(
    "peroneus-longus",
    "calves",
    "Fibularis (peroneus) longus",
    "back",
    [
      n(0.36, 1.22, -0.075, 0.008, 0.008),
      n(0.36, 1.03, -0.105, 0.033, 0.026),

      n(0.33, 0.82, -0.085, 0.028, 0.021),
      n(0.29, 0.63, -0.055, 0.008, 0.008),
    ],
    "#a75a59",
    "peroneals",
  ),

  // POSTERIOR — scapular elevators and the deep shoulder girdle.

  ...pair(
    "levator-scapulae",
    "traps",
    "Levator scapulae",
    "back",
    [
      n(0.17, 3.94, -0.12, 0.006, 0.006),
      n(0.24, 3.78, -0.19, 0.032, 0.022),

      n(0.32, 3.62, -0.23, 0.029, 0.021),
      n(0.4, 3.48, -0.19, 0.006, 0.006),
    ],
    "#a65a57",
    "levator-scapulae",
  ),

  ...pair(
    "rhomboid-minor",
    "back",
    "Rhomboid minor",
    "back",
    [
      n(0.055, 3.48, -0.22, 0.005, 0.005),
      n(0.14, 3.43, -0.265, 0.036, 0.022),

      n(0.22, 3.37, -0.27, 0.028, 0.019),
      n(0.27, 3.31, -0.22, 0.005, 0.005),
    ],
    "#a65a57",
    "rhomboids",
  ),

  ...pair(
    "rhomboid-major",
    "back",
    "Rhomboid major",
    "back",
    [
      n(0.09, 3.34, -0.23, 0.006, 0.005),
      n(0.19, 3.28, -0.285, 0.046, 0.027),

      n(0.28, 3.2, -0.285, 0.039, 0.024),
      n(0.34, 3.12, -0.23, 0.006, 0.005),
    ],
    "#a65a57",
    "rhomboids",
  ),

  ...pair(
    "serratus-posterior-superior",
    "back",
    "Serratus posterior superior",
    "back",
    [
      n(0.1, 3.45, -0.22, 0.005, 0.005),
      n(0.2, 3.38, -0.255, 0.035, 0.019),

      n(0.32, 3.28, -0.24, 0.032, 0.018),
      n(0.43, 3.19, -0.2, 0.005, 0.005),
    ],
    "#93464a",
    "serratus-posterior-superior",
  ),

  ...pair(
    "serratus-posterior-inferior",
    "lower-back",
    "Serratus posterior inferior",
    "back",
    [
      n(0.13, 2.98, -0.22, 0.005, 0.005),
      n(0.22, 2.89, -0.26, 0.032, 0.02),

      n(0.34, 2.78, -0.245, 0.034, 0.02),
      n(0.43, 2.68, -0.19, 0.005, 0.005),
    ],
    "#93464a",
    "serratus-posterior-inferior",
  ),

  // POSTERIOR — finer spinal erector columns. They visually merge into the

  // existing erector-spinae region in the exercise panel but remain separate meshes.

  ...pair(
    "spinalis-thoracis",
    "lower-back",
    "Spinalis thoracis",
    "back",
    [
      n(0.035, 3.28, -0.255, 0.005, 0.005),
      n(0.045, 3.08, -0.285, 0.025, 0.018),

      n(0.05, 2.87, -0.28, 0.027, 0.018),
      n(0.055, 2.69, -0.245, 0.005, 0.005),
    ],
    "#a65a57",
    "erector-spinae",
  ),

  ...pair(
    "longissimus-lumborum",
    "lower-back",
    "Longissimus lumborum",
    "back",
    [
      n(0.12, 2.83, -0.26, 0.006, 0.006),
      n(0.14, 2.66, -0.285, 0.032, 0.022),

      n(0.15, 2.48, -0.25, 0.029, 0.02),
      n(0.14, 2.34, -0.2, 0.006, 0.006),
    ],
    "#a65a57",
    "erector-spinae",
  ),

  ...pair(
    "iliocostalis-thoracis",
    "lower-back",
    "Iliocostalis thoracis",
    "back",
    [
      n(0.24, 3.17, -0.245, 0.006, 0.006),
      n(0.29, 3.02, -0.28, 0.031, 0.022),

      n(0.32, 2.85, -0.26, 0.03, 0.02),
      n(0.28, 2.72, -0.215, 0.006, 0.006),
    ],
    "#a65a57",
    "erector-spinae",
  ),

  // POSTERIOR — elbow and forearm extensor anatomy.

  ...pair(
    "anconeus",
    "triceps",
    "Anconeus",
    "back",
    [
      n(0.78, 2.91, -0.11, 0.005, 0.005),
      n(0.82, 2.83, -0.14, 0.027, 0.02),

      n(0.83, 2.77, -0.12, 0.018, 0.014),
      n(0.84, 2.72, -0.09, 0.005, 0.005),
    ],
    "#a65a57",
    "anconeus",
  ),

  ...pair(
    "brachioradialis-posterior",
    "forearms",
    "Brachioradialis · lateral forearm",
    "back",
    [
      n(0.83, 2.82, -0.105, 0.006, 0.006),
      n(0.87, 2.65, -0.145, 0.039, 0.03),

      n(0.89, 2.46, -0.125, 0.033, 0.025),
      n(0.88, 2.34, -0.075, 0.006, 0.006),
    ],
    "#a65a57",
    "brachioradialis",
  ),

  ...pair(
    "extensor-carpi-radialis",
    "forearms",
    "Extensor carpi radialis longus / brevis",
    "back",
    [
      n(0.83, 2.78, -0.105, 0.005, 0.005),
      n(0.86, 2.62, -0.14, 0.027, 0.022),

      n(0.87, 2.45, -0.115, 0.022, 0.018),
      n(0.87, 2.33, -0.07, 0.005, 0.005),
    ],
    "#a65a57",
    "forearm-extensors",
  ),

  ...pair(
    "extensor-digitorum",
    "forearms",
    "Extensor digitorum",
    "back",
    [
      n(0.87, 2.77, -0.1, 0.005, 0.005),
      n(0.89, 2.61, -0.13, 0.027, 0.02),

      n(0.9, 2.44, -0.105, 0.02, 0.016),
      n(0.9, 2.31, -0.06, 0.005, 0.005),
    ],
    "#a65a57",
    "forearm-extensors",
  ),

  ...pair(
    "extensor-carpi-ulnaris",
    "forearms",
    "Extensor carpi ulnaris",
    "back",
    [
      n(0.91, 2.76, -0.085, 0.005, 0.005),
      n(0.92, 2.6, -0.115, 0.024, 0.018),

      n(0.91, 2.43, -0.09, 0.018, 0.014),
      n(0.89, 2.32, -0.055, 0.005, 0.005),
    ],
    "#a65a57",
    "forearm-extensors",
  ),

  // POSTERIOR — gluteal deep and lateral structures.

  ...pair(
    "piriformis",
    "glutes",
    "Piriformis · deep gluteal muscle",
    "back",
    [
      n(0.07, 2.3, -0.21, 0.005, 0.005),
      n(0.16, 2.27, -0.255, 0.032, 0.02),

      n(0.25, 2.23, -0.25, 0.026, 0.018),
      n(0.3, 2.19, -0.2, 0.005, 0.005),
    ],
    "#93464a",
    "piriformis",
  ),

  ...pair(
    "gluteus-maximus-upper",
    "glutes",
    "Gluteus maximus · upper fibers",
    "back",
    [
      n(0.1, 2.31, -0.23, 0.005, 0.005),
      n(0.19, 2.25, -0.31, 0.09, 0.064),

      n(0.31, 2.17, -0.33, 0.08, 0.06),
      n(0.38, 2.09, -0.27, 0.005, 0.005),
    ],
    "#a65a57",
    "gluteus-maximus",
  ),

  ...pair(
    "gluteus-maximus-lower",
    "glutes",
    "Gluteus maximus · lower fibers",
    "back",
    [
      n(0.13, 2.15, -0.22, 0.005, 0.005),
      n(0.22, 2.08, -0.3, 0.08, 0.06),

      n(0.29, 1.99, -0.29, 0.055, 0.043),
      n(0.25, 1.92, -0.2, 0.005, 0.005),
    ],
    "#a65a57",
    "gluteus-maximus",
  ),

  // POSTERIOR — inner thigh / adductor magnus hamstring tie-in.

  ...pair(
    "adductor-magnus-posterior",
    "hamstrings",
    "Adductor magnus · posterior fibers",
    "back",
    [
      n(0.09, 1.93, -0.13, 0.005, 0.005),
      n(0.12, 1.72, -0.16, 0.037, 0.028),

      n(0.13, 1.49, -0.13, 0.033, 0.024),
      n(0.17, 1.3, -0.09, 0.005, 0.005),
    ],
    "#a65a57",
    "adductor-magnus",
  ),

  ...pair(
    "gracilis-posterior",
    "hamstrings",
    "Gracilis · medial thigh edge",
    "back",
    [
      n(0.07, 1.91, -0.11, 0.005, 0.005),
      n(0.08, 1.69, -0.13, 0.022, 0.017),

      n(0.1, 1.45, -0.11, 0.019, 0.014),
      n(0.15, 1.27, -0.07, 0.005, 0.005),
    ],
    "#93464a",
    "gracilis",
  ),

  // POSTERIOR — deeper lower-leg structures and Achilles-adjacent muscle bellies.

  ...pair(
    "plantaris",
    "calves",
    "Plantaris",
    "back",
    [
      n(0.19, 1.28, -0.095, 0.004, 0.004),
      n(0.21, 1.16, -0.12, 0.018, 0.013),

      n(0.23, 0.98, -0.1, 0.015, 0.011),
      n(0.25, 0.79, -0.075, 0.004, 0.004),
    ],
    "#93464a",
    "plantaris",
  ),

  ...pair(
    "tibialis-posterior",
    "calves",
    "Tibialis posterior · deep posterior shin",
    "back",
    [
      n(0.19, 1.2, -0.095, 0.004, 0.004),
      n(0.2, 1.03, -0.12, 0.024, 0.018),

      n(0.22, 0.82, -0.1, 0.019, 0.014),
      n(0.24, 0.64, -0.07, 0.004, 0.004),
    ],
    "#a65a57",
    "tibialis-posterior",
  ),

  ...pair(
    "flexor-hallucis-longus",
    "calves",
    "Flexor hallucis longus",
    "back",
    [
      n(0.14, 1.14, -0.075, 0.004, 0.004),
      n(0.16, 0.96, -0.1, 0.018, 0.014),

      n(0.19, 0.76, -0.085, 0.014, 0.01),
      n(0.22, 0.58, -0.06, 0.004, 0.004),
    ],
    "#93464a",
    "tibialis-posterior",
  ),
];

/**

 * Approximate the rear skin envelope of the procedural mannequin. These values

 * intentionally mirror BodyFoundation's loft radii. Posterior muscle paths are

 * projected to this envelope before rendering, so their visibility does not

 * depend on hand-tuning every individual z-coordinate or on z-fighting.

 */

type SurfaceSample = { y: number; width: number; depth: number };

const TORSO_SURFACE: readonly SurfaceSample[] = [
  { y: 2.47, width: 0.34, depth: 0.23 },

  { y: 2.7, width: 0.43, depth: 0.29 },

  { y: 2.98, width: 0.39, depth: 0.28 },

  { y: 3.25, width: 0.49, depth: 0.31 },

  { y: 3.5, width: 0.57, depth: 0.29 },

  { y: 3.7, width: 0.43, depth: 0.22 },

  { y: 3.79, width: 0.19, depth: 0.16 },
];

const PELVIS_SURFACE: readonly SurfaceSample[] = [
  { y: 1.9, width: 0.25, depth: 0.19 },

  { y: 2.03, width: 0.37, depth: 0.24 },

  { y: 2.2, width: 0.43, depth: 0.24 },

  { y: 2.37, width: 0.35, depth: 0.22 },

  { y: 2.47, width: 0.34, depth: 0.23 },
];

function sampleSurface(
  profile: readonly SurfaceSample[],
  y: number,
): SurfaceSample {
  if (y <= profile[0].y) return profile[0];

  if (y >= profile[profile.length - 1].y) return profile[profile.length - 1];

  for (let index = 0; index < profile.length - 1; index += 1) {
    const a = profile[index];

    const b = profile[index + 1];

    if (y >= a.y && y <= b.y) {
      const t = (y - a.y) / (b.y - a.y);

      return {
        y,

        width: THREE.MathUtils.lerp(a.width, b.width, t),

        depth: THREE.MathUtils.lerp(a.depth, b.depth, t),
      };
    }
  }

  return profile[profile.length - 1];
}

function estimatePosteriorSkinDepth(x: number, y: number): number {
  const ax = Math.abs(x);

  // Lateral upper-arm and forearm surface. Arms are sculpted separately from torso.

  if (y >= 2.3 && ax >= 0.62) {
    const armProfile: readonly SurfaceSample[] = [
      { y: 2.3, width: 0.045, depth: 0.052 },

      { y: 2.55, width: 0.06, depth: 0.07 },

      { y: 2.79, width: 0.07, depth: 0.082 },

      { y: 2.98, width: 0.073, depth: 0.09 },

      { y: 3.22, width: 0.09, depth: 0.11 },

      { y: 3.47, width: 0.115, depth: 0.13 },

      { y: 3.68, width: 0.105, depth: 0.13 },
    ];

    const arm = sampleSurface(armProfile, THREE.MathUtils.clamp(y, 2.3, 3.68));

    const centreX = y < 2.65 ? 0.86 : y < 2.95 ? 0.82 : y < 3.25 ? 0.78 : 0.69;

    const relativeX = Math.min(
      0.94,
      Math.abs(ax - centreX) / Math.max(arm.width, 0.07),
    );

    return Math.max(0.035, arm.depth * Math.sqrt(1 - relativeX * relativeX));
  }

  if (y >= 2.45) {
    const surface = sampleSurface(TORSO_SURFACE, Math.min(y, 3.79));

    const ratio = Math.min(0.965, ax / Math.max(surface.width, 0.12));

    let depth = surface.depth * Math.sqrt(1 - ratio * ratio);

    if (y > 3.79) depth = Math.max(0.075, 0.16 - (y - 3.79) * 0.48);

    return Math.max(0.035, depth);
  }

  if (y >= 1.88) {
    const surface = sampleSurface(PELVIS_SURFACE, y);

    const ratio = Math.min(
      0.92,
      Math.abs(ax - 0.08) / Math.max(surface.width, 0.12),
    );

    return Math.max(0.11, surface.depth * Math.sqrt(1 - ratio * ratio));
  }

  if (y >= 1.25) {
    const thighDepth = THREE.MathUtils.lerp(0.17, 0.125, (1.88 - y) / 0.63);

    const lateralDistance = Math.abs(ax - 0.245);

    const contour = Math.sqrt(1 - Math.min(0.92, lateralDistance / 0.19) ** 2);

    return Math.max(0.055, thighDepth * contour);
  }

  const calfDepth = THREE.MathUtils.lerp(
    0.11,
    0.065,
    THREE.MathUtils.clamp((1.25 - y) / 0.77, 0, 1),
  );

  const lateralDistance = Math.abs(ax - 0.245);

  const contour = Math.sqrt(1 - Math.min(0.92, lateralDistance / 0.12) ** 2);

  return Math.max(0.045, calfDepth * contour);
}

/**

 * Move posterior mesh centres to the outside of the mannequin's posterior skin.

 * The model is rotated 180 degrees for the posterior camera-facing side, so the

 * returned local z stays negative; after rotation it becomes positive camera z.

 */

function projectPosteriorNodes(nodes: readonly Node[]): readonly Node[] {
  return nodes.map(([x, y, z, width, depth]) => {
    const skinDepth = estimatePosteriorSkinDepth(x, y);

    const outwardCentre = skinDepth + Math.max(0.006, depth * 0.18) + 0.008;

    return n(x, y, -outwardCentre, width, depth);
  });
}

const FRONT_MUSCLES = MUSCLES.filter((muscle) => muscle.view === "front");

const BACK_MUSCLES: readonly MuscleSpec[] = MUSCLES.filter(
  (muscle) => muscle.view === "back",
)

  .map((muscle) => ({ ...muscle, nodes: projectPosteriorNodes(muscle.nodes) }));

/**

 * Loft a smooth, tapered muscle belly along a Catmull-Rom centreline.

 * Each node supplies the half-width and half-depth at that location.

 */

function createLoft(
  nodes: readonly Node[],
  radialSegments = 22,
  longitudinalSegments = 36,
) {
  const controls = nodes.map(([x, y, z]) => new THREE.Vector3(x, y, z));

  const curve = new THREE.CatmullRomCurve3(
    controls,
    false,
    "centripetal",
    0.35,
  );

  const positions: number[] = [];

  const indices: number[] = [];

  const interpolateShape = (t: number, part: 3 | 4) => {
    const scaled = t * (nodes.length - 1);

    const index = Math.min(nodes.length - 2, Math.floor(scaled));

    const local = THREE.MathUtils.clamp(scaled - index, 0, 1);

    const a = nodes[index][part];

    const b = nodes[index + 1][part];

    return THREE.MathUtils.lerp(a, b, local);
  };

  for (let i = 0; i <= longitudinalSegments; i += 1) {
    const t = i / longitudinalSegments;

    const center = curve.getPointAt(t);

    const tangent = curve.getTangentAt(t).normalize();

    // Use the anatomical plane for the cross-section so it stays broad and flat.

    let side = new THREE.Vector3(tangent.y, -tangent.x, 0).normalize();

    if (side.lengthSq() < 0.001) side = new THREE.Vector3(1, 0, 0);

    const depthAxis = new THREE.Vector3(0, 0, 1);

    const width = Math.max(0.002, interpolateShape(t, 3));

    const depth = Math.max(0.002, interpolateShape(t, 4));

    for (let j = 0; j < radialSegments; j += 1) {
      const angle = (j / radialSegments) * Math.PI * 2;

      const point = center
        .clone()

        .addScaledVector(side, Math.cos(angle) * width)

        .addScaledVector(depthAxis, Math.sin(angle) * depth);

      positions.push(point.x, point.y, point.z);
    }
  }

  for (let i = 0; i < longitudinalSegments; i += 1) {
    for (let j = 0; j < radialSegments; j += 1) {
      const a = i * radialSegments + j;

      const b = i * radialSegments + ((j + 1) % radialSegments);

      const c = (i + 1) * radialSegments + j;

      const d = (i + 1) * radialSegments + ((j + 1) % radialSegments);

      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );

  geometry.setIndex(indices);

  geometry.computeVertexNormals();

  geometry.computeBoundingSphere();

  return geometry;
}

function LoftMesh({
  nodes,

  color,

  roughness = 0.64,

  metalness = 0,
}: {
  nodes: readonly Node[];

  color: string;

  roughness?: number;

  metalness?: number;
}) {
  const geometry = useMemo(() => createLoft(nodes, 28, 42), [nodes]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function MusclePart({
  spec,

  selected,

  onSelect,
}: {
  spec: MuscleSpec;

  selected: boolean;

  onSelect: (spec: MuscleSpec) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(() => createLoft(spec.nodes, 28, 44), [spec.nodes]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const color = selected
    ? HIGHLIGHT
    : hovered
      ? BASE_MUSCLE_LIGHT
      : (spec.tone ?? BASE_MUSCLE);

  return (
    <mesh
      geometry={geometry}
      castShadow
      receiveShadow
      onClick={(event) => {
        event.stopPropagation();

        onSelect(spec);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();

        setHovered(true);

        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);

        document.body.style.cursor = "default";
      }}
      userData={{
        muscleId: spec.id,
        muscleRegionId: spec.regionId,
        muscleName: spec.name,
      }}
    >
      <meshPhysicalMaterial
        color={color}
        roughness={selected ? 0.32 : 0.48}
        metalness={0.02}
        clearcoat={selected ? 0.38 : 0.16}
        clearcoatRoughness={0.45}
        emissive={selected ? HIGHLIGHT : "#000000"}
        emissiveIntensity={selected ? 0.18 : 0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function BodyFoundation() {
  const torso = useMemo(
    () =>
      [
        n(0, 2.47, 0, 0.34, 0.23),
        n(0, 2.7, 0, 0.43, 0.29),

        n(0, 2.98, 0, 0.39, 0.28),
        n(0, 3.25, 0, 0.49, 0.31),

        n(0, 3.5, 0, 0.57, 0.29),
        n(0, 3.7, 0, 0.43, 0.22),

        n(0, 3.79, 0, 0.19, 0.16),
      ] as const,
    [],
  );

  const pelvis = useMemo(
    () =>
      [
        n(0, 1.9, 0, 0.25, 0.19),
        n(0, 2.03, 0, 0.37, 0.24),

        n(0, 2.2, 0, 0.43, 0.24),
        n(0, 2.37, 0, 0.35, 0.22),
      ] as const,
    [],
  );

  const neck = useMemo(
    () =>
      [
        n(0, 3.7, 0, 0.1, 0.1),
        n(0, 3.83, 0, 0.105, 0.1),

        n(0, 4.02, 0, 0.105, 0.095),
      ] as const,
    [],
  );

  const leftArm = useMemo(
    () =>
      [
        n(0.55, 3.68, 0, 0.105, 0.13),
        n(0.69, 3.47, 0, 0.115, 0.13),

        n(0.77, 3.22, 0, 0.09, 0.11),
        n(0.8, 2.98, 0, 0.073, 0.09),

        n(0.82, 2.79, 0, 0.07, 0.082),
        n(0.86, 2.55, 0, 0.06, 0.07),

        n(0.87, 2.32, 0, 0.045, 0.052),
      ] as const,
    [],
  );

  const leftLeg = useMemo(
    () =>
      [
        n(0.22, 2.02, 0, 0.18, 0.19),
        n(0.25, 1.79, 0, 0.19, 0.19),

        n(0.25, 1.54, 0, 0.17, 0.16),
        n(0.23, 1.34, 0, 0.115, 0.13),

        n(0.24, 1.1, 0, 0.11, 0.12),
        n(0.24, 0.81, 0, 0.082, 0.09),

        n(0.25, 0.54, 0, 0.055, 0.065),
        n(0.25, 0.35, 0.015, 0.095, 0.15),
      ] as const,
    [],
  );

  return (
    <group>
      <LoftMesh nodes={torso} color="#c5aaa0" />

      <LoftMesh nodes={pelvis} color="#b99c94" />

      <LoftMesh nodes={neck} color="#c5aaa0" />

      <LoftMesh nodes={leftArm} color="#c6a9a0" />

      <LoftMesh
        nodes={leftArm.map(([x, y, z, w, d]) => n(-x, y, z, w, d)).reverse()}
        color="#c6a9a0"
      />

      <LoftMesh nodes={leftLeg} color="#c2a49a" />

      <LoftMesh
        nodes={leftLeg.map(([x, y, z, w, d]) => n(-x, y, z, w, d)).reverse()}
        color="#c2a49a"
      />

      <mesh
        position={[0, 4.34, 0]}
        scale={[0.19, 0.25, 0.18]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 48, 36]} />

        <meshStandardMaterial color="#c9aea4" roughness={0.66} />
      </mesh>

      {/* Palms: quiet, tapered forms keep the silhouette connected. */}

      <LoftMesh
        nodes={[
          n(0.87, 2.32, 0, 0.043, 0.045),
          n(0.88, 2.22, 0, 0.052, 0.028),
          n(0.88, 2.16, 0, 0.035, 0.018),
        ]}
        color="#c4a59a"
      />

      <LoftMesh
        nodes={[
          n(-0.87, 2.32, 0, 0.043, 0.045),
          n(-0.88, 2.22, 0, 0.052, 0.028),
          n(-0.88, 2.16, 0, 0.035, 0.018),
        ]}
        color="#c4a59a"
      />
    </group>
  );
}

function FrontAnatomyDetails() {
  // Fine, non-clickable tendinous intersections across rectus abdominis.
  // They are placed on the positive-Z/anterior surface and rotate with the body.
  const bands = useMemo(() => {
    const rows: Node[][] = [];
    for (const y of [2.99, 2.84, 2.68, 2.54]) {
      const z = y > 2.75 ? 0.338 : 0.3;
      rows.push([
        n(0.045, y, z, 0.0035, 0.003),
        n(0.105, y - 0.006, z + 0.012, 0.0045, 0.003),
        n(0.165, y, z, 0.0035, 0.003),
      ]);
    }
    return rows;
  }, []);
  return (
    <group>
      {/* Clavicle contours sit above the pectoral bellies, not on top of them. */}
      <LoftMesh
        nodes={[
          n(0.035, 3.69, 0.16, 0.004, 0.004),
          n(0.17, 3.7, 0.205, 0.012, 0.006),
          n(0.34, 3.68, 0.205, 0.01, 0.005),
          n(0.5, 3.64, 0.16, 0.004, 0.004),
        ]}
        color="#b49388"
      />
      <LoftMesh
        nodes={[
          n(-0.035, 3.69, 0.16, 0.004, 0.004),
          n(-0.17, 3.7, 0.205, 0.012, 0.006),
          n(-0.34, 3.68, 0.205, 0.01, 0.005),
          n(-0.5, 3.64, 0.16, 0.004, 0.004),
        ]}
        color="#b49388"
      />
      {/* A restrained sternum line separates the left/right pectoral masses. */}
      <LoftMesh
        nodes={[
          n(0, 3.57, 0.33, 0.004, 0.004),
          n(0, 3.4, 0.365, 0.006, 0.004),
          n(0, 3.24, 0.31, 0.004, 0.004),
        ]}
        color="#b99387"
      />
      {bands.map((nodes, index) => (
        <LoftMesh
          key={`rectus-tendon-${index}`}
          nodes={nodes}
          color="#bd9b91"
          roughness={0.78}
        />
      ))}
      {bands.map((nodes, index) => (
        <LoftMesh
          key={`rectus-tendon-mirror-${index}`}
          nodes={nodes.map(([x, y, z, w, d]) => n(-x, y, z, w, d)).reverse()}
          color="#bd9b91"
          roughness={0.78}
        />
      ))}
    </group>
  );
}

function BodyScene({
  selectedMuscle,

  view,

  onSelectMuscle,

  activeRegion,

  selectedRegion,
}: {
  selectedMuscle: string;

  view: View;

  onSelectMuscle: (spec: MuscleSpec) => void;

  activeRegion: string;

  selectedRegion?: string;
}) {
  // Keep both surfaces mounted at all times. OrbitControls changes the camera
  // around the whole anatomy, so the opposite-side muscles are already present
  // when the user rotates from front to back. Front/Back buttons still orient
  // the model through the existing group rotation below.
  const sceneMuscles = [...FRONT_MUSCLES, ...BACK_MUSCLES];

  return (
    <group
      rotation={[0, view === "front" ? 0 : Math.PI, 0]}
      position={[0, -0.03, 0]}
    >
      <BodyFoundation />

      {/* Posterior meshes are projected onto the back skin envelope before the

          shared 180° turn. No z-offset workaround or front-surface intersection. */}

      <group>
        {sceneMuscles.map((muscle) => (
          <MusclePart
            key={muscle.key}
            spec={muscle}
            selected={
              activeRegion
                ? activeRegion === muscle.regionId
                : selectedRegion
                  ? selectedRegion === muscle.regionId
                  : PARENT_GROUP[muscle.id] === selectedMuscle
            }
            onSelect={onSelectMuscle}
          />
        ))}
      </group>

      <FrontAnatomyDetails />

      <ContactShadows
        position={[0, 0.03, 0]}
        opacity={0.23}
        scale={3.6}
        blur={2.8}
        far={2.8}
        resolution={256}
      />
    </group>
  );
}

// Keep the original broad group callback compatible, while exact region metadata

// supplies names and exercise targets for the new detailed panel integration.

const PARENT_GROUP: Record<GroupId, string> = {
  chest: "chest",

  shoulders: "shoulders",

  biceps: "biceps",

  triceps: "triceps",

  forearms: "biceps",

  abs: "abs",

  obliques: "abs",

  serratus: "chest",

  quadriceps: "quadriceps",

  tibialis: "calves",

  back: "back",

  traps: "back",

  lats: "back",

  "lower-back": "back",

  glutes: "glutes",

  "glute-med": "glutes",

  hamstrings: "hamstrings",

  calves: "calves",
};

const GROUP_DISPLAY: Record<GroupId, { title: string; area: string }> = {
  chest: { title: "Chest", area: "Front upper torso" },

  shoulders: { title: "Shoulders", area: "Deltoid group" },

  biceps: { title: "Biceps", area: "Front upper arm" },

  triceps: { title: "Triceps", area: "Back of upper arm" },

  forearms: { title: "Forearms", area: "Forearm flexors / extensors" },

  abs: { title: "Abdominals", area: "Front core" },

  obliques: { title: "Obliques", area: "Side abdominal wall" },

  serratus: { title: "Serratus anterior", area: "Side ribs / underarm" },

  quadriceps: { title: "Quadriceps", area: "Front thigh" },

  tibialis: { title: "Tibialis anterior", area: "Front of lower leg" },

  back: { title: "Upper back", area: "Scapular region" },

  traps: { title: "Trapezius", area: "Upper and middle back" },

  lats: { title: "Latissimus dorsi", area: "Lats / underarm fold" },

  "lower-back": { title: "Lower back", area: "Lumbar / erector spinae" },

  glutes: { title: "Glutes", area: "Posterior pelvis" },

  "glute-med": { title: "Gluteus medius", area: "Upper outer hip" },

  hamstrings: { title: "Hamstrings", area: "Back of thigh" },

  calves: { title: "Calves", area: "Gastrocnemius / soleus" },
};

function normalizeAnatomyView(value: unknown): View {
  const normalized = String(value ?? "front")
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  return /(back|posterior|rear|dorsal|پشت)/i.test(normalized)
    ? "back"
    : "front";
}

export default function AnatomyViewer({
  selectedMuscle,

  onSelectMuscle,

  view,

  className,

  selectedRegion,

  onSelectRegion,

  onViewChange,

  showViewControls = true,
}: Props) {
  const { t, isRTL, language } = useLanguage();
  const incomingView = normalizeAnatomyView(view);

  const [renderView, setRenderView] = useState<View>(incomingView);

  // Sync the component with the surrounding page when its external view changes.

  // Internal controls still work if the page does not provide a working view state.

  useEffect(() => {
    setRenderView(incomingView);
  }, [incomingView]);

  const resolvedView = renderView;

  const [activeLabel, setActiveLabel] = useState("");

  const [activeArea, setActiveArea] = useState("");

  const [activeRegion, setActiveRegion] = useState("");

  const [activeParentGroup, setActiveParentGroup] = useState("");

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const root = document.documentElement;

      setIsDark(
        root.classList.contains("dark") || root.dataset.theme === "dark",
      );
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      setActiveRegion(selectedRegion);

      const info = getLocalizedMuscleRegionInfo(selectedRegion, language);

      if (info) {
        setActiveLabel(info.name);

        setActiveArea(info.area);
      }
    }
  }, [selectedRegion]);

  // When a Front/Back button changes the model orientation, move the selection
  // to a visible region on that side. Do not reset the selection when the camera
  // is rotated with the mouse and a muscle on the opposite surface is clicked.
  const previousResolvedView = useRef<View>(resolvedView);
  useEffect(() => {
    if (previousResolvedView.current === resolvedView) return;
    previousResolvedView.current = resolvedView;

    const currentId = selectedRegion || activeRegion;
    const currentInfo = getMuscleRegionInfo(currentId);
    if (!currentInfo || currentInfo.view === resolvedView) return;
    const nextId = resolvedView === "back" ? "trapezius-upper" : "chest-mid";

    const nextInfo = getMuscleRegionInfo(nextId);

    if (!nextInfo) return;

    setActiveRegion(nextId);

    setActiveLabel(nextInfo.name);

    setActiveArea(nextInfo.area);

    setActiveParentGroup(nextInfo.parentMuscle);

    onSelectMuscle(nextInfo.parentMuscle);

    onSelectRegion?.(nextId);
  }, [
    resolvedView,
    selectedRegion,
    activeRegion,
    onSelectMuscle,
    onSelectRegion,
  ]);

  useEffect(() => {
    if (
      !selectedRegion &&
      activeRegion &&
      activeParentGroup &&
      selectedMuscle !== activeParentGroup
    ) {
      setActiveRegion("");
    }
  }, [selectedMuscle, selectedRegion, activeRegion, activeParentGroup]);

  const currentRegion = getLocalizedMuscleRegionInfo(
    selectedRegion || activeRegion,
    language,
  );

  const background = isDark ? "#101313" : "#f4f4f0";

  const text = isDark ? "#d7ddd7" : "#4e5952";

  const handleViewChange = (nextView: View) => {
    setRenderView(nextView);

    onViewChange?.(nextView);

    const nextRegionId = nextView === "back" ? "trapezius-upper" : "chest-mid";

    const nextRegion = getMuscleRegionInfo(nextRegionId);

    if (nextRegion) {
      setActiveRegion(nextRegionId);

      setActiveLabel(nextRegion.name);

      setActiveArea(nextRegion.area);

      setActiveParentGroup(nextRegion.parentMuscle);

      onSelectMuscle(nextRegion.parentMuscle);

      onSelectRegion?.(nextRegionId);
    }
  };

  const handleSelect = (spec: MuscleSpec) => {
    const parentGroup = PARENT_GROUP[spec.id];

    const regionInfo = getLocalizedMuscleRegionInfo(spec.regionId, language);

    setActiveLabel(
      regionInfo?.name ?? spec.name.replace(/ \((left|right)\)$/i, ""),
    );

    setActiveArea(regionInfo?.area ?? GROUP_DISPLAY[spec.id].area);

    setActiveRegion(spec.regionId);

    setActiveParentGroup(parentGroup);

    onSelectMuscle(parentGroup); // Keep backward compatibility with existing page state.

    onSelectRegion?.(spec.regionId); // New optional exact-region event for the exercise panel.
  };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 460,
        overflow: "hidden",
        borderRadius: 20,
        background,
        transition: "background 180ms ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: isDark
            ? "radial-gradient(ellipse at 50% 38%, rgba(81,101,88,.16), transparent 62%)"
            : "radial-gradient(ellipse at 50% 36%, rgba(255,255,255,.88), transparent 65%)",
        }}
      />

      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 2.38, 7.9], fov: 33, near: 0.1, far: 35 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={isDark ? 1.0 : 1.3} />

          <hemisphereLight
            args={["#fff2e9", "#55423e", isDark ? 0.75 : 0.55]}
          />

          <directionalLight
            position={[-3.5, 6, 5]}
            intensity={2.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <directionalLight
            position={[4, 3, -4]}
            intensity={1.6}
            color="#d0d9ff"
          />

          <spotLight
            position={[0, 5.8, 2.6]}
            intensity={isDark ? 2.2 : 1.8}
            angle={0.42}
            penumbra={0.8}
          />

          <BodyScene
            selectedMuscle={selectedMuscle}
            view={resolvedView}
            onSelectMuscle={handleSelect}
            activeRegion={activeRegion}
            selectedRegion={selectedRegion}
          />

          <OrbitControls
            makeDefault
            target={[0, 2.36, 0]}
            enablePan={false}
            enableZoom
            minDistance={5.8}
            maxDistance={10.5}
            minPolarAngle={Math.PI / 2.6}
            maxPolarAngle={Math.PI / 1.8}
            rotateSpeed={0.72}
            zoomSpeed={0.78}
          />
        </Suspense>
      </Canvas>
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          pointerEvents: "none",
          gap: 12,
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <div
          style={{
            color: text,
            fontSize: 10,
            fontWeight: 750,
            letterSpacing: "0.17em",
            textTransform: "uppercase",
            lineHeight: 1.5,
          }}
        >
          {t("anatomyViewerAtlas")}

          <div
            style={{
              marginTop: 4,
              opacity: 0.58,
              letterSpacing: "0.04em",
              fontSize: 9,
            }}
          >
            {t("anatomyViewerInstructions")}
          </div>
        </div>

        {showViewControls ? (
          <div
            role="group"
            aria-label={t("anatomyViewerSide")}
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              border: `1px solid ${isDark ? "#39423d" : "#d7ddd5"}`,
              background: isDark
                ? "rgba(20,25,23,.82)"
                : "rgba(255,255,255,.82)",
              borderRadius: 11,
              backdropFilter: "blur(8px)",
              pointerEvents: "auto",
            }}
          >
            {(["front", "back"] as const).map((side) => {
              const active = resolvedView === side;

              return (
                <button
                  key={side}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleViewChange(side)}
                  style={{
                    border: active
                      ? "1px solid #b7ed4c"
                      : "1px solid transparent",
                    background: active ? "#b7ed4c" : "transparent",
                    color: active ? "#192018" : text,
                    borderRadius: 7,
                    padding: "7px 10px",
                    fontSize: 10,
                    lineHeight: 1,
                    fontWeight: 800,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    minWidth: 54,
                  }}
                >
                  {side === "front" ? t("anatomyFront") : t("anatomyBack")}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              border: `1px solid ${isDark ? "#39423d" : "#d7ddd5"}`,
              background: isDark
                ? "rgba(20,25,23,.72)"
                : "rgba(255,255,255,.72)",
              borderRadius: 9,
              padding: "6px 9px",
              color: text,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              backdropFilter: "blur(8px)",
            }}
          >
            {resolvedView === "front"
              ? t("anatomyAnteriorView")
              : t("anatomyPosteriorView")}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 12,
          pointerEvents: "none",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <div
          style={{
            maxWidth: "75%",
            color: text,
            border: `1px solid ${
              isDark ? "rgba(87,103,92,.55)" : "rgba(205,213,204,.85)"
            }`,
            background: isDark ? "rgba(15,19,17,.78)" : "rgba(255,255,255,.82)",
            borderRadius: 12,
            padding: "10px 12px",
            backdropFilter: "blur(9px)",
            direction: isRTL ? "rtl" : "ltr",
            textAlign: isRTL ? "right" : "left",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: isRTL ? "0" : "0.14em",
              textTransform: "uppercase",
              opacity: 0.56,
              marginBottom: 4,
            }}
          >
            {t("anatomyViewerSelectedRegion")}
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 750,
              lineHeight: 1.6,
            }}
          >
            {activeLabel || t("anatomyViewerChooseMuscle")}
          </div>

          <div
            style={{
              marginTop: 3,
              fontSize: 10,
              lineHeight: 1.6,
              opacity: 0.65,
            }}
          >
            {activeArea || t("anatomyViewerClickRegion")}
          </div>

          {currentRegion && currentRegion.exercises.length > 0 && (
            <div
              style={{
                marginTop: 7,
                paddingTop: 6,
                borderTop: `1px solid ${
                  isDark ? "rgba(160,180,160,.18)" : "rgba(80,100,80,.15)"
                }`,
                fontSize: 10,
                lineHeight: 1.7,
              }}
            >
              <strong
                style={{
                  letterSpacing: isRTL ? "0" : ".04em",
                  textTransform: "uppercase",
                  fontSize: 8,
                  opacity: 0.7,
                }}
              >
                {t("anatomyViewerRelatedExercises")}
              </strong>

              <div style={{ marginTop: 2 }}>
                {currentRegion.exercises.slice(0, 3).join(" · ")}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: 9,
            color: text,
            opacity: 0.64,
            textAlign: isRTL ? "left" : "right",
            lineHeight: 1.8,
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          {t("anatomyViewerInteractive3D")}
          <br />
          {t("anatomyViewerSelectableGroups")}
        </div>
      </div>
    </div>
  );
}
