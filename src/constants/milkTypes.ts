export const MILK_TYPES = {
  COW: 'cow',
  BUFFALO: 'buffalo',
} as const;

export type MilkType =
  (typeof MILK_TYPES)[keyof typeof MILK_TYPES];