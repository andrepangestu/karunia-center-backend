import { QueryRunner } from 'typeorm';

export type FormHarianSeedTemplate = {
  typeCode: 'PAGI' | 'SIANG' | 'MALAM';
  name: string;
  startTime: string;
  endTime: string;
  sortOrder: number;
  items: string[];
};

/** Canonical seed keys mapped to possible DB codes (incl. legacy short codes). */
const ACTIVITY_TYPE_CODE_ALIASES: Record<
  FormHarianSeedTemplate['typeCode'],
  string[]
> = {
  PAGI: ['PAGI', 'PG'],
  SIANG: ['SIANG', 'SI'],
  MALAM: ['MALAM', 'ML'],
};

export const FORM_HARIAN_ACTIVITY_TEMPLATES: FormHarianSeedTemplate[] = [
  {
    typeCode: 'PAGI',
    name: 'Bangun Tidur',
    startTime: '04:45:00',
    endTime: '05:30:00',
    sortOrder: 0,
    items: [
      'Bangun Tidur',
      'Toileting',
      'Shalat Shubuh (berwudhu)',
      'Shalat Subuh (gerakan shalat)',
      'Kemandirian',
    ],
  },
  {
    typeCode: 'PAGI',
    name: 'Olah Raga',
    startTime: '05:30:00',
    endTime: '06:30:00',
    sortOrder: 1,
    items: ['Brian Gym', 'Jogging'],
  },
  {
    typeCode: 'PAGI',
    name: 'Mandi dan berpakaian',
    startTime: '06:30:00',
    endTime: '07:00:00',
    sortOrder: 2,
    items: [
      'Mengambil Alat Mandi',
      'Sikat Gigi',
      'Menyiram Badan',
      'Membasuh Badan',
      'Memakai Handuk',
      'Memakai Baju',
      'Memakai Celana',
      'Berdandan',
    ],
  },
  {
    typeCode: 'PAGI',
    name: 'Kemandirian Sarapan Pagi',
    startTime: '07:00:00',
    endTime: '08:00:00',
    sortOrder: 3,
    items: [
      'Mengambil Piring',
      'Mengambil Makanan',
      'Berdoa',
      'Memegang Sendok',
      'Mengangkat Sendok',
      'Mengunyah',
      'Menelan',
      'Minum Air',
      'Mencuci Piring',
    ],
  },
  {
    typeCode: 'PAGI',
    name: 'Sosialisasi dan Komunikasi',
    startTime: '08:00:00',
    endTime: '08:30:00',
    sortOrder: 4,
    items: [
      'Mengucap Salam',
      'Memperkenalkan Diri',
      'Mengenal Guru, Teman, Benda di lingkungannya',
    ],
  },
  {
    typeCode: 'PAGI',
    name: 'Mini Outbound',
    startTime: '08:30:00',
    endTime: '09:00:00',
    sortOrder: 5,
    items: ['Mini Outbound (koordinasi kaki, tangan, dan mata)'],
  },
  {
    typeCode: 'PAGI',
    name: 'KBM I',
    startTime: '09:00:00',
    endTime: '10:00:00',
    sortOrder: 6,
    items: [],
  },
  {
    typeCode: 'PAGI',
    name: 'Kemandirian (snack Pagi)',
    startTime: '10:00:00',
    endTime: '10:30:00',
    sortOrder: 7,
    items: ['Cara memegang/Mengambil', 'Berdoa', 'Cara memakan/mengunyah'],
  },
  {
    typeCode: 'PAGI',
    name: 'KBM II',
    startTime: '10:30:00',
    endTime: '11:30:00',
    sortOrder: 8,
    items: [],
  },
  {
    typeCode: 'PAGI',
    name: 'Agama Shalat Dzuhur',
    startTime: '11:30:00',
    endTime: '12:15:00',
    sortOrder: 9,
    items: [
      'Iqro (pelafalan)/Vocalisasi',
      'Hafalan Surat Pendek',
      'Berwudhu',
      'Bacaan Shalat',
      'Gerakan Shalat',
    ],
  },
  {
    typeCode: 'SIANG',
    name: 'Kemandirian (Makan Siang)',
    startTime: '12:15:00',
    endTime: '13:00:00',
    sortOrder: 0,
    items: [
      'Mengambil Piring',
      'Mengambil Makanan',
      'Berdoa',
      'Memegang Sendok',
      'Mengangkat Sendok',
      'Mengunyah',
      'Menelan',
      'Minum Air',
      'Mencuci Piring',
    ],
  },
  {
    typeCode: 'SIANG',
    name: 'Tidur Siang',
    startTime: '13:00:00',
    endTime: '15:00:00',
    sortOrder: 1,
    items: ['Toileting', 'Kemandirian'],
  },
  {
    typeCode: 'SIANG',
    name: 'Shalat Ashar',
    startTime: '15:00:00',
    endTime: '15:30:00',
    sortOrder: 2,
    items: ['Berwudhu', 'Bacaan Shalat', 'Gerakan Shalat'],
  },
  {
    typeCode: 'SIANG',
    name: 'Mandi dan berpakaian',
    startTime: '15:30:00',
    endTime: '16:00:00',
    sortOrder: 3,
    items: [
      'Mengambil Alat Mandi',
      'Sikat Gigi',
      'Menyiram Badan',
      'Membasuh Badan',
      'Memakai Handuk',
      'Memakai Baju',
      'Memakai Celana',
      'Berdandan',
    ],
  },
  {
    typeCode: 'SIANG',
    name: 'Kemandirian (snack Sore)',
    startTime: '16:00:00',
    endTime: '16:30:00',
    sortOrder: 4,
    items: ['Cara memegang/Mengambil', 'Berdoa', 'Cara memakan/mengunyah'],
  },
  {
    typeCode: 'SIANG',
    name: 'Olah Raga',
    startTime: '16:30:00',
    endTime: '17:00:00',
    sortOrder: 5,
    items: ['Bulutangkis', 'Bersepeda', 'Menangkap Bola', 'Menendang Bola'],
  },
  {
    typeCode: 'MALAM',
    name: 'Shalat Maghrib',
    startTime: '17:00:00',
    endTime: '18:00:00',
    sortOrder: 0,
    items: ['Berwudhu', 'Bacaan Shalat', 'Gerakan Shalat'],
  },
  {
    typeCode: 'MALAM',
    name: 'Makan Malam',
    startTime: '18:30:00',
    endTime: '19:30:00',
    sortOrder: 1,
    items: [
      'Mengambil Piring',
      'Mengambil Makanan',
      'Berdoa',
      'Memegang Sendok',
      'Mengangkat Sendok',
      'Mengunyah',
      'Menelan',
      'Minum Air',
      'Mencuci Piring',
    ],
  },
  {
    typeCode: 'MALAM',
    name: 'Agama Shalat Isya',
    startTime: '19:30:00',
    endTime: '20:00:00',
    sortOrder: 2,
    items: ['Berwudhu', 'Bacaan Shalat', 'Gerakan Shalat'],
  },
  {
    typeCode: 'MALAM',
    name: 'Music',
    startTime: '20:00:00',
    endTime: '21:00:00',
    sortOrder: 3,
    items: ['Cara memegang stik', 'Laterisasi', 'Atensi dan Konsentrasi'],
  },
  {
    typeCode: 'MALAM',
    name: 'Tidur malam',
    startTime: '20:30:00',
    endTime: '04:45:00',
    sortOrder: 4,
    items: ['Tidur malam'],
  },
];

const resolveActivityTypeId = (
  canonicalCode: FormHarianSeedTemplate['typeCode'],
  types: Array<{ id: string; code: string; sort_order: number }>,
): string | undefined => {
  const aliases = ACTIVITY_TYPE_CODE_ALIASES[canonicalCode];
  const byCode = types.find((type) =>
    aliases.includes(type.code.toUpperCase()),
  );
  if (byCode) {
    return byCode.id;
  }

  const sortOrderByCanonical: Record<
    FormHarianSeedTemplate['typeCode'],
    number
  > = {
    PAGI: 0,
    SIANG: 1,
    MALAM: 2,
  };
  const bySort = types.find(
    (type) => type.sort_order === sortOrderByCanonical[canonicalCode],
  );
  return bySort?.id;
};

export const seedFormHarianActivityTemplates = async (
  queryRunner: QueryRunner,
): Promise<void> => {
  const existing = (await queryRunner.query(
    `SELECT COUNT(*)::int AS count FROM "activity_templates"`,
  )) as Array<{ count: number }>;
  if (existing[0]?.count > 0) {
    return;
  }

  const types = (await queryRunner.query(
    `SELECT "id", "code", "sort_order" FROM "activity_types" ORDER BY "sort_order"`,
  )) as Array<{ id: string; code: string; sort_order: number }>;

  if (!types.length) {
    return;
  }

  for (const template of FORM_HARIAN_ACTIVITY_TEMPLATES) {
    const activityTypeId = resolveActivityTypeId(template.typeCode, types);
    if (!activityTypeId) {
      continue;
    }

    const inserted = (await queryRunner.query(
      `
        INSERT INTO "activity_templates"
          ("activity_type_id", "name", "start_time", "end_time", "sort_order")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING "id"
      `,
      [
        activityTypeId,
        template.name,
        template.startTime,
        template.endTime,
        template.sortOrder,
      ],
    )) as Array<{ id: string }>;

    const templateId = inserted[0]?.id;
    if (!templateId) {
      continue;
    }

    for (const [index, name] of template.items.entries()) {
      await queryRunner.query(
        `
          INSERT INTO "activity_template_items" ("template_id", "name", "sort_order")
          VALUES ($1, $2, $3)
        `,
        [templateId, name, index],
      );
    }
  }
};
