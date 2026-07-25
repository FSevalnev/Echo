export type Lang = "en" | "ru" | "tg";

export const languageNames: Record<Lang, string> = {
  en: "English",
  ru: "Русский",
  tg: "Тоҷикӣ",
};

export type Dictionary = {
  nav: {
    home: string;
    howItWorks: string;
    features: string;
    tryEcho: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleHighlight: string;
    subtitle: string;
    ctaStart: string;
    ctaDemo: string;
    cardLabel: string;
    cardTitle: string;
    strength1: string;
    strength2: string;
    gap1: string;
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: { emoji: string; title: string; text: string }[];
  };
  features: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: { emoji: string; title: string; text: string }[];
  };
  tryEcho: {
    eyebrow: string;
    title: string;
    subtitle: string;
    modeText: string;
    modeVoice: string;
    topicLabel: string;
    topicPlaceholder: string;
    explanationLabel: string;
    explanationPlaceholder: string;
    levelLabel: string;
    levelBeginner: string;
    levelIntermediate: string;
    levelAdvanced: string;
    levelAuto: string;
    submit: string;
    submitting: string;
    recordStart: string;
    recordStop: string;
    recordAgain: string;
    recordingHint: string;
    reviewHint: string;
    idleHint: string;
    loadingHint: string;
    aiAnalysis: string;
    offlineBadge: string;
    understandingScore: string;
    followUpLabel: string;
    transcriptLabel: string;
    micError: string;
    apiError: string;
    scoreBands: {
      veryLow: string;
      low: string;
      medium: string;
      good: string;
      veryGood: string;
      excellent: string;
      perfect: string;
    };
    causeLabels: {
      theory: string;
      carelessness: string;
      misreading: string;
      logic: string;
      calculation: string;
    };
    mistakesTitle: string;
    noMistakes: string;
    whyWrongLabel: string;
    correctionLabel: string;
    criteriaTitle: string;
    recommendationsTitle: string;
    reviewTopicsTitle: string;
    practiceTitle: string;
    progressLabel: string;
    noHistory: string;
  };
  footer: {
    tagline: string;
    rightsReserved: string;
  };
};

export const translations: Record<Lang, Dictionary> = {
  en: {
    nav: {
      home: "Home",
      howItWorks: "How it Works",
      features: "Features",
      tryEcho: "Try Echo",
    },
    hero: {
      badge: "✨ AI-powered learning companion",
      titleLine1: "Learn by",
      titleHighlight: " explaining.",
      subtitle:
        "Stop memorizing. Start understanding. Echo analyzes your explanations and gives personalized AI feedback that helps you learn faster and remember longer.",
      ctaStart: "Start Explaining →",
      ctaDemo: "Watch Demo",
      cardLabel: "AI Analysis",
      cardTitle: "Understanding Score",
      strength1: "Strong logical explanation",
      strength2: "Excellent vocabulary",
      gap1: "You forgot to explain osmosis.",
    },
    howItWorks: {
      eyebrow: "How It Works",
      title: "Learn in four simple steps",
      subtitle: "Echo transforms your explanations into personalized AI coaching.",
      steps: [
        { emoji: "🎙️", title: "Explain", text: "Explain the topic in your own words." },
        { emoji: "🤖", title: "AI Understands", text: "Echo analyzes your explanation." },
        { emoji: "📊", title: "Feedback", text: "Receive instant personalized feedback." },
        { emoji: "🧠", title: "Master", text: "Improve and truly understand the concept." },
      ],
    },
    features: {
      eyebrow: "Features",
      title: "Why Echo works",
      subtitle:
        "Everything is built around one idea: you only truly know something once you can explain it.",
      items: [
        {
          emoji: "🎯",
          title: "Finds real gaps",
          text: "Echo doesn't just check keywords — it spots the exact concept you skipped or got wrong.",
        },
        {
          emoji: "💬",
          title: "Asks the right follow-up",
          text: "Get a targeted question that pushes you to fill the gap yourself, instead of just handing you the answer.",
        },
        {
          emoji: "📈",
          title: "Tracks your understanding",
          text: "See your explanation score improve over time across every topic you've practiced.",
        },
        {
          emoji: "🗣️",
          title: "Explain your way",
          text: "Type it out or talk it through out loud — Echo analyzes the substance, not the format.",
        },
        {
          emoji: "⚡",
          title: "Instant feedback",
          text: "No waiting for a teacher or a forum reply. Know exactly what to fix in seconds.",
        },
        {
          emoji: "🔒",
          title: "Built for real studying",
          text: "No ads, no gamified fluff — just a fast loop that makes the material actually stick.",
        },
      ],
    },
    tryEcho: {
      eyebrow: "Try It Yourself",
      title: "Explain a topic, get feedback",
      subtitle:
        "Pick anything you're studying and explain it like you would to a friend. Echo will tell you what's missing.",
      modeText: "Text",
      modeVoice: "Voice",
      topicLabel: "Topic",
      topicPlaceholder: "e.g. Osmosis, Newton's second law, recursion...",
      explanationLabel: "Your explanation",
      explanationPlaceholder:
        "Explain it in your own words, like you're teaching someone who's never heard of it...",
      levelLabel: "Your level",
      levelBeginner: "Beginner",
      levelIntermediate: "Intermediate",
      levelAdvanced: "Advanced",
      levelAuto: "Not sure — let AI decide",
      submit: "Check My Understanding",
      submitting: "Analyzing...",
      recordStart: "Start Recording",
      recordStop: "Stop Recording",
      recordAgain: "Record Again",
      recordingHint: "Recording... speak your explanation out loud.",
      reviewHint: "Listen back, then submit when you're happy with it.",
      idleHint: "Your feedback will show up here once you submit an explanation.",
      loadingHint: "Echo is reading your explanation...",
      aiAnalysis: "AI Analysis",
      offlineBadge: "offline demo data",
      understandingScore: "Understanding Score",
      followUpLabel: "Follow-up:",
      transcriptLabel: "What Echo heard:",
      micError: "Couldn't access the microphone. Check your browser permissions.",
      apiError: "Couldn't reach Echo. Try again or switch to text.",
      scoreBands: {
        veryLow: "The work barely meets the requirements.",
        low: "Only a small part of the task was completed; there are many mistakes.",
        medium: "Average level — there are significant gaps.",
        good: "Good work, but with some mistakes or inaccuracies.",
        veryGood: "Very good result with only minor notes.",
        excellent: "Nearly flawless work.",
        perfect: "Fully meets every criterion, no mistakes or issues.",
      },
      causeLabels: {
        theory: "Gap in theoretical knowledge",
        carelessness: "Carelessness",
        misreading: "Misread or misunderstood the task",
        logic: "Logical error",
        calculation: "Calculation error",
      },
      mistakesTitle: "Mistake breakdown",
      noMistakes: "No mistakes found — nice work.",
      whyWrongLabel: "Why it's wrong:",
      correctionLabel: "Correct explanation:",
      criteriaTitle: "Scoring criteria",
      recommendationsTitle: "Personal recommendations",
      reviewTopicsTitle: "Topics to review",
      practiceTitle: "Practice with similar examples",
      progressLabel: "Progress",
      noHistory: "This is your first attempt on this topic — no history yet.",
    },
    footer: {
      tagline:
        "Learn by explaining. AI feedback that finds your gaps and helps you close them.",
      rightsReserved: "All rights reserved.",
    },
  },

  ru: {
    nav: {
      home: "Главная",
      howItWorks: "Как это работает",
      features: "Возможности",
      tryEcho: "Попробовать Echo",
    },
    hero: {
      badge: "✨ Обучение с помощью ИИ",
      titleLine1: "Учись,",
      titleHighlight: " объясняя.",
      subtitle:
        "Хватит зубрить. Начни понимать. Echo анализирует твои объяснения и даёт персональную обратную связь от ИИ, которая помогает учиться быстрее и запоминать надолго.",
      ctaStart: "Начать объяснять →",
      ctaDemo: "Смотреть демо",
      cardLabel: "Анализ ИИ",
      cardTitle: "Оценка понимания",
      strength1: "Логичное объяснение",
      strength2: "Отличный словарный запас",
      gap1: "Ты забыл объяснить осмос.",
    },
    howItWorks: {
      eyebrow: "Как это работает",
      title: "Учись за четыре простых шага",
      subtitle: "Echo превращает твои объяснения в персональный ИИ-коучинг.",
      steps: [
        { emoji: "🎙️", title: "Объясни", text: "Объясни тему своими словами." },
        { emoji: "🤖", title: "ИИ понимает", text: "Echo анализирует твоё объяснение." },
        { emoji: "📊", title: "Обратная связь", text: "Получи мгновенный персональный фидбек." },
        { emoji: "🧠", title: "Освой", text: "Улучшайся и по-настоящему пойми тему." },
      ],
    },
    features: {
      eyebrow: "Возможности",
      title: "Почему Echo работает",
      subtitle:
        "Всё построено вокруг одной идеи: ты по-настоящему знаешь что-то, только когда можешь это объяснить.",
      items: [
        {
          emoji: "🎯",
          title: "Находит настоящие пробелы",
          text: "Echo не просто ищет ключевые слова — он находит именно то понятие, которое ты пропустил или понял неверно.",
        },
        {
          emoji: "💬",
          title: "Задаёт нужный уточняющий вопрос",
          text: "Получи целевой вопрос, который заставит тебя самому закрыть пробел, а не просто получить готовый ответ.",
        },
        {
          emoji: "📈",
          title: "Отслеживает твой прогресс",
          text: "Смотри, как растёт оценка понимания по каждой теме, которую ты практиковал.",
        },
        {
          emoji: "🗣️",
          title: "Объясняй как удобно",
          text: "Печатай или говори вслух — Echo анализирует суть, а не форму.",
        },
        {
          emoji: "⚡",
          title: "Мгновенная обратная связь",
          text: "Не жди учителя или ответа на форуме. Узнай, что исправить, за секунды.",
        },
        {
          emoji: "🔒",
          title: "Создан для настоящей учёбы",
          text: "Без рекламы и геймификации ради галочки — только быстрый цикл, который реально закрепляет материал.",
        },
      ],
    },
    tryEcho: {
      eyebrow: "Попробуй сам",
      title: "Объясни тему — получи фидбек",
      subtitle:
        "Возьми любую тему, которую изучаешь, и объясни её как другу. Echo скажет, чего не хватает.",
      modeText: "Текст",
      modeVoice: "Голос",
      topicLabel: "Тема",
      topicPlaceholder: "например, осмос, второй закон Ньютона, рекурсия...",
      explanationLabel: "Твоё объяснение",
      explanationPlaceholder:
        "Объясни своими словами, как будто учишь того, кто никогда об этом не слышал...",
      levelLabel: "Твой уровень",
      levelBeginner: "Новичок",
      levelIntermediate: "Средний",
      levelAdvanced: "Продвинутый",
      levelAuto: "Не уверен — пусть решит AI",
      submit: "Проверить понимание",
      submitting: "Анализирую...",
      recordStart: "Начать запись",
      recordStop: "Остановить запись",
      recordAgain: "Записать заново",
      recordingHint: "Идёт запись... объясни тему вслух.",
      reviewHint: "Прослушай запись и отправь, когда будешь готов.",
      idleHint: "Здесь появится фидбек после того, как ты отправишь объяснение.",
      loadingHint: "Echo разбирает твоё объяснение...",
      aiAnalysis: "Анализ ИИ",
      offlineBadge: "офлайн-демо данные",
      understandingScore: "Оценка понимания",
      followUpLabel: "Уточняющий вопрос:",
      transcriptLabel: "Что услышал Echo:",
      micError: "Не удалось получить доступ к микрофону. Проверь разрешения браузера.",
      apiError: "Не удалось связаться с Echo. Попробуй ещё раз или переключись на текст.",
      scoreBands: {
        veryLow: "Работа практически не соответствует требованиям.",
        low: "Выполнена небольшая часть задания, присутствует большое количество ошибок.",
        medium: "Средний уровень — имеются существенные пробелы.",
        good: "Хорошее выполнение, но присутствуют отдельные ошибки или неточности.",
        veryGood: "Очень хороший результат с незначительными замечаниями.",
        excellent: "Практически идеальная работа.",
        perfect: "Полностью соответствует всем критериям, без ошибок и недочётов.",
      },
      causeLabels: {
        theory: "Пробел в теоретических знаниях",
        carelessness: "Невнимательность",
        misreading: "Неверно понял(а) задание",
        logic: "Логическая ошибка",
        calculation: "Вычислительная ошибка",
      },
      mistakesTitle: "Разбор ошибок",
      noMistakes: "Ошибок не найдено — отличная работа.",
      whyWrongLabel: "Почему это неверно:",
      correctionLabel: "Правильное объяснение:",
      criteriaTitle: "Критерии оценки",
      recommendationsTitle: "Персональные рекомендации",
      reviewTopicsTitle: "Темы для повторения",
      practiceTitle: "Похожие задания для практики",
      progressLabel: "Прогресс",
      noHistory: "Это твоя первая попытка по этой теме — истории пока нет.",
    },
    footer: {
      tagline: "Учись, объясняя. ИИ-фидбек находит твои пробелы и помогает их закрыть.",
      rightsReserved: "Все права защищены.",
    },
  },

  tg: {
    nav: {
      home: "Асосӣ",
      howItWorks: "Чӣ тавр кор мекунад",
      features: "Хусусиятҳо",
      tryEcho: "Echo-ро санҷед",
    },
    hero: {
      badge: "✨ Ҳамсафари омӯзиш бо AI",
      titleLine1: "Омӯзед бо",
      titleHighlight: " шарҳ додан.",
      subtitle:
        "Аз ёд кардан даст кашед. Фаҳмиданро оғоз кунед. Echo шарҳҳои шуморо таҳлил карда, бозхӯрии шахсии AI медиҳад, ки ба шумо кӯмак мекунад тезтар омӯзед ва дертар дар хотир нигоҳ доред.",
      ctaStart: "Шарҳ доданро оғоз кунед →",
      ctaDemo: "Демо-ро тамошо кунед",
      cardLabel: "Таҳлили AI",
      cardTitle: "Холи фаҳмиш",
      strength1: "Шарҳи мантиқан қавӣ",
      strength2: "Захираи луғавии аъло",
      gap1: "Шумо фаромӯш кардед, ки осмосро шарҳ диҳед.",
    },
    howItWorks: {
      eyebrow: "Чӣ тавр кор мекунад",
      title: "Дар чор қадами сода омӯзед",
      subtitle: "Echo шарҳҳои шуморо ба омӯзиши шахсии AI табдил медиҳад.",
      steps: [
        { emoji: "🎙️", title: "Шарҳ диҳед", text: "Мавзӯъро бо суханони худ шарҳ диҳед." },
        { emoji: "🤖", title: "AI мефаҳмад", text: "Echo шарҳи шуморо таҳлил мекунад." },
        { emoji: "📊", title: "Бозхӯрӣ", text: "Бозхӯрии фаврии шахсӣ гиред." },
        { emoji: "🧠", title: "Азхуд кунед", text: "Беҳтар шавед ва мафҳумро воқеан бифаҳмед." },
      ],
    },
    features: {
      eyebrow: "Хусусиятҳо",
      title: "Барои чӣ Echo кор мекунад",
      subtitle:
        "Ҳама чиз дар атрофи як ғоя сохта шудааст: шумо танҳо вақте чизеро воқеан медонед, ки метавонед онро шарҳ диҳед.",
      items: [
        {
          emoji: "🎯",
          title: "Норасоиҳои воқеиро меёбад",
          text: "Echo танҳо калимаҳои калидиро тафтиш намекунад — он мафҳуми дурустеро, ки шумо гузаронда ё хато фаҳмидаед, муайян мекунад.",
        },
        {
          emoji: "💬",
          title: "Саволи дурусти иловагӣ медиҳад",
          text: "Саволи мушаххасе гиред, ки шуморо водор мекунад худ норасоиро пур кунед, на ин ки ҷавоби тайёр гиред.",
        },
        {
          emoji: "📈",
          title: "Пешрафти шуморо пайгирӣ мекунад",
          text: "Бинед, ки холи шарҳи шумо бо гузашти вақт дар ҳар мавзӯъе, ки машқ кардаед, беҳтар мешавад.",
        },
        {
          emoji: "🗣️",
          title: "Тавре ки бароятон осон аст шарҳ диҳед",
          text: "Матн нависед ё бо овоз гӯед — Echo моҳиятро таҳлил мекунад, на шаклро.",
        },
        {
          emoji: "⚡",
          title: "Бозхӯрии фаврӣ",
          text: "Мунтазири муаллим ё ҷавоби форум нашавед. Дар якчанд сония бифаҳмед, ки чиро ислоҳ кунед.",
        },
        {
          emoji: "🔒",
          title: "Барои омӯзиши воқеӣ сохта шудааст",
          text: "Бе реклама, бе бозисозии беҳуда — танҳо давраи тези коре, ки маводро воқеан дар хотир нигоҳ медорад.",
        },
      ],
    },
    tryEcho: {
      eyebrow: "Худатон санҷед",
      title: "Мавзӯъро шарҳ диҳед, бозхӯрӣ гиред",
      subtitle:
        "Ягон мавзӯъеро, ки меомӯзед, интихоб кунед ва онро мисли барои дӯст шарҳ диҳед. Echo мегӯяд, ки чӣ намерасад.",
      modeText: "Матн",
      modeVoice: "Овоз",
      topicLabel: "Мавзӯъ",
      topicPlaceholder: "масалан, осмос, қонуни дуюми Нютон, рекурсия...",
      explanationLabel: "Шарҳи шумо",
      explanationPlaceholder:
        "Бо суханони худ шарҳ диҳед, гӯё ба касе меомӯзонед, ки ҳеҷ гоҳ дар бораи он нашунидааст...",
      levelLabel: "Сатҳи шумо",
      levelBeginner: "Навомӯз",
      levelIntermediate: "Миёна",
      levelAdvanced: "Пешрафта",
      levelAuto: "Мутмаин нестам — бигзор AI ҳал кунад",
      submit: "Фаҳмиши маро санҷед",
      submitting: "Таҳлил шуда истодааст...",
      recordStart: "Сабтро оғоз кунед",
      recordStop: "Сабтро қатъ кунед",
      recordAgain: "Дубора сабт кунед",
      recordingHint: "Сабт идома дорад... шарҳи худро бо овоз баланд гӯед.",
      reviewHint: "Бишнавед ва вақте омода шудед, фиристед.",
      idleHint: "Пас аз фиристодани шарҳ, бозхӯрӣ дар ин ҷо пайдо мешавад.",
      loadingHint: "Echo шарҳи шуморо мехонад...",
      aiAnalysis: "Таҳлили AI",
      offlineBadge: "маълумоти намунавии офлайн",
      understandingScore: "Холи фаҳмиш",
      followUpLabel: "Саволи иловагӣ:",
      transcriptLabel: "Он чи Echo шунид:",
      micError: "Дастрасӣ ба микрофон имконнопазир аст. Иҷозатҳои браузерро тафтиш кунед.",
      apiError: "Пайваст шудан бо Echo имконнопазир шуд. Дубора кӯшиш кунед ё ба матн гузаред.",
      scoreBands: {
        veryLow: "Кор амалан ба талаботҳо мувофиқат намекунад.",
        low: "Қисми хурди супориш иҷро шудааст, хатоҳои зиёд мавҷуданд.",
        medium: "Сатҳи миёна — норасоиҳои ҷиддӣ мавҷуданд.",
        good: "Иҷрои хуб, аммо хатоҳо ё нодурустиҳои алоҳида мавҷуданд.",
        veryGood: "Натиҷаи хеле хуб бо эродҳои ночиз.",
        excellent: "Кори қариб беками.",
        perfect: "Пурра ба ҳама меъёрҳо мувофиқат мекунад, бе хато ва камбудӣ.",
      },
      causeLabels: {
        theory: "Норасоии дониши назариявӣ",
        carelessness: "Бепарвоӣ",
        misreading: "Супоришро нодуруст фаҳмидааст",
        logic: "Хатои мантиқӣ",
        calculation: "Хатои ҳисобкунӣ",
      },
      mistakesTitle: "Таҳлили хатоҳо",
      noMistakes: "Хато ёфт нашуд — кори аъло.",
      whyWrongLabel: "Чаро нодуруст аст:",
      correctionLabel: "Шарҳи дуруст:",
      criteriaTitle: "Меъёрҳои баҳогузорӣ",
      recommendationsTitle: "Тавсияҳои шахсӣ",
      reviewTopicsTitle: "Мавзӯъҳо барои такрор",
      practiceTitle: "Машқҳои монанд барои мустаҳкамкунӣ",
      progressLabel: "Пешрафт",
      noHistory: "Ин кӯшиши аввалини шумо оид ба ин мавзӯъ аст — таърих ҳанӯз нест.",
    },
    footer: {
      tagline:
        "Бо шарҳ додан омӯзед. Бозхӯрии AI норасоиҳои шуморо ёфта, дар бартараф кардани онҳо кӯмак мекунад.",
      rightsReserved: "Ҳама ҳуқуқҳо ҳифз шудаанд.",
    },
  },
};
