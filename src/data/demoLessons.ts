import type { Lesson, Vocabulary } from '@/types';
import type { SubtitleLine } from '@/types';

interface ParsedLesson {
  lesson: Omit<Lesson, 'id' | 'session_id' | 'created_at'>;
  vocabulary: Omit<Vocabulary, 'id' | 'lesson_id' | 'session_id' | 'created_at'>[];
}

interface WordEntry {
  hangul: string;
  romanization: string;
  translation: string;
  partOfSpeech: string;
}

const wordDictionary: Record<string, WordEntry> = {
  '안녕하세요': { hangul: '안녕하세요', romanization: 'annyeonghaseyo', translation: 'hello', partOfSpeech: 'interjection' },
  '만나서': { hangul: '만나서', romanization: 'mannaseo', translation: 'because we meet', partOfSpeech: 'particle+verb' },
  '반갑습니다': { hangul: '반갑습니다', romanization: 'bangapseumnida', translation: 'pleased to meet you', partOfSpeech: 'adjective' },
  '이름이': { hangul: '이름', romanization: 'ireum', translation: 'name', partOfSpeech: 'noun' },
  '뭐예요': { hangul: '뭐', romanization: 'mwo', translation: 'what', partOfSpeech: 'pronoun' },
  '저는': { hangul: '저', romanization: 'jeo', translation: 'I (humble)', partOfSpeech: 'pronoun' },
  '서리준입니다': { hangul: '세리', romanization: 'seri', translation: 'Se-ri (name)', partOfSpeech: 'noun' },
  '한국에서': { hangul: '한국', romanization: 'hanguk', translation: 'Korea', partOfSpeech: 'noun' },
  '왔어요': { hangul: '오다', romanization: 'oda', translation: 'to come', partOfSpeech: 'verb' },
  '정말': { hangul: '정말', romanization: 'jeongmal', translation: 'really, truly', partOfSpeech: 'adverb' },
  '감사합니다': { hangul: '감사하다', romanization: 'gamsahada', translation: 'to thank', partOfSpeech: 'verb' },
  '도와주셔서': { hangul: '돕다', romanization: 'dopda', translation: 'to help', partOfSpeech: 'verb' },
  '고마워요': { hangul: '고맙다', romanization: 'gomapda', translation: 'to be thankful', partOfSpeech: 'adjective' },
  '여기가': { hangul: '여기', romanization: 'yeogi', translation: 'here', partOfSpeech: 'pronoun' },
  '어디예요': { hangul: '어디', romanization: 'eodi', translation: 'where', partOfSpeech: 'pronoun' },
  '길을': { hangul: '길', romanization: 'gil', translation: 'road, way', partOfSpeech: 'noun' },
  '잃었어요': { hangul: '잃다', romanization: 'ilda', translation: 'to lose', partOfSpeech: 'verb' },
  '조금만': { hangul: '조금', romanization: 'jogeum', translation: 'a little', partOfSpeech: 'adverb' },
  '기다려': { hangul: '기다리다', romanization: 'gidarida', translation: 'to wait', partOfSpeech: 'verb' },
  '주세요': { hangul: '주다', romanization: 'juda', translation: 'to give', partOfSpeech: 'verb' },
  '곧': { hangul: '곧', romanization: 'got', translation: 'soon', partOfSpeech: 'adverb' },
  '돌아올게요': { hangul: '돌아오다', romanization: 'doraoda', translation: 'to return', partOfSpeech: 'verb' },
  '배가고파요': { hangul: '배', romanization: 'bae', translation: 'stomach', partOfSpeech: 'noun' },
  '고프다': { hangul: '고프다', romanization: 'gopda', translation: 'to be hungry', partOfSpeech: 'adjective' },
  '밥': { hangul: '밥', romanization: 'bap', translation: 'meal, rice', partOfSpeech: 'noun' },
  '먹었어요': { hangul: '먹다', romanization: 'meokda', translation: 'to eat', partOfSpeech: 'verb' },
  '사랑해요': { hangul: '사랑하다', romanization: 'saranghada', translation: 'to love', partOfSpeech: 'verb' },
  '항상': { hangul: '항상', romanization: 'hangsang', translation: 'always', partOfSpeech: 'adverb' },
  '함께할게요': { hangul: '함께', romanization: 'hamkke', translation: 'together', partOfSpeech: 'adverb' },
  '죄송합니다': { hangul: '죄송하다', romanization: 'joesonghada', translation: 'to be sorry (formal)', partOfSpeech: 'adjective' },
  '늦어서': { hangul: '늦다', romanization: 'neutda', translation: 'to be late', partOfSpeech: 'adjective' },
  '미안해요': { hangul: '미안하다', romanization: 'mianhada', translation: 'to be sorry', partOfSpeech: 'adjective' },
  '그게': { hangul: '그것', romanization: 'geugeot', translation: 'that thing', partOfSpeech: 'pronoun' },
  '무슨': { hangul: '무슨', romanization: 'museun', translation: 'what kind of', partOfSpeech: 'determiner' },
  '뜻이에요': { hangul: '뜻', romanization: 'tteut', translation: 'meaning', partOfSpeech: 'noun' },
  '이해': { hangul: '이해하다', romanization: 'ihaehada', translation: 'to understand', partOfSpeech: 'verb' },
  '못': { hangul: '못', romanization: 'mot', translation: 'cannot', partOfSpeech: 'adverb' },
  '했어요': { hangul: '하다', romanization: 'hada', translation: 'to do', partOfSpeech: 'verb' },
  '오늘': { hangul: '오늘', romanization: 'oneul', translation: 'today', partOfSpeech: 'noun' },
  '날씨가': { hangul: '날씨', romanization: 'nalssi', translation: 'weather', partOfSpeech: 'noun' },
  '좋네요': { hangul: '좋다', romanization: 'jota', translation: 'to be good', partOfSpeech: 'adjective' },
  '산책할까요': { hangul: '산책', romanization: 'sanchaek', translation: 'walk, stroll', partOfSpeech: 'noun' },
  '시간이': { hangul: '시간', romanization: 'sigan', translation: 'time', partOfSpeech: 'noun' },
  '없어요': { hangul: '없다', romanization: 'eopda', translation: 'to not have', partOfSpeech: 'adjective' },
  '빨리': { hangul: '빨리', romanization: 'ppalli', translation: 'quickly', partOfSpeech: 'adverb' },
  '가야': { hangul: '가다', romanization: 'gada', translation: 'to go', partOfSpeech: 'verb' },
  '돼요': { hangul: '되다', romanization: 'doeda', translation: 'to become', partOfSpeech: 'verb' },
  '맛있어요': { hangul: '맛있다', romanization: 'masitda', translation: 'to be delicious', partOfSpeech: 'adjective' },
  '잘': { hangul: '잘', romanization: 'jal', translation: 'well', partOfSpeech: 'adverb' },
  '걱정하지': { hangul: '걱정하다', romanization: 'geokjeonghada', translation: 'to worry', partOfSpeech: 'verb' },
  '마세요': { hangul: '말다', romanization: 'malda', translation: 'to not do', partOfSpeech: 'verb' },
  '괜찮을': { hangul: '괜찮다', romanization: 'gwaenchanta', translation: 'to be okay', partOfSpeech: 'adjective' },
  '거예요': { hangul: '것', romanization: 'geot', translation: 'thing (future tense)', partOfSpeech: 'particle' },
  '다시': { hangul: '다시', romanization: 'dasi', translation: 'again', partOfSpeech: 'adverb' },
  '반가워요': { hangul: '반갑다', romanization: 'bangapda', translation: 'to be glad', partOfSpeech: 'adjective' },
  '지냈어요': { hangul: '지내다', romanization: 'jinaeda', translation: 'to live, spend time', partOfSpeech: 'verb' },
  '이게': { hangul: '이것', romanization: 'igeot', translation: 'this thing', partOfSpeech: 'pronoun' },
  '진짜예요': { hangul: '진짜', romanization: 'jinjja', translation: 'real, genuine', partOfSpeech: 'noun' },
  '믿을': { hangul: '믿다', romanization: 'mitda', translation: 'to believe', partOfSpeech: 'verb' },
  '수': { hangul: '수', romanization: 'su', translation: 'ability, possibility', partOfSpeech: 'noun' },
  '안녕': { hangul: '안녕', romanization: 'annyeong', translation: 'hi (casual)', partOfSpeech: 'interjection' },
  '오랜만이야': { hangul: '오랜만', romanization: 'oraenman', translation: 'long time no see', partOfSpeech: 'noun' },
  '나': { hangul: '나', romanization: 'na', translation: 'I (casual)', partOfSpeech: 'pronoun' },
  '내일': { hangul: '내일', romanization: 'naeil', translation: 'tomorrow', partOfSpeech: 'noun' },
  '가게를': { hangul: '가게', romanization: 'gage', translation: 'shop, store', partOfSpeech: 'noun' },
  '열': { hangul: '열다', romanization: 'yeolda', translation: 'to open', partOfSpeech: 'verb' },
  '거야': { hangul: '것', romanization: 'geot', translation: 'will (casual future)', partOfSpeech: 'particle' },
  '도와줄': { hangul: '돕다', romanization: 'dopda', translation: 'to help', partOfSpeech: 'verb' },
  '있어': { hangul: '있다', romanization: 'itda', translation: 'to have, exist', partOfSpeech: 'adjective' },
  '힘들어도': { hangul: '힘들다', romanization: 'himdeulda', translation: 'to be difficult', partOfSpeech: 'adjective' },
  '포기하지': { hangul: '포기하다', romanization: 'pogihada', translation: 'to give up', partOfSpeech: 'verb' },
  '마': { hangul: '말다', romanization: 'malda', translation: 'do not', partOfSpeech: 'verb' },
  '넌': { hangul: '너', romanization: 'neo', translation: 'you (casual)', partOfSpeech: 'pronoun' },
  '할': { hangul: '하다', romanization: 'hada', translation: 'to do', partOfSpeech: 'verb' },
  '이': { hangul: '이', romanization: 'i', translation: 'this', partOfSpeech: 'determiner' },
  '음식': { hangul: '음식', romanization: 'eumsik', translation: 'food', partOfSpeech: 'noun' },
  '맛있어': { hangul: '맛있다', romanization: 'masitda', translation: 'delicious', partOfSpeech: 'adjective' },
  '미안해': { hangul: '미안하다', romanization: 'mianhada', translation: 'sorry (casual)', partOfSpeech: 'adjective' },
  '내가': { hangul: '내', romanization: 'nae', translation: 'I (casual subject)', partOfSpeech: 'pronoun' },
  '잘못했어': { hangul: '잘못하다', romanization: 'jalmotada', translation: 'to make a mistake', partOfSpeech: 'verb' },
  '꿈을': { hangul: '꿈', romanization: 'kkum', translation: 'dream', partOfSpeech: 'noun' },
  '향해': { hangul: '향하다', romanization: 'hyanghada', translation: 'to head toward', partOfSpeech: 'verb' },
  '달려가자': { hangul: '달려가다', romanization: 'dallyeogada', translation: 'to run toward', partOfSpeech: 'verb' },
  '우리': { hangul: '우리', romanization: 'uri', translation: 'we, us', partOfSpeech: 'pronoun' },
  '같이': { hangul: '같이', romanization: 'gachi', translation: 'together', partOfSpeech: 'adverb' },
  '하자': { hangul: '하다', romanization: 'hada', translation: 'let\'s do', partOfSpeech: 'verb' },
};

const romanizationMap: { [key: string]: string } = {
  '안녕하세요. 만나서 반갑습니다.': 'annyeonghaseyo. mannaseo bangapseumnida.',
  '이름이 뭐예요?': 'ireumi mwoyeyo?',
  '저는 서리준입니다. 한국에서 왔어요.': 'jeoneun serijunimnida. hangukeseo wasseoyo.',
  '정말 감사합니다. 도와주셔서 고마워요.': 'jeongmal gamsahamnida. dowajusyeoseo gomawoyo.',
  '여기가 어디예요? 길을 잃었어요.': 'yeogiga eodiyeyo? gireul irasseoyo.',
  '조금만 기다려 주세요. 곧 돌아올게요.': 'jogeumman gidaryeo juseyo. got doraolgeyo.',
  '배가고파요. 밥 먹었어요?': 'baegagopayo. bap meogeosseoyo?',
  '사랑해요. 항상 함께할게요.': 'saranghaeyo. hangsang hamkkehalgeyo.',
  '죄송합니다. 늦어서 미안해요.': 'joesonghamnida. neujeoseo mianhaeyo.',
  '그게 무슨 뜻이에요? 이해 못 했어요.': 'geuge museun tteusieyo? ihae mot haesseoyo.',
  '오늘 날씨가 정말 좋네요. 산책할까요?': 'oneul nalssiga jeongmal jonneyo. sanchaekhalkkayo?',
  '시간이 없어요. 빨리 가야 돼요.': 'sigani eopseoyo. ppalli gaya dwaeyo.',
  '맛있어요! 정말 잘 먹었어요.': 'masisseoyo! jeongmal jal meogeosseoyo.',
  '걱정하지 마세요. 괜찮을 거예요.': 'geokjeonghaji maseyo. gwaenchaneul geoyeyo.',
  '다시 만나서 반가워요. 잘 지냈어요?': 'dasi mannaseo bangawoyo. jal jinaesseoyo?',
  '이게 진짜예요? 믿을 수 없어요.': 'ige jinjjayeyo? mideul su eopseoyo.',
  '안녕! 오랜만이야. 잘 지냈어?': 'annyeong! oraenmaniya. jal jinaesseo?',
  '나 내일 가게를 열 거야. 도와줄 수 있어?': 'na naeil gagereul yeol geoya. dowajul su isseo?',
  '힘들어도 포기하지 마. 넌 할 수 있어.': 'himdeureodo pogihaji ma. neon hal su isseo.',
  '이 음식 정말 맛있어! 뭐예요?': 'i eumsik jeongmal masisseo! mwoyeyo?',
  '미안해. 내가 잘못했어.': 'mianhae. naega jalmothaesseo.',
  '꿈을 향해 달려가자. 우리 같이 하자.': 'kkumeul hyanghae dallyeogaja. uri gachi haja.',
};

const translationMap: { [key: string]: string } = {
  '안녕하세요. 만나서 반갑습니다.': 'Hello. Pleased to meet you.',
  '이름이 뭐예요?': 'What is your name?',
  '저는 서리준입니다. 한국에서 왔어요.': 'I am Se-ri. I came from Korea.',
  '정말 감사합니다. 도와주셔서 고마워요.': 'Thank you so much. I appreciate your help.',
  '여기가 어디예요? 길을 잃었어요.': 'Where is this? I lost my way.',
  '조금만 기다려 주세요. 곧 돌아올게요.': 'Please wait a moment. I will be back soon.',
  '배가고파요. 밥 먹었어요?': 'I am hungry. Have you eaten?',
  '사랑해요. 항상 함께할게요.': 'I love you. I will always be with you.',
  '죄송합니다. 늦어서 미안해요.': 'I am sorry. I apologize for being late.',
  '그게 무슨 뜻이에요? 이해 못 했어요.': 'What does that mean? I could not understand.',
  '오늘 날씨가 정말 좋네요. 산책할까요?': 'The weather is really nice today. Shall we take a walk?',
  '시간이 없어요. 빨리 가야 돼요.': 'There is no time. I have to go quickly.',
  '맛있어요! 정말 잘 먹었어요.': 'It is delicious! I ate very well.',
  '걱정하지 마세요. 괜찮을 거예요.': 'Do not worry. Everything will be fine.',
  '다시 만나서 반가워요. 잘 지냈어요?': 'Nice to see you again. Have you been well?',
  '이게 진짜예요? 믿을 수 없어요.': 'Is this real? I cannot believe it.',
  '안녕! 오랜만이야. 잘 지냈어?': 'Hi! Long time no see. Have you been well?',
  '나 내일 가게를 열 거야. 도와줄 수 있어?': 'I am opening a shop tomorrow. Can you help?',
  '힘들어도 포기하지 마. 넌 할 수 있어.': 'Even if it is hard, do not give up. You can do it.',
  '이 음식 정말 맛있어! 뭐예요?': 'This food is really delicious! What is it?',
  '미안해. 내가 잘못했어.': 'Sorry. I was wrong.',
  '꿈을 향해 달려가자. 우리 같이 하자.': 'Let us run toward our dreams. Let us do it together.',
};

const politenessMap: { [key: string]: string } = {
  '안녕하세요. 만나서 반갑습니다.': '합쇼체 (formal) + 해요체 (polite)',
  '이름이 뭐예요?': '해요체 (polite)',
  '저는 서리준입니다. 한국에서 왔어요.': '합쇼체 (formal) + 해요체 (polite)',
  '정말 감사합니다. 도와주셔서 고마워요.': '합쇼체 (formal) + 해요체 (polite)',
  '여기가 어디예요? 길을 잃었어요.': '해요체 (polite)',
  '조금만 기다려 주세요. 곧 돌아올게요.': '해요체 (polite)',
  '배가고파요. 밥 먹었어요?': '해요체 (polite)',
  '사랑해요. 항상 함께할게요.': '해요체 (polite)',
  '죄송합니다. 늦어서 미안해요.': '합쇼체 (formal) + 해요체 (polite)',
  '그게 무슨 뜻이에요? 이해 못 했어요.': '해요체 (polite)',
  '오늘 날씨가 정말 좋네요. 산책할까요?': '해요체 (polite)',
  '시간이 없어요. 빨리 가야 돼요.': '해요체 (polite)',
  '맛있어요! 정말 잘 먹었어요.': '해요체 (polite)',
  '걱정하지 마세요. 괜찮을 거예요.': '해요체 (polite)',
  '다시 만나서 반가워요. 잘 지냈어요?': '해요체 (polite)',
  '이게 진짜예요? 믿을 수 없어요.': '해요체 (polite)',
  '안녕! 오랜만이야. 잘 지냈어?': '해체 (casual/intimate)',
  '나 내일 가게를 열 거야. 도와줄 수 있어?': '해체 (casual/intimate)',
  '힘들어도 포기하지 마. 넌 할 수 있어.': '해체 (casual/intimate)',
  '이 음식 정말 맛있어! 뭐예요?': '해체 (casual/intimate)',
  '미안해. 내가 잘못했어.': '해체 (casual/intimate)',
  '꿈을 향해 달려가자. 우리 같이 하자.': '해체 (casual) — propositive',
};

const grammarNotes: { [key: string]: string } = {
  '안녕하세요. 만나서 반갑습니다.': '만나서 반갑습니다 is a set greeting phrase. -서 means "because" — literally "because we meet, I am glad." 합쇼체 (습니다) is the most formal speech level.',
  '이름이 뭐예요?': '이름 + 이 (subject particle for consonant-ending nouns) + 뭐 (what) + -예요 (polite copula "is").',
  '저는 서리준입니다. 한국에서 왔어요.': '저는 = "I" (humble) + topic marker 는. -입니다 is the formal copula. -에서 marks the origin/place of an action: "from Korea." -았/었어요 is the polite past tense ending.',
  '정말 감사합니다. 도와주셔서 고마워요.': '도와주셔서 breaks down as 돕다 (to help) + -아/어 주다 (to do as a favor) + -시 (honorific) + -어서 (because). Two thank-yous are common in Korean — one formal (감사합니다), one polite-soft (고마워요).',
  '여기가 어디예요? 길을 잃었어요.': '여기 (here) + 가 (subject). 어디 (where) + -예요 (is). 길 (road/way) + 을 (object particle). 잃다 (to lose) + -었어요 (past tense, polite).',
  '조금만 기다려 주세요. 곧 돌아올게요.': '-만 means "only" — 조금만 = "just a little." -아/어 주세요 = polite request "please do X for me." -(으)ㄹ게요 = speaker\'s intention/promise "I will."',
  '배가고파요. 밥 먹었어요?': '배 (stomach) + 가 (subject). 고프다 (to be hungry) + -아/어요 (polite). 밥 (meal/rice) + 먹다 (to eat) + -었어요 (past polite). Asking "have you eaten?" is a common Korean greeting.',
  '사랑해요. 항상 함께할게요.': '사랑하다 (to love) + -해요 (polite). 항상 (always). 함께 (together) + 하다 (to do) + -ㄹ게요 (intention).',
  '죄송합니다. 늦어서 미안해요.': '죄송하다 is the most formal apology. 늦다 (to be late) + -어서 (because/reason). 미안하다 (to be sorry) + -해요 (polite).',
  '그게 무슨 뜻이에요? 이해 못 했어요.': '그것 (that) + 이 (subject, contracted to 게). 무슨 (what kind of). 뜻 (meaning) + -이에요 (is). 이해하다 (to understand) + 못 (cannot) + 하다 + -었어요.',
  '오늘 날씨가 정말 좋네요. 산책할까요?': '좋다 (to be good) + -네요 (exclamatory/surprise ending). 산책 (stroll) + 하다 + -을까요 = "shall we?" propositive.',
  '시간이 없어요. 빨리 가야 돼요.': '없다 (to not have) + -어요 (polite). -아/어야 되다 = "have to / must" (obligation). 가다 + -아야 돼요 = "must go."',
  '맛있어요! 정말 잘 먹었어요.': '맛 (taste) + 있다 (to exist) = "delicious." 잘 먹었어요 is a standard polite phrase said after meals: "I ate well."',
  '걱정하지 마세요. 괜찮을 거예요.': '걱정하다 (to worry) + -지 마세요 (do not, polite command). 괜찮다 (to be okay) + -(으)ㄹ 거예요 = future/conjecture "will be."',
  '다시 만나서 반가워요. 잘 지냈어요?': '다시 (again) + 만나다 (to meet) + -아/어서 (because). 반갑다 (to be glad) + -아/어요. 지내다 (to live/spend time) + -었어요 (past polite).',
  '이게 진짜예요? 믿을 수 없어요.': '이것 + 이 → 이게. 진짜 (real) + -예요 (is). 믿다 (to believe) + -(으)ㄹ 수 있다/없다 = "can/cannot."',
  '안녕! 오랜만이야. 잘 지냈어?': '안녕 is casual hi (drop -하세요). 오랜만 = "long time" + -이야 (casual copula). -어? is a casual question ending (해체).',
  '나 내일 가게를 열 거야. 도와줄 수 있어?': '나 (I, casual) + 내일 (tomorrow). 가게 (shop) + 를 (object). 열다 (to open) + -ㄹ 거야 (casual future). 돕다 → 도와주다 (to help as a favor) + -ㄹ 수 있어 (can).',
  '힘들어도 포기하지 마. 넌 할 수 있어.': '힘들다 (to be hard) + -아/어도 = "even if." 포기하다 (to give up) + -지 마 (casual negative command). 너 + 는 → 넌 (you, topic).',
  '이 음식 정말 맛있어! 뭐예요?': '이 (this) + 음식 (food). 맛있다 → 맛있어 (casual). 뭐 (what) + -예요 (is, polite — mixing casual and polite is common in spontaneous speech).',
  '미안해. 내가 잘못했어.': '미안하다 → 미안해 (casual sorry). 내가 = 나 (I) + 가 (subject). 잘못하다 (to make a mistake) + -었어 (past, casual).',
  '꿈을 향해 달려가자. 우리 같이 하자.': '꿈 (dream) + 을 (object). 향하다 (to head toward). 달려가다 (to run) + -자 = "let us" (casual propositive). 같이 (together) + 하자 (let us do).',
};

function findWordsInLine(korean: string): WordEntry[] {
  const cleanLine = korean.replace(/[.?!,]/g, '');
  const tokens = cleanLine.split(/\s+/).filter(Boolean);
  const found: WordEntry[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    if (wordDictionary[token] && !seen.has(token)) {
      found.push(wordDictionary[token]);
      seen.add(token);
    }
  }

  return found;
}

export function generateDemoLessons(subtitles: SubtitleLine[]): ParsedLesson[] {
  return subtitles.map((sub, index) => {
    const romanization = romanizationMap[sub.korean] || '';
    const translation = translationMap[sub.korean] || '';
    const politeness = politenessMap[sub.korean] || '';
    const grammarNote = grammarNotes[sub.korean] || '';
    const words = findWordsInLine(sub.korean);

    const lesson: Omit<Lesson, 'id' | 'session_id' | 'created_at'> = {
      hangul: sub.korean,
      romanization,
      translation,
      timestamp_start: sub.timestamp_start,
      timestamp_end: sub.timestamp_end || null,
      politeness: politeness || null,
      grammar_note: grammarNote || null,
      order_index: index,
    };

    const vocab: Omit<Vocabulary, 'id' | 'lesson_id' | 'session_id' | 'created_at'>[] = words.map((w) => ({
      word_hangul: w.hangul,
      word_romanization: w.romanization,
      word_translation: w.translation,
      part_of_speech: w.partOfSpeech,
      is_known: false,
      is_saved: true,
    }));

    return { lesson, vocabulary: vocab };
  });
}
