// МРОТ
export const MROT: Record<number, number> = {
  2020: 12130,
  2021: 12792,
  2022: 15279,
  2023: 16242,
  2024: 19242,
  2025: 22440,
  2026: 27093,
}

// предельная база взносов
export const CONTRIBUTION_BASE: Record<number, number> = {
  2020: 1292000,
  2021: 1465000,
  2022: 1565000,
  2023: 1917000,
  2024: 2225000,
  2025: 2759000,
  2026: 2979000,
}

// фикс. взносы ИП
export const IP_CONTRIBUTIONS: Record<number, { fixed: number; maxVariable: number }> = {
  2020: { fixed: 40874, maxVariable: 259584 },
  2021: { fixed: 40874, maxVariable: 259584 },
  2022: { fixed: 43211, maxVariable: 275560 },
  2023: { fixed: 45842, maxVariable: 302903 },
  2024: { fixed: 49500, maxVariable: 277571 },
  2025: { fixed: 53658, maxVariable: 300888 },
  2026: { fixed: 57390, maxVariable: 321818 },
}

// ключевая ставка ЦБ (от новых к старым)
export const CB_RATE_HISTORY: { from: string; rate: number }[] = [
  { from: "2025-12-19", rate: 16 },
  { from: "2025-10-24", rate: 16.5 },
  { from: "2025-09-12", rate: 19 },
  { from: "2025-07-25", rate: 20 },
  { from: "2025-06-06", rate: 20 },
  { from: "2025-04-25", rate: 21 },
  { from: "2025-02-14", rate: 21 },
  { from: "2024-10-28", rate: 21 },
  { from: "2024-09-16", rate: 19 },
  { from: "2024-07-26", rate: 18 },
  { from: "2024-06-07", rate: 16 },
  { from: "2024-02-16", rate: 16 },
  { from: "2023-12-18", rate: 16 },
  { from: "2023-10-30", rate: 15 },
  { from: "2023-09-18", rate: 13 },
  { from: "2023-07-24", rate: 12 },
  { from: "2022-09-19", rate: 7.5 },
  { from: "2022-07-25", rate: 8 },
  { from: "2022-06-14", rate: 9.5 },
  { from: "2022-05-27", rate: 11 },
  { from: "2022-05-04", rate: 14 },
  { from: "2022-04-11", rate: 17 },
  { from: "2022-02-28", rate: 20 },
  { from: "2021-12-20", rate: 8.5 },
  { from: "2021-10-25", rate: 7.5 },
  { from: "2021-09-13", rate: 6.75 },
  { from: "2021-07-26", rate: 6.5 },
  { from: "2021-06-15", rate: 5.5 },
  { from: "2021-04-26", rate: 5 },
  { from: "2021-03-22", rate: 4.5 },
  { from: "2020-07-27", rate: 4.25 },
  { from: "2020-06-22", rate: 4.5 },
  { from: "2020-04-27", rate: 5.5 },
  { from: "2020-02-10", rate: 6 },
]

// шкала НДФЛ с 2025
export const NDFL_SCALE_2025: { limit: number; rate: number }[] = [
  { limit: 2_400_000, rate: 13 },
  { limit: 5_000_000, rate: 15 },
  { limit: 20_000_000, rate: 18 },
  { limit: 50_000_000, rate: 20 },
  { limit: Infinity, rate: 22 },
]

// ставки НДС
export const VAT_RATES = [5, 7, 10, 18, 20, 22] as const

// 29.3 — для отпускных
export const AVG_MONTH_DAYS = 29.3

// лимиты УСН 2026
export const USN_LIMITS = {
  income: 490_500_000,
  incomeReduced: 337_500_000,
  employees: 130,
  employeesReduced: 100,
  standardRate6: 6,
  standardRate15: 15,
  increasedRate6: 8,
  increasedRate15: 20,
}

// лимит НПД
export const NPD_LIMIT = 2_400_000

// взносы работодателя, %
export const EMPLOYER_CONTRIBUTIONS = {
  pension: 22,      // пфр
  medical: 5.1,     // фомс
  social: 2.9,      // фсс
  accidentMin: 0.2, // нс мин. класс
  mspReduced: 15,   // мсп сверх МРОТ
}

// тарифы НС по классам профриска (1-32)
export const ACCIDENT_RATES: number[] = [
  0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
  1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 1.9, 2.1, 2.3, 2.5,
  2.8, 3.1, 3.4, 3.7, 4.1, 4.5, 5.0, 5.5, 6.1, 6.7,
  7.4, 8.5,
]

// детские вычеты
export const CHILD_DEDUCTIONS = {
  perChild: [1400, 1400, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000] as readonly number[],
  incomeLimit: 350_000, // лимит дохода
}

// госпошлина — суды общей юрисдикции (ст. 333.19 НК)
export const COURT_FEE_GENERAL: { upTo: number; base: number; rate: number; excess: number }[] = [
  { upTo: 20_000, base: 0, rate: 4, excess: 0 },
  { upTo: 100_000, base: 800, rate: 3, excess: 20_000 },
  { upTo: 200_000, base: 3_200, rate: 2, excess: 100_000 },
  { upTo: 1_000_000, base: 5_200, rate: 1, excess: 200_000 },
  { upTo: Infinity, base: 13_200, rate: 0.5, excess: 1_000_000 },
]

// госпошлина — арбитраж (ст. 333.21 НК)
export const COURT_FEE_ARBITRATION: { upTo: number; base: number; rate: number; excess: number }[] = [
  { upTo: 100_000, base: 0, rate: 4, excess: 0 },
  { upTo: 200_000, base: 4_000, rate: 3, excess: 100_000 },
  { upTo: 1_000_000, base: 7_000, rate: 2, excess: 200_000 },
  { upTo: 2_000_000, base: 23_000, rate: 1, excess: 1_000_000 },
  { upTo: Infinity, base: 33_000, rate: 0.5, excess: 2_000_000 },
]

// больничный — % от стажа
export const SICK_LEAVE_PERCENT: Record<string, number> = {
  "less-6m": 0, // считаем по МРОТ
  "6m-5y": 60,
  "5y-8y": 80,
  "8y+": 100,
}

// декрет — дни по типу
export const MATERNITY_DAYS: Record<string, number> = {
  normal: 140,
  complicated: 156,
  multiple: 194,
}
