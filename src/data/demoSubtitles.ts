import type { SubtitleLine } from '@/types';

export interface DemoShow {
  id: string;
  title: string;
  description: string;
  subtitles: SubtitleLine[];
}

export const demoShows: DemoShow[] = [
  {
    id: 'crash-landing-e1',
    title: 'Crash Landing on You — Episode 1',
    description: 'A South Korean heiress crash-lands in North Korea after a paragliding accident.',
    subtitles: [
      {
        timestamp_start: '00:03:12',
        timestamp_end: '00:03:18',
        korean: '안녕하세요. 만나서 반갑습니다.',
      },
      {
        timestamp_start: '00:05:45',
        timestamp_end: '00:05:52',
        korean: '이름이 뭐예요?',
      },
      {
        timestamp_start: '00:08:20',
        timestamp_end: '00:08:28',
        korean: '저는 서리준입니다. 한국에서 왔어요.',
      },
      {
        timestamp_start: '00:12:05',
        timestamp_end: '00:12:15',
        korean: '정말 감사합니다. 도와주셔서 고마워요.',
      },
      {
        timestamp_start: '00:18:30',
        timestamp_end: '00:18:37',
        korean: '여기가 어디예요? 길을 잃었어요.',
      },
      {
        timestamp_start: '00:25:10',
        timestamp_end: '00:25:18',
        korean: '조금만 기다려 주세요. 곧 돌아올게요.',
      },
      {
        timestamp_start: '00:32:40',
        timestamp_end: '00:32:48',
        korean: '배가고파요. 밥 먹었어요?',
      },
      {
        timestamp_start: '00:38:55',
        timestamp_end: '00:39:03',
        korean: '사랑해요. 항상 함께할게요.',
      },
    ],
  },
  {
    id: 'goblin-e1',
    title: 'Goblin — Episode 1',
    description: 'An immortal goblin seeks a human bride to end his eternal life.',
    subtitles: [
      {
        timestamp_start: '00:02:15',
        timestamp_end: '00:02:22',
        korean: '죄송합니다. 늦어서 미안해요.',
      },
      {
        timestamp_start: '00:06:30',
        timestamp_end: '00:06:38',
        korean: '그게 무슨 뜻이에요? 이해 못 했어요.',
      },
      {
        timestamp_start: '00:11:00',
        timestamp_end: '00:11:10',
        korean: '오늘 날씨가 정말 좋네요. 산책할까요?',
      },
      {
        timestamp_start: '00:17:20',
        timestamp_end: '00:17:28',
        korean: '시간이 없어요. 빨리 가야 돼요.',
      },
      {
        timestamp_start: '00:22:45',
        timestamp_end: '00:22:52',
        korean: '맛있어요! 정말 잘 먹었어요.',
      },
      {
        timestamp_start: '00:29:10',
        timestamp_end: '00:29:18',
        korean: '걱정하지 마세요. 괜찮을 거예요.',
      },
      {
        timestamp_start: '00:35:30',
        timestamp_end: '00:35:38',
        korean: '다시 만나서 반가워요. 잘 지냈어요?',
      },
      {
        timestamp_start: '00:41:00',
        timestamp_end: '00:41:08',
        korean: '이게 진짜예요? 믿을 수 없어요.',
      },
    ],
  },
  {
    id: 'itaewon-e1',
    title: 'Itaewon Class — Episode 1',
    description: 'An ex-convict opens a pub in Itaewon to chase his dreams.',
    subtitles: [
      {
        timestamp_start: '00:04:20',
        timestamp_end: '00:04:28',
        korean: '안녕! 오랜만이야. 잘 지냈어?',
      },
      {
        timestamp_start: '00:09:15',
        timestamp_end: '00:09:23',
        korean: '나 내일 가게를 열 거야. 도와줄 수 있어?',
      },
      {
        timestamp_start: '00:15:40',
        timestamp_end: '00:15:48',
        korean: '힘들어도 포기하지 마. 넌 할 수 있어.',
      },
      {
        timestamp_start: '00:20:30',
        timestamp_end: '00:20:38',
        korean: '이 음식 정말 맛있어! 뭐예요?',
      },
      {
        timestamp_start: '00:27:55',
        timestamp_end: '00:28:03',
        korean: '미안해. 내가 잘못했어.',
      },
      {
        timestamp_start: '00:33:10',
        timestamp_end: '00:33:18',
        korean: '꿈을 향해 달려가자. 우리 같이 하자.',
      },
    ],
  },
];
