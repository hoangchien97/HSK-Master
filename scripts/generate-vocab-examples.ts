/**
 * Generate example sentences for HSK 2-6 vocabulary JSON files.
 * Also removes the `meta` field from ALL JSON files (HSK 1-6).
 *
 * Run: npx tsx scripts/generate-vocab-examples.ts
 */

import * as fs from "fs"
import * as path from "path"

interface VocabEntry {
  id: string
  hsk_level_code: string
  lesson_number: number
  chinese_word: string
  pinyin: string
  meaning: string
  meaning_vi: string | null
  example_sentence: string | null
  example_pinyin: string | null
  example_meaning: string | null
  word_type: string | null
  display_order: number
  meta?: unknown
}

/* ─── Sentence templates by word_type ─── */

interface Template {
  sentence: (word: string) => string
  pinyin: (py: string) => string
  meaning: (vi: string) => string
}

const VERB_TEMPLATES: Template[] = [
  {
    sentence: (w) => `我每天都${w}。`,
    pinyin: (p) => `Wǒ měitiān dōu ${p}.`,
    meaning: (v) => `Tôi mỗi ngày đều ${v}.`,
  },
  {
    sentence: (w) => `他喜欢${w}。`,
    pinyin: (p) => `Tā xǐhuān ${p}.`,
    meaning: (v) => `Anh ấy thích ${v}.`,
  },
  {
    sentence: (w) => `你想${w}吗？`,
    pinyin: (p) => `Nǐ xiǎng ${p} ma?`,
    meaning: (v) => `Bạn muốn ${v} không?`,
  },
  {
    sentence: (w) => `我们一起${w}吧。`,
    pinyin: (p) => `Wǒmen yìqǐ ${p} ba.`,
    meaning: (v) => `Chúng ta cùng ${v} nhé.`,
  },
  {
    sentence: (w) => `她正在${w}。`,
    pinyin: (p) => `Tā zhèngzài ${p}.`,
    meaning: (v) => `Cô ấy đang ${v}.`,
  },
]

const NOUN_TEMPLATES: Template[] = [
  {
    sentence: (w) => `这是${w}。`,
    pinyin: (p) => `Zhè shì ${p}.`,
    meaning: (v) => `Đây là ${v}.`,
  },
  {
    sentence: (w) => `我需要${w}。`,
    pinyin: (p) => `Wǒ xūyào ${p}.`,
    meaning: (v) => `Tôi cần ${v}.`,
  },
  {
    sentence: (w) => `${w}很重要。`,
    pinyin: (p) => `${p} hěn zhòngyào.`,
    meaning: (v) => `${v} rất quan trọng.`,
  },
  {
    sentence: (w) => `你有${w}吗？`,
    pinyin: (p) => `Nǐ yǒu ${p} ma?`,
    meaning: (v) => `Bạn có ${v} không?`,
  },
  {
    sentence: (w) => `我喜欢这个${w}。`,
    pinyin: (p) => `Wǒ xǐhuān zhège ${p}.`,
    meaning: (v) => `Tôi thích ${v} này.`,
  },
]

const ADJ_TEMPLATES: Template[] = [
  {
    sentence: (w) => `今天天气很${w}。`,
    pinyin: (p) => `Jīntiān tiānqì hěn ${p}.`,
    meaning: (v) => `Thời tiết hôm nay rất ${v}.`,
  },
  {
    sentence: (w) => `这个东西很${w}。`,
    pinyin: (p) => `Zhège dōngxi hěn ${p}.`,
    meaning: (v) => `Thứ này rất ${v}.`,
  },
  {
    sentence: (w) => `他觉得很${w}。`,
    pinyin: (p) => `Tā juédé hěn ${p}.`,
    meaning: (v) => `Anh ấy cảm thấy rất ${v}.`,
  },
  {
    sentence: (w) => `这里${w}极了。`,
    pinyin: (p) => `Zhèlǐ ${p} jíle.`,
    meaning: (v) => `Ở đây ${v} vô cùng.`,
  },
]

const ADV_TEMPLATES: Template[] = [
  {
    sentence: (w) => `他${w}来了。`,
    pinyin: (p) => `Tā ${p} lái le.`,
    meaning: (v) => `Anh ấy ${v} đến rồi.`,
  },
  {
    sentence: (w) => `我${w}知道了。`,
    pinyin: (p) => `Wǒ ${p} zhīdào le.`,
    meaning: (v) => `Tôi ${v} biết rồi.`,
  },
  {
    sentence: (w) => `她${w}去学校。`,
    pinyin: (p) => `Tā ${p} qù xuéxiào.`,
    meaning: (v) => `Cô ấy ${v} đến trường.`,
  },
]

const PRONOUN_TEMPLATES: Template[] = [
  {
    sentence: (w) => `${w}是我的朋友。`,
    pinyin: (p) => `${p} shì wǒ de péngyǒu.`,
    meaning: (v) => `${v} là bạn của tôi.`,
  },
  {
    sentence: (w) => `${w}在哪儿？`,
    pinyin: (p) => `${p} zài nǎr?`,
    meaning: (v) => `${v} ở đâu?`,
  },
]

const NUMERAL_TEMPLATES: Template[] = [
  {
    sentence: (w) => `我有${w}个。`,
    pinyin: (p) => `Wǒ yǒu ${p} gè.`,
    meaning: (v) => `Tôi có ${v} cái.`,
  },
  {
    sentence: (w) => `一共${w}块钱。`,
    pinyin: (p) => `Yígòng ${p} kuài qián.`,
    meaning: (v) => `Tổng cộng ${v} đồng.`,
  },
]

const MEASURE_TEMPLATES: Template[] = [
  {
    sentence: (w) => `请给我一${w}。`,
    pinyin: (p) => `Qǐng gěi wǒ yī ${p}.`,
    meaning: (v) => `Xin cho tôi một ${v}.`,
  },
  {
    sentence: (w) => `我买了两${w}。`,
    pinyin: (p) => `Wǒ mǎile liǎng ${p}.`,
    meaning: (v) => `Tôi đã mua hai ${v}.`,
  },
]

const CONJ_TEMPLATES: Template[] = [
  {
    sentence: (w) => `我${w}他都去。`,
    pinyin: (p) => `Wǒ ${p} tā dōu qù.`,
    meaning: (v) => `Tôi ${v} anh ấy đều đi.`,
  },
]

const PREP_TEMPLATES: Template[] = [
  {
    sentence: (w) => `${w}学校不远。`,
    pinyin: (p) => `${p} xuéxiào bù yuǎn.`,
    meaning: (v) => `${v} trường không xa.`,
  },
]

const PARTICLE_TEMPLATES: Template[] = [
  {
    sentence: (w) => `好${w}！`,
    pinyin: (p) => `Hǎo ${p}!`,
    meaning: (v) => `Được ${v}!`,
  },
  {
    sentence: (w) => `是${w}？`,
    pinyin: (p) => `Shì ${p}?`,
    meaning: (v) => `Là ${v}?`,
  },
]

const GENERIC_TEMPLATES: Template[] = [
  {
    sentence: (w) => `请你注意「${w}」的用法。`,
    pinyin: (p) => `Qǐng nǐ zhùyì "${p}" de yòngfǎ.`,
    meaning: (v) => `Xin bạn chú ý cách dùng "${v}".`,
  },
  {
    sentence: (w) => `我学会了「${w}」这个词。`,
    pinyin: (p) => `Wǒ xuéhuì le "${p}" zhège cí.`,
    meaning: (v) => `Tôi đã học được từ "${v}".`,
  },
  {
    sentence: (w) => `「${w}」是一个常用词。`,
    pinyin: (p) => `"${p}" shì yī gè chángyòng cí.`,
    meaning: (v) => `"${v}" là một từ thông dụng.`,
  },
]

function getTemplates(wordType: string | null): Template[] {
  switch (wordType) {
    case "v": return VERB_TEMPLATES
    case "n": return NOUN_TEMPLATES
    case "a": return ADJ_TEMPLATES
    case "d": return ADV_TEMPLATES
    case "r": return PRONOUN_TEMPLATES
    case "m": return NUMERAL_TEMPLATES
    case "q": return MEASURE_TEMPLATES
    case "c": return CONJ_TEMPLATES
    case "p": return PREP_TEMPLATES
    case "u": return PARTICLE_TEMPLATES
    default: return GENERIC_TEMPLATES
  }
}

function pickTemplate(templates: Template[], index: number): Template {
  return templates[index % templates.length]
}

function getMeaningVi(entry: VocabEntry): string {
  if (entry.meaning_vi) {
    // Take first meaning before comma
    return entry.meaning_vi.split(",")[0].split("(")[0].trim()
  }
  return entry.meaning.split(";")[0].split(",")[0].trim()
}

/* ─── Main ─── */

const EXPORT_DIR = path.join(__dirname, "..", "prisma", "hsk_vocab_exports")
const HSK_FILES = [
  "vocabulary_hsk1.json",
  "vocabulary_hsk2.json",
  "vocabulary_hsk3.json",
  "vocabulary_hsk4.json",
  "vocabulary_hsk5.json",
  "vocabulary_hsk6.json",
]

let totalUpdated = 0
let totalCleaned = 0

for (const file of HSK_FILES) {
  const filePath = path.join(EXPORT_DIR, file)
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} not found, skipping`)
    continue
  }

  const data: VocabEntry[] = JSON.parse(fs.readFileSync(filePath, "utf-8"))
  let updatedCount = 0
  let metaRemoved = 0

  for (let i = 0; i < data.length; i++) {
    const entry = data[i]

    // Remove meta field
    if ("meta" in entry) {
      delete entry.meta
      metaRemoved++
    }

    // Generate examples if missing (HSK2-6)
    if (!entry.example_sentence && entry.hsk_level_code !== "hsk1") {
      const templates = getTemplates(entry.word_type)
      const template = pickTemplate(templates, entry.display_order - 1)
      const vi = getMeaningVi(entry)

      entry.example_sentence = template.sentence(entry.chinese_word)
      entry.example_pinyin = template.pinyin(entry.pinyin)
      entry.example_meaning = template.meaning(vi)
      updatedCount++
    }
  }

  // Write updated JSON
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8")

  console.log(`✅ ${file}: removed meta from ${metaRemoved} entries, generated ${updatedCount} examples`)
  totalUpdated += updatedCount
  totalCleaned += metaRemoved
}

console.log(`\n🎉 Done! Total: ${totalUpdated} examples generated, ${totalCleaned} meta fields removed`)
