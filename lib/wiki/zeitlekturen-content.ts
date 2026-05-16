import { BATCH_A } from './content-batch-a';
import { BATCH_B } from './content-batch-b';
import { BATCH_C } from './content-batch-c';

// Full encyclopedia prose for the 17 Zeitlektüren, keyed by lektion_nr.
export const ZEITLEKTUR_CONTENT: Record<number, string> = {
  ...BATCH_A,
  ...BATCH_B,
  ...BATCH_C,
};

// Marker present in the original placeholder template — used to detect
// notes that have not yet been backfilled and must not overwrite user edits.
export const PLACEHOLDER_MARKER = '_Wichtige Ereignisse, Reiche, politische Umbrüche..._';
