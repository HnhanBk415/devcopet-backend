/**
 * 15 Onboarding Questions — Personality Assessment
 *
 * Traits scored (8):
 *   analytical, creative, disciplined, independent,
 *   empathetic, competitive, adaptable, curious
 *
 * Mỗi câu có 4 options (A-D), câu 15 có 6 options (A-F).
 * Mỗi option cộng điểm cho 1-2 traits.
 */

// prettier-ignore
export interface OnboardingOptionScore {
  analytical?: number;
  creative?: number;
  disciplined?: number;
  independent?: number;
  empathetic?: number;
  competitive?: number;
  adaptable?: number;
  curious?: number;
}

// prettier-ignore
export interface OnboardingOption {
  key: string;
  textVi: string;
  textEn: string;
  scores: OnboardingOptionScore;
}

// prettier-ignore
export interface OnboardingQuestion {
  questionNumber: number;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  options: OnboardingOption[];
}

export const PERSONALITY_TRAITS = [
  'analytical',
  'creative',
  'disciplined',
  'independent',
  'empathetic',
  'competitive',
  'adaptable',
  'curious',
] as const;

export type PersonalityTrait = (typeof PERSONALITY_TRAITS)[number];

/**
 * Tên hiển thị cho từng trait (dùng cho kết quả trả về FE)
 */
export const TRAIT_DISPLAY_NAMES: Record<
  PersonalityTrait,
  { vi: string; en: string }
> = {
  analytical: {
    vi: 'Người tư duy phân tích',
    en: 'Analytical Thinker',
  },
  creative: {
    vi: 'Người sáng tạo',
    en: 'Creative Innovator',
  },
  disciplined: {
    vi: 'Người có kỷ luật',
    en: 'Disciplined Achiever',
  },
  independent: {
    vi: 'Người khám phá độc lập',
    en: 'Independent Explorer',
  },
  empathetic: {
    vi: 'Người đồng cảm',
    en: 'Empathetic Connector',
  },
  competitive: {
    vi: 'Người cạnh tranh',
    en: 'Competitive Performer',
  },
  adaptable: {
    vi: 'Người linh hoạt',
    en: 'Adaptable Learner',
  },
  curious: {
    vi: 'Người ham học hỏi',
    en: 'Curious Seeker',
  },
};

// prettier-ignore
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  // ───────────────────────────── Câu 1 ─────────────────────────────
  {
    questionNumber: 1,
    titleVi: 'Bạn đến đây để làm gì?',
    titleEn: 'Why are you here?',
    descriptionVi: 'Điều gì khiến bạn bắt đầu sử dụng nền tảng này?',
    descriptionEn: 'What is the main reason you started using this platform?',
    options: [
      {
        key: 'A',
        textVi: 'Tôi muốn học một kỹ năng mới theo lộ trình rõ ràng.',
        textEn: 'I want to learn a new skill through a clear roadmap.',
        scores: { disciplined: 2, curious: 1 },
      },
      {
        key: 'B',
        textVi: 'Tôi muốn khám phá nhiều chủ đề và tìm thứ thực sự phù hợp với mình.',
        textEn: 'I want to explore different topics and discover what truly suits me.',
        scores: { curious: 2, adaptable: 1 },
      },
      {
        key: 'C',
        textVi: 'Tôi muốn cải thiện kết quả học tập hoặc công việc nhanh nhất có thể.',
        textEn: 'I want to improve my academic or professional performance as quickly as possible.',
        scores: { competitive: 2, analytical: 1 },
      },
      {
        key: 'D',
        textVi: 'Tôi muốn gặp gỡ, trao đổi và học cùng những người khác.',
        textEn: 'I want to connect, discuss, and learn with other people.',
        scores: { empathetic: 2, curious: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 2 ─────────────────────────────
  {
    questionNumber: 2,
    titleVi: 'Bạn thường bắt đầu một mục tiêu mới như thế nào?',
    titleEn: 'How do you usually start a new goal?',
    descriptionVi: 'Khi quyết định học hoặc thực hiện một điều mới, bạn thường làm gì đầu tiên?',
    descriptionEn: 'When you decide to learn or pursue something new, what do you usually do first?',
    options: [
      {
        key: 'A',
        textVi: 'Lập kế hoạch chi tiết và chia mục tiêu thành từng bước nhỏ.',
        textEn: 'Create a detailed plan and divide the goal into smaller steps.',
        scores: { disciplined: 3, analytical: 1 },
      },
      {
        key: 'B',
        textVi: 'Bắt đầu ngay rồi điều chỉnh trong quá trình thực hiện.',
        textEn: 'Start immediately and make adjustments along the way.',
        scores: { adaptable: 2, independent: 1 },
      },
      {
        key: 'C',
        textVi: 'Nghiên cứu thật kỹ trước khi bắt đầu.',
        textEn: 'Research the topic thoroughly before starting.',
        scores: { analytical: 3, curious: 1 },
      },
      {
        key: 'D',
        textVi: 'Tìm một người có kinh nghiệm để hỏi hoặc học theo.',
        textEn: 'Find an experienced person to ask for advice or follow.',
        scores: { empathetic: 2, curious: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 3 ─────────────────────────────
  {
    questionNumber: 3,
    titleVi: 'Bạn thích cách học nào nhất?',
    titleEn: 'What is your preferred learning style?',
    descriptionVi: 'Phương pháp nào giúp bạn tiếp thu kiến thức hiệu quả nhất?',
    descriptionEn: 'Which learning method helps you understand new knowledge most effectively?',
    options: [
      {
        key: 'A',
        textVi: 'Đọc lý thuyết và phân tích ví dụ chi tiết.',
        textEn: 'Reading theory and analyzing detailed examples.',
        scores: { analytical: 3 },
      },
      {
        key: 'B',
        textVi: 'Thực hành ngay thông qua bài tập hoặc dự án.',
        textEn: 'Practicing immediately through exercises or projects.',
        scores: { independent: 2, adaptable: 1 },
      },
      {
        key: 'C',
        textVi: 'Xem hình ảnh, sơ đồ, video hoặc mô phỏng.',
        textEn: 'Using images, diagrams, videos, or simulations.',
        scores: { creative: 3 },
      },
      {
        key: 'D',
        textVi: 'Trao đổi, tranh luận hoặc học cùng người khác.',
        textEn: 'Discussing, debating, or learning with others.',
        scores: { empathetic: 2, competitive: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 4 ─────────────────────────────
  {
    questionNumber: 4,
    titleVi: 'Bạn phản ứng thế nào khi gặp một bài quá khó?',
    titleEn: 'How do you react to a very difficult problem?',
    descriptionVi: 'Khi không thể giải quyết một vấn đề sau nhiều lần thử, bạn thường làm gì?',
    descriptionEn: 'When you cannot solve a difficult problem after several attempts, what do you usually do?',
    options: [
      {
        key: 'A',
        textVi: 'Chia nhỏ vấn đề và kiểm tra từng phần một.',
        textEn: 'Break the problem into smaller parts and examine each one.',
        scores: { analytical: 3, disciplined: 1 },
      },
      {
        key: 'B',
        textVi: 'Tìm một cách tiếp cận hoàn toàn khác.',
        textEn: 'Look for a completely different approach.',
        scores: { creative: 3, adaptable: 1 },
      },
      {
        key: 'C',
        textVi: 'Hỏi người khác hoặc tham gia thảo luận.',
        textEn: 'Ask someone else or join a discussion.',
        scores: { empathetic: 2, curious: 1 },
      },
      {
        key: 'D',
        textVi: 'Tạm nghỉ rồi quay lại khi đầu óc thoải mái hơn.',
        textEn: 'Take a break and return with a clearer mind.',
        scores: { adaptable: 2, independent: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 5 ─────────────────────────────
  {
    questionNumber: 5,
    titleVi: 'Bạn muốn AI hỗ trợ mình theo cách nào?',
    titleEn: 'How would you like the AI assistant to help you?',
    descriptionVi: 'Bạn muốn trợ lý AI trên nền tảng đóng vai trò gì?',
    descriptionEn: 'What role would you like the AI assistant on this platform to play?',
    options: [
      {
        key: 'A',
        textVi: 'Một giáo viên giải thích mọi thứ từ cơ bản đến nâng cao.',
        textEn: 'A teacher who explains everything from basic to advanced.',
        scores: { curious: 2, disciplined: 1 },
      },
      {
        key: 'B',
        textVi: 'Một chuyên gia đưa ra câu trả lời chính xác và trực tiếp.',
        textEn: 'An expert who provides precise and direct answers.',
        scores: { analytical: 2, competitive: 1 },
      },
      {
        key: 'C',
        textVi: 'Một người đồng hành đặt câu hỏi và khuyến khích tôi tự suy nghĩ.',
        textEn: 'A companion who asks questions and encourages independent thinking.',
        scores: { independent: 2, curious: 1 },
      },
      {
        key: 'D',
        textVi: 'Một cộng sự sáng tạo giúp tôi phát triển ý tưởng.',
        textEn: 'A creative collaborator who helps develop my ideas.',
        scores: { creative: 3 },
      },
    ],
  },

  // ───────────────────────────── Câu 6 ─────────────────────────────
  {
    questionNumber: 6,
    titleVi: 'Bạn thích làm việc một mình hay theo nhóm?',
    titleEn: 'Do you prefer working independently or collaborating?',
    descriptionVi: 'Bạn thích làm việc một mình hay theo nhóm?',
    descriptionEn: 'Do you prefer working independently or collaborating with others?',
    options: [
      {
        key: 'A',
        textVi: 'Tôi làm việc hiệu quả nhất khi hoàn toàn độc lập.',
        textEn: 'I work most effectively when I am completely independent.',
        scores: { independent: 3 },
      },
      {
        key: 'B',
        textVi: 'Tôi thích làm một mình nhưng vẫn cần người góp ý.',
        textEn: 'I prefer working alone but still value feedback.',
        scores: { independent: 2, adaptable: 1 },
      },
      {
        key: 'C',
        textVi: 'Tôi thích làm việc trong một nhóm nhỏ có phân công rõ ràng.',
        textEn: 'I prefer working in a small team with clearly assigned responsibilities.',
        scores: { disciplined: 2, empathetic: 1 },
      },
      {
        key: 'D',
        textVi: 'Tôi thích môi trường đông người, trao đổi liên tục.',
        textEn: 'I enjoy active environments with frequent communication.',
        scores: { empathetic: 3, adaptable: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 7 ─────────────────────────────
  {
    questionNumber: 7,
    titleVi: 'Vai trò tự nhiên của bạn trong một nhóm là gì?',
    titleEn: 'Which role do you naturally take in a team?',
    descriptionVi: 'Vai trò tự nhiên của bạn trong một nhóm là gì?',
    descriptionEn: 'Which role do you naturally take in a team?',
    options: [
      {
        key: 'A',
        textVi: 'Người đưa ra định hướng và phân công công việc.',
        textEn: 'The person who sets direction and assigns responsibilities.',
        scores: { disciplined: 2, competitive: 1 },
      },
      {
        key: 'B',
        textVi: 'Người phân tích vấn đề và kiểm tra tính chính xác.',
        textEn: 'The person who analyzes problems and verifies accuracy.',
        scores: { analytical: 3 },
      },
      {
        key: 'C',
        textVi: 'Người đưa ra ý tưởng và giải pháp mới.',
        textEn: 'The person who proposes new ideas and solutions.',
        scores: { creative: 3 },
      },
      {
        key: 'D',
        textVi: 'Người kết nối thành viên và giải quyết mâu thuẫn.',
        textEn: 'The person who connects members and resolves conflicts.',
        scores: { empathetic: 3, adaptable: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 8 ─────────────────────────────
  {
    questionNumber: 8,
    titleVi: 'Điều gì thúc đẩy bạn cố gắng nhất?',
    titleEn: 'What motivates you to work harder?',
    descriptionVi: 'Điều gì thúc đẩy bạn cố gắng nhất?',
    descriptionEn: 'What motivates you to work harder?',
    options: [
      {
        key: 'A',
        textVi: 'Đạt được điểm số hoặc kết quả cao hơn người khác.',
        textEn: 'Achieving better scores or results than others.',
        scores: { competitive: 3 },
      },
      {
        key: 'B',
        textVi: 'Nhìn thấy bản thân tiến bộ từng ngày.',
        textEn: 'Seeing myself improve every day.',
        scores: { disciplined: 2, curious: 1 },
      },
      {
        key: 'C',
        textVi: 'Tạo ra một sản phẩm hữu ích hoặc độc đáo.',
        textEn: 'Creating something useful or original.',
        scores: { creative: 3 },
      },
      {
        key: 'D',
        textVi: 'Giúp đỡ người khác và tạo ra ảnh hưởng tích cực.',
        textEn: 'Helping others and creating a positive impact.',
        scores: { empathetic: 3 },
      },
    ],
  },

  // ───────────────────────────── Câu 9 ─────────────────────────────
  {
    questionNumber: 9,
    titleVi: 'Bạn xử lý deadline như thế nào?',
    titleEn: 'How do you handle deadlines?',
    descriptionVi: 'Bạn xử lý deadline như thế nào?',
    descriptionEn: 'How do you usually handle deadlines?',
    options: [
      {
        key: 'A',
        textVi: 'Hoàn thành sớm để có thời gian kiểm tra lại.',
        textEn: 'Finish early to leave time for review.',
        scores: { disciplined: 3, analytical: 1 },
      },
      {
        key: 'B',
        textVi: 'Chia nhỏ công việc và hoàn thành theo từng mốc.',
        textEn: 'Divide the work and complete it through scheduled milestones.',
        scores: { disciplined: 2, competitive: 1 },
      },
      {
        key: 'C',
        textVi: 'Làm hiệu quả nhất khi deadline đã đến gần.',
        textEn: 'Work most effectively when the deadline is close.',
        scores: { adaptable: 2, competitive: 1 },
      },
      {
        key: 'D',
        textVi: 'Deadline không quá quan trọng nếu sản phẩm chưa đạt chất lượng mong muốn.',
        textEn: 'The deadline is less important if the work has not reached the desired quality.',
        scores: { creative: 2, independent: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 10 ─────────────────────────────
  {
    questionNumber: 10,
    titleVi: 'Khi nhận được phản hồi tiêu cực, bạn thường làm gì?',
    titleEn: 'How do you respond to negative feedback?',
    descriptionVi: 'Khi nhận được phản hồi tiêu cực, bạn thường làm gì?',
    descriptionEn: 'How do you usually respond to negative feedback?',
    options: [
      {
        key: 'A',
        textVi: 'Phân tích phản hồi để xác định phần nào thực sự hợp lý.',
        textEn: 'Analyze the feedback to determine which parts are valid.',
        scores: { analytical: 3 },
      },
      {
        key: 'B',
        textVi: 'Sửa ngay những điểm được góp ý.',
        textEn: 'Immediately correct the issues mentioned.',
        scores: { disciplined: 2, adaptable: 1 },
      },
      {
        key: 'C',
        textVi: 'Trao đổi lại để hiểu rõ quan điểm của người phản hồi.',
        textEn: "Discuss it further to understand the other person's perspective.",
        scores: { empathetic: 2, curious: 1 },
      },
      {
        key: 'D',
        textVi: 'Chỉ thay đổi khi tôi thực sự đồng ý với phản hồi đó.',
        textEn: 'Only make changes when I genuinely agree with the feedback.',
        scores: { independent: 3 },
      },
    ],
  },

  // ───────────────────────────── Câu 11 ─────────────────────────────
  {
    questionNumber: 11,
    titleVi: 'Bạn đưa ra quyết định dựa trên điều gì?',
    titleEn: 'What do you base your decisions on?',
    descriptionVi: 'Bạn đưa ra quyết định dựa trên điều gì?',
    descriptionEn: 'What do you mainly rely on when making an important decision?',
    options: [
      {
        key: 'A',
        textVi: 'Dữ liệu, bằng chứng và logic.',
        textEn: 'Data, evidence, and logic.',
        scores: { analytical: 3 },
      },
      {
        key: 'B',
        textVi: 'Trực giác và kinh nghiệm cá nhân.',
        textEn: 'Intuition and personal experience.',
        scores: { independent: 2, creative: 1 },
      },
      {
        key: 'C',
        textVi: 'Ý kiến của những người có liên quan.',
        textEn: 'The opinions of the people involved.',
        scores: { empathetic: 2, adaptable: 1 },
      },
      {
        key: 'D',
        textVi: 'Khả năng đem lại kết quả tốt nhất trong tương lai.',
        textEn: 'The option most likely to produce the best future outcome.',
        scores: { competitive: 2, analytical: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 12 ─────────────────────────────
  {
    questionNumber: 12,
    titleVi: 'Bạn cảm thấy thế nào khi kế hoạch đột ngột thay đổi?',
    titleEn: 'How do you feel when a plan suddenly changes?',
    descriptionVi: 'Bạn cảm thấy thế nào khi kế hoạch đột ngột thay đổi?',
    descriptionEn: 'How do you feel when a plan suddenly changes?',
    options: [
      {
        key: 'A',
        textVi: 'Khó chịu vì tôi muốn mọi thứ diễn ra đúng kế hoạch.',
        textEn: 'Uncomfortable because I prefer things to follow the original plan.',
        scores: { disciplined: 3 },
      },
      {
        key: 'B',
        textVi: 'Tôi nhanh chóng điều chỉnh và tìm phương án mới.',
        textEn: 'I quickly adapt and find a new solution.',
        scores: { adaptable: 3 },
      },
      {
        key: 'C',
        textVi: 'Tôi xem đó là cơ hội để thử một cách làm tốt hơn.',
        textEn: 'I see it as an opportunity to try a better approach.',
        scores: { creative: 2, adaptable: 1 },
      },
      {
        key: 'D',
        textVi: 'Tôi muốn biết rõ lý do thay đổi trước khi hành động.',
        textEn: 'I want to understand the reason for the change before acting.',
        scores: { analytical: 2, disciplined: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 13 ─────────────────────────────
  {
    questionNumber: 13,
    titleVi: 'Khi có một ý tưởng mới, bạn thường làm gì?',
    titleEn: 'What do you do when you have a new idea?',
    descriptionVi: 'Khi có một ý tưởng mới, bạn thường làm gì?',
    descriptionEn: 'What do you usually do when you have a new idea?',
    options: [
      {
        key: 'A',
        textVi: 'Ghi lại và nghiên cứu tính khả thi.',
        textEn: 'Write it down and evaluate its feasibility.',
        scores: { analytical: 2, creative: 1 },
      },
      {
        key: 'B',
        textVi: 'Thử nghiệm ngay ở quy mô nhỏ.',
        textEn: 'Test it immediately on a small scale.',
        scores: { creative: 2, adaptable: 1 },
      },
      {
        key: 'C',
        textVi: 'Chia sẻ với người khác để nhận phản hồi.',
        textEn: 'Share it with others to receive feedback.',
        scores: { empathetic: 2, creative: 1 },
      },
      {
        key: 'D',
        textVi: 'Giữ lại và tự phát triển cho đến khi đủ hoàn chỉnh.',
        textEn: 'Keep it private and develop it independently until it is mature.',
        scores: { independent: 2, disciplined: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 14 ─────────────────────────────
  {
    questionNumber: 14,
    titleVi: 'Môi trường nào giúp bạn phát huy tốt nhất?',
    titleEn: 'Which environment helps you perform at your best?',
    descriptionVi: 'Môi trường nào giúp bạn phát huy tốt nhất?',
    descriptionEn: 'Which environment helps you perform at your best?',
    options: [
      {
        key: 'A',
        textVi: 'Yên tĩnh, ổn định và ít bị làm phiền.',
        textEn: 'A quiet, stable environment with minimal interruptions.',
        scores: { independent: 2, disciplined: 1 },
      },
      {
        key: 'B',
        textVi: 'Có mục tiêu cao và cạnh tranh rõ ràng.',
        textEn: 'An environment with ambitious goals and clear competition.',
        scores: { competitive: 3 },
      },
      {
        key: 'C',
        textVi: 'Tự do, linh hoạt và cho phép thử nghiệm.',
        textEn: 'A flexible environment that allows freedom and experimentation.',
        scores: { creative: 3, adaptable: 1 },
      },
      {
        key: 'D',
        textVi: 'Có nhiều người hỗ trợ và thường xuyên trao đổi.',
        textEn: 'A supportive environment with frequent interaction.',
        scores: { empathetic: 3, curious: 1 },
      },
    ],
  },

  // ───────────────────────────── Câu 15 ─────────────────────────────
  {
    questionNumber: 15,
    titleVi: 'Bạn muốn trở thành phiên bản nào của mình?',
    titleEn: 'Which version of yourself do you want to become?',
    descriptionVi: 'Trong tương lai, phẩm chất nào bạn muốn phát triển mạnh nhất?',
    descriptionEn: 'Which quality would you most like to strengthen in the future?',
    options: [
      {
        key: 'A',
        textVi: 'Tư duy logic và khả năng giải quyết vấn đề.',
        textEn: 'Logical thinking and problem-solving ability.',
        scores: { analytical: 3 },
      },
      {
        key: 'B',
        textVi: 'Kỷ luật và khả năng duy trì mục tiêu dài hạn.',
        textEn: 'Discipline and the ability to sustain long-term goals.',
        scores: { disciplined: 3 },
      },
      {
        key: 'C',
        textVi: 'Sự tự tin trong giao tiếp và dẫn dắt người khác.',
        textEn: 'Confidence in communication and leading others.',
        scores: { empathetic: 2, competitive: 1 },
      },
      {
        key: 'D',
        textVi: 'Sự sáng tạo và khả năng tạo ra điều mới.',
        textEn: 'Creativity and the ability to produce original ideas.',
        scores: { creative: 3 },
      },
      {
        key: 'E',
        textVi: 'Khả năng thấu hiểu, kết nối và giúp đỡ người khác.',
        textEn: 'The ability to understand, connect with, and support others.',
        scores: { empathetic: 3 },
      },
      {
        key: 'F',
        textVi: 'Sự linh hoạt và khả năng thích nghi với thay đổi.',
        textEn: 'Flexibility and the ability to adapt to change.',
        scores: { adaptable: 3 },
      },
    ],
  },
];
