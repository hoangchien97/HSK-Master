import json
import os

# Read the original file
input_path = os.path.join(os.path.dirname(__file__), '..', 'prisma', 'hsk_vocab_exports', 'vocabulary_hsk3.json')
with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Map: chinese_word -> (example_sentence, example_pinyin, example_meaning)
# For duplicate words (只 appears twice with different pinyin), we use (word, pinyin) as key
examples = {
    ("阿姨", "ā yí"): (
        "阿姨做的菜非常好吃。",
        "Āyí zuò de cài fēicháng hǎochī.",
        "Món ăn dì nấu rất ngon."
    ),
    ("啊", "a"): (
        "今天的天气真好啊！",
        "Jīntiān de tiānqì zhēn hǎo a!",
        "Thời tiết hôm nay thật đẹp!"
    ),
    ("矮", "ǎi"): (
        "弟弟比我矮一点儿。",
        "Dìdi bǐ wǒ ǎi yīdiǎnr.",
        "Em trai thấp hơn tôi một chút."
    ),
    ("爱好", "ài hào"): (
        "我的爱好是打篮球和游泳。",
        "Wǒ de àihào shì dǎ lánqiú hé yóuyǒng.",
        "Sở thích của tôi là chơi bóng rổ và bơi lội."
    ),
    ("安静", "ān jìng"): (
        "图书馆里很安静，适合学习。",
        "Túshūguǎn lǐ hěn ānjìng, shìhé xuéxí.",
        "Trong thư viện rất yên tĩnh, thích hợp để học."
    ),
    ("把", "bǎ"): (
        "请把门关上。",
        "Qǐng bǎ mén guān shang.",
        "Xin hãy đóng cửa lại."
    ),
    ("搬", "bān"): (
        "我下个月要搬到新房子。",
        "Wǒ xià ge yuè yào bān dào xīn fángzi.",
        "Tháng sau tôi sẽ chuyển đến nhà mới."
    ),
    ("班", "bān"): (
        "我们班有三十个学生。",
        "Wǒmen bān yǒu sānshí ge xuésheng.",
        "Lớp chúng tôi có ba mươi học sinh."
    ),
    ("半", "bàn"): (
        "现在是下午两点半。",
        "Xiànzài shì xiàwǔ liǎng diǎn bàn.",
        "Bây giờ là hai giờ rưỡi chiều."
    ),
    ("办法", "bàn fǎ"): (
        "我想不出好办法来解决这个问题。",
        "Wǒ xiǎng bu chū hǎo bànfǎ lái jiějué zhège wèntí.",
        "Tôi không nghĩ ra cách hay để giải quyết vấn đề này."
    ),
    ("办公室", "bàn gōng shì"): (
        "经理在办公室等你。",
        "Jīnglǐ zài bàngōngshì děng nǐ.",
        "Giám đốc đang đợi bạn ở văn phòng."
    ),
    ("帮忙", "bāng máng"): (
        "你能帮忙搬一下这个箱子吗？",
        "Nǐ néng bāngmáng bān yīxià zhège xiāngzi ma?",
        "Bạn có thể giúp chuyển cái hộp này không?"
    ),
    ("包", "bāo"): (
        "她买了一个新包，很漂亮。",
        "Tā mǎi le yī ge xīn bāo, hěn piàoliang.",
        "Cô ấy mua một cái túi mới, rất đẹp."
    ),
    ("饱", "bǎo"): (
        "我已经吃饱了，谢谢。",
        "Wǒ yǐjīng chī bǎo le, xièxie.",
        "Tôi đã ăn no rồi, cảm ơn."
    ),
    ("北方", "běi fāng"): (
        "中国北方的冬天很冷。",
        "Zhōngguó běifāng de dōngtiān hěn lěng.",
        "Mùa đông ở miền Bắc Trung Quốc rất lạnh."
    ),
    ("被", "bèi"): (
        "我的自行车被人偷走了。",
        "Wǒ de zìxíngchē bèi rén tōu zǒu le.",
        "Xe đạp của tôi bị người ta lấy trộm rồi."
    ),
    ("鼻子", "bí zi"): (
        "她的鼻子又高又好看。",
        "Tā de bízi yòu gāo yòu hǎokàn.",
        "Mũi cô ấy vừa cao vừa đẹp."
    ),
    ("比较", "bǐ jiào"): (
        "今天比较冷，你多穿点衣服。",
        "Jīntiān bǐjiào lěng, nǐ duō chuān diǎn yīfu.",
        "Hôm nay khá lạnh, bạn mặc thêm quần áo nhé."
    ),
    ("比赛", "bǐ sài"): (
        "明天我们学校有一场足球比赛。",
        "Míngtiān wǒmen xuéxiào yǒu yī chǎng zúqiú bǐsài.",
        "Ngày mai trường chúng tôi có một trận đấu bóng đá."
    ),
    ("必须", "bì xū"): (
        "你必须在八点以前到学校。",
        "Nǐ bìxū zài bā diǎn yǐqián dào xuéxiào.",
        "Bạn phải đến trường trước tám giờ."
    ),
    ("变化", "biàn huà"): (
        "这个城市的变化很大。",
        "Zhège chéngshì de biànhuà hěn dà.",
        "Thành phố này thay đổi rất nhiều."
    ),
    ("表示", "biǎo shì"): (
        "他送花表示感谢。",
        "Tā sòng huā biǎoshì gǎnxiè.",
        "Anh ấy tặng hoa để thể hiện sự cảm ơn."
    ),
    ("表演", "biǎo yǎn"): (
        "孩子们在舞台上表演节目。",
        "Háizimen zài wǔtái shang biǎoyǎn jiémù.",
        "Các em nhỏ biểu diễn tiết mục trên sân khấu."
    ),
    ("别人", "bié ren"): (
        "不要随便拿别人的东西。",
        "Bú yào suíbiàn ná biéren de dōngxi.",
        "Đừng tùy tiện lấy đồ của người khác."
    ),
    ("宾馆", "bīn guǎn"): (
        "我们在宾馆住了三天。",
        "Wǒmen zài bīnguǎn zhù le sān tiān.",
        "Chúng tôi đã ở khách sạn ba ngày."
    ),
    ("冰箱", "bīng xiāng"): (
        "请把牛奶放进冰箱里。",
        "Qǐng bǎ niúnǎi fàng jìn bīngxiāng lǐ.",
        "Xin hãy cho sữa vào tủ lạnh."
    ),
    ("才", "cái"): (
        "他十点才起床。",
        "Tā shí diǎn cái qǐchuáng.",
        "Mười giờ anh ấy mới dậy."
    ),
    ("菜单", "cài dān"): (
        "服务员，请给我一份菜单。",
        "Fúwùyuán, qǐng gěi wǒ yī fèn càidān.",
        "Phục vụ ơi, xin cho tôi một tờ thực đơn."
    ),
    ("参加", "cān jiā"): (
        "我想参加学校的唱歌比赛。",
        "Wǒ xiǎng cānjiā xuéxiào de chànggē bǐsài.",
        "Tôi muốn tham gia cuộc thi hát của trường."
    ),
    ("草", "cǎo"): (
        "公园里的草绿绿的，很好看。",
        "Gōngyuán lǐ de cǎo lǜlǜ de, hěn hǎokàn.",
        "Cỏ trong công viên xanh mướt, rất đẹp."
    ),
    ("层", "céng"): (
        "我家住在五层。",
        "Wǒ jiā zhù zài wǔ céng.",
        "Nhà tôi ở tầng năm."
    ),
    ("差", "chà"): (
        "现在差五分八点。",
        "Xiànzài chà wǔ fēn bā diǎn.",
        "Bây giờ là tám giờ kém năm phút."
    ),
    ("超市", "chāo shì"): (
        "我去超市买了一些水果。",
        "Wǒ qù chāoshì mǎi le yīxiē shuǐguǒ.",
        "Tôi đi siêu thị mua một ít hoa quả."
    ),
    ("衬衫", "chèn shān"): (
        "这件白色衬衫很适合你。",
        "Zhè jiàn báisè chènshān hěn shìhé nǐ.",
        "Chiếc áo sơ mi trắng này rất hợp với bạn."
    ),
    ("成绩", "chéng jì"): (
        "她这次考试的成绩非常好。",
        "Tā zhè cì kǎoshì de chéngjì fēicháng hǎo.",
        "Kết quả thi lần này của cô ấy rất tốt."
    ),
    ("城市", "chéng shì"): (
        "上海是一个非常大的城市。",
        "Shànghǎi shì yī ge fēicháng dà de chéngshì.",
        "Thượng Hải là một thành phố rất lớn."
    ),
    ("迟到", "chí dào"): (
        "今天早上堵车，所以我迟到了。",
        "Jīntiān zǎoshang dǔchē, suǒyǐ wǒ chídào le.",
        "Sáng nay tắc đường nên tôi đến muộn."
    ),
    ("出现", "chū xiàn"): (
        "天空中出现了一道彩虹。",
        "Tiānkōng zhōng chūxiàn le yī dào cǎihóng.",
        "Trên bầu trời xuất hiện một cầu vồng."
    ),
    ("除了", "chú le"): (
        "除了中文，我还会说英语。",
        "Chúle Zhōngwén, wǒ hái huì shuō Yīngyǔ.",
        "Ngoài tiếng Trung, tôi còn biết nói tiếng Anh."
    ),
    ("厨房", "chú fáng"): (
        "妈妈在厨房做饭。",
        "Māma zài chúfáng zuòfàn.",
        "Mẹ đang nấu cơm trong bếp."
    ),
    ("春", "chūn"): (
        "春天来了，花都开了。",
        "Chūntiān lái le, huā dōu kāi le.",
        "Mùa xuân đến rồi, hoa đều nở rồi."
    ),
    ("词语", "cí yǔ"): (
        "请用这个词语造一个句子。",
        "Qǐng yòng zhège cíyǔ zào yī ge jùzi.",
        "Xin hãy dùng từ ngữ này đặt một câu."
    ),
    ("聪明", "cōng ming"): (
        "这个孩子很聪明，学什么都很快。",
        "Zhège háizi hěn cōngming, xué shénme dōu hěn kuài.",
        "Đứa trẻ này rất thông minh, học gì cũng nhanh."
    ),
    ("打扫", "dǎ sǎo"): (
        "周末我要打扫房间。",
        "Zhōumò wǒ yào dǎsǎo fángjiān.",
        "Cuối tuần tôi phải dọn dẹp phòng."
    ),
    ("打算", "dǎ suàn"): (
        "你暑假打算去哪里旅游？",
        "Nǐ shǔjià dǎsuàn qù nǎlǐ lǚyóu?",
        "Nghỉ hè bạn dự định đi du lịch ở đâu?"
    ),
    ("带", "dài"): (
        "明天别忘了带雨伞。",
        "Míngtiān bié wàng le dài yǔsǎn.",
        "Ngày mai đừng quên mang ô nhé."
    ),
    ("担心", "dān xīn"): (
        "妈妈总是担心我的身体。",
        "Māma zǒngshì dānxīn wǒ de shēntǐ.",
        "Mẹ luôn lo lắng cho sức khỏe của tôi."
    ),
    ("蛋糕", "dàn gāo"): (
        "生日那天朋友给我买了一个蛋糕。",
        "Shēngrì nà tiān péngyou gěi wǒ mǎi le yī ge dàngāo.",
        "Ngày sinh nhật bạn bè mua cho tôi một cái bánh kem."
    ),
    ("当然", "dāng rán"): (
        "你想去看电影吗？当然想！",
        "Nǐ xiǎng qù kàn diànyǐng ma? Dāngrán xiǎng!",
        "Bạn muốn đi xem phim không? Tất nhiên muốn!"
    ),
    ("地", "de"): (
        "他高兴地跳了起来。",
        "Tā gāoxìng de tiào le qǐlai.",
        "Anh ấy vui vẻ nhảy lên."
    ),
    ("灯", "dēng"): (
        "天黑了，请把灯打开。",
        "Tiān hēi le, qǐng bǎ dēng dǎkāi.",
        "Trời tối rồi, xin hãy bật đèn lên."
    ),
    ("低", "dī"): (
        "今天的气温很低，只有五度。",
        "Jīntiān de qìwēn hěn dī, zhǐ yǒu wǔ dù.",
        "Nhiệt độ hôm nay rất thấp, chỉ có năm độ."
    ),
    ("地方", "dì fang"): (
        "这个地方的风景很美。",
        "Zhège dìfang de fēngjǐng hěn měi.",
        "Phong cảnh nơi này rất đẹp."
    ),
    ("地铁", "dì tiě"): (
        "坐地铁去上班比较快。",
        "Zuò dìtiě qù shàngbān bǐjiào kuài.",
        "Đi tàu điện ngầm đến công ty khá nhanh."
    ),
    ("地图", "dì tú"): (
        "我在手机上看地图找路。",
        "Wǒ zài shǒujī shang kàn dìtú zhǎo lù.",
        "Tôi xem bản đồ trên điện thoại để tìm đường."
    ),
    ("电梯", "diàn tī"): (
        "坐电梯到十二楼。",
        "Zuò diàntī dào shí'èr lóu.",
        "Đi thang máy lên tầng mười hai."
    ),
    ("电子", "diàn zǐ"): (
        "现在很多人用电子邮件联系。",
        "Xiànzài hěn duō rén yòng diànzǐ yóujiàn liánxì.",
        "Bây giờ nhiều người dùng email để liên lạc."
    ),
    ("冬", "dōng"): (
        "北京的冬天经常下雪。",
        "Běijīng de dōngtiān jīngcháng xiàxuě.",
        "Mùa đông ở Bắc Kinh thường xuyên có tuyết."
    ),
    ("东", "dōng"): (
        "太阳从东边升起来了。",
        "Tàiyáng cóng dōngbian shēng qǐlai le.",
        "Mặt trời mọc lên từ phía đông."
    ),
    ("动物", "dòng wù"): (
        "孩子们都喜欢去动物园看动物。",
        "Háizimen dōu xǐhuan qù dòngwùyuán kàn dòngwù.",
        "Các em nhỏ đều thích đi sở thú xem động vật."
    ),
    ("短", "duǎn"): (
        "这条裤子太短了，换一条长的吧。",
        "Zhè tiáo kùzi tài duǎn le, huàn yī tiáo cháng de ba.",
        "Chiếc quần này quá ngắn, đổi một chiếc dài hơn đi."
    ),
    ("段", "duàn"): (
        "请你读一下这段文章。",
        "Qǐng nǐ dú yīxià zhè duàn wénzhāng.",
        "Xin bạn hãy đọc đoạn văn này."
    ),
    ("锻炼", "duàn liàn"): (
        "每天早上他都去公园锻炼身体。",
        "Měi tiān zǎoshang tā dōu qù gōngyuán duànliàn shēntǐ.",
        "Mỗi sáng anh ấy đều ra công viên rèn luyện thân thể."
    ),
    ("多么", "duō me"): (
        "今天的天气多么好啊！",
        "Jīntiān de tiānqì duōme hǎo a!",
        "Thời tiết hôm nay đẹp biết bao!"
    ),
    ("饿", "è"): (
        "我还没吃午饭，现在很饿。",
        "Wǒ hái méi chī wǔfàn, xiànzài hěn è.",
        "Tôi chưa ăn trưa, bây giờ rất đói."
    ),
    ("而且", "ér qiě"): (
        "这家餐厅的菜好吃，而且不贵。",
        "Zhè jiā cāntīng de cài hǎochī, érqiě bú guì.",
        "Món ăn nhà hàng này ngon, hơn nữa không đắt."
    ),
    ("耳朵", "ěr duo"): (
        "他的耳朵很大，听力也很好。",
        "Tā de ěrduo hěn dà, tīnglì yě hěn hǎo.",
        "Tai anh ấy rất to, thính lực cũng rất tốt."
    ),
    ("发烧", "fā shāo"): (
        "孩子发烧了，我带他去医院。",
        "Háizi fāshāo le, wǒ dài tā qù yīyuàn.",
        "Con bé bị sốt rồi, tôi đưa bé đi bệnh viện."
    ),
    ("发现", "fā xiàn"): (
        "我发现钱包不见了。",
        "Wǒ fāxiàn qiánbāo bújiàn le.",
        "Tôi phát hiện ví tiền đã mất."
    ),
    ("方便", "fāng biàn"): (
        "住在地铁站附近很方便。",
        "Zhù zài dìtiězhàn fùjìn hěn fāngbiàn.",
        "Sống gần ga tàu điện ngầm rất tiện lợi."
    ),
    ("放", "fàng"): (
        "请把书放在桌子上。",
        "Qǐng bǎ shū fàng zài zhuōzi shang.",
        "Xin hãy đặt sách lên bàn."
    ),
    ("放心", "fàng xīn"): (
        "你放心吧，我会照顾好自己的。",
        "Nǐ fàngxīn ba, wǒ huì zhàogù hǎo zìjǐ de.",
        "Bạn yên tâm đi, tôi sẽ chăm sóc bản thân tốt."
    ),
    ("分", "fēn"): (
        "这次考试我得了九十五分。",
        "Zhè cì kǎoshì wǒ dé le jiǔshíwǔ fēn.",
        "Bài thi lần này tôi được chín mươi lăm điểm."
    ),
    ("附近", "fù jìn"): (
        "学校附近有一家很好的餐厅。",
        "Xuéxiào fùjìn yǒu yī jiā hěn hǎo de cāntīng.",
        "Gần trường có một nhà hàng rất ngon."
    ),
    ("复习", "fù xí"): (
        "考试以前要好好复习。",
        "Kǎoshì yǐqián yào hǎohāo fùxí.",
        "Trước khi thi phải ôn tập thật kỹ."
    ),
    ("干净", "gān jìng"): (
        "打扫以后，房间变得很干净。",
        "Dǎsǎo yǐhòu, fángjiān biàn de hěn gānjìng.",
        "Sau khi dọn dẹp, căn phòng trở nên rất sạch sẽ."
    ),
    ("敢", "gǎn"): (
        "他不敢一个人走夜路。",
        "Tā bù gǎn yī ge rén zǒu yèlù.",
        "Anh ấy không dám đi đường ban đêm một mình."
    ),
    ("感冒", "gǎn mào"): (
        "天气变冷了，小心别感冒。",
        "Tiānqì biàn lěng le, xiǎoxīn bié gǎnmào.",
        "Thời tiết trở lạnh rồi, cẩn thận đừng bị cảm."
    ),
    ("刚才", "gāng cái"): (
        "刚才有人给你打电话了。",
        "Gāngcái yǒu rén gěi nǐ dǎ diànhuà le.",
        "Vừa nãy có người gọi điện cho bạn."
    ),
    ("根据", "gēn jù"): (
        "根据天气预报，明天会下雨。",
        "Gēnjù tiānqì yùbào, míngtiān huì xiàyǔ.",
        "Theo dự báo thời tiết, ngày mai sẽ mưa."
    ),
    ("跟", "gēn"): (
        "我跟朋友一起去看电影。",
        "Wǒ gēn péngyou yīqǐ qù kàn diànyǐng.",
        "Tôi đi xem phim cùng bạn."
    ),
    ("更", "gèng"): (
        "你应该更努力地学习。",
        "Nǐ yīnggāi gèng nǔlì de xuéxí.",
        "Bạn nên học tập chăm chỉ hơn."
    ),
    ("公园", "gōng yuán"): (
        "周末我们去公园散步吧。",
        "Zhōumò wǒmen qù gōngyuán sànbù ba.",
        "Cuối tuần chúng ta đi dạo công viên nhé."
    ),
    ("故事", "gù shi"): (
        "奶奶每天晚上给我讲故事。",
        "Nǎinai měi tiān wǎnshang gěi wǒ jiǎng gùshi.",
        "Mỗi tối bà nội kể chuyện cho tôi nghe."
    ),
    ("刮", "guā"): (
        "外面刮大风了，你穿多一点。",
        "Wàimiàn guā dà fēng le, nǐ chuān duō yīdiǎn.",
        "Bên ngoài gió thổi mạnh rồi, bạn mặc thêm đi."
    ),
    ("关", "guān"): (
        "睡觉以前请关好门窗。",
        "Shuìjiào yǐqián qǐng guān hǎo ménchuāng.",
        "Trước khi ngủ xin hãy đóng cửa sổ cho kỹ."
    ),
    ("关系", "guān xì"): (
        "他们两个人的关系很好。",
        "Tāmen liǎng ge rén de guānxi hěn hǎo.",
        "Mối quan hệ giữa hai người họ rất tốt."
    ),
    ("关心", "guān xīn"): (
        "谢谢你这么关心我。",
        "Xièxie nǐ zhème guānxīn wǒ.",
        "Cảm ơn bạn đã quan tâm tôi như vậy."
    ),
    ("关于", "guān yú"): (
        "关于这件事，我想跟你谈谈。",
        "Guānyú zhè jiàn shì, wǒ xiǎng gēn nǐ tántan.",
        "Về việc này, tôi muốn nói chuyện với bạn."
    ),
    ("国家", "guó jiā"): (
        "中国是一个历史悠久的国家。",
        "Zhōngguó shì yī ge lìshǐ yōujiǔ de guójiā.",
        "Trung Quốc là một đất nước có lịch sử lâu đời."
    ),
    ("果汁", "guǒ zhī"): (
        "你想喝果汁还是喝茶？",
        "Nǐ xiǎng hē guǒzhī háishi hē chá?",
        "Bạn muốn uống nước ép trái cây hay uống trà?"
    ),
    ("过去", "guò qu"): (
        "过去的事就不要再想了。",
        "Guòqu de shì jiù bú yào zài xiǎng le.",
        "Chuyện quá khứ thì đừng nghĩ nữa."
    ),
    ("还是", "hái shi"): (
        "你喝咖啡还是喝茶？",
        "Nǐ hē kāfēi háishi hē chá?",
        "Bạn uống cà phê hay uống trà?"
    ),
    ("害怕", "hài pà"): (
        "小孩子晚上害怕一个人睡觉。",
        "Xiǎo háizi wǎnshang hàipà yī ge rén shuìjiào.",
        "Trẻ con ban đêm sợ ngủ một mình."
    ),
    ("河", "hé"): (
        "这条河的水很清。",
        "Zhè tiáo hé de shuǐ hěn qīng.",
        "Nước con sông này rất trong."
    ),
    ("黑板", "hēi bǎn"): (
        "老师在黑板上写了很多生词。",
        "Lǎoshī zài hēibǎn shang xiě le hěn duō shēngcí.",
        "Thầy giáo viết rất nhiều từ mới trên bảng đen."
    ),
    ("护照", "hù zhào"): (
        "出国旅游一定要带护照。",
        "Chūguó lǚyóu yīdìng yào dài hùzhào.",
        "Đi du lịch nước ngoài nhất định phải mang hộ chiếu."
    ),
    ("花", "huā"): (
        "他每个月花很多钱买书。",
        "Tā měi ge yuè huā hěn duō qián mǎi shū.",
        "Mỗi tháng anh ấy tiêu rất nhiều tiền mua sách."
    ),
    ("花园", "huā yuán"): (
        "她家有一个很漂亮的花园。",
        "Tā jiā yǒu yī ge hěn piàoliang de huāyuán.",
        "Nhà cô ấy có một khu vườn hoa rất đẹp."
    ),
    ("画", "huà"): (
        "她很喜欢画画儿。",
        "Tā hěn xǐhuan huà huàr.",
        "Cô ấy rất thích vẽ tranh."
    ),
    ("坏", "huài"): (
        "我的手机坏了，要去修。",
        "Wǒ de shǒujī huài le, yào qù xiū.",
        "Điện thoại của tôi hỏng rồi, phải đi sửa."
    ),
    ("环境", "huán jìng"): (
        "我们应该保护环境。",
        "Wǒmen yīnggāi bǎohù huánjìng.",
        "Chúng ta nên bảo vệ môi trường."
    ),
    ("换", "huàn"): (
        "这件衣服太大了，能换一件小的吗？",
        "Zhè jiàn yīfu tài dà le, néng huàn yī jiàn xiǎo de ma?",
        "Chiếc áo này quá lớn, có thể đổi một cái nhỏ hơn không?"
    ),
    ("黄", "huáng"): (
        "秋天到了，树叶变黄了。",
        "Qiūtiān dào le, shùyè biàn huáng le.",
        "Mùa thu đến rồi, lá cây chuyển vàng."
    ),
    ("会议", "huì yì"): (
        "下午三点有一个重要的会议。",
        "Xiàwǔ sān diǎn yǒu yī ge zhòngyào de huìyì.",
        "Ba giờ chiều có một cuộc họp quan trọng."
    ),
    ("或者", "huò zhě"): (
        "你可以坐公共汽车或者地铁。",
        "Nǐ kěyǐ zuò gōnggòng qìchē huòzhě dìtiě.",
        "Bạn có thể đi xe buýt hoặc tàu điện ngầm."
    ),
    ("机会", "jī huì"): (
        "这是一个很好的学习机会。",
        "Zhè shì yī ge hěn hǎo de xuéxí jīhuì.",
        "Đây là một cơ hội học tập rất tốt."
    ),
    ("几乎", "jī hū"): (
        "他几乎每天都去跑步。",
        "Tā jīhū měi tiān dōu qù pǎobù.",
        "Anh ấy hầu như ngày nào cũng đi chạy bộ."
    ),
    ("极", "jí"): (
        "今天的演出好极了！",
        "Jīntiān de yǎnchū hǎo jí le!",
        "Buổi biểu diễn hôm nay hay cực kỳ!"
    ),
    ("记得", "jì de"): (
        "我还记得小时候的事。",
        "Wǒ hái jìde xiǎoshíhou de shì.",
        "Tôi vẫn nhớ chuyện hồi nhỏ."
    ),
    ("季节", "jì jié"): (
        "春天是我最喜欢的季节。",
        "Chūntiān shì wǒ zuì xǐhuan de jìjié.",
        "Mùa xuân là mùa tôi thích nhất."
    ),
    ("检查", "jiǎn chá"): (
        "医生给我检查了身体。",
        "Yīshēng gěi wǒ jiǎnchá le shēntǐ.",
        "Bác sĩ đã kiểm tra sức khỏe cho tôi."
    ),
    ("简单", "jiǎn dān"): (
        "这道题很简单，我会做。",
        "Zhè dào tí hěn jiǎndān, wǒ huì zuò.",
        "Câu hỏi này rất đơn giản, tôi biết làm."
    ),
    ("见面", "jiàn miàn"): (
        "我们明天下午见面吧。",
        "Wǒmen míngtiān xiàwǔ jiànmiàn ba.",
        "Ngày mai chiều chúng ta gặp nhau nhé."
    ),
    ("健康", "jiàn kāng"): (
        "多吃水果对身体健康有好处。",
        "Duō chī shuǐguǒ duì shēntǐ jiànkāng yǒu hǎochu.",
        "Ăn nhiều hoa quả có lợi cho sức khỏe."
    ),
    ("讲", "jiǎng"): (
        "老师正在讲课，请安静。",
        "Lǎoshī zhèngzài jiǎngkè, qǐng ānjìng.",
        "Thầy giáo đang giảng bài, xin hãy im lặng."
    ),
    ("教", "jiāo"): (
        "王老师教我们数学。",
        "Wáng lǎoshī jiāo wǒmen shùxué.",
        "Thầy Vương dạy chúng tôi môn toán."
    ),
    ("脚", "jiǎo"): (
        "走了一天路，我的脚很疼。",
        "Zǒu le yī tiān lù, wǒ de jiǎo hěn téng.",
        "Đi bộ cả ngày, chân tôi rất đau."
    ),
    ("角", "jiǎo"): (
        "这支笔只要五角钱。",
        "Zhè zhī bǐ zhǐ yào wǔ jiǎo qián.",
        "Cây bút này chỉ mất năm hào."
    ),
    ("接", "jiē"): (
        "我去机场接朋友。",
        "Wǒ qù jīchǎng jiē péngyou.",
        "Tôi ra sân bay đón bạn."
    ),
    ("街道", "jiē dào"): (
        "这条街道两边都是商店。",
        "Zhè tiáo jiēdào liǎng biān dōu shì shāngdiàn.",
        "Hai bên con đường này đều là cửa hàng."
    ),
    ("节目", "jié mù"): (
        "晚上我喜欢看电视节目。",
        "Wǎnshang wǒ xǐhuan kàn diànshì jiémù.",
        "Buổi tối tôi thích xem chương trình truyền hình."
    ),
    ("节日", "jié rì"): (
        "春节是中国最重要的节日。",
        "Chūnjié shì Zhōngguó zuì zhòngyào de jiérì.",
        "Tết Nguyên Đán là ngày lễ quan trọng nhất của Trung Quốc."
    ),
    ("结婚", "jié hūn"): (
        "他们计划明年结婚。",
        "Tāmen jìhuà míngnián jiéhūn.",
        "Họ dự định sang năm kết hôn."
    ),
    ("结束", "jié shù"): (
        "会议已经结束了。",
        "Huìyì yǐjīng jiéshù le.",
        "Cuộc họp đã kết thúc rồi."
    ),
    ("解决", "jiě jué"): (
        "这个问题我们一定能解决。",
        "Zhège wèntí wǒmen yīdìng néng jiějué.",
        "Vấn đề này chúng ta nhất định có thể giải quyết."
    ),
    ("借", "jiè"): (
        "我可以借你的词典用一下吗？",
        "Wǒ kěyǐ jiè nǐ de cídiǎn yòng yīxià ma?",
        "Tôi có thể mượn từ điển của bạn dùng một chút không?"
    ),
    ("经常", "jīng cháng"): (
        "我经常去那家咖啡店。",
        "Wǒ jīngcháng qù nà jiā kāfēidiàn.",
        "Tôi thường xuyên đến quán cà phê đó."
    ),
    ("经过", "jīng guò"): (
        "每天上班我都经过这条路。",
        "Měi tiān shàngbān wǒ dōu jīngguò zhè tiáo lù.",
        "Mỗi ngày đi làm tôi đều đi qua con đường này."
    ),
    ("经理", "jīng lǐ"): (
        "我们经理对工作要求很高。",
        "Wǒmen jīnglǐ duì gōngzuò yāoqiú hěn gāo.",
        "Giám đốc chúng tôi yêu cầu rất cao đối với công việc."
    ),
    ("久", "jiǔ"): (
        "好久不见，你最近怎么样？",
        "Hǎojiǔ bújiàn, nǐ zuìjìn zěnmeyàng?",
        "Lâu rồi không gặp, dạo này bạn thế nào?"
    ),
    ("旧", "jiù"): (
        "这件旧衣服我不想穿了。",
        "Zhè jiàn jiù yīfu wǒ bù xiǎng chuān le.",
        "Chiếc áo cũ này tôi không muốn mặc nữa."
    ),
    ("举行", "jǔ xíng"): (
        "学校下周举行运动会。",
        "Xuéxiào xià zhōu jǔxíng yùndònghuì.",
        "Trường tuần sau tổ chức hội thể thao."
    ),
    ("句子", "jù zi"): (
        "请你把这个句子翻译成中文。",
        "Qǐng nǐ bǎ zhège jùzi fānyì chéng Zhōngwén.",
        "Xin bạn hãy dịch câu này sang tiếng Trung."
    ),
    ("决定", "jué dìng"): (
        "她决定明年去中国留学。",
        "Tā juédìng míngnián qù Zhōngguó liúxué.",
        "Cô ấy quyết định sang năm đi du học Trung Quốc."
    ),
    ("渴", "kě"): (
        "运动以后，我非常渴。",
        "Yùndòng yǐhòu, wǒ fēicháng kě.",
        "Sau khi vận động, tôi rất khát."
    ),
    ("可爱", "kě ài"): (
        "这只小猫真可爱！",
        "Zhè zhī xiǎo māo zhēn kě'ài!",
        "Con mèo nhỏ này thật đáng yêu!"
    ),
    ("刻", "kè"): (
        "现在是七点一刻。",
        "Xiànzài shì qī diǎn yī kè.",
        "Bây giờ là bảy giờ mười lăm."
    ),
    ("客人", "kè rén"): (
        "今天家里来了很多客人。",
        "Jīntiān jiā lǐ lái le hěn duō kèrén.",
        "Hôm nay nhà đến rất nhiều khách."
    ),
    ("空调", "kōng tiáo"): (
        "夏天太热了，开空调吧。",
        "Xiàtiān tài rè le, kāi kōngtiáo ba.",
        "Mùa hè quá nóng, bật điều hòa đi."
    ),
    ("口", "kǒu"): (
        "我们家有四口人。",
        "Wǒmen jiā yǒu sì kǒu rén.",
        "Gia đình chúng tôi có bốn người."
    ),
    ("哭", "kū"): (
        "小女孩找不到妈妈，哭了起来。",
        "Xiǎo nǚhái zhǎo bú dào māma, kū le qǐlai.",
        "Bé gái không tìm thấy mẹ, khóc lên."
    ),
    ("裤子", "kù zi"): (
        "我想买一条黑色的裤子。",
        "Wǒ xiǎng mǎi yī tiáo hēisè de kùzi.",
        "Tôi muốn mua một chiếc quần màu đen."
    ),
    ("筷子", "kuài zi"): (
        "你会用筷子吃饭吗？",
        "Nǐ huì yòng kuàizi chīfàn ma?",
        "Bạn biết dùng đũa ăn cơm không?"
    ),
    ("蓝", "lán"): (
        "今天天空特别蓝。",
        "Jīntiān tiānkōng tèbié lán.",
        "Hôm nay bầu trời xanh đặc biệt."
    ),
    ("老", "lǎo"): (
        "这位老人已经九十岁了。",
        "Zhè wèi lǎorén yǐjīng jiǔshí suì le.",
        "Vị cụ già này đã chín mươi tuổi rồi."
    ),
    ("离开", "lí kāi"): (
        "他已经离开北京了。",
        "Tā yǐjīng líkāi Běijīng le.",
        "Anh ấy đã rời Bắc Kinh rồi."
    ),
    ("礼物", "lǐ wù"): (
        "这是我送给你的生日礼物。",
        "Zhè shì wǒ sòng gěi nǐ de shēngrì lǐwù.",
        "Đây là quà sinh nhật tôi tặng bạn."
    ),
    ("历史", "lì shǐ"): (
        "我对中国历史很感兴趣。",
        "Wǒ duì Zhōngguó lìshǐ hěn gǎn xìngqù.",
        "Tôi rất hứng thú với lịch sử Trung Quốc."
    ),
    ("脸", "liǎn"): (
        "她的脸红红的，很好看。",
        "Tā de liǎn hónghóng de, hěn hǎokàn.",
        "Mặt cô ấy đỏ hồng, rất đẹp."
    ),
    ("练习", "liàn xí"): (
        "学外语要多练习说话。",
        "Xué wàiyǔ yào duō liànxí shuōhuà.",
        "Học ngoại ngữ phải luyện nói nhiều."
    ),
    ("辆", "liàng"): (
        "他买了一辆新车。",
        "Tā mǎi le yī liàng xīn chē.",
        "Anh ấy mua một chiếc xe mới."
    ),
    ("了解", "liǎo jiě"): (
        "我想更多地了解中国文化。",
        "Wǒ xiǎng gèng duō de liǎojiě Zhōngguó wénhuà.",
        "Tôi muốn tìm hiểu thêm về văn hóa Trung Quốc."
    ),
    ("邻居", "lín jū"): (
        "我的邻居是一位很好的老人。",
        "Wǒ de línjū shì yī wèi hěn hǎo de lǎorén.",
        "Hàng xóm của tôi là một cụ già rất tốt."
    ),
    ("楼", "lóu"): (
        "我在三楼上班。",
        "Wǒ zài sān lóu shàngbān.",
        "Tôi làm việc ở tầng ba."
    ),
    ("绿", "lǜ"): (
        "春天来了，树叶变绿了。",
        "Chūntiān lái le, shùyè biàn lǜ le.",
        "Mùa xuân đến rồi, lá cây chuyển xanh."
    ),
    ("马", "mǎ"): (
        "草地上有几匹马在吃草。",
        "Cǎodì shang yǒu jǐ pǐ mǎ zài chī cǎo.",
        "Trên đồng cỏ có mấy con ngựa đang ăn cỏ."
    ),
    ("马上", "mǎ shàng"): (
        "你等一下，我马上就来。",
        "Nǐ děng yīxià, wǒ mǎshàng jiù lái.",
        "Bạn đợi một chút, tôi đến ngay."
    ),
    ("满意", "mǎn yì"): (
        "老板对我的工作很满意。",
        "Lǎobǎn duì wǒ de gōngzuò hěn mǎnyì.",
        "Sếp rất hài lòng với công việc của tôi."
    ),
    ("帽子", "mào zi"): (
        "出去晒太阳要戴帽子。",
        "Chūqù shài tàiyáng yào dài màozi.",
        "Ra ngoài nắng phải đội mũ."
    ),
    ("米", "mǐ"): (
        "这条河有五百米长。",
        "Zhè tiáo hé yǒu wǔbǎi mǐ cháng.",
        "Con sông này dài năm trăm mét."
    ),
    ("面包", "miàn bāo"): (
        "早上我吃了两片面包。",
        "Zǎoshang wǒ chī le liǎng piàn miànbāo.",
        "Sáng nay tôi ăn hai lát bánh mì."
    ),
    ("面条", "miàn tiáo"): (
        "中午我们去吃面条吧。",
        "Zhōngwǔ wǒmen qù chī miàntiáo ba.",
        "Trưa nay chúng ta đi ăn mì nhé."
    ),
    ("明白", "míng bai"): (
        "老师讲的话你明白了吗？",
        "Lǎoshī jiǎng de huà nǐ míngbai le ma?",
        "Những gì thầy giáo nói bạn hiểu chưa?"
    ),
    ("拿", "ná"): (
        "请帮我拿一下那个杯子。",
        "Qǐng bāng wǒ ná yīxià nàge bēizi.",
        "Xin giúp tôi lấy cái cốc đó."
    ),
    ("奶奶", "nǎi nai"): (
        "奶奶今年八十岁了，身体还很好。",
        "Nǎinai jīnnián bāshí suì le, shēntǐ hái hěn hǎo.",
        "Bà nội năm nay tám mươi tuổi rồi, sức khỏe vẫn rất tốt."
    ),
    ("南", "nán"): (
        "越南在中国的南边。",
        "Yuènán zài Zhōngguó de nánbian.",
        "Việt Nam ở phía nam Trung Quốc."
    ),
    ("难", "nán"): (
        "这道数学题太难了。",
        "Zhè dào shùxué tí tài nán le.",
        "Bài toán này quá khó."
    ),
    ("难过", "nán guò"): (
        "听到这个坏消息，我很难过。",
        "Tīng dào zhège huài xiāoxi, wǒ hěn nánguò.",
        "Nghe tin xấu này, tôi rất buồn."
    ),
    ("年级", "nián jí"): (
        "我弟弟上小学三年级了。",
        "Wǒ dìdi shàng xiǎoxué sān niánjí le.",
        "Em trai tôi học lớp ba tiểu học rồi."
    ),
    ("年轻", "nián qīng"): (
        "这位老师很年轻，才二十五岁。",
        "Zhè wèi lǎoshī hěn niánqīng, cái èrshíwǔ suì.",
        "Thầy giáo này rất trẻ, mới hai mươi lăm tuổi."
    ),
    ("鸟", "niǎo"): (
        "树上有很多鸟在唱歌。",
        "Shù shang yǒu hěn duō niǎo zài chànggē.",
        "Trên cây có rất nhiều chim đang hót."
    ),
    ("努力", "nǔ lì"): (
        "只要努力学习，就能考上好大学。",
        "Zhǐyào nǔlì xuéxí, jiù néng kǎoshàng hǎo dàxué.",
        "Chỉ cần nỗ lực học tập thì có thể đỗ đại học tốt."
    ),
    ("爬山", "pá shān"): (
        "我们周末一起去爬山吧。",
        "Wǒmen zhōumò yīqǐ qù páshān ba.",
        "Cuối tuần chúng ta cùng đi leo núi nhé."
    ),
    ("盘子", "pán zi"): (
        "请把菜放在盘子里。",
        "Qǐng bǎ cài fàng zài pánzi lǐ.",
        "Xin hãy đặt món ăn vào đĩa."
    ),
    ("胖", "pàng"): (
        "最近吃太多了，我胖了五斤。",
        "Zuìjìn chī tài duō le, wǒ pàng le wǔ jīn.",
        "Gần đây ăn quá nhiều, tôi béo thêm năm cân."
    ),
    ("啤酒", "pí jiǔ"): (
        "夏天喝一杯冰啤酒很舒服。",
        "Xiàtiān hē yī bēi bīng píjiǔ hěn shūfu.",
        "Mùa hè uống một ly bia lạnh rất thích."
    ),
    ("葡萄", "pú tao"): (
        "这里的葡萄又甜又好吃。",
        "Zhèlǐ de pútao yòu tián yòu hǎochī.",
        "Nho ở đây vừa ngọt vừa ngon."
    ),
    ("普通话", "pǔ tōng huà"): (
        "他的普通话说得很标准。",
        "Tā de pǔtōnghuà shuō de hěn biāozhǔn.",
        "Tiếng phổ thông của anh ấy nói rất chuẩn."
    ),
    ("骑", "qí"): (
        "他每天骑自行车上学。",
        "Tā měi tiān qí zìxíngchē shàngxué.",
        "Mỗi ngày anh ấy đạp xe đi học."
    ),
    ("其实", "qí shí"): (
        "这件事其实没有那么难。",
        "Zhè jiàn shì qíshí méiyǒu nàme nán.",
        "Việc này thực ra không khó đến vậy."
    ),
    ("其他", "qí tā"): (
        "除了小明，其他人都到了。",
        "Chúle Xiǎo Míng, qítā rén dōu dào le.",
        "Ngoài Tiểu Minh ra, những người khác đều đến rồi."
    ),
    ("奇怪", "qí guài"): (
        "今天他怎么没来？真奇怪。",
        "Jīntiān tā zěnme méi lái? Zhēn qíguài.",
        "Hôm nay sao anh ấy không đến? Thật kỳ lạ."
    ),
    ("铅笔", "qiān bǐ"): (
        "考试的时候要用铅笔。",
        "Kǎoshì de shíhou yào yòng qiānbǐ.",
        "Khi thi phải dùng bút chì."
    ),
    ("清楚", "qīng chu"): (
        "你说得太快了，我听不清楚。",
        "Nǐ shuō de tài kuài le, wǒ tīng bù qīngchu.",
        "Bạn nói quá nhanh, tôi nghe không rõ."
    ),
    ("秋", "qiū"): (
        "秋天的天气最舒服了。",
        "Qiūtiān de tiānqì zuì shūfu le.",
        "Thời tiết mùa thu thoải mái nhất."
    ),
    ("裙子", "qún zi"): (
        "她穿了一条红色的裙子。",
        "Tā chuān le yī tiáo hóngsè de qúnzi.",
        "Cô ấy mặc một chiếc váy đỏ."
    ),
    ("然后", "rán hòu"): (
        "我先去银行，然后去超市。",
        "Wǒ xiān qù yínháng, ránhòu qù chāoshì.",
        "Tôi đi ngân hàng trước, sau đó đi siêu thị."
    ),
    ("热情", "rè qíng"): (
        "这里的人很热情，对我们很好。",
        "Zhèlǐ de rén hěn rèqíng, duì wǒmen hěn hǎo.",
        "Người ở đây rất nhiệt tình, đối xử với chúng tôi rất tốt."
    ),
    ("认为", "rèn wéi"): (
        "我认为学习语言需要多练习。",
        "Wǒ rènwéi xuéxí yǔyán xūyào duō liànxí.",
        "Tôi cho rằng học ngôn ngữ cần phải luyện tập nhiều."
    ),
    ("认真", "rèn zhēn"): (
        "他学习非常认真。",
        "Tā xuéxí fēicháng rènzhēn.",
        "Anh ấy học tập rất nghiêm túc."
    ),
    ("容易", "róng yì"): (
        "说起来容易做起来难。",
        "Shuō qǐlai róngyì zuò qǐlai nán.",
        "Nói thì dễ nhưng làm thì khó."
    ),
    ("如果", "rú guǒ"): (
        "如果明天不下雨，我们就去爬山。",
        "Rúguǒ míngtiān bú xiàyǔ, wǒmen jiù qù páshān.",
        "Nếu ngày mai không mưa, chúng ta sẽ đi leo núi."
    ),
    ("伞", "sǎn"): (
        "外面下雨了，你带伞了吗？",
        "Wàimiàn xiàyǔ le, nǐ dài sǎn le ma?",
        "Bên ngoài trời mưa rồi, bạn có mang ô không?"
    ),
    ("上网", "shàng wǎng"): (
        "现在的人每天都上网。",
        "Xiànzài de rén měi tiān dōu shàngwǎng.",
        "Người bây giờ ngày nào cũng lên mạng."
    ),
    ("生气", "shēng qì"): (
        "别生气了，都是我的错。",
        "Bié shēngqì le, dōu shì wǒ de cuò.",
        "Đừng giận nữa, đều là lỗi của tôi."
    ),
    ("声音", "shēng yīn"): (
        "请你大声一点，我听不到你的声音。",
        "Qǐng nǐ dàshēng yīdiǎn, wǒ tīng bú dào nǐ de shēngyīn.",
        "Xin bạn nói to hơn, tôi không nghe thấy tiếng bạn."
    ),
    ("使", "shǐ"): (
        "这个消息使大家都很高兴。",
        "Zhège xiāoxi shǐ dàjiā dōu hěn gāoxìng.",
        "Tin này khiến mọi người đều rất vui."
    ),
    ("世界", "shì jiè"): (
        "我想去世界各地旅游。",
        "Wǒ xiǎng qù shìjiè gèdì lǚyóu.",
        "Tôi muốn đi du lịch khắp nơi trên thế giới."
    ),
    ("瘦", "shòu"): (
        "你最近瘦了很多，要多吃点。",
        "Nǐ zuìjìn shòu le hěn duō, yào duō chī diǎn.",
        "Gần đây bạn gầy đi nhiều, phải ăn nhiều hơn."
    ),
    ("舒服", "shū fu"): (
        "这张床睡起来很舒服。",
        "Zhè zhāng chuáng shuì qǐlai hěn shūfu.",
        "Cái giường này ngủ rất thoải mái."
    ),
    ("叔叔", "shū shu"): (
        "叔叔在北京工作。",
        "Shūshu zài Běijīng gōngzuò.",
        "Chú ấy làm việc ở Bắc Kinh."
    ),
    ("树", "shù"): (
        "学校门口有一棵大树。",
        "Xuéxiào ménkǒu yǒu yī kē dà shù.",
        "Trước cổng trường có một cây lớn."
    ),
    ("数学", "shù xué"): (
        "他的数学成绩在班上最好。",
        "Tā de shùxué chéngjì zài bān shang zuì hǎo.",
        "Thành tích toán của anh ấy tốt nhất lớp."
    ),
    ("刷", "shuā"): (
        "每天早上起来要刷牙。",
        "Měi tiān zǎoshang qǐlai yào shuāyá.",
        "Mỗi sáng thức dậy phải đánh răng."
    ),
    ("双", "shuāng"): (
        "我买了一双新运动鞋。",
        "Wǒ mǎi le yī shuāng xīn yùndòngxié.",
        "Tôi mua một đôi giày thể thao mới."
    ),
    ("水平", "shuǐ píng"): (
        "他的中文水平提高了很多。",
        "Tā de Zhōngwén shuǐpíng tígāo le hěn duō.",
        "Trình độ tiếng Trung của anh ấy nâng cao rất nhiều."
    ),
    ("司机", "sī jī"): (
        "出租车司机很熟悉这个城市。",
        "Chūzūchē sījī hěn shúxī zhège chéngshì.",
        "Tài xế taxi rất quen thuộc thành phố này."
    ),
    ("虽然", "suī rán"): (
        "虽然他很忙，但是每天都锻炼。",
        "Suīrán tā hěn máng, dànshì měi tiān dōu duànliàn.",
        "Mặc dù anh ấy rất bận, nhưng mỗi ngày đều tập thể dục."
    ),
    ("太阳", "tài yáng"): (
        "今天太阳很大，要涂防晒霜。",
        "Jīntiān tàiyáng hěn dà, yào tú fángshàishuāng.",
        "Hôm nay nắng to, phải bôi kem chống nắng."
    ),
    ("糖", "táng"): (
        "小孩子不能吃太多糖。",
        "Xiǎo háizi bù néng chī tài duō táng.",
        "Trẻ con không nên ăn quá nhiều kẹo."
    ),
    ("特别", "tè bié"): (
        "她做的饺子特别好吃。",
        "Tā zuò de jiǎozi tèbié hǎochī.",
        "Sủi cảo cô ấy làm đặc biệt ngon."
    ),
    ("疼", "téng"): (
        "我头疼，可能是感冒了。",
        "Wǒ tóu téng, kěnéng shì gǎnmào le.",
        "Tôi đau đầu, có lẽ bị cảm rồi."
    ),
    ("提高", "tí gāo"): (
        "多看中文电影能提高听力。",
        "Duō kàn Zhōngwén diànyǐng néng tígāo tīnglì.",
        "Xem nhiều phim Trung Quốc có thể nâng cao khả năng nghe."
    ),
    ("体育", "tǐ yù"): (
        "我喜欢看体育比赛。",
        "Wǒ xǐhuan kàn tǐyù bǐsài.",
        "Tôi thích xem các trận thi đấu thể thao."
    ),
    ("甜", "tián"): (
        "这个西瓜很甜。",
        "Zhège xīguā hěn tián.",
        "Quả dưa hấu này rất ngọt."
    ),
    ("条", "tiáo"): (
        "桌子上有两条鱼。",
        "Zhuōzi shang yǒu liǎng tiáo yú.",
        "Trên bàn có hai con cá."
    ),
    ("同事", "tóng shì"): (
        "我和同事们关系都很好。",
        "Wǒ hé tóngshìmen guānxi dōu hěn hǎo.",
        "Tôi và các đồng nghiệp quan hệ đều rất tốt."
    ),
    ("同意", "tóng yì"): (
        "我同意你的看法。",
        "Wǒ tóngyì nǐ de kànfǎ.",
        "Tôi đồng ý với quan điểm của bạn."
    ),
    ("头发", "tóu fa"): (
        "她的头发又长又黑。",
        "Tā de tóufa yòu cháng yòu hēi.",
        "Tóc cô ấy vừa dài vừa đen."
    ),
    ("突然", "tū rán"): (
        "我正在走路，突然下起雨来了。",
        "Wǒ zhèngzài zǒulù, tūrán xià qǐ yǔ lái le.",
        "Tôi đang đi bộ thì đột nhiên trời đổ mưa."
    ),
    ("图书馆", "tú shū guǎn"): (
        "我经常去图书馆看书。",
        "Wǒ jīngcháng qù túshūguǎn kànshū.",
        "Tôi thường xuyên đến thư viện đọc sách."
    ),
    ("腿", "tuǐ"): (
        "跑步以后我的腿很酸。",
        "Pǎobù yǐhòu wǒ de tuǐ hěn suān.",
        "Sau khi chạy bộ chân tôi rất mỏi."
    ),
    ("完成", "wán chéng"): (
        "我今天要完成这篇作文。",
        "Wǒ jīntiān yào wánchéng zhè piān zuòwén.",
        "Hôm nay tôi phải hoàn thành bài luận này."
    ),
    ("碗", "wǎn"): (
        "请给我一碗米饭。",
        "Qǐng gěi wǒ yī wǎn mǐfàn.",
        "Xin cho tôi một bát cơm."
    ),
    ("万", "wàn"): (
        "这辆车要十万块钱。",
        "Zhè liàng chē yào shí wàn kuài qián.",
        "Chiếc xe này mất mười vạn tệ."
    ),
    ("忘记", "wàng jì"): (
        "我忘记带钥匙了。",
        "Wǒ wàngjì dài yàoshi le.",
        "Tôi quên mang chìa khóa rồi."
    ),
    ("为了", "wèi le"): (
        "为了学好中文，他去了中国。",
        "Wèile xué hǎo Zhōngwén, tā qù le Zhōngguó.",
        "Để học tốt tiếng Trung, anh ấy đã đến Trung Quốc."
    ),
    ("为什么", "wèi shén me"): (
        "你为什么不早点告诉我？",
        "Nǐ wèi shénme bù zǎo diǎn gàosu wǒ?",
        "Tại sao bạn không nói với tôi sớm hơn?"
    ),
    ("位", "wèi"): (
        "这位老师教了三十年书。",
        "Zhè wèi lǎoshī jiāo le sānshí nián shū.",
        "Vị giáo viên này đã dạy học ba mươi năm."
    ),
    ("文化", "wén huà"): (
        "每个国家都有自己的文化。",
        "Měi ge guójiā dōu yǒu zìjǐ de wénhuà.",
        "Mỗi quốc gia đều có văn hóa riêng của mình."
    ),
    ("西", "xī"): (
        "太阳从西边落下去了。",
        "Tàiyáng cóng xībian luò xiàqu le.",
        "Mặt trời lặn ở phía tây."
    ),
    ("习惯", "xí guàn"): (
        "他已经习惯了早起。",
        "Tā yǐjīng xíguàn le zǎoqǐ.",
        "Anh ấy đã quen với việc dậy sớm."
    ),
    ("洗手间", "xǐ shǒu jiān"): (
        "请问洗手间在哪里？",
        "Qǐngwèn xǐshǒujiān zài nǎlǐ?",
        "Xin hỏi nhà vệ sinh ở đâu?"
    ),
    ("洗澡", "xǐ zǎo"): (
        "运动以后要洗澡。",
        "Yùndòng yǐhòu yào xǐzǎo.",
        "Sau khi vận động phải tắm."
    ),
    ("夏", "xià"): (
        "夏天我喜欢去海边玩。",
        "Xiàtiān wǒ xǐhuan qù hǎibiān wán.",
        "Mùa hè tôi thích đi chơi ở biển."
    ),
    ("先", "xiān"): (
        "你先吃饭，我等一会儿再吃。",
        "Nǐ xiān chīfàn, wǒ děng yīhuǐr zài chī.",
        "Bạn ăn trước đi, tôi lát nữa mới ăn."
    ),
    ("香蕉", "xiāng jiāo"): (
        "猴子最喜欢吃香蕉。",
        "Hóuzi zuì xǐhuan chī xiāngjiāo.",
        "Khỉ thích ăn chuối nhất."
    ),
    ("相同", "xiāng tóng"): (
        "我们的想法完全相同。",
        "Wǒmen de xiǎngfǎ wánquán xiāngtóng.",
        "Suy nghĩ của chúng tôi hoàn toàn giống nhau."
    ),
    ("相信", "xiāng xìn"): (
        "我相信你说的是真的。",
        "Wǒ xiāngxìn nǐ shuō de shì zhēn de.",
        "Tôi tin những gì bạn nói là thật."
    ),
    ("像", "xiàng"): (
        "她长得像她妈妈。",
        "Tā zhǎng de xiàng tā māma.",
        "Cô ấy giống mẹ cô ấy."
    ),
    ("小心", "xiǎo xīn"): (
        "路上车很多，你要小心。",
        "Lù shang chē hěn duō, nǐ yào xiǎoxīn.",
        "Trên đường nhiều xe, bạn phải cẩn thận."
    ),
    ("校长", "xiào zhǎng"): (
        "校长在学校大会上讲了话。",
        "Xiàozhǎng zài xuéxiào dàhuì shang jiǎng le huà.",
        "Hiệu trưởng đã phát biểu tại buổi họp toàn trường."
    ),
    ("鞋", "xié"): (
        "这双鞋穿着很舒服。",
        "Zhè shuāng xié chuān zhe hěn shūfu.",
        "Đôi giày này mang rất thoải mái."
    ),
    ("新闻", "xīn wén"): (
        "你今天看新闻了吗？",
        "Nǐ jīntiān kàn xīnwén le ma?",
        "Hôm nay bạn xem tin tức chưa?"
    ),
    ("新鲜", "xīn xiān"): (
        "这些水果很新鲜。",
        "Zhèxiē shuǐguǒ hěn xīnxiān.",
        "Những hoa quả này rất tươi."
    ),
    ("信", "xìn"): (
        "我给朋友写了一封信。",
        "Wǒ gěi péngyou xiě le yī fēng xìn.",
        "Tôi đã viết một lá thư cho bạn."
    ),
    ("行李箱", "xíng li xiāng"): (
        "我的行李箱太重了，拿不动。",
        "Wǒ de xínglixiāng tài zhòng le, ná bu dòng.",
        "Vali của tôi quá nặng, không xách nổi."
    ),
    ("兴趣", "xìng qù"): (
        "我对中国音乐很有兴趣。",
        "Wǒ duì Zhōngguó yīnyuè hěn yǒu xìngqù.",
        "Tôi rất hứng thú với âm nhạc Trung Quốc."
    ),
    ("熊猫", "xióng māo"): (
        "大熊猫是中国的国宝。",
        "Dà xióngmāo shì Zhōngguó de guóbǎo.",
        "Gấu trúc lớn là quốc bảo của Trung Quốc."
    ),
    ("需要", "xū yào"): (
        "你需要帮忙吗？",
        "Nǐ xūyào bāngmáng ma?",
        "Bạn có cần giúp không?"
    ),
    ("选择", "xuǎn zé"): (
        "你可以选择自己喜欢的课。",
        "Nǐ kěyǐ xuǎnzé zìjǐ xǐhuan de kè.",
        "Bạn có thể chọn môn học mình thích."
    ),
    ("眼镜", "yǎn jìng"): (
        "爷爷看书的时候要戴眼镜。",
        "Yéye kànshū de shíhou yào dài yǎnjìng.",
        "Ông nội đọc sách phải đeo kính."
    ),
    ("要求", "yāo qiú"): (
        "老师要求我们每天写日记。",
        "Lǎoshī yāoqiú wǒmen měi tiān xiě rìjì.",
        "Thầy giáo yêu cầu chúng tôi mỗi ngày viết nhật ký."
    ),
    ("爷爷", "yé ye"): (
        "爷爷喜欢在公园下棋。",
        "Yéye xǐhuan zài gōngyuán xiàqí.",
        "Ông nội thích đánh cờ ở công viên."
    ),
    ("一定", "yī dìng"): (
        "明天的考试你一定能通过。",
        "Míngtiān de kǎoshì nǐ yīdìng néng tōngguò.",
        "Bài thi ngày mai bạn nhất định có thể đỗ."
    ),
    ("一共", "yī gòng"): (
        "这些东西一共多少钱？",
        "Zhèxiē dōngxi yīgòng duōshao qián?",
        "Những đồ này tổng cộng bao nhiêu tiền?"
    ),
    ("一会儿", "yī huì r"): (
        "你等一会儿，我去去就回来。",
        "Nǐ děng yīhuǐr, wǒ qùqu jiù huílai.",
        "Bạn đợi một lát, tôi đi rồi về ngay."
    ),
    ("一样", "yī yàng"): (
        "你的手机跟我的一样。",
        "Nǐ de shǒujī gēn wǒ de yīyàng.",
        "Điện thoại của bạn giống của tôi."
    ),
    ("以后", "yǐ hòu"): (
        "毕业以后我想去北京工作。",
        "Bìyè yǐhòu wǒ xiǎng qù Běijīng gōngzuò.",
        "Sau khi tốt nghiệp tôi muốn đến Bắc Kinh làm việc."
    ),
    ("以前", "yǐ qián"): (
        "以前我不会说中文。",
        "Yǐqián wǒ bú huì shuō Zhōngwén.",
        "Trước đây tôi không biết nói tiếng Trung."
    ),
    ("以为", "yǐ wéi"): (
        "我以为今天不上课，结果来晚了。",
        "Wǒ yǐwéi jīntiān bú shàngkè, jiéguǒ lái wǎn le.",
        "Tôi tưởng hôm nay không có lớp, kết quả đến muộn."
    ),
    ("一般", "yī bān"): (
        "我一般七点起床。",
        "Wǒ yībān qī diǎn qǐchuáng.",
        "Tôi thường dậy lúc bảy giờ."
    ),
    ("一边", "yī biān"): (
        "他一边吃饭一边看电视。",
        "Tā yībiān chīfàn yībiān kàn diànshì.",
        "Anh ấy vừa ăn cơm vừa xem ti vi."
    ),
    ("一直", "yī zhí"): (
        "从这里一直走就能到地铁站。",
        "Cóng zhèlǐ yīzhí zǒu jiù néng dào dìtiězhàn.",
        "Từ đây đi thẳng là đến ga tàu điện ngầm."
    ),
    ("音乐", "yīn yuè"): (
        "我喜欢听音乐放松自己。",
        "Wǒ xǐhuan tīng yīnyuè fàngsōng zìjǐ.",
        "Tôi thích nghe nhạc để thư giãn."
    ),
    ("银行", "yín háng"): (
        "我要去银行取一些钱。",
        "Wǒ yào qù yínháng qǔ yīxiē qián.",
        "Tôi phải đến ngân hàng rút một ít tiền."
    ),
    ("应该", "yīng gāi"): (
        "你应该多喝水，少喝饮料。",
        "Nǐ yīnggāi duō hē shuǐ, shǎo hē yǐnliào.",
        "Bạn nên uống nhiều nước, ít uống nước ngọt."
    ),
    ("影响", "yǐng xiǎng"): (
        "手机对学习有很大的影响。",
        "Shǒujī duì xuéxí yǒu hěn dà de yǐngxiǎng.",
        "Điện thoại có ảnh hưởng rất lớn đến việc học."
    ),
    ("用", "yòng"): (
        "我可以用你的电脑吗？",
        "Wǒ kěyǐ yòng nǐ de diànnǎo ma?",
        "Tôi có thể dùng máy tính của bạn không?"
    ),
    ("游戏", "yóu xì"): (
        "孩子们在外面玩游戏。",
        "Háizimen zài wàimiàn wán yóuxì.",
        "Các em nhỏ đang chơi trò chơi ở ngoài."
    ),
    ("有名", "yǒu míng"): (
        "长城是世界上最有名的建筑之一。",
        "Chángchéng shì shìjiè shang zuì yǒumíng de jiànzhù zhī yī.",
        "Vạn Lý Trường Thành là một trong những công trình nổi tiếng nhất thế giới."
    ),
    ("又", "yòu"): (
        "他又迟到了，老师很生气。",
        "Tā yòu chídào le, lǎoshī hěn shēngqì.",
        "Anh ấy lại đến muộn, thầy giáo rất giận."
    ),
    ("遇到", "yù dào"): (
        "今天在路上遇到了一个老朋友。",
        "Jīntiān zài lù shang yùdào le yī ge lǎo péngyou.",
        "Hôm nay trên đường tôi gặp một người bạn cũ."
    ),
    ("愿意", "yuàn yì"): (
        "我愿意帮你学中文。",
        "Wǒ yuànyì bāng nǐ xué Zhōngwén.",
        "Tôi sẵn lòng giúp bạn học tiếng Trung."
    ),
    ("越", "yuè"): (
        "中文越学越有意思。",
        "Zhōngwén yuè xué yuè yǒu yìsi.",
        "Tiếng Trung càng học càng thú vị."
    ),
    ("月亮", "yuè liang"): (
        "今天晚上的月亮又大又圆。",
        "Jīntiān wǎnshang de yuèliang yòu dà yòu yuán.",
        "Mặt trăng tối nay vừa to vừa tròn."
    ),
    ("云", "yún"): (
        "天上的白云像棉花一样。",
        "Tiān shang de bái yún xiàng miánhua yīyàng.",
        "Mây trắng trên trời như bông gòn."
    ),
    ("站", "zhàn"): (
        "下一站就是我们要下车的地方。",
        "Xià yī zhàn jiù shì wǒmen yào xiàchē de dìfang.",
        "Trạm tiếp theo chính là nơi chúng ta xuống xe."
    ),
    ("着急", "zháo jí"): (
        "别着急，慢慢来。",
        "Bié zháojí, mànmàn lái.",
        "Đừng lo lắng, từ từ thôi."
    ),
    ("照顾", "zhào gu"): (
        "她在家照顾生病的妈妈。",
        "Tā zài jiā zhàogu shēngbìng de māma.",
        "Cô ấy ở nhà chăm sóc mẹ bị bệnh."
    ),
    ("照片", "zhào piàn"): (
        "这张照片拍得很好看。",
        "Zhè zhāng zhàopiàn pāi de hěn hǎokàn.",
        "Bức ảnh này chụp rất đẹp."
    ),
    ("照相机", "zhào xiàng jī"): (
        "旅游的时候别忘了带照相机。",
        "Lǚyóu de shíhou bié wàng le dài zhàoxiàngjī.",
        "Khi đi du lịch đừng quên mang máy ảnh."
    ),
    ("只", "zhī"): (
        "我养了一只小狗。",
        "Wǒ yǎng le yī zhī xiǎo gǒu.",
        "Tôi nuôi một con chó nhỏ."
    ),
    ("只", "zhǐ"): (
        "他只吃了一碗饭就不吃了。",
        "Tā zhǐ chī le yī wǎn fàn jiù bù chī le.",
        "Anh ấy chỉ ăn một bát cơm rồi không ăn nữa."
    ),
    ("终于", "zhōng yú"): (
        "经过努力，他终于通过了考试。",
        "Jīngguò nǔlì, tā zhōngyú tōngguò le kǎoshì.",
        "Sau nỗ lực, cuối cùng anh ấy cũng đỗ kỳ thi."
    ),
    ("中间", "zhōng jiān"): (
        "学校在银行和超市中间。",
        "Xuéxiào zài yínháng hé chāoshì zhōngjiān.",
        "Trường học ở giữa ngân hàng và siêu thị."
    ),
    ("种", "zhǒng"): (
        "这种水果我没吃过。",
        "Zhè zhǒng shuǐguǒ wǒ méi chī guo.",
        "Loại hoa quả này tôi chưa ăn bao giờ."
    ),
    ("重要", "zhòng yào"): (
        "身体健康是最重要的。",
        "Shēntǐ jiànkāng shì zuì zhòngyào de.",
        "Sức khỏe là quan trọng nhất."
    ),
    ("周末", "zhōu mò"): (
        "周末你有什么安排？",
        "Zhōumò nǐ yǒu shénme ānpái?",
        "Cuối tuần bạn có kế hoạch gì?"
    ),
    ("主要", "zhǔ yào"): (
        "这次旅游主要是去看风景。",
        "Zhè cì lǚyóu zhǔyào shì qù kàn fēngjǐng.",
        "Chuyến du lịch lần này chủ yếu là đi ngắm phong cảnh."
    ),
    ("祝", "zhù"): (
        "祝你生日快乐！",
        "Zhù nǐ shēngrì kuàilè!",
        "Chúc bạn sinh nhật vui vẻ!"
    ),
    ("注意", "zhù yì"): (
        "过马路要注意安全。",
        "Guò mǎlù yào zhùyì ānquán.",
        "Qua đường phải chú ý an toàn."
    ),
    ("字典", "zì diǎn"): (
        "不认识的字可以查字典。",
        "Bú rènshi de zì kěyǐ chá zìdiǎn.",
        "Chữ không biết có thể tra từ điển."
    ),
    ("自己", "zì jǐ"): (
        "这件事你要自己决定。",
        "Zhè jiàn shì nǐ yào zìjǐ juédìng.",
        "Việc này bạn phải tự mình quyết định."
    ),
    ("总是", "zǒng shì"): (
        "他总是第一个到教室。",
        "Tā zǒngshì dì yī ge dào jiàoshì.",
        "Anh ấy luôn luôn là người đầu tiên đến lớp."
    ),
    ("最近", "zuì jìn"): (
        "最近工作很忙，没有时间休息。",
        "Zuìjìn gōngzuò hěn máng, méiyǒu shíjiān xiūxi.",
        "Gần đây công việc rất bận, không có thời gian nghỉ ngơi."
    ),
    ("作业", "zuò yè"): (
        "老师每天都布置很多作业。",
        "Lǎoshī měi tiān dōu bùzhì hěn duō zuòyè.",
        "Thầy giáo mỗi ngày đều giao rất nhiều bài tập."
    ),
    ("作用", "zuò yòng"): (
        "运动对身体有很大的作用。",
        "Yùndòng duì shēntǐ yǒu hěn dà de zuòyòng.",
        "Vận động có tác dụng rất lớn đối với cơ thể."
    ),
}

# Apply updates
updated_count = 0
for item in data:
    key = (item["chinese_word"], item["pinyin"])
    if key in examples:
        sent, pin, mean = examples[key]
        item["example_sentence"] = sent
        item["example_pinyin"] = pin
        item["example_meaning"] = mean
        updated_count += 1
    else:
        print(f"WARNING: No example found for {item['chinese_word']} ({item['pinyin']})")

print(f"Total items: {len(data)}, Updated: {updated_count}")

# Write back
with open(input_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done! File written successfully.")
