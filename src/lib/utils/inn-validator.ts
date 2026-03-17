// регионы
const REGION_CODES: Record<string, string> = {
  "01": "Республика Адыгея", "02": "Республика Башкортостан", "03": "Республика Бурятия",
  "04": "Республика Алтай", "05": "Республика Дагестан", "06": "Республика Ингушетия",
  "07": "Кабардино-Балкарская Республика", "08": "Республика Калмыкия", "09": "Карачаево-Черкесская Республика",
  "10": "Республика Карелия", "11": "Республика Коми", "12": "Республика Марий Эл",
  "13": "Республика Мордовия", "14": "Республика Саха (Якутия)", "15": "Республика Северная Осетия",
  "16": "Республика Татарстан", "17": "Республика Тыва", "18": "Удмуртская Республика",
  "19": "Республика Хакасия", "20": "Чеченская Республика", "21": "Чувашская Республика",
  "22": "Алтайский край", "23": "Краснодарский край", "24": "Красноярский край",
  "25": "Приморский край", "26": "Ставропольский край", "27": "Хабаровский край",
  "28": "Амурская область", "29": "Архангельская область", "30": "Астраханская область",
  "31": "Белгородская область", "32": "Брянская область", "33": "Владимирская область",
  "34": "Волгоградская область", "35": "Вологодская область", "36": "Воронежская область",
  "37": "Ивановская область", "38": "Иркутская область", "39": "Калининградская область",
  "40": "Калужская область", "41": "Камчатский край", "42": "Кемеровская область",
  "43": "Кировская область", "44": "Костромская область", "45": "Курганская область",
  "46": "Курская область", "47": "Ленинградская область", "48": "Липецкая область",
  "49": "Магаданская область", "50": "Московская область", "51": "Мурманская область",
  "52": "Нижегородская область", "53": "Новгородская область", "54": "Новосибирская область",
  "55": "Омская область", "56": "Оренбургская область", "57": "Орловская область",
  "58": "Пензенская область", "59": "Пермский край", "60": "Псковская область",
  "61": "Ростовская область", "62": "Рязанская область", "63": "Самарская область",
  "64": "Саратовская область", "65": "Сахалинская область", "66": "Свердловская область",
  "67": "Смоленская область", "68": "Тамбовская область", "69": "Тверская область",
  "70": "Томская область", "71": "Тульская область", "72": "Тюменская область",
  "73": "Ульяновская область", "74": "Челябинская область", "75": "Забайкальский край",
  "76": "Ярославская область", "77": "Москва", "78": "Санкт-Петербург",
  "79": "Еврейская автономная область", "82": "Республика Крым",
  "83": "Ненецкий автономный округ", "86": "Ханты-Мансийский автономный округ",
  "87": "Чукотский автономный округ", "89": "Ямало-Ненецкий автономный округ",
  "91": "Республика Крым", "92": "Севастополь", "99": "Межрегиональная инспекция",
}

export interface INNResult {
  valid: boolean
  type?: "ЮЛ" | "ФЛ/ИП"
  region?: string
}

// проверка ИНН
export function validateINN(value: string): INNResult {
  const digits = value.replace(/\s/g, "")
  if (!/^\d{10}$|^\d{12}$/.test(digits)) {
    return { valid: false }
  }

  const d = digits.split("").map(Number)
  const regionCode = digits.slice(0, 2)
  const region = REGION_CODES[regionCode]

  if (digits.length === 10) {
    // юрлицо — 10-я цифра контрольная
    const weights = [2, 4, 10, 3, 5, 9, 4, 6, 8]
    const sum = weights.reduce((s, w, i) => s + w * d[i], 0)
    const check = (sum % 11) % 10
    return { valid: check === d[9], type: "ЮЛ", region }
  }

  // физлицо/ИП — 11-я и 12-я
  const w11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
  const sum11 = w11.reduce((s, w, i) => s + w * d[i], 0)
  const check11 = (sum11 % 11) % 10

  const w12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
  const sum12 = w12.reduce((s, w, i) => s + w * d[i], 0)
  const check12 = (sum12 % 11) % 10

  return { valid: check11 === d[10] && check12 === d[11], type: "ФЛ/ИП", region }
}

// проверка ОГРН
export function validateOGRN(value: string): { valid: boolean; type?: string } {
  const digits = value.replace(/\s/g, "")

  if (/^\d{13}$/.test(digits)) {
    const num = BigInt(digits.slice(0, 12))
    const remainder = Number(num % 11n) % 10
    return { valid: remainder === Number(digits[12]), type: "ОГРН (ЮЛ)" }
  }

  if (/^\d{15}$/.test(digits)) {
    const num = BigInt(digits.slice(0, 14))
    const remainder = Number(num % 13n) % 10
    return { valid: remainder === Number(digits[14]), type: "ОГРНИП (ИП)" }
  }

  return { valid: false }
}

// проверка СНИЛС
export function validateSNILS(value: string): { valid: boolean } {
  const digits = value.replace(/[\s\-]/g, "")
  if (!/^\d{11}$/.test(digits)) return { valid: false }

  const d = digits.split("").map(Number)
  const checkSum = d[9] * 10 + d[10]

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += d[i] * (9 - i)
  }

  let control: number
  if (sum < 100) {
    control = sum
  } else if (sum === 100 || sum === 101) {
    control = 0
  } else {
    control = sum % 101
    if (control === 100) control = 0
  }

  return { valid: control === checkSum }
}

// проверка КПП
export function validateKPP(value: string): { valid: boolean; region?: string } {
  const v = value.replace(/\s/g, "")
  if (!/^\d{4}[\dA-Z]{2}\d{3}$/i.test(v)) return { valid: false }
  const regionCode = v.slice(0, 2)
  const region = REGION_CODES[regionCode]
  return { valid: true, region }
}

// проверка р/с по БИК
export function validateAccount(account: string, bik: string): { valid: boolean } {
  const acc = account.replace(/\s/g, "")
  const b = bik.replace(/\s/g, "")
  if (!/^\d{20}$/.test(acc) || !/^\d{9}$/.test(b)) return { valid: false }

  // последние 3 цифры БИК + 20 цифр счёта
  const keyStr = b.slice(6, 9) + acc
  const weights = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1]
  let sum = 0
  for (let i = 0; i < 23; i++) {
    sum += (Number(keyStr[i]) * weights[i]) % 10
  }
  return { valid: sum % 10 === 0 }
}
