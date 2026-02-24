/**
 * Populate vocabulary_hsk1.json with word_type + example sentences
 *
 * Usage: npx tsx scripts/populate-hsk1-data.ts
 */
import fs from "fs"
import path from "path"

interface VocabEntry {
  id: string
  hsk_level_code: string
  lesson_number: number
  chinese_word: string
  pinyin: string
  meaning: string
  example_sentence: string | null
  example_pinyin: string | null
  example_meaning: string | null
  word_type: string | null
  display_order: number
  meta: Record<string, unknown>
  meaning_vi: string | null
}

/**
 * HSK1 word_type + example data
 * word_type codes: n=noun, v=verb, a=adj, d=adv, r=pronoun, m=numeral,
 *   q=measure, c=conj, p=prep, u=particle, i=idiom, phr=phrase
 */
const HSK1_DATA: Record<string, {
  word_type: string
  example_sentence: string
  example_pinyin: string
  example_meaning: string
}> = {
  "爱": {
    word_type: "v",
    example_sentence: "我爱我的家人。",
    example_pinyin: "Wǒ ài wǒ de jiārén.",
    example_meaning: "Tôi yêu gia đình tôi.",
  },
  "八": {
    word_type: "m",
    example_sentence: "我有八本书。",
    example_pinyin: "Wǒ yǒu bā běn shū.",
    example_meaning: "Tôi có tám quyển sách.",
  },
  "爸爸": {
    word_type: "n",
    example_sentence: "爸爸在家工作。",
    example_pinyin: "Bàba zài jiā gōngzuò.",
    example_meaning: "Bố làm việc ở nhà.",
  },
  "杯子": {
    word_type: "n",
    example_sentence: "这个杯子是我的。",
    example_pinyin: "Zhège bēizi shì wǒ de.",
    example_meaning: "Cái cốc này là của tôi.",
  },
  "北京": {
    word_type: "n",
    example_sentence: "我想去北京。",
    example_pinyin: "Wǒ xiǎng qù Běijīng.",
    example_meaning: "Tôi muốn đi Bắc Kinh.",
  },
  "本": {
    word_type: "q",
    example_sentence: "我买了三本书。",
    example_pinyin: "Wǒ mǎile sān běn shū.",
    example_meaning: "Tôi mua ba quyển sách.",
  },
  "不客气": {
    word_type: "phr",
    example_sentence: "谢谢！不客气。",
    example_pinyin: "Xièxie! Bú kèqi.",
    example_meaning: "Cảm ơn! Không có gì.",
  },
  "不": {
    word_type: "d",
    example_sentence: "我不喝茶。",
    example_pinyin: "Wǒ bù hē chá.",
    example_meaning: "Tôi không uống trà.",
  },
  "菜": {
    word_type: "n",
    example_sentence: "这个菜很好吃。",
    example_pinyin: "Zhège cài hěn hǎochī.",
    example_meaning: "Món này rất ngon.",
  },
  "茶": {
    word_type: "n",
    example_sentence: "你想喝茶吗？",
    example_pinyin: "Nǐ xiǎng hē chá ma?",
    example_meaning: "Bạn muốn uống trà không?",
  },
  "吃": {
    word_type: "v",
    example_sentence: "我们去吃饭吧。",
    example_pinyin: "Wǒmen qù chīfàn ba.",
    example_meaning: "Chúng ta đi ăn cơm đi.",
  },
  "出租车": {
    word_type: "n",
    example_sentence: "我坐出租车去学校。",
    example_pinyin: "Wǒ zuò chūzūchē qù xuéxiào.",
    example_meaning: "Tôi đi taxi đến trường.",
  },
  "打电话": {
    word_type: "phr",
    example_sentence: "我给妈妈打电话。",
    example_pinyin: "Wǒ gěi māma dǎ diànhuà.",
    example_meaning: "Tôi gọi điện cho mẹ.",
  },
  "大": {
    word_type: "a",
    example_sentence: "这个房间很大。",
    example_pinyin: "Zhège fángjiān hěn dà.",
    example_meaning: "Căn phòng này rất lớn.",
  },
  "的": {
    word_type: "u",
    example_sentence: "这是我的书。",
    example_pinyin: "Zhè shì wǒ de shū.",
    example_meaning: "Đây là sách của tôi.",
  },
  "点": {
    word_type: "q",
    example_sentence: "现在几点了？",
    example_pinyin: "Xiànzài jǐ diǎn le?",
    example_meaning: "Bây giờ mấy giờ rồi?",
  },
  "电脑": {
    word_type: "n",
    example_sentence: "我用电脑工作。",
    example_pinyin: "Wǒ yòng diànnǎo gōngzuò.",
    example_meaning: "Tôi dùng máy tính để làm việc.",
  },
  "电视": {
    word_type: "n",
    example_sentence: "他在看电视。",
    example_pinyin: "Tā zài kàn diànshì.",
    example_meaning: "Anh ấy đang xem tivi.",
  },
  "电影": {
    word_type: "n",
    example_sentence: "我们去看电影吧。",
    example_pinyin: "Wǒmen qù kàn diànyǐng ba.",
    example_meaning: "Chúng ta đi xem phim đi.",
  },
  "东西": {
    word_type: "n",
    example_sentence: "你买了什么东西？",
    example_pinyin: "Nǐ mǎile shénme dōngxi?",
    example_meaning: "Bạn mua gì vậy?",
  },
  "都": {
    word_type: "d",
    example_sentence: "我们都是学生。",
    example_pinyin: "Wǒmen dōu shì xuésheng.",
    example_meaning: "Chúng tôi đều là học sinh.",
  },
  "读": {
    word_type: "v",
    example_sentence: "请读这个字。",
    example_pinyin: "Qǐng dú zhège zì.",
    example_meaning: "Xin hãy đọc chữ này.",
  },
  "对不起": {
    word_type: "phr",
    example_sentence: "对不起，我来晚了。",
    example_pinyin: "Duìbuqǐ, wǒ lái wǎn le.",
    example_meaning: "Xin lỗi, tôi đến muộn.",
  },
  "多": {
    word_type: "a",
    example_sentence: "人很多。",
    example_pinyin: "Rén hěn duō.",
    example_meaning: "Người rất đông.",
  },
  "多少": {
    word_type: "r",
    example_sentence: "这个多少钱？",
    example_pinyin: "Zhège duōshao qián?",
    example_meaning: "Cái này bao nhiêu tiền?",
  },
  "儿子": {
    word_type: "n",
    example_sentence: "他的儿子五岁了。",
    example_pinyin: "Tā de érzi wǔ suì le.",
    example_meaning: "Con trai anh ấy năm tuổi rồi.",
  },
  "二": {
    word_type: "m",
    example_sentence: "我有二个姐姐。",
    example_pinyin: "Wǒ yǒu èr gè jiějie.",
    example_meaning: "Tôi có hai chị gái.",
  },
  "饭馆": {
    word_type: "n",
    example_sentence: "那个饭馆很好。",
    example_pinyin: "Nàge fànguǎn hěn hǎo.",
    example_meaning: "Nhà hàng đó rất ngon.",
  },
  "飞机": {
    word_type: "n",
    example_sentence: "我坐飞机去北京。",
    example_pinyin: "Wǒ zuò fēijī qù Běijīng.",
    example_meaning: "Tôi đi máy bay đến Bắc Kinh.",
  },
  "分钟": {
    word_type: "n",
    example_sentence: "请等五分钟。",
    example_pinyin: "Qǐng děng wǔ fēnzhōng.",
    example_meaning: "Xin đợi năm phút.",
  },
  "高兴": {
    word_type: "a",
    example_sentence: "认识你很高兴。",
    example_pinyin: "Rènshi nǐ hěn gāoxìng.",
    example_meaning: "Rất vui được biết bạn.",
  },
  "个": {
    word_type: "q",
    example_sentence: "我有三个朋友。",
    example_pinyin: "Wǒ yǒu sān gè péngyou.",
    example_meaning: "Tôi có ba người bạn.",
  },
  "工作": {
    word_type: "v",
    example_sentence: "你在哪儿工作？",
    example_pinyin: "Nǐ zài nǎr gōngzuò?",
    example_meaning: "Bạn làm việc ở đâu?",
  },
  "狗": {
    word_type: "n",
    example_sentence: "我家有一只狗。",
    example_pinyin: "Wǒ jiā yǒu yī zhī gǒu.",
    example_meaning: "Nhà tôi có một con chó.",
  },
  "汉语": {
    word_type: "n",
    example_sentence: "我在学汉语。",
    example_pinyin: "Wǒ zài xué Hànyǔ.",
    example_meaning: "Tôi đang học tiếng Trung.",
  },
  "好": {
    word_type: "a",
    example_sentence: "今天天气很好。",
    example_pinyin: "Jīntiān tiānqì hěn hǎo.",
    example_meaning: "Hôm nay thời tiết rất đẹp.",
  },
  "喝": {
    word_type: "v",
    example_sentence: "我喜欢喝水。",
    example_pinyin: "Wǒ xǐhuan hē shuǐ.",
    example_meaning: "Tôi thích uống nước.",
  },
  "和": {
    word_type: "c",
    example_sentence: "我和你一起去。",
    example_pinyin: "Wǒ hé nǐ yīqǐ qù.",
    example_meaning: "Tôi và bạn cùng đi.",
  },
  "很": {
    word_type: "d",
    example_sentence: "她很漂亮。",
    example_pinyin: "Tā hěn piàoliang.",
    example_meaning: "Cô ấy rất đẹp.",
  },
  "后面": {
    word_type: "n",
    example_sentence: "学校在医院后面。",
    example_pinyin: "Xuéxiào zài yīyuàn hòumiàn.",
    example_meaning: "Trường học ở phía sau bệnh viện.",
  },
  "回": {
    word_type: "v",
    example_sentence: "我想回家。",
    example_pinyin: "Wǒ xiǎng huí jiā.",
    example_meaning: "Tôi muốn về nhà.",
  },
  "会": {
    word_type: "v",
    example_sentence: "你会说汉语吗？",
    example_pinyin: "Nǐ huì shuō Hànyǔ ma?",
    example_meaning: "Bạn biết nói tiếng Trung không?",
  },
  "火车站": {
    word_type: "n",
    example_sentence: "火车站在哪里？",
    example_pinyin: "Huǒchēzhàn zài nǎli?",
    example_meaning: "Ga tàu ở đâu?",
  },
  "几": {
    word_type: "r",
    example_sentence: "你家有几个人？",
    example_pinyin: "Nǐ jiā yǒu jǐ gè rén?",
    example_meaning: "Nhà bạn có mấy người?",
  },
  "家": {
    word_type: "n",
    example_sentence: "我的家在北京。",
    example_pinyin: "Wǒ de jiā zài Běijīng.",
    example_meaning: "Nhà tôi ở Bắc Kinh.",
  },
  "叫": {
    word_type: "v",
    example_sentence: "你叫什么名字？",
    example_pinyin: "Nǐ jiào shénme míngzi?",
    example_meaning: "Bạn tên gì?",
  },
  "今天": {
    word_type: "n",
    example_sentence: "今天是星期一。",
    example_pinyin: "Jīntiān shì xīngqīyī.",
    example_meaning: "Hôm nay là thứ Hai.",
  },
  "九": {
    word_type: "m",
    example_sentence: "现在九点了。",
    example_pinyin: "Xiànzài jiǔ diǎn le.",
    example_meaning: "Bây giờ chín giờ rồi.",
  },
  "开": {
    word_type: "v",
    example_sentence: "请开门。",
    example_pinyin: "Qǐng kāi mén.",
    example_meaning: "Xin mở cửa.",
  },
  "看": {
    word_type: "v",
    example_sentence: "我在看书。",
    example_pinyin: "Wǒ zài kàn shū.",
    example_meaning: "Tôi đang đọc sách.",
  },
  "看见": {
    word_type: "v",
    example_sentence: "我看见他了。",
    example_pinyin: "Wǒ kànjiàn tā le.",
    example_meaning: "Tôi nhìn thấy anh ấy rồi.",
  },
  "块": {
    word_type: "q",
    example_sentence: "这个苹果两块钱。",
    example_pinyin: "Zhège píngguǒ liǎng kuài qián.",
    example_meaning: "Quả táo này hai đồng.",
  },
  "来": {
    word_type: "v",
    example_sentence: "你来我家吧。",
    example_pinyin: "Nǐ lái wǒ jiā ba.",
    example_meaning: "Bạn đến nhà tôi đi.",
  },
  "老师": {
    word_type: "n",
    example_sentence: "老师在教室里。",
    example_pinyin: "Lǎoshī zài jiàoshì lǐ.",
    example_meaning: "Giáo viên ở trong lớp học.",
  },
  "了": {
    word_type: "u",
    example_sentence: "我吃了饭了。",
    example_pinyin: "Wǒ chīle fàn le.",
    example_meaning: "Tôi ăn cơm rồi.",
  },
  "冷": {
    word_type: "a",
    example_sentence: "今天很冷。",
    example_pinyin: "Jīntiān hěn lěng.",
    example_meaning: "Hôm nay rất lạnh.",
  },
  "里": {
    word_type: "n",
    example_sentence: "书在桌子里面。",
    example_pinyin: "Shū zài zhuōzi lǐmiàn.",
    example_meaning: "Sách ở trong bàn.",
  },
  "零": {
    word_type: "m",
    example_sentence: "今天零度。",
    example_pinyin: "Jīntiān líng dù.",
    example_meaning: "Hôm nay không độ.",
  },
  "六": {
    word_type: "m",
    example_sentence: "我六点起床。",
    example_pinyin: "Wǒ liù diǎn qǐchuáng.",
    example_meaning: "Tôi dậy lúc sáu giờ.",
  },
  "妈妈": {
    word_type: "n",
    example_sentence: "妈妈做了很多菜。",
    example_pinyin: "Māma zuòle hěn duō cài.",
    example_meaning: "Mẹ nấu rất nhiều món.",
  },
  "吗": {
    word_type: "u",
    example_sentence: "你是学生吗？",
    example_pinyin: "Nǐ shì xuésheng ma?",
    example_meaning: "Bạn là học sinh phải không?",
  },
  "买": {
    word_type: "v",
    example_sentence: "我想买水果。",
    example_pinyin: "Wǒ xiǎng mǎi shuǐguǒ.",
    example_meaning: "Tôi muốn mua trái cây.",
  },
  "猫": {
    word_type: "n",
    example_sentence: "那只猫很可爱。",
    example_pinyin: "Nà zhī māo hěn kě'ài.",
    example_meaning: "Con mèo đó rất đáng yêu.",
  },
  "没": {
    word_type: "d",
    example_sentence: "我没去过中国。",
    example_pinyin: "Wǒ méi qùguò Zhōngguó.",
    example_meaning: "Tôi chưa đi Trung Quốc.",
  },
  "没关系": {
    word_type: "phr",
    example_sentence: "没关系，没问题。",
    example_pinyin: "Méi guānxi, méi wèntí.",
    example_meaning: "Không sao, không vấn đề gì.",
  },
  "米饭": {
    word_type: "n",
    example_sentence: "我每天吃米饭。",
    example_pinyin: "Wǒ měitiān chī mǐfàn.",
    example_meaning: "Tôi ăn cơm mỗi ngày.",
  },
  "明天": {
    word_type: "n",
    example_sentence: "明天你有空吗？",
    example_pinyin: "Míngtiān nǐ yǒu kòng ma?",
    example_meaning: "Ngày mai bạn rảnh không?",
  },
  "名字": {
    word_type: "n",
    example_sentence: "你的名字真好听。",
    example_pinyin: "Nǐ de míngzi zhēn hǎotīng.",
    example_meaning: "Tên bạn thật hay.",
  },
  "哪": {
    word_type: "r",
    example_sentence: "你是哪国人？",
    example_pinyin: "Nǐ shì nǎ guó rén?",
    example_meaning: "Bạn là người nước nào?",
  },
  "那": {
    word_type: "r",
    example_sentence: "那是我的老师。",
    example_pinyin: "Nà shì wǒ de lǎoshī.",
    example_meaning: "Đó là giáo viên của tôi.",
  },
  "呢": {
    word_type: "u",
    example_sentence: "你呢？你去吗？",
    example_pinyin: "Nǐ ne? Nǐ qù ma?",
    example_meaning: "Còn bạn? Bạn đi không?",
  },
  "能": {
    word_type: "v",
    example_sentence: "你能帮我吗？",
    example_pinyin: "Nǐ néng bāng wǒ ma?",
    example_meaning: "Bạn có thể giúp tôi không?",
  },
  "你": {
    word_type: "r",
    example_sentence: "你好！你是老师吗？",
    example_pinyin: "Nǐ hǎo! Nǐ shì lǎoshī ma?",
    example_meaning: "Xin chào! Bạn là giáo viên phải không?",
  },
  "年": {
    word_type: "n",
    example_sentence: "今年是二零二五年。",
    example_pinyin: "Jīnnián shì èr líng èr wǔ nián.",
    example_meaning: "Năm nay là năm 2025.",
  },
  "女儿": {
    word_type: "n",
    example_sentence: "她的女儿很漂亮。",
    example_pinyin: "Tā de nǚ'ér hěn piàoliang.",
    example_meaning: "Con gái cô ấy rất xinh.",
  },
  "朋友": {
    word_type: "n",
    example_sentence: "他是我最好的朋友。",
    example_pinyin: "Tā shì wǒ zuì hǎo de péngyou.",
    example_meaning: "Anh ấy là bạn tốt nhất của tôi.",
  },
  "漂亮": {
    word_type: "a",
    example_sentence: "这件衣服很漂亮。",
    example_pinyin: "Zhè jiàn yīfu hěn piàoliang.",
    example_meaning: "Bộ quần áo này rất đẹp.",
  },
  "苹果": {
    word_type: "n",
    example_sentence: "我想吃苹果。",
    example_pinyin: "Wǒ xiǎng chī píngguǒ.",
    example_meaning: "Tôi muốn ăn táo.",
  },
  "七": {
    word_type: "m",
    example_sentence: "一个星期有七天。",
    example_pinyin: "Yī gè xīngqī yǒu qī tiān.",
    example_meaning: "Một tuần có bảy ngày.",
  },
  "钱": {
    word_type: "n",
    example_sentence: "你有多少钱？",
    example_pinyin: "Nǐ yǒu duōshao qián?",
    example_meaning: "Bạn có bao nhiêu tiền?",
  },
  "前面": {
    word_type: "n",
    example_sentence: "商店在前面。",
    example_pinyin: "Shāngdiàn zài qiánmiàn.",
    example_meaning: "Cửa hàng ở phía trước.",
  },
  "请": {
    word_type: "v",
    example_sentence: "请坐。",
    example_pinyin: "Qǐng zuò.",
    example_meaning: "Xin mời ngồi.",
  },
  "去": {
    word_type: "v",
    example_sentence: "你去哪里？",
    example_pinyin: "Nǐ qù nǎli?",
    example_meaning: "Bạn đi đâu?",
  },
  "热": {
    word_type: "a",
    example_sentence: "夏天很热。",
    example_pinyin: "Xiàtiān hěn rè.",
    example_meaning: "Mùa hè rất nóng.",
  },
  "人": {
    word_type: "n",
    example_sentence: "那个人是谁？",
    example_pinyin: "Nàge rén shì shéi?",
    example_meaning: "Người đó là ai?",
  },
  "认识": {
    word_type: "v",
    example_sentence: "认识你很高兴。",
    example_pinyin: "Rènshi nǐ hěn gāoxìng.",
    example_meaning: "Rất vui được biết bạn.",
  },
  "日": {
    word_type: "n",
    example_sentence: "今天几月几日？",
    example_pinyin: "Jīntiān jǐ yuè jǐ rì?",
    example_meaning: "Hôm nay ngày mấy tháng mấy?",
  },
  "三": {
    word_type: "m",
    example_sentence: "我有三个孩子。",
    example_pinyin: "Wǒ yǒu sān gè háizi.",
    example_meaning: "Tôi có ba đứa con.",
  },
  "商店": {
    word_type: "n",
    example_sentence: "我去商店买东西。",
    example_pinyin: "Wǒ qù shāngdiàn mǎi dōngxi.",
    example_meaning: "Tôi đi cửa hàng mua đồ.",
  },
  "上": {
    word_type: "n",
    example_sentence: "书在桌子上。",
    example_pinyin: "Shū zài zhuōzi shàng.",
    example_meaning: "Sách ở trên bàn.",
  },
  "上午": {
    word_type: "n",
    example_sentence: "上午我在学校。",
    example_pinyin: "Shàngwǔ wǒ zài xuéxiào.",
    example_meaning: "Buổi sáng tôi ở trường.",
  },
  "少": {
    word_type: "a",
    example_sentence: "今天人很少。",
    example_pinyin: "Jīntiān rén hěn shǎo.",
    example_meaning: "Hôm nay ít người.",
  },
  "谁": {
    word_type: "r",
    example_sentence: "他是谁？",
    example_pinyin: "Tā shì shéi?",
    example_meaning: "Anh ấy là ai?",
  },
  "什么": {
    word_type: "r",
    example_sentence: "你在做什么？",
    example_pinyin: "Nǐ zài zuò shénme?",
    example_meaning: "Bạn đang làm gì?",
  },
  "十": {
    word_type: "m",
    example_sentence: "我们班有十个人。",
    example_pinyin: "Wǒmen bān yǒu shí gè rén.",
    example_meaning: "Lớp chúng tôi có mười người.",
  },
  "时候": {
    word_type: "n",
    example_sentence: "你什么时候来？",
    example_pinyin: "Nǐ shénme shíhou lái?",
    example_meaning: "Bạn khi nào đến?",
  },
  "是": {
    word_type: "v",
    example_sentence: "我是中国人。",
    example_pinyin: "Wǒ shì Zhōngguó rén.",
    example_meaning: "Tôi là người Trung Quốc.",
  },
  "书": {
    word_type: "n",
    example_sentence: "这本书很有意思。",
    example_pinyin: "Zhè běn shū hěn yǒu yìsi.",
    example_meaning: "Quyển sách này rất thú vị.",
  },
  "水": {
    word_type: "n",
    example_sentence: "请给我一杯水。",
    example_pinyin: "Qǐng gěi wǒ yī bēi shuǐ.",
    example_meaning: "Xin cho tôi một cốc nước.",
  },
  "水果": {
    word_type: "n",
    example_sentence: "我喜欢吃水果。",
    example_pinyin: "Wǒ xǐhuan chī shuǐguǒ.",
    example_meaning: "Tôi thích ăn trái cây.",
  },
  "睡觉": {
    word_type: "v",
    example_sentence: "我十点睡觉。",
    example_pinyin: "Wǒ shí diǎn shuìjiào.",
    example_meaning: "Tôi ngủ lúc mười giờ.",
  },
  "说话": {
    word_type: "v",
    example_sentence: "请不要说话。",
    example_pinyin: "Qǐng búyào shuōhuà.",
    example_meaning: "Xin đừng nói chuyện.",
  },
  "四": {
    word_type: "m",
    example_sentence: "一年有四个季节。",
    example_pinyin: "Yī nián yǒu sì gè jìjié.",
    example_meaning: "Một năm có bốn mùa.",
  },
  "岁": {
    word_type: "q",
    example_sentence: "你今年几岁？",
    example_pinyin: "Nǐ jīnnián jǐ suì?",
    example_meaning: "Năm nay bạn bao nhiêu tuổi?",
  },
  "他": {
    word_type: "r",
    example_sentence: "他是我的朋友。",
    example_pinyin: "Tā shì wǒ de péngyou.",
    example_meaning: "Anh ấy là bạn tôi.",
  },
  "她": {
    word_type: "r",
    example_sentence: "她在学校工作。",
    example_pinyin: "Tā zài xuéxiào gōngzuò.",
    example_meaning: "Cô ấy làm việc ở trường.",
  },
  "太": {
    word_type: "d",
    example_sentence: "这个太贵了。",
    example_pinyin: "Zhège tài guì le.",
    example_meaning: "Cái này đắt quá.",
  },
  "天气": {
    word_type: "n",
    example_sentence: "今天天气怎么样？",
    example_pinyin: "Jīntiān tiānqì zěnmeyàng?",
    example_meaning: "Hôm nay thời tiết thế nào?",
  },
  "听": {
    word_type: "v",
    example_sentence: "我在听音乐。",
    example_pinyin: "Wǒ zài tīng yīnyuè.",
    example_meaning: "Tôi đang nghe nhạc.",
  },
  "同学": {
    word_type: "n",
    example_sentence: "他是我的同学。",
    example_pinyin: "Tā shì wǒ de tóngxué.",
    example_meaning: "Anh ấy là bạn học của tôi.",
  },
  "喂": {
    word_type: "i",
    example_sentence: "喂，你好！",
    example_pinyin: "Wèi, nǐ hǎo!",
    example_meaning: "A lô, xin chào!",
  },
  "我": {
    word_type: "r",
    example_sentence: "我叫小明。",
    example_pinyin: "Wǒ jiào Xiǎo Míng.",
    example_meaning: "Tôi tên là Tiểu Minh.",
  },
  "我们": {
    word_type: "r",
    example_sentence: "我们是好朋友。",
    example_pinyin: "Wǒmen shì hǎo péngyou.",
    example_meaning: "Chúng tôi là bạn tốt.",
  },
  "五": {
    word_type: "m",
    example_sentence: "我有五本书。",
    example_pinyin: "Wǒ yǒu wǔ běn shū.",
    example_meaning: "Tôi có năm quyển sách.",
  },
  "喜欢": {
    word_type: "v",
    example_sentence: "我喜欢学汉语。",
    example_pinyin: "Wǒ xǐhuan xué Hànyǔ.",
    example_meaning: "Tôi thích học tiếng Trung.",
  },
  "下": {
    word_type: "n",
    example_sentence: "猫在桌子下面。",
    example_pinyin: "Māo zài zhuōzi xiàmiàn.",
    example_meaning: "Con mèo ở dưới bàn.",
  },
  "下午": {
    word_type: "n",
    example_sentence: "下午你做什么？",
    example_pinyin: "Xiàwǔ nǐ zuò shénme?",
    example_meaning: "Buổi chiều bạn làm gì?",
  },
  "下雨": {
    word_type: "v",
    example_sentence: "今天下雨了。",
    example_pinyin: "Jīntiān xià yǔ le.",
    example_meaning: "Hôm nay trời mưa rồi.",
  },
  "先生": {
    word_type: "n",
    example_sentence: "王先生，你好！",
    example_pinyin: "Wáng xiānsheng, nǐ hǎo!",
    example_meaning: "Ông Vương, xin chào!",
  },
  "现在": {
    word_type: "n",
    example_sentence: "现在几点了？",
    example_pinyin: "Xiànzài jǐ diǎn le?",
    example_meaning: "Bây giờ mấy giờ rồi?",
  },
  "想": {
    word_type: "v",
    example_sentence: "我想去中国。",
    example_pinyin: "Wǒ xiǎng qù Zhōngguó.",
    example_meaning: "Tôi muốn đi Trung Quốc.",
  },
  "小": {
    word_type: "a",
    example_sentence: "我的房间很小。",
    example_pinyin: "Wǒ de fángjiān hěn xiǎo.",
    example_meaning: "Phòng tôi rất nhỏ.",
  },
  "小姐": {
    word_type: "n",
    example_sentence: "李小姐，请坐。",
    example_pinyin: "Lǐ xiǎojiě, qǐng zuò.",
    example_meaning: "Cô Lý, xin mời ngồi.",
  },
  "些": {
    word_type: "q",
    example_sentence: "给我一些水。",
    example_pinyin: "Gěi wǒ yīxiē shuǐ.",
    example_meaning: "Cho tôi một ít nước.",
  },
  "写": {
    word_type: "v",
    example_sentence: "请写你的名字。",
    example_pinyin: "Qǐng xiě nǐ de míngzi.",
    example_meaning: "Xin viết tên bạn.",
  },
  "谢谢": {
    word_type: "v",
    example_sentence: "谢谢你的帮助。",
    example_pinyin: "Xièxie nǐ de bāngzhù.",
    example_meaning: "Cảm ơn sự giúp đỡ của bạn.",
  },
  "星期": {
    word_type: "n",
    example_sentence: "今天星期几？",
    example_pinyin: "Jīntiān xīngqī jǐ?",
    example_meaning: "Hôm nay thứ mấy?",
  },
  "学生": {
    word_type: "n",
    example_sentence: "我是一个学生。",
    example_pinyin: "Wǒ shì yī gè xuésheng.",
    example_meaning: "Tôi là một học sinh.",
  },
  "学习": {
    word_type: "v",
    example_sentence: "我每天学习汉语。",
    example_pinyin: "Wǒ měitiān xuéxí Hànyǔ.",
    example_meaning: "Tôi học tiếng Trung mỗi ngày.",
  },
  "学校": {
    word_type: "n",
    example_sentence: "我们的学校很大。",
    example_pinyin: "Wǒmen de xuéxiào hěn dà.",
    example_meaning: "Trường chúng tôi rất lớn.",
  },
  "一": {
    word_type: "m",
    example_sentence: "我有一个哥哥。",
    example_pinyin: "Wǒ yǒu yī gè gēge.",
    example_meaning: "Tôi có một anh trai.",
  },
  "衣服": {
    word_type: "n",
    example_sentence: "这件衣服多少钱？",
    example_pinyin: "Zhè jiàn yīfu duōshao qián?",
    example_meaning: "Bộ quần áo này bao nhiêu tiền?",
  },
  "医生": {
    word_type: "n",
    example_sentence: "他是一个医生。",
    example_pinyin: "Tā shì yī gè yīshēng.",
    example_meaning: "Anh ấy là bác sĩ.",
  },
  "医院": {
    word_type: "n",
    example_sentence: "医院在学校旁边。",
    example_pinyin: "Yīyuàn zài xuéxiào pángbiān.",
    example_meaning: "Bệnh viện ở bên cạnh trường.",
  },
  "椅子": {
    word_type: "n",
    example_sentence: "请坐这把椅子。",
    example_pinyin: "Qǐng zuò zhè bǎ yǐzi.",
    example_meaning: "Xin ngồi chiếc ghế này.",
  },
  "有": {
    word_type: "v",
    example_sentence: "我有一只猫。",
    example_pinyin: "Wǒ yǒu yī zhī māo.",
    example_meaning: "Tôi có một con mèo.",
  },
  "月": {
    word_type: "n",
    example_sentence: "一月很冷。",
    example_pinyin: "Yī yuè hěn lěng.",
    example_meaning: "Tháng Giêng rất lạnh.",
  },
  "在": {
    word_type: "p",
    example_sentence: "他在家里。",
    example_pinyin: "Tā zài jiā lǐ.",
    example_meaning: "Anh ấy ở nhà.",
  },
  "再见": {
    word_type: "phr",
    example_sentence: "老师再见！",
    example_pinyin: "Lǎoshī zàijiàn!",
    example_meaning: "Giáo viên tạm biệt!",
  },
  "怎么": {
    word_type: "r",
    example_sentence: "这个字怎么读？",
    example_pinyin: "Zhège zì zěnme dú?",
    example_meaning: "Chữ này đọc thế nào?",
  },
  "怎么样": {
    word_type: "r",
    example_sentence: "你觉得怎么样？",
    example_pinyin: "Nǐ juéde zěnmeyàng?",
    example_meaning: "Bạn thấy thế nào?",
  },
  "这": {
    word_type: "r",
    example_sentence: "这是我的书。",
    example_pinyin: "Zhè shì wǒ de shū.",
    example_meaning: "Đây là sách của tôi.",
  },
  "中国": {
    word_type: "n",
    example_sentence: "中国很大。",
    example_pinyin: "Zhōngguó hěn dà.",
    example_meaning: "Trung Quốc rất lớn.",
  },
  "中午": {
    word_type: "n",
    example_sentence: "中午我们吃饭。",
    example_pinyin: "Zhōngwǔ wǒmen chīfàn.",
    example_meaning: "Buổi trưa chúng tôi ăn cơm.",
  },
  "住": {
    word_type: "v",
    example_sentence: "你住在哪里？",
    example_pinyin: "Nǐ zhù zài nǎli?",
    example_meaning: "Bạn sống ở đâu?",
  },
  "桌子": {
    word_type: "n",
    example_sentence: "桌子上有一本书。",
    example_pinyin: "Zhuōzi shàng yǒu yī běn shū.",
    example_meaning: "Trên bàn có một quyển sách.",
  },
  "字": {
    word_type: "n",
    example_sentence: "这个字很难写。",
    example_pinyin: "Zhège zì hěn nán xiě.",
    example_meaning: "Chữ này rất khó viết.",
  },
  "昨天": {
    word_type: "n",
    example_sentence: "昨天我去了商店。",
    example_pinyin: "Zuótiān wǒ qùle shāngdiàn.",
    example_meaning: "Hôm qua tôi đi cửa hàng.",
  },
  "坐": {
    word_type: "v",
    example_sentence: "请坐。",
    example_pinyin: "Qǐng zuò.",
    example_meaning: "Xin mời ngồi.",
  },
  "做": {
    word_type: "v",
    example_sentence: "你在做什么？",
    example_pinyin: "Nǐ zài zuò shénme?",
    example_meaning: "Bạn đang làm gì?",
  },
}

// ─── Main ───
const filePath = path.join(__dirname, "../prisma/hsk_vocab_exports/vocabulary_hsk1.json")
const data: VocabEntry[] = JSON.parse(fs.readFileSync(filePath, "utf-8"))

let updated = 0
let missing = 0

for (const entry of data) {
  const info = HSK1_DATA[entry.chinese_word]
  if (info) {
    entry.word_type = info.word_type
    entry.example_sentence = info.example_sentence
    entry.example_pinyin = info.example_pinyin
    entry.example_meaning = info.example_meaning
    updated++
  } else {
    console.warn(`⚠️  No data for: ${entry.chinese_word}`)
    missing++
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8")
console.log(`\n✅ Updated ${updated} entries, ${missing} missing`)
console.log(`📄 Written to ${filePath}`)
