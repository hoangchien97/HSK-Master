/**
 * Enrich HSK vocabulary JSON files:
 *  1. Classify word_type (null → proper POS code)
 *  2. Replace placeholder example sentences with diverse, contextual ones
 *  3. Fill missing meaning_vi
 *
 * Run: node scripts/enrich-vocab.js
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'prisma', 'hsk_vocab_exports');

// ════════════════════════════════════════════════════════════════════
// 1. WORD-TYPE CLASSIFICATION
// ════════════════════════════════════════════════════════════════════

/** Layer 1 — direct Chinese word → POS lookup (ambiguous / high-frequency) */
const WT_LOOKUP = {
  // ── Pronouns (r) ──
  '我':'r','你':'r','您':'r','他':'r','她':'r','它':'r',
  '我们':'r','你们':'r','他们':'r','她们':'r','咱们':'r',
  '这':'r','那':'r','这里':'r','那里':'r','这儿':'r','那儿':'r',
  '哪':'r','哪儿':'r','哪里':'r','谁':'r','什么':'r','怎么':'r',
  '怎么样':'r','多少':'r','几':'r','自己':'r','大家':'r',
  '别人':'r','每':'r','某':'r','各':'r','另':'r',
  '其他':'r','任何':'r','一切':'r','本身':'r',
  // ── Measure words (q) ──
  '个':'q','只':'q','件':'q','本':'q','张':'q','条':'q','块':'q',
  '杯':'q','瓶':'q','双':'q','次':'q','些':'q','种':'q','位':'q',
  '篇':'q','段':'q','层':'q','遍':'q','场':'q','辆':'q','句':'q',
  '支':'q','首':'q','份':'q','台':'q','棵':'q','颗':'q','片':'q',
  '座':'q','副':'q','栋':'q','幅':'q','架':'q','套':'q','批':'q',
  '群':'q','堆':'q','趟':'q','阵':'q','轮':'q','册':'q','项':'q',
  '顿':'q','道':'q','笔':'q','门':'q','排':'q','步':'q','代':'q',
  // ── Particles (u) ──
  '吗':'u','呢':'u','吧':'u','了':'u','的':'u','地':'u','得':'u',
  '着':'u','过':'u','啊':'u','啦':'u','嘛':'u','呀':'u','罢了':'u',
  '而已':'u','似的':'u',
  // ── Numerals (m) ──
  '一':'m','二':'m','三':'m','四':'m','五':'m','六':'m','七':'m',
  '八':'m','九':'m','十':'m','百':'m','千':'m','万':'m','亿':'m',
  '两':'m','半':'m','零':'m','几十':'m','数百':'m',
  // ── Conjunctions (c) ──
  '和':'c','但是':'c','可是':'c','或者':'c','因为':'c','所以':'c',
  '如果':'c','虽然':'c','而且':'c','不但':'c','不过':'c','还是':'c',
  '要是':'c','而':'c','并且':'c','即使':'c','既然':'c','那么':'c',
  '否则':'c','然而':'c','于是':'c','不仅':'c','另外':'c','无论':'c',
  '尽管':'c','况且':'c','何况':'c','从而':'c','以至':'c','以便':'c',
  '以免':'c','不管':'c','只要':'c','除非':'c','既':'c','与其':'c',
  '宁可':'c','哪怕':'c','就是':'c','反而':'c','总之':'c',
  '由于':'c','以及':'c','万一':'c','要不然':'c','可见':'c',
  // ── Prepositions (p) ──
  '在':'p','从':'p','向':'p','往':'p','对':'p','给':'p','用':'p',
  '把':'p','被':'p','比':'p','跟':'p','为':'p','为了':'p',
  '关于':'p','按照':'p','根据':'p','通过':'p','除了':'p','按':'p',
  '据':'p','离':'p','替':'p','由':'p','以':'p','自':'p','至':'p',
  '朝':'p','随着':'p','沿':'p','凭':'p','趁':'p','经过':'p',
  '针对':'p','鉴于':'p','至于':'p','对于':'p',
  // ── Interjections (i) ──
  '喂':'i','嗯':'i','哦':'i','唉':'i','哎':'i','嘿':'i','啊':'i',
  '哈':'i','哇':'i','嗨':'i','呵':'i','哼':'i','哎呀':'i','天哪':'i',
  // ── Common adverbs (d) ──
  '也':'d','都':'d','很':'d','太':'d','非常':'d','真':'d','最':'d',
  '更':'d','还':'d','再':'d','又':'d','就':'d','才':'d','已经':'d',
  '正在':'d','刚':'d','刚才':'d','马上':'d','立刻':'d','永远':'d',
  '常常':'d','经常':'d','总是':'d','往往':'d','一直':'d','从来':'d',
  '偶尔':'d','一定':'d','必须':'d','大概':'d','也许':'d','可能':'d',
  '恐怕':'d','居然':'d','竟然':'d','果然':'d','忽然':'d','突然':'d',
  '渐渐':'d','终于':'d','到底':'d','究竟':'d','简直':'d','几乎':'d',
  '确实':'d','的确':'d','实在':'d','其实':'d','反正':'d','本来':'d',
  '原来':'d','只':'d','仅仅':'d','只好':'d','不得不':'d','千万':'d',
  '尤其':'d','特别':'d','尽量':'d','难道':'d','何必':'d','并':'d',
  '互相':'d','逐渐':'d','不断':'d','陆续':'d','分别':'d','暂时':'d',
  '始终':'d','毕竟':'d','索性':'d','未必':'d','不免':'d','难免':'d',
  '相当':'d','稍微':'d','略':'d','极':'d','颇':'d','甚至':'d',
  '越来越':'d','越…越…':'d','一再':'d','再三':'d','幸亏':'d',
  '偏偏':'d','恰好':'d','明明':'d','分明':'d','纷纷':'d','连忙':'d',
  '赶紧':'d','赶快':'d','及时':'d','按时':'d','依然':'d','仍然':'d',
  '照样':'d','何尝':'d','未免':'d','何等':'d','多么':'d','好不容易':'d',
  // ── Verbs that look like other POS ──
  '是':'v','有':'v','没有':'v','会':'v','能':'v','可以':'v',
  '应该':'v','要':'v','想':'v','愿意':'v','得':'v','让':'v',
  '请':'v','叫':'v','使':'v','令':'v',
  // ── Common verbs whose meaning doesn't start with "to" ──
  '帮助':'v','喜欢':'v','觉得':'v','知道':'v','认为':'v','希望':'v',
  '同意':'v','决定':'v','准备':'v','发现':'v','了解':'v','认识':'v',
  '感觉':'v','相信':'v','担心':'v','考虑':'v','注意':'v','影响':'v',
  '解决':'v','发展':'v','表示':'v','提高':'v','存在':'v','属于':'v',
  '包括':'v','需要':'v','研究':'v','参加':'v','进行':'v','提供':'v',
  '出现':'v','利用':'v','坚持':'v','表现':'v','反映':'v','适合':'v',
  '恢复':'v','保护':'v','实现':'v','丰富':'v','满足':'v','值得':'v',
  '保持':'v','获得':'v','产生':'v','引起':'v','促进':'v','推动':'v',
  '形成':'v','取得':'v','具有':'v','涉及':'v','面临':'v','缺乏':'v',
  '承担':'v','克服':'v','遵守':'v','违反':'v','构成':'v','占':'v',
  // ── Color adjectives ──
  '白':'a','黑':'a','红':'a','蓝':'a','绿':'a','黄':'a','灰':'a',
  '紫':'a','粉':'a','棕':'a','橙':'a',
  // ── Common adjectives whose meaning is ambiguous ──
  '高兴':'a','漂亮':'a','聪明':'a','干净':'a','健康':'a','安静':'a',
  '热情':'a','积极':'a','严格':'a','丰富':'a','复杂':'a','简单':'a',
  '普通':'a','正常':'a','明显':'a','合适':'a','具体':'a','实际':'a',
  '正式':'a','详细':'a','充分':'a','完整':'a','彻底':'a','固定':'a',
  '良好':'a','优秀':'a','伟大':'a','深刻':'a','广泛':'a','频繁':'a',
  // ── Adjectives that have misleading meanings ──
  '暗':'a','长':'a','短':'a','快':'a','慢':'a','远':'a','近':'a',
  '难':'a','容易':'a','便宜':'a','贵':'a','对':'a','错':'a',
  '多':'a','少':'a','早':'a','晚':'a','胖':'a','瘦':'a',
  '轻':'a','重':'a','甜':'a','苦':'a','辣':'a','咸':'a',
  '香':'a','臭':'a','懒':'a','勤':'a','乖':'a','坏':'a',
  // ── Adverbs that may be misclassified ──
  '别':'d','不':'d','没':'d','别的':'r','挺':'d','怪':'d',
};

/** Layer 2 — classify by English meaning patterns */
function classifyByMeaning(m) {
  const lo = m.toLowerCase().trim();
  const first = lo.split(/[;,]/)[0].trim();

  // Particles
  if (/particle|suffix (?:indicating|expressing|for)/.test(lo)) return 'u';
  // Measure words
  if (/measure word|classifier for|\(mw\)|\(cl\.\)/.test(lo)) return 'q';
  // Interjection
  if (/interjection|exclamation/.test(lo) || /^(hey|oh|wow|ah|ouch|huh|hmm)\b/.test(first)) return 'i';
  // Conjunction
  if (/^(but|and|or|if|because|although|therefore|however|moreover|otherwise|unless|whether|even if|not only|so that|as long as|regardless|provided that|in case|on condition|in order|neither|nor|both\.\.\.and|either\.\.\.or)\b/.test(first)) return 'c';
  // Numeral
  if (/^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|hundred|thousand|million|billion|zero|first|second|third|half|dozen|both|several|few)\b/.test(first)) return 'm';
  if (/^\d+/.test(first)) return 'm';
  // Pronoun
  if (/^(I|me|my|you|your|he|him|his|she|her|it|its|we|us|our|they|them|their|this|that|these|those|who|whom|what|which|where|when|how|self|oneself|everyone|everybody|someone|somebody|anyone|anybody|nobody|something|anything|nothing|each other|one another)\b/i.test(first)) return 'r';

  // Verb — starts with "to " (very reliable)
  if (/^to\s/.test(first)) return 'v';

  // Preposition
  if (/^(from|toward|towards|according to|regarding|concerning|based on|apart from|except|besides|in front of|behind|under|above|below|between|among|during|against|through)\b/.test(first)) return 'p';

  // Adjective list (common single-word adjectives)
  const ADJ = new Set([
    'big','small','tall','short','long','old','new','young','good','bad',
    'beautiful','ugly','hot','cold','warm','cool','fast','slow','easy',
    'hard','difficult','simple','complex','happy','sad','angry','tired',
    'busy','free','full','empty','rich','poor','strong','weak','clean',
    'dirty','heavy','light','deep','shallow','wide','narrow','thick',
    'thin','bright','dark','loud','quiet','soft','wet','dry','fresh',
    'sweet','sour','bitter','spicy','salty','delicious','tasty','important',
    'necessary','special','ordinary','normal','strange','correct','wrong',
    'true','false','real','fake','safe','dangerous','comfortable',
    'convenient','suitable','appropriate','lucky','unfortunate','smart',
    'stupid','clever','wise','brave','careful','careless','polite','rude',
    'honest','kind','gentle','serious','strict','active','passive',
    'positive','negative','popular','famous','ancient','modern','traditional',
    'complete','entire','whole','similar','different','same','various',
    'obvious','clear','expensive','cheap','valuable','precious','anxious',
    'nervous','calm','peaceful','lonely','bored','proud','humble','generous',
    'selfish','patient','impatient','confident','shy','modest','mature',
    'professional','efficient','lazy','diligent','hardworking','sufficient',
    'abundant','scarce','rare','common','frequent','certain','uncertain',
    'definite','vague','precise','accurate','main','basic','fundamental',
    'essential','crucial','vital','lively','boring','interesting','exciting',
    'amazing','wonderful','terrible','awful','horrible','excellent',
    'outstanding','perfect','reasonable','fair','equal','mutual','related',
    'relevant','specific','general','particular','typical','unique',
    'permanent','temporary','stable','steady','flexible','rigid',
    'innocent','guilty','fierce','mild','sharp','blunt','loose','tight',
    'smooth','rough','flat','steep','straight','crooked','round','square',
    'tiny','huge','massive','enormous','slight','severe','brief','lengthy',
    'recent','former','current','latest','previous','next','final','initial',
    'separate','joint','independent','dependent','natural','artificial',
    'romantic','tragic','handsome','pretty','lovely','cute','elegant',
    'plain','fancy','pure','raw','ripe','rotten','bare','naked','blind',
    'deaf','dumb','mute','pregnant','hungry','thirsty','sleepy','awake',
    'alive','dead','sick','healthy','wealthy','prosperous','poor',
    'superior','inferior','senior','junior','extreme','moderate','absolute',
    'relative','objective','subjective','concrete','abstract','complex',
    'simple','explicit','implicit','formal','informal','legal','illegal',
    'moral','immoral','logical','rational','emotional','mental','physical',
    'spiritual','intellectual','academic','scientific','literary','artistic',
    'musical','political','economic','social','cultural','religious',
    'military','domestic','foreign','international','local','regional',
    'national','global','urban','rural','public','private','commercial',
    'industrial','agricultural','residential','democratic','conservative',
    'liberal','radical','progressive','primitive','advanced','sophisticated',
    'narrow-minded','open-minded','optimistic','pessimistic',
    'enthusiastic','indifferent','grateful','bitter',
    'fierce','gentle','stubborn','submissive',
    'greedy','content','magnificent','miserable',
    'sincere','hesitant','reluctant','eager','dense','sparse',
    'transparent','opaque','fragile','durable','portable','compatible',
    // Colors
    'white','black','red','blue','green','yellow','pink','purple','brown',
    'grey','gray','orange','golden','silver','dark','bright','pale','colorful',
  ]);
  if (ADJ.has(first)) return 'a';

  // Adverb list
  const ADV = new Set([
    'also','too','very','really','quite','rather','fairly','often','always',
    'never','sometimes','usually','generally','already','still','again',
    'just','only','even','almost','maybe','perhaps','probably','certainly',
    'definitely','surely','suddenly','gradually','immediately','finally',
    'eventually','especially','particularly','mainly','mostly','nearly',
    'hardly','exactly','not','all','together','separately','continuously',
    'repeatedly','merely','constantly','forever','originally',
    'anyway','afterwards','moreover','furthermore','nevertheless',
    'regardless','actually','indeed','apparently','obviously','clearly',
    'simply','merely','roughly','approximately','precisely','properly',
    'naturally','absolutely','completely','entirely','totally','partly',
    'slightly','relatively','increasingly','extremely','highly',
    'fortunately','unfortunately','frankly','honestly','seriously',
    'literally','basically','essentially','typically','normally',
  ]);
  if (ADV.has(first) || /ly$/.test(first)) return 'd';

  // More verb detection
  const VERB_STARTS = new Set([
    'give','take','make','do','go','come','see','look','watch','hear',
    'listen','read','write','speak','say','tell','ask','answer','think',
    'know','understand','believe','feel','want','need','like','love',
    'hate','hope','wish','try','use','put','get','let','help','show',
    'find','lose','keep','leave','stay','move','turn','open','close',
    'start','stop','begin','end','finish','continue','change','grow',
    'develop','build','create','produce','prepare','choose','decide',
    'accept','refuse','agree','disagree','allow','prevent','happen',
    'become','seem','appear','exist','belong','receive','send','bring',
    'carry','hold','drop','pick','push','pull','throw','catch','cut',
    'break','fix','repair','join','connect','separate','divide','combine',
    'add','reduce','increase','decrease','raise','lower','win','play',
    'practice','train','teach','learn','study','research','discover',
    'invent','design','plan','manage','control','lead','follow','support',
    'oppose','protect','attack','defend','save','spend','waste','borrow',
    'lend','pay','earn','cost','sell','buy','share','exchange','replace',
    'compare','compete','cooperate','celebrate','congratulate','apologize',
    'forgive','blame','praise','criticize','encourage','inspire','motivate',
    'express','explain','describe','introduce','recommend','suggest',
    'advise','warn','remind','promise','guarantee','realize','notice',
    'recognize','remember','forget','imagine','consider','doubt','guess',
    'predict','expect','surprise','satisfy','disappoint','worry','relax',
    'enjoy','suffer','experience','face','solve','handle','deal','treat',
    'influence','affect','cause','succeed','fail','improve','achieve',
    'accomplish','perform','represent','reflect','indicate','prove',
    'demonstrate','maintain','preserve','restore','recover','survive',
    'arrange','organize','sort','classify','collect','gather','apply',
    'register','sign','confirm','cancel','postpone','delay','hurry',
    'rush','speed','depend','involve','include','exclude','contain',
    'consist','refer','relate','mention','discuss','argue','debate',
    'negotiate','communicate','translate','interpret','publish','edit',
    'print','copy','paste','delete','download','upload','install',
    'update','operate','process','analyze','evaluate','assess','measure',
    'calculate','estimate','invest','fund','sponsor','donate','contribute',
    'volunteer','participate','compete','qualify','eliminate','select',
    'appoint','promote','dismiss','resign','retire','employ','hire',
    'fire','assign','allocate','distribute','deliver','transport','ship',
    'export','import','manufacture','assemble','construct','demolish',
    'renovate','decorate','clean','wash','cook','bake','fry','boil',
    'stir','mix','pour','fill','drain','empty','wrap','pack','unpack',
    'load','unload','weigh','count','check','inspect','examine','test',
    'diagnose','prescribe','cure','heal','nurse','inject','operate',
    'swim','run','walk','jump','climb','fly','drive','ride','sail',
    'float','sink','rise','fall','slide','roll','spin','bounce','crash',
    'collide','explode','burn','melt','freeze','evaporate','dissolve',
    'absorb','emit','reflect','shine','glow','flash','ring','buzz',
    'bark','bite','sting','scratch','rub','press','squeeze','stretch',
    'bend','fold','tear','smash','crush','chew','swallow','spit',
    'breathe','cough','sneeze','yawn','laugh','cry','scream','shout',
    'whisper','sing','dance','act','pretend','imitate','repeat',
    'resemble','differ','surpass','exceed','lack','miss','waste',
    'store','display','exhibit','illustrate','depict','portray',
    'adopt','adapt','modify','revise','adjust','convert','transform',
    'generate','consume','expand','shrink','extend','shorten','widen',
    'narrow','deepen','strengthen','weaken','accelerate','decelerate',
    'complicate','simplify','clarify','specify','summarize','emphasize',
    'highlight','underline','overlook','ignore','neglect','abandon',
    'suppress','restrict','prohibit','forbid','ban','impose','enforce',
    'obey','violate','resist','rebel','surrender','yield','compromise',
    'sacrifice','endure','tolerate','bear','withstand','confront',
    'encounter','accompany','escort','guide','direct','instruct',
    'observe','witness','monitor','supervise','oversee','coordinate',
    'administer','govern','rule','dominate','exploit','manipulate',
    'deceive','betray','accuse','convict','punish','reward','compensate',
    'reimburse','refund','charge','owe','inherit','possess','own',
    'acquire','obtain','gain','attain','accomplish','fulfill','satisfy',
  ]);
  if (VERB_STARTS.has(first)) return 'v';

  // If meaning contains "; to " or ", to " somewhere → likely verb
  if (/;\s*to\s|,\s*to\s/.test(lo)) return 'v';

  // Adjective secondary patterns: "adj; adj" or ends with common adj suffixes
  if (/^[a-z]+;\s*[a-z]+$/.test(lo)) {
    // Two short words separated by ; — often adjective pair
    const parts = lo.split(';').map(s => s.trim());
    if (parts.every(p => ADJ.has(p))) return 'a';
  }

  // Phrase
  if (/phrase|idiom|proverb|saying/.test(lo)) return 'phr';

  // Default: noun
  return 'n';
}

/** Classify word_type for an entry */
function classifyWordType(word, meaning) {
  // Direct lookup first
  if (WT_LOOKUP[word]) return WT_LOOKUP[word];
  // Meaning-based fallback
  return classifyByMeaning(meaning || '');
}


// ════════════════════════════════════════════════════════════════════
// 2. PLACEHOLDER EXAMPLE DETECTION & REPLACEMENT
// ════════════════════════════════════════════════════════════════════

const PLACEHOLDER_PATTERNS = [
  /请你注意「.+?」的用法/,
  /「.+?」是一个常用词/,
  /我学会了「.+?」这个词/,
  /你知道「.+?」吗？/,
  /请解释「.+?」/,
  /老师教了「.+?」/,
  /请用「.+?」造句/,
  /这是「.+?」的意思/,
];

function isPlaceholder(sentence) {
  if (!sentence) return true;
  return PLACEHOLDER_PATTERNS.some(p => p.test(sentence));
}

// ── Templates by word type ──
// Each template: [sentenceFn, pinyinFn, meaningViFn]
// {w} = Chinese word, {py} = pinyin of word, {vi} = Vietnamese meaning

const T_VERB = [
  [w=>`我每天都${w}。`, py=>`Wǒ měitiān dōu ${py}.`, vi=>`Tôi ${vi} mỗi ngày.`],
  [w=>`他正在${w}。`, py=>`Tā zhèngzài ${py}.`, vi=>`Anh ấy đang ${vi}.`],
  [w=>`你可以${w}吗？`, py=>`Nǐ kěyǐ ${py} ma?`, vi=>`Bạn có thể ${vi} không?`],
  [w=>`她很喜欢${w}。`, py=>`Tā hěn xǐhuan ${py}.`, vi=>`Cô ấy rất thích ${vi}.`],
  [w=>`我已经${w}了。`, py=>`Wǒ yǐjīng ${py} le.`, vi=>`Tôi đã ${vi} rồi.`],
  [w=>`大家一起${w}吧。`, py=>`Dàjiā yīqǐ ${py} ba.`, vi=>`Mọi người cùng ${vi} nhé.`],
  [w=>`你想${w}吗？`, py=>`Nǐ xiǎng ${py} ma?`, vi=>`Bạn muốn ${vi} không?`],
  [w=>`请你${w}一下。`, py=>`Qǐng nǐ ${py} yīxià.`, vi=>`Xin bạn ${vi} một chút.`],
  [w=>`我们应该${w}。`, py=>`Wǒmen yīnggāi ${py}.`, vi=>`Chúng ta nên ${vi}.`],
  [w=>`他不想${w}。`, py=>`Tā bù xiǎng ${py}.`, vi=>`Anh ấy không muốn ${vi}.`],
  [w=>`你需要${w}。`, py=>`Nǐ xūyào ${py}.`, vi=>`Bạn cần ${vi}.`],
  [w=>`我刚${w}完。`, py=>`Wǒ gāng ${py} wán.`, vi=>`Tôi vừa ${vi} xong.`],
];

const T_NOUN = [
  [w=>`这个${w}很重要。`, py=>`Zhège ${py} hěn zhòngyào.`, vi=>`${vi} này rất quan trọng.`],
  [w=>`我对${w}很感兴趣。`, py=>`Wǒ duì ${py} hěn gǎn xìngqù.`, vi=>`Tôi rất quan tâm đến ${vi}.`],
  [w=>`${w}是很重要的。`, py=>`${py} shì hěn zhòngyào de.`, vi=>`${vi} rất là quan trọng.`],
  [w=>`你知道${w}是什么吗？`, py=>`Nǐ zhīdào ${py} shì shénme ma?`, vi=>`Bạn biết ${vi} là gì không?`],
  [w=>`我需要一个好的${w}。`, py=>`Wǒ xūyào yī gè hǎo de ${py}.`, vi=>`Tôi cần một ${vi} tốt.`],
  [w=>`他给了我一个${w}。`, py=>`Tā gěi le wǒ yī gè ${py}.`, vi=>`Anh ấy cho tôi một ${vi}.`],
  [w=>`${w}对学习很有帮助。`, py=>`${py} duì xuéxí hěn yǒu bāngzhù.`, vi=>`${vi} rất hữu ích cho việc học.`],
  [w=>`我们讨论了${w}的问题。`, py=>`Wǒmen tǎolùn le ${py} de wèntí.`, vi=>`Chúng tôi đã thảo luận về vấn đề ${vi}.`],
  [w=>`这个${w}非常有用。`, py=>`Zhège ${py} fēicháng yǒuyòng.`, vi=>`${vi} này rất hữu ích.`],
  [w=>`她的${w}很好。`, py=>`Tā de ${py} hěn hǎo.`, vi=>`${vi} của cô ấy rất tốt.`],
  [w=>`关于${w}你了解多少？`, py=>`Guānyú ${py} nǐ liǎojiě duōshǎo?`, vi=>`Về ${vi}, bạn biết bao nhiêu?`],
  [w=>`现在的${w}越来越好了。`, py=>`Xiànzài de ${py} yuèláiyuè hǎo le.`, vi=>`${vi} bây giờ ngày càng tốt hơn.`],
];

const T_ADJ = [
  [w=>`今天天气很${w}。`, py=>`Jīntiān tiānqì hěn ${py}.`, vi=>`Hôm nay thời tiết rất ${vi}.`],
  [w=>`这里的环境很${w}。`, py=>`Zhèlǐ de huánjìng hěn ${py}.`, vi=>`Môi trường ở đây rất ${vi}.`],
  [w=>`他的性格非常${w}。`, py=>`Tā de xìnggé fēicháng ${py}.`, vi=>`Tính cách anh ấy rất ${vi}.`],
  [w=>`这本书很${w}。`, py=>`Zhè běn shū hěn ${py}.`, vi=>`Quyển sách này rất ${vi}.`],
  [w=>`她看起来很${w}。`, py=>`Tā kàn qǐlái hěn ${py}.`, vi=>`Cô ấy trông rất ${vi}.`],
  [w=>`这个地方特别${w}。`, py=>`Zhège dìfāng tèbié ${py}.`, vi=>`Nơi này đặc biệt ${vi}.`],
  [w=>`你做得很${w}。`, py=>`Nǐ zuò de hěn ${py}.`, vi=>`Bạn làm rất ${vi}.`],
  [w=>`生活变得越来越${w}。`, py=>`Shēnghuó biàn de yuèláiyuè ${py}.`, vi=>`Cuộc sống trở nên ngày càng ${vi}.`],
  [w=>`结果非常${w}。`, py=>`Jiéguǒ fēicháng ${py}.`, vi=>`Kết quả rất ${vi}.`],
  [w=>`这件事很${w}。`, py=>`Zhè jiàn shì hěn ${py}.`, vi=>`Việc này rất ${vi}.`],
  [w=>`中国菜真${w}。`, py=>`Zhōngguó cài zhēn ${py}.`, vi=>`Món Trung thật ${vi}.`],
  [w=>`大家都觉得很${w}。`, py=>`Dàjiā dōu juédé hěn ${py}.`, vi=>`Mọi người đều thấy rất ${vi}.`],
];

const T_ADV = [
  [w=>`他${w}来上课。`, py=>`Tā ${py} lái shàngkè.`, vi=>`Anh ấy ${vi} đến lớp.`],
  [w=>`我${w}觉得这样很好。`, py=>`Wǒ ${py} juédé zhèyàng hěn hǎo.`, vi=>`Tôi ${vi} thấy như vậy rất tốt.`],
  [w=>`她${w}很努力学习。`, py=>`Tā ${py} hěn nǔlì xuéxí.`, vi=>`Cô ấy ${vi} rất chăm chỉ học.`],
  [w=>`我们${w}这样做。`, py=>`Wǒmen ${py} zhèyàng zuò.`, vi=>`Chúng tôi ${vi} làm như vậy.`],
  [w=>`你${w}去过中国吗？`, py=>`Nǐ ${py} qùguò Zhōngguó ma?`, vi=>`Bạn ${vi} đã đến Trung Quốc chưa?`],
  [w=>`我${w}想告诉你一件事。`, py=>`Wǒ ${py} xiǎng gàosu nǐ yī jiàn shì.`, vi=>`Tôi ${vi} muốn nói với bạn một chuyện.`],
  [w=>`他${w}是个好学生。`, py=>`Tā ${py} shì gè hǎo xuéshēng.`, vi=>`Anh ấy ${vi} là học sinh giỏi.`],
  [w=>`我${w}同意你的看法。`, py=>`Wǒ ${py} tóngyì nǐ de kànfǎ.`, vi=>`Tôi ${vi} đồng ý quan điểm của bạn.`],
];

const T_DEFAULT = [
  [w=>`我正在学习"${w}"这个词。`, py=>`Wǒ zhèngzài xuéxí "${py}" zhège cí.`, vi=>`Tôi đang học từ "${vi}".`],
  [w=>`请用"${w}"造个句子。`, py=>`Qǐng yòng "${py}" zào gè jùzi.`, vi=>`Hãy đặt một câu với "${vi}".`],
  [w=>`"${w}"在汉语中很常见。`, py=>`"${py}" zài Hànyǔ zhōng hěn chángjiàn.`, vi=>`"${vi}" rất phổ biến trong tiếng Trung.`],
  [w=>`我们今天学"${w}"。`, py=>`Wǒmen jīntiān xué "${py}".`, vi=>`Hôm nay chúng ta học "${vi}".`],
];

function getTemplates(wordType) {
  switch (wordType) {
    case 'v': return T_VERB;
    case 'n': return T_NOUN;
    case 'a': return T_ADJ;
    case 'd': return T_ADV;
    default: return T_DEFAULT;
  }
}

/** Generate an example using a deterministic template selection */
function generateExample(word, pinyin, wordType, meaningVi, index) {
  const templates = getTemplates(wordType);
  const tpl = templates[index % templates.length];
  const vi = meaningVi || word;
  // Capitalize first letter of Vietnamese meaning in sentence
  const viCap = vi.charAt(0).toUpperCase() + vi.slice(1);
  return {
    sentence: tpl[0](word),
    pinyin: tpl[1](pinyin),
    meaning: tpl[2](viCap),
  };
}


// ════════════════════════════════════════════════════════════════════
// 3. MEANING_VI AUTO-FILL (English → Vietnamese for common patterns)
// ════════════════════════════════════════════════════════════════════

/** Basic English→Vietnamese dictionary for most common HSK meaning words */
const EN_VI = {
  // Actions
  'to love':'yêu','to eat':'ăn','to drink':'uống','to go':'đi','to come':'đến',
  'to see':'nhìn','to look':'nhìn','to hear':'nghe','to speak':'nói','to say':'nói',
  'to read':'đọc','to write':'viết','to study':'học','to learn':'học','to teach':'dạy',
  'to work':'làm việc','to sleep':'ngủ','to sit':'ngồi','to stand':'đứng',
  'to walk':'đi bộ','to run':'chạy','to swim':'bơi','to fly':'bay','to drive':'lái xe',
  'to buy':'mua','to sell':'bán','to give':'cho','to take':'lấy','to use':'dùng',
  'to make':'làm','to do':'làm','to get':'lấy','to have':'có','to be':'là',
  'to want':'muốn','to need':'cần','to know':'biết','to think':'nghĩ','to feel':'cảm thấy',
  'to like':'thích','to hope':'hy vọng','to believe':'tin','to understand':'hiểu',
  'to live':'sống','to die':'chết','to play':'chơi','to sing':'hát','to dance':'nhảy',
  'to wear':'mặc','to put on':'đeo','to open':'mở','to close':'đóng',
  'to begin':'bắt đầu','to start':'bắt đầu','to finish':'kết thúc','to stop':'dừng',
  'to wait':'đợi','to send':'gửi','to receive':'nhận','to return':'trở lại',
  'to help':'giúp đỡ','to change':'thay đổi','to try':'thử','to ask':'hỏi',
  'to answer':'trả lời','to explain':'giải thích','to remember':'nhớ','to forget':'quên',
  'to choose':'chọn','to decide':'quyết định','to prepare':'chuẩn bị',
  'to find':'tìm','to lose':'mất','to keep':'giữ','to leave':'rời đi',
  'to move':'di chuyển','to grow':'lớn lên','to develop':'phát triển',
  'to build':'xây dựng','to create':'tạo ra','to produce':'sản xuất',
  'to save':'tiết kiệm','to spend':'tiêu','to pay':'trả tiền','to earn':'kiếm',
  'to borrow':'mượn','to lend':'cho mượn','to repair':'sửa chữa',
  'to protect':'bảo vệ','to support':'ủng hộ','to manage':'quản lý',
  'to lead':'dẫn dắt','to follow':'theo','to join':'tham gia',
  'to invite':'mời','to celebrate':'kỷ niệm','to introduce':'giới thiệu',
  'to suggest':'đề nghị','to agree':'đồng ý','to refuse':'từ chối',
  'to accept':'chấp nhận','to allow':'cho phép','to prevent':'ngăn chặn',
  'to solve':'giải quyết','to compare':'so sánh','to improve':'cải thiện',
  'to influence':'ảnh hưởng','to express':'biểu đạt','to discuss':'thảo luận',
  'to argue':'tranh luận','to complain':'phàn nàn','to praise':'khen ngợi',
  'to criticize':'phê bình','to encourage':'khích lệ','to warn':'cảnh báo',
  'to realize':'nhận ra','to notice':'nhận thấy','to recognize':'nhận ra',
  'to imagine':'tưởng tượng','to consider':'cân nhắc','to doubt':'nghi ngờ',
  'to predict':'dự đoán','to expect':'mong đợi','to worry':'lo lắng',
  'to enjoy':'thưởng thức','to suffer':'chịu đựng','to experience':'trải nghiệm',
  'to succeed':'thành công','to fail':'thất bại','to achieve':'đạt được',
  'to represent':'đại diện','to reflect':'phản ánh','to prove':'chứng minh',
  'to maintain':'duy trì','to recover':'hồi phục','to survive':'sống sót',
  'to arrange':'sắp xếp','to organize':'tổ chức','to collect':'thu thập',
  'to publish':'xuất bản','to translate':'dịch','to communicate':'giao tiếp',

  // Adjectives
  'big':'lớn','small':'nhỏ','tall':'cao','short':'thấp','long':'dài',
  'old':'cũ','new':'mới','young':'trẻ','good':'tốt','bad':'xấu',
  'beautiful':'đẹp','ugly':'xấu','hot':'nóng','cold':'lạnh',
  'warm':'ấm','cool':'mát','fast':'nhanh','slow':'chậm',
  'easy':'dễ','hard':'khó','difficult':'khó','happy':'vui',
  'sad':'buồn','angry':'giận','tired':'mệt','busy':'bận',
  'free':'rảnh','full':'đầy','empty':'trống','rich':'giàu',
  'poor':'nghèo','strong':'mạnh','weak':'yếu','clean':'sạch',
  'dirty':'bẩn','heavy':'nặng','light':'nhẹ','deep':'sâu',
  'wide':'rộng','narrow':'hẹp','thick':'dày','thin':'mỏng',
  'bright':'sáng','dark':'tối','loud':'to','quiet':'yên tĩnh',
  'soft':'mềm','sweet':'ngọt','sour':'chua','bitter':'đắng',
  'spicy':'cay','salty':'mặn','delicious':'ngon','important':'quan trọng',
  'special':'đặc biệt','normal':'bình thường','strange':'lạ',
  'correct':'đúng','wrong':'sai','true':'đúng','false':'sai',
  'real':'thật','safe':'an toàn','dangerous':'nguy hiểm',
  'comfortable':'thoải mái','convenient':'thuận tiện','polite':'lịch sự',
  'honest':'thật thà','kind':'tử tế','serious':'nghiêm túc',
  'popular':'phổ biến','famous':'nổi tiếng','ancient':'cổ đại',
  'modern':'hiện đại','traditional':'truyền thống','clear':'rõ ràng',
  'expensive':'đắt','cheap':'rẻ','precious':'quý giá',
  'calm':'bình tĩnh','lonely':'cô đơn','boring':'chán',
  'proud':'tự hào','patient':'kiên nhẫn','confident':'tự tin',
  'interesting':'thú vị','exciting':'hào hứng','wonderful':'tuyệt vời',
  'terrible':'tệ','excellent':'xuất sắc','perfect':'hoàn hảo',
  'fair':'công bằng','independent':'độc lập','natural':'tự nhiên',
  'healthy':'khỏe mạnh','wealthy':'giàu có','necessary':'cần thiết',
  'simple':'đơn giản','complex':'phức tạp','complete':'hoàn chỉnh',
  'similar':'tương tự','different':'khác','same':'giống',
  'obvious':'rõ ràng','precise':'chính xác','suitable':'phù hợp',
  'flexible':'linh hoạt','stable':'ổn định','romantic':'lãng mạn',

  // Nouns
  'person':'người','people':'người','family':'gia đình','friend':'bạn bè',
  'teacher':'giáo viên','student':'học sinh','doctor':'bác sĩ',
  'child':'trẻ em','man':'đàn ông','woman':'phụ nữ','water':'nước',
  'food':'thức ăn','money':'tiền','time':'thời gian','day':'ngày',
  'year':'năm','month':'tháng','week':'tuần','hour':'giờ',
  'minute':'phút','morning':'buổi sáng','afternoon':'buổi chiều',
  'evening':'buổi tối','night':'đêm','today':'hôm nay',
  'tomorrow':'ngày mai','yesterday':'hôm qua','home':'nhà',
  'school':'trường','hospital':'bệnh viện','hotel':'khách sạn',
  'restaurant':'nhà hàng','store':'cửa hàng','company':'công ty',
  'city':'thành phố','country':'quốc gia','world':'thế giới',
  'road':'đường','car':'xe hơi','bus':'xe buýt','train':'tàu',
  'airplane':'máy bay','book':'sách','phone':'điện thoại',
  'computer':'máy tính','letter':'thư','news':'tin tức',
  'question':'câu hỏi','answer':'câu trả lời','problem':'vấn đề',
  'idea':'ý tưởng','way':'cách','thing':'thứ','place':'nơi',
  'name':'tên','language':'ngôn ngữ','culture':'văn hóa',
  'history':'lịch sử','science':'khoa học','art':'nghệ thuật',
  'music':'âm nhạc','movie':'phim','weather':'thời tiết',
  'color':'màu sắc','number':'số','word':'từ','sentence':'câu',
  'body':'cơ thể','head':'đầu','face':'mặt','eye':'mắt',
  'ear':'tai','mouth':'miệng','hand':'tay','foot':'chân',
  'heart':'trái tim','life':'cuộc sống','death':'cái chết',
  'health':'sức khỏe','education':'giáo dục','economy':'kinh tế',
  'society':'xã hội','environment':'môi trường','technology':'công nghệ',
  'internet':'internet','government':'chính phủ','law':'pháp luật',
  'right':'quyền','responsibility':'trách nhiệm','relationship':'mối quan hệ',
  'experience':'kinh nghiệm','opportunity':'cơ hội','success':'thành công',
  'failure':'thất bại','development':'phát triển','progress':'tiến bộ',
  'situation':'tình hình','condition':'điều kiện','result':'kết quả',
  'reason':'lý do','purpose':'mục đích','method':'phương pháp',
  'system':'hệ thống','structure':'cấu trúc','process':'quá trình',
  'standard':'tiêu chuẩn','quality':'chất lượng','value':'giá trị',
  'research':'nghiên cứu','knowledge':'kiến thức','information':'thông tin',

  // Adverbs
  'also':'cũng','very':'rất','really':'thật sự','often':'thường',
  'always':'luôn luôn','never':'không bao giờ','sometimes':'đôi khi',
  'already':'đã','still':'vẫn','again':'lại','just':'chỉ',
  'only':'chỉ','even':'thậm chí','almost':'gần như','maybe':'có lẽ',
  'probably':'có lẽ','suddenly':'đột nhiên','finally':'cuối cùng',
  'especially':'đặc biệt','mainly':'chủ yếu','nearly':'gần',
  'exactly':'chính xác','together':'cùng nhau','forever':'mãi mãi',
  'actually':'thực ra','indeed':'quả thật','gradually':'dần dần',
  'immediately':'ngay lập tức','completely':'hoàn toàn','absolutely':'tuyệt đối',
};

function autoMeaningVi(meaning) {
  if (!meaning) return null;
  const lo = meaning.toLowerCase().trim();
  // Try exact match
  if (EN_VI[lo]) return EN_VI[lo];
  // Try first part before ;
  const first = lo.split(';')[0].trim();
  if (EN_VI[first]) return EN_VI[first];
  // Try without "to " prefix
  if (first.startsWith('to ')) {
    const verb = first.slice(3).trim();
    if (EN_VI[first]) return EN_VI[first];
    // Search all entries for partial match
    for (const [k, v] of Object.entries(EN_VI)) {
      if (k === `to ${verb}`) return v;
    }
  }
  return null;
}


// ════════════════════════════════════════════════════════════════════
// 4. MAIN PROCESSING
// ════════════════════════════════════════════════════════════════════

function processFile(filename) {
  const filepath = path.join(DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`  ⚠️  ${filename} not found, skip`);
    return null;
  }

  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  let wtFixed = 0, exFixed = 0, viFixed = 0;

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];

    // ── word_type ──
    if (!entry.word_type) {
      entry.word_type = classifyWordType(entry.chinese_word, entry.meaning);
      wtFixed++;
    } else if (WT_LOOKUP[entry.chinese_word] && entry.word_type !== WT_LOOKUP[entry.chinese_word]) {
      // Override with lookup if word is known and was misclassified
      entry.word_type = WT_LOOKUP[entry.chinese_word];
      wtFixed++;
    }

    // ── meaning_vi ──
    if (!entry.meaning_vi) {
      const auto = autoMeaningVi(entry.meaning);
      if (auto) {
        entry.meaning_vi = auto;
        viFixed++;
      }
    }

    // ── placeholder examples ──
    if (isPlaceholder(entry.example_sentence)) {
      const vi = entry.meaning_vi || entry.meaning?.split(';')[0]?.replace(/^to\s+/i,'').trim() || entry.chinese_word;
      const ex = generateExample(
        entry.chinese_word,
        entry.pinyin,
        entry.word_type,
        vi,
        i, // use index for template rotation → diversity
      );
      entry.example_sentence = ex.sentence;
      entry.example_pinyin = ex.pinyin;
      entry.example_meaning = ex.meaning;
      exFixed++;
    }
  }

  // Write back
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf8');

  return { total: data.length, wtFixed, exFixed, viFixed };
}

// ── Run ──
console.log('═══════════════════════════════════════════');
console.log('  HSK Vocabulary Enrichment Script');
console.log('═══════════════════════════════════════════\n');

const files = [
  'vocabulary_hsk1.json',
  'vocabulary_hsk2.json',
  'vocabulary_hsk3.json',
  'vocabulary_hsk4.json',
  'vocabulary_hsk5.json',
  'vocabulary_hsk6.json',
];

let grandTotal = { words: 0, wt: 0, ex: 0, vi: 0 };

for (const f of files) {
  console.log(`📂 Processing ${f}...`);
  const result = processFile(f);
  if (result) {
    grandTotal.words += result.total;
    grandTotal.wt += result.wtFixed;
    grandTotal.ex += result.exFixed;
    grandTotal.vi += result.viFixed;
    console.log(`   ✅ ${result.total} words | word_type: +${result.wtFixed} | examples: +${result.exFixed} | meaning_vi: +${result.viFixed}`);
  }
  console.log();
}

console.log('═══════════════════════════════════════════');
console.log(`🎉 DONE! ${grandTotal.words} total words processed`);
console.log(`   word_type filled:  ${grandTotal.wt}`);
console.log(`   examples replaced: ${grandTotal.ex}`);
console.log(`   meaning_vi filled: ${grandTotal.vi}`);
console.log('═══════════════════════════════════════════');
