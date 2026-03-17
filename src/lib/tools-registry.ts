import { lazy, type ComponentType } from "react"
import {
  Calculator,
  Receipt,
  Type,
  CalendarDays,
  Shield,
  Baby,
  Thermometer,
  Palmtree,
  UserMinus,
  AlertTriangle,
  FileSpreadsheet,
  Scale,
  Wallet,
  Users,
  TrendingUp,
  Gavel,
  Landmark,
  PiggyBank,
  CalendarRange,
  ShieldCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface ToolDefinition {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: string
  component: React.LazyExoticComponent<ComponentType>
}

export interface CategoryDefinition {
  name: string
  description: string
}

export const CATEGORY_ORDER: CategoryDefinition[] = [
  { name: "Бухгалтерия", description: "Расчёт зарплат, взносов и стоимости сотрудников" },
  { name: "Калькуляторы", description: "Расчёт процентов, налогов, пеней и пособий" },
  { name: "Финансы", description: "Кредиты, вклады и личные финансы" },
  { name: "Справочники", description: "Справочная информация и календари" },
  { name: "Проверка", description: "Валидация документов и реквизитов" },
]

export const toolsRegistry: ToolDefinition[] = [
  // бухгалтерия
  {
    id: "salary-calculator",
    name: "Калькулятор зарплаты",
    description: "Расчёт зарплаты «до вычета» и «на руки» с учётом НДФЛ и взносов",
    icon: Wallet,
    category: "Бухгалтерия",
    component: lazy(() => import("@/pages/tools/SalaryCalculator")),
  },
  {
    id: "employee-cost-calculator",
    name: "Стоимость сотрудника",
    description: "Полная стоимость сотрудника для работодателя с учётом всех взносов",
    icon: Users,
    category: "Бухгалтерия",
    component: lazy(() => import("@/pages/tools/EmployeeCostCalculator")),
  },

  // калькуляторы
  {
    id: "percent-calculator",
    name: "Калькулятор процентов",
    description: "Вычисление процентов от числа, прибавление и вычитание процентов",
    icon: Calculator,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/PercentCalculator")),
  },
  {
    id: "vat-calculator",
    name: "Калькулятор НДС",
    description: "Начисление и выделение НДС по ставкам 5%, 7%, 10%, 18%, 20%, 22%",
    icon: Receipt,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/VatCalculator")),
  },
  {
    id: "number-to-words",
    name: "Сумма прописью",
    description: "Преобразование числа в текст для платёжных поручений и документов",
    icon: Type,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/NumberToWordsCalculator")),
  },
  {
    id: "days-between-calculator",
    name: "Дни между датами",
    description: "Рабочие и календарные дни между датами с учётом производственного календаря",
    icon: CalendarDays,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/DaysBetweenCalculator")),
  },
  {
    id: "ip-contributions-calculator",
    name: "Страховые взносы ИП",
    description: "Фиксированные взносы ИП и 1% с доходов свыше 300 000 ₽",
    icon: Shield,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/IpContributionsCalculator")),
  },
  {
    id: "maternity-calculator",
    name: "Калькулятор декретных",
    description: "Расчёт пособия по беременности и родам",
    icon: Baby,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/MaternityCalculator")),
  },
  {
    id: "sick-leave-calculator",
    name: "Калькулятор больничного",
    description: "Расчёт пособия по временной нетрудоспособности",
    icon: Thermometer,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/SickLeaveCalculator")),
  },
  {
    id: "vacation-pay-calculator",
    name: "Калькулятор отпускных",
    description: "Расчёт отпускных с учётом среднего заработка и НДФЛ",
    icon: Palmtree,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/VacationPayCalculator")),
  },
  {
    id: "dismissal-compensation-calculator",
    name: "Компенсация при увольнении",
    description: "Расчёт компенсации за неиспользованный отпуск при увольнении",
    icon: UserMinus,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/DismissalCompensationCalculator")),
  },
  {
    id: "penalty-calculator",
    name: "Расчёт пеней",
    description: "Пени за просрочку уплаты налогов и страховых взносов",
    icon: AlertTriangle,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/PenaltyCalculator")),
  },
  {
    id: "usn-calculator",
    name: "Калькулятор УСН",
    description: "Расчёт налога по упрощённой системе налогообложения",
    icon: FileSpreadsheet,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/UsnCalculator")),
  },
  {
    id: "tax-system-calculator",
    name: "Выбор налогообложения",
    description: "Сравнение ОСНО, УСН, Патент и НПД — какой режим выгоднее",
    icon: Scale,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/TaxSystemCalculator")),
  },
  {
    id: "ndfl-calculator",
    name: "Калькулятор НДФЛ",
    description: "Расчёт НДФЛ по прогрессивной шкале с визуализацией ступеней",
    icon: TrendingUp,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/NdflCalculator")),
  },
  {
    id: "court-fee-calculator",
    name: "Госпошлина в суд",
    description: "Расчёт госпошлины для судов общей юрисдикции и арбитражных судов",
    icon: Gavel,
    category: "Калькуляторы",
    component: lazy(() => import("@/pages/tools/CourtFeeCalculator")),
  },

  // финансы
  {
    id: "loan-calculator",
    name: "Калькулятор кредита",
    description: "Расчёт аннуитетных и дифференцированных платежей с графиком",
    icon: Landmark,
    category: "Финансы",
    component: lazy(() => import("@/pages/tools/LoanCalculator")),
  },
  {
    id: "deposit-calculator",
    name: "Калькулятор вклада",
    description: "Расчёт процентов по вкладу с капитализацией и пополнением",
    icon: PiggyBank,
    category: "Финансы",
    component: lazy(() => import("@/pages/tools/DepositCalculator")),
  },

  // справочники
  {
    id: "production-calendar",
    name: "Производственный календарь",
    description: "Производственный календарь с праздниками и рабочими днями",
    icon: CalendarRange,
    category: "Справочники",
    component: lazy(() => import("@/pages/tools/ProductionCalendar")),
  },

  // проверка
  {
    id: "inn-validator",
    name: "Проверка ИНН",
    description: "Валидация ИНН, ОГРН, СНИЛС, КПП и расчётных счетов",
    icon: ShieldCheck,
    category: "Проверка",
    component: lazy(() => import("@/pages/tools/InnValidator")),
  },
]
