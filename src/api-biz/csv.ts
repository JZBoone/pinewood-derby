import { get } from 'lodash';

type DeserializedCsvRecord = {
  carNumber: number;
  carName: string | null;
  owner: string;
  denNumber: number;
  superlative: string | null;
};

const csvHeadings = [
  'Car Number',
  'Car Name',
  'Scout',
  'Den',
  'Superlative',
] as const;

type CsvHeading = (typeof csvHeadings)[number];

const headingToPropertyMap: Record<
  CsvHeading,
  {
    key: keyof DeserializedCsvRecord;
    type: 'string' | 'number';
    required?: true;
  }
> = {
  'Car Number': { key: 'carNumber', type: 'number', required: true },
  'Car Name': { key: 'carName', type: 'string' },
  Scout: { key: 'owner', type: 'string', required: true },
  Den: { key: 'denNumber', type: 'number', required: true },
  Superlative: { key: 'superlative', type: 'string' },
} as const;

export function validateCsv(
  parsedRecords: object[]
):
  | { valid: true; data: DeserializedCsvRecord[] }
  | { valid: false; error: string } {
  const records: DeserializedCsvRecord[] = [];
  for (const row of parsedRecords) {
    const record: Partial<
      Record<keyof DeserializedCsvRecord, string | number | null>
    > = {};
    for (const heading of csvHeadings) {
      const parsedValue = get(row, heading) as string | undefined;
      if (typeof parsedValue !== 'string') {
        return { valid: false, error: `Missing required heading: ${heading}` };
      }
      const trimmedStringOrNull: string | null = parsedValue.trim() || null;
      const { key, type, required } = headingToPropertyMap[heading];
      if (required && trimmedStringOrNull === null) {
        return {
          valid: false,
          error: `Missing required value for ${heading}`,
        };
      }
      const value =
        type === 'number' ? Number(trimmedStringOrNull) : trimmedStringOrNull;
      if (type === 'number' && isNaN(value as number)) {
        return {
          valid: false,
          error: `Invalid value for ${heading}: ${parsedValue}`,
        };
      }
      record[key] = value;
    }
    records.push(record as DeserializedCsvRecord);
  }
  return { data: records, valid: true };
}
