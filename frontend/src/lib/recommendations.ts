export interface Recommendation {
  label: string;
  title: string;
  points: string[];
  // Optional: Add links or other metadata if needed
  // links?: Array<{ text: string; url: string }>;
}

export const recommendationsData: Record<string, Recommendation> = {
  '0': {
    label: 'None (CDR 0)',
    title: 'Maintain Brain Health',
    points: [
      'Reinforce brain-health habits: aerobic exercise, social engagement, MIND/Mediterranean diet, good sleep.',
      'Schedule yearly cognitive check-ins using this tool to track changes early.',
      'Get a vascular check-up (BP, A1c, lipids) to reduce vascular dementia risk.',
    ],
  },
  '0.5': {
    label: 'Questionable / Very Mild (CDR 0.5)',
    title: 'Investigate & Adapt',
    points: [
      'Schedule a formal diagnostic work-up: Neuro exam, neuropsych testing, MRI, and lab tests for reversible causes.',
      'Start lifestyle therapy: Aim for 150 min/week of moderate exercise and use cognitive stimulation activities (e.g., games, dual-tasking).',
      'Discuss driving risk with your doctor and begin planning for eventual driving cessation.',
      'Connect caregivers with education/support groups (e.g., ALZConnected, Alzheimer\'s Foundation of America, Family Caregiver Alliance).',
    ],
  },
  '1': {
    label: 'Mild Dementia (CDR 1)',
    title: 'Initiate Treatment & Safety Planning',
    points: [
      'Discuss starting a cholinesterase inhibitor (e.g., donepezil) with your doctor for potential cognitive benefits.',
      'Arrange a home safety evaluation with an Occupational Therapist (OT) for modifications like stove locks, grab bars, and improved lighting.',
      'Undergo a driving fitness re-test; arrange alternative transportation as stopping driving is often advised at this stage.',
      'Complete legal & financial planning (Power of Attorney, advance directives) while decision-making capacity is present.',
      'Screen caregivers for burden and connect them with psycho-education and respite options.',
    ],
  },
  '2': {
    label: 'Moderate Dementia (CDR 2)',
    title: 'Manage Symptoms & Expand Support',
    points: [
      'Discuss adding memantine (or using combination therapy) with your doctor for functional and behavioral benefits.',
      'Address behavioral symptoms (BPSD) first with non-drug approaches (music, massage, routines). Discuss medication (e.g., antipsychotics) only if necessary for safety, with a clear plan for short-term use.',
      'Explore adult day programs for patient stimulation and caregiver respite.',
      'Re-engage Occupational Therapy (OT) to reassess daily living strategies and adaptive equipment needs.',
      'Implement nighttime wandering safeguards (e.g., door alarms, GPS wearables).',
    ],
  },
  '3': {
    label: 'Severe Dementia (CDR 3)',
    title: 'Focus on Comfort Care & Support',
    points: [
      'Request a palliative care consultation or evaluate hospice eligibility, especially if bed-bound or non-ambulatory.',
      'Discuss feeding/hydration preferences; avoid automatic feeding tubes as they may not improve outcomes.',
      'Prioritize pain and comfort management; assess regularly for need of pain relief or antispasmodics.',
      'Ensure 24-hour supervision is available; consider skilled nursing facilities or increased in-home aide support.',
      'Provide robust caregiver respite and grief support resources, acknowledging the high stress and anticipatory grief.',
    ],
  },
};

// Helper to get the band key (e.g., '0', '0.5', '1', '2', '3') from a score
export function getCdrBandKeyFromScore(score: number | null): string | null {
    if (score === null) return null;
    if (score === 0) return '0';
    if (score >= 0.5 && score <= 4.0) return '0.5';
    if (score >= 4.5 && score <= 9.0) return '1';
    if (score >= 9.5 && score <= 15.5) return '2';
    if (score >= 16.0 && score <= 18.0) return '3';
    return null; // Score is out of defined ranges
}

// Helper to convert band key string to a numerical value for comparison
const bandKeyToNumeric = (key: string | null): number => {
    if (key === null) return -1; // Handle null case
    // Use parseFloat for '0.5'
    return parseFloat(key);
};

// Check if the new band represents a higher severity
export function isHigherSeverityBand(newBandKey: string | null, oldBandKey: string | null): boolean {
    if (newBandKey === null || oldBandKey === null) return false; // Cannot compare if either is null
    return bandKeyToNumeric(newBandKey) > bandKeyToNumeric(oldBandKey);
} 