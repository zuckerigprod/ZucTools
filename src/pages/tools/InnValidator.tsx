import { useState } from "react"
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useSEO } from "@/lib/use-seo"
import CalculatorLayout from "@/components/calculator/CalculatorLayout"
import InfoSection from "@/components/calculator/InfoSection"
import { validateINN, validateOGRN, validateSNILS, validateKPP, validateAccount } from "@/lib/utils/inn-validator"

function ValidationResult({ valid, details }: { valid: boolean | null; details?: string[] }) {
  if (valid === null) return null

  return (
    <div className={`rounded-lg p-4 flex items-start gap-3 ${valid ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
      {valid ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
      )}
      <div>
        <p className={`font-medium ${valid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {valid ? "Корректный" : "Некорректный"}
        </p>
        {details && details.length > 0 && (
          <ul className="text-sm text-muted-foreground mt-1 space-y-0.5">
            {details.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}

function INNTab() {
  const [value, setValue] = useState("")
  const trimmed = value.replace(/\s/g, "")
  const hasInput = trimmed.length > 0
  const result = hasInput ? validateINN(trimmed) : null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inn">ИНН (10 или 12 цифр)</Label>
        <Input
          id="inn"
          type="text"
          inputMode="numeric"
          maxLength={12}
          placeholder="7707083893"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 12))}
          className="bg-input/50 font-mono text-lg"
        />
      </div>
      {result && (
        <ValidationResult
          valid={result.valid}
          details={result.valid ? [
            `Тип: ${result.type}`,
            ...(result.region ? [`Регион: ${result.region}`] : []),
          ] : ["Контрольная сумма не совпадает"]}
        />
      )}
    </div>
  )
}

function OGRNTab() {
  const [value, setValue] = useState("")
  const trimmed = value.replace(/\s/g, "")
  const hasInput = trimmed.length > 0
  const result = hasInput ? validateOGRN(trimmed) : null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ogrn">ОГРН (13 или 15 цифр)</Label>
        <Input
          id="ogrn"
          type="text"
          inputMode="numeric"
          maxLength={15}
          placeholder="1027700132195"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 15))}
          className="bg-input/50 font-mono text-lg"
        />
      </div>
      {result && (
        <ValidationResult
          valid={result.valid}
          details={result.valid && result.type ? [result.type] : undefined}
        />
      )}
    </div>
  )
}

function SNILSTab() {
  const [value, setValue] = useState("")
  const trimmed = value.replace(/[\s\-]/g, "")
  const hasInput = trimmed.length > 0
  const result = hasInput ? validateSNILS(trimmed) : null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="snils">СНИЛС (11 цифр)</Label>
        <Input
          id="snils"
          type="text"
          inputMode="numeric"
          maxLength={14}
          placeholder="112-233-445 95"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d\s\-]/g, "").slice(0, 14))}
          className="bg-input/50 font-mono text-lg"
        />
      </div>
      {result && <ValidationResult valid={result.valid} />}
    </div>
  )
}

function KPPTab() {
  const [value, setValue] = useState("")
  const trimmed = value.replace(/\s/g, "")
  const hasInput = trimmed.length > 0
  const result = hasInput ? validateKPP(trimmed) : null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kpp">КПП (9 символов)</Label>
        <Input
          id="kpp"
          type="text"
          maxLength={9}
          placeholder="770701001"
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 9))}
          className="bg-input/50 font-mono text-lg"
        />
      </div>
      {result && (
        <ValidationResult
          valid={result.valid}
          details={result.valid && result.region ? [`Регион: ${result.region}`] : undefined}
        />
      )}
    </div>
  )
}

function AccountTab() {
  const [account, setAccount] = useState("")
  const [bik, setBik] = useState("")
  const accTrimmed = account.replace(/\s/g, "")
  const bikTrimmed = bik.replace(/\s/g, "")
  const hasInput = accTrimmed.length > 0 && bikTrimmed.length > 0
  const result = hasInput ? validateAccount(accTrimmed, bikTrimmed) : null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="account">Расчётный счёт (20 цифр)</Label>
        <Input
          id="account"
          type="text"
          inputMode="numeric"
          maxLength={20}
          placeholder="40702810100000012345"
          value={account}
          onChange={(e) => setAccount(e.target.value.replace(/\D/g, "").slice(0, 20))}
          className="bg-input/50 font-mono text-lg"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bik">БИК банка (9 цифр)</Label>
        <Input
          id="bik"
          type="text"
          inputMode="numeric"
          maxLength={9}
          placeholder="044525225"
          value={bik}
          onChange={(e) => setBik(e.target.value.replace(/\D/g, "").slice(0, 9))}
          className="bg-input/50 font-mono text-lg"
        />
      </div>
      {result && <ValidationResult valid={result.valid} />}
    </div>
  )
}

export default function InnValidator() {
  useSEO({
    title: "Проверка ИНН, ОГРН, СНИЛС онлайн",
    description: "Бесплатная проверка ИНН, ОГРН, СНИЛС, КПП и расчётных счетов по контрольной сумме.",
  })

  return (
    <CalculatorLayout icon={ShieldCheck} title="Проверка ИНН" description="Валидация реквизитов по контрольной сумме">
      <Tabs defaultValue="inn">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inn">ИНН</TabsTrigger>
          <TabsTrigger value="ogrn">ОГРН</TabsTrigger>
          <TabsTrigger value="snils">СНИЛС</TabsTrigger>
          <TabsTrigger value="kpp">КПП</TabsTrigger>
          <TabsTrigger value="account">Р/С</TabsTrigger>
        </TabsList>
        <TabsContent value="inn" className="mt-4"><INNTab /></TabsContent>
        <TabsContent value="ogrn" className="mt-4"><OGRNTab /></TabsContent>
        <TabsContent value="snils" className="mt-4"><SNILSTab /></TabsContent>
        <TabsContent value="kpp" className="mt-4"><KPPTab /></TabsContent>
        <TabsContent value="account" className="mt-4"><AccountTab /></TabsContent>
      </Tabs>

      <InfoSection>
        <p><strong>ИНН</strong> — идентификационный номер налогоплательщика. 10 цифр для ЮЛ, 12 для ФЛ/ИП. Последние 1-2 цифры — контрольные.</p>
        <p className="mt-1"><strong>ОГРН</strong> — основной государственный регистрационный номер. 13 цифр для ЮЛ, 15 для ИП.</p>
        <p className="mt-1"><strong>СНИЛС</strong> — страховой номер индивидуального лицевого счёта. 11 цифр, формат XXX-XXX-XXX XX.</p>
        <p className="mt-1"><strong>КПП</strong> — код причины постановки на учёт. 9 символов.</p>
        <p className="mt-1"><strong>Р/С + БИК</strong> — проверка расчётного счёта по контрольной сумме с использованием БИК банка.</p>
      </InfoSection>
    </CalculatorLayout>
  )
}
