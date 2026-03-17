import { calculateNDFL } from "@/lib/utils/ndfl"
import {
  MROT,
  EMPLOYER_CONTRIBUTIONS,
  CHILD_DEDUCTIONS,
  CONTRIBUTION_BASE,
  ACCIDENT_RATES,
} from "@/lib/constants/tax-constants"

export interface SalaryResult {
  gross: number
  ndfl: number
  net: number
  pensionContrib: number
  medicalContrib: number
  socialContrib: number
  accidentContrib: number
  totalContrib: number
  totalCost: number
}

// gross → net
export function calculateSalaryGrossToNet(
  gross: number,
  children: number,
  isResident: boolean,
  isMsp: boolean,
  accidentClass: number,
  year = 2026,
): SalaryResult {
  if (gross <= 0) {
    return { gross: 0, ndfl: 0, net: 0, pensionContrib: 0, medicalContrib: 0, socialContrib: 0, accidentContrib: 0, totalContrib: 0, totalCost: 0 }
  }

  const annualGross = gross * 12

  // вычеты на детей
  let annualDeduction = 0
  if (isResident && children > 0) {
    const monthlyDeduction = CHILD_DEDUCTIONS.perChild
      .slice(0, children)
      .reduce((s, v) => s + v, 0)
    // пока доход < 350к
    const monthsApplicable = Math.min(12, Math.floor(CHILD_DEDUCTIONS.incomeLimit / gross) || 0)
    annualDeduction = monthlyDeduction * monthsApplicable
  }

  // ндфл
  const taxableIncome = Math.max(0, annualGross - annualDeduction)
  let ndflAnnual: number
  if (!isResident) {
    ndflAnnual = Math.round(annualGross * 0.30 * 100) / 100
  } else {
    ndflAnnual = calculateNDFL(taxableIncome, year)
  }
  const ndfl = Math.round(ndflAnnual / 12 * 100) / 100
  const net = Math.round((gross - ndfl) * 100) / 100

  // взносы
  const contribs = calculateEmployerContributions(gross, isMsp, accidentClass, year)

  return {
    gross,
    ndfl,
    net,
    ...contribs,
    totalCost: Math.round((gross + contribs.totalContrib) * 100) / 100,
  }
}

// net → gross (бинарный поиск)
export function calculateSalaryNetToGross(
  targetNet: number,
  children: number,
  isResident: boolean,
  isMsp: boolean,
  accidentClass: number,
  year = 2026,
): SalaryResult {
  if (targetNet <= 0) {
    return { gross: 0, ndfl: 0, net: 0, pensionContrib: 0, medicalContrib: 0, socialContrib: 0, accidentContrib: 0, totalContrib: 0, totalCost: 0 }
  }

  let lo = targetNet
  let hi = targetNet * 2
  // подгоняем верхнюю границу
  while (calculateSalaryGrossToNet(hi, children, isResident, isMsp, accidentClass, year).net < targetNet) {
    hi *= 2
  }

  for (let i = 0; i < 100; i++) {
    const mid = Math.round((lo + hi) / 2 * 100) / 100
    const result = calculateSalaryGrossToNet(mid, children, isResident, isMsp, accidentClass, year)
    if (Math.abs(result.net - targetNet) < 0.01) {
      return result
    }
    if (result.net < targetNet) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return calculateSalaryGrossToNet(Math.round((lo + hi) / 2 * 100) / 100, children, isResident, isMsp, accidentClass, year)
}

export interface EmployerContributions {
  pensionContrib: number
  medicalContrib: number
  socialContrib: number
  accidentContrib: number
  totalContrib: number
}

// взносы работодателя за месяц
export function calculateEmployerContributions(
  monthlyGross: number,
  isMsp: boolean,
  accidentClass: number,
  year = 2026,
): EmployerContributions {
  const mrot = MROT[year] ?? MROT[2026]
  const base = CONTRIBUTION_BASE[year] ?? CONTRIBUTION_BASE[2026]
  const accidentRate = ACCIDENT_RATES[Math.max(0, Math.min(31, accidentClass - 1))] ?? 0.2
  const annualGross = monthlyGross * 12

  let pensionContrib: number
  let medicalContrib: number
  let socialContrib: number

  if (isMsp) {
    // МСП: до МРОТ полные, сверх — 15% (10 пфр + 5 фомс)
    const basePart = Math.min(monthlyGross, mrot)
    const mspPart = Math.max(0, monthlyGross - mrot)

    // до предельной базы
    if (annualGross <= base) {
      pensionContrib = basePart * EMPLOYER_CONTRIBUTIONS.pension / 100 + mspPart * 10 / 100
      medicalContrib = basePart * EMPLOYER_CONTRIBUTIONS.medical / 100 + mspPart * 5 / 100
      socialContrib = basePart * EMPLOYER_CONTRIBUTIONS.social / 100
    } else {
      // сверх базы
      pensionContrib = basePart * 10 / 100 + mspPart * 10 / 100
      medicalContrib = basePart * EMPLOYER_CONTRIBUTIONS.medical / 100 + mspPart * 5 / 100
      socialContrib = 0
    }
  } else {
    if (annualGross <= base) {
      pensionContrib = monthlyGross * EMPLOYER_CONTRIBUTIONS.pension / 100
      medicalContrib = monthlyGross * EMPLOYER_CONTRIBUTIONS.medical / 100
      socialContrib = monthlyGross * EMPLOYER_CONTRIBUTIONS.social / 100
    } else {
      pensionContrib = monthlyGross * 10 / 100
      medicalContrib = monthlyGross * EMPLOYER_CONTRIBUTIONS.medical / 100
      socialContrib = 0
    }
  }

  const accidentContrib = monthlyGross * accidentRate / 100

  pensionContrib = Math.round(pensionContrib * 100) / 100
  medicalContrib = Math.round(medicalContrib * 100) / 100
  socialContrib = Math.round(socialContrib * 100) / 100
  const totalContrib = Math.round((pensionContrib + medicalContrib + socialContrib + accidentContrib) * 100) / 100

  return { pensionContrib, medicalContrib, socialContrib, accidentContrib: Math.round(accidentContrib * 100) / 100, totalContrib }
}
