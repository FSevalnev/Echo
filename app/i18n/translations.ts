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
    rooms: string;
    reviews: string;
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
    levelSchoolchild: string;
    levelStudent: string;
    levelProfessional: string;
    gradeLabel: string;
    gradeOption: string;
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
    transcribing: string;
    transcribeError: string;
    transcribeRetry: string;
    transcriptEditLabel: string;
    transcriptEditHint: string;
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
    modeFile: string;
    fileChoose: string;
    fileChooseAnother: string;
    fileHint: string;
    fileTypeError: string;
    fileSizeError: string;
    signUpPrompt: string;
    clearExplanation: string;
  };
  footer: {
    tagline: string;
    rightsReserved: string;
  };
  auth: {
    signInTitle: string;
    signUpTitle: string;
    signInSubmit: string;
    signUpSubmit: string;
    submitting: string;
    continueWithGoogle: string;
    orDivider: string;
    emailLabel: string;
    passwordLabel: string;
    noAccount: string;
    haveAccount: string;
    backHome: string;
    checkEmail: string;
    notConfigured: string;
    signOut: string;
    history: string;
    profile: string;
    displayNameLabel: string;
    displayNamePlaceholder: string;
    saveChanges: string;
    saved: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    passwordMismatch: string;
    passwordTooShort: string;
    avatarLabel: string;
    avatarChoose: string;
    avatarTypeError: string;
    avatarSizeError: string;
    showPassword: string;
    hidePassword: string;
  };
  history: {
    title: string;
    subtitle: string;
    empty: string;
    signInPrompt: string;
    backHome: string;
    loading: string;
    scoreLabel: string;
    dateLabel: string;
    topicLabel: string;
    clearAll: string;
    searchPlaceholder: string;
    statusLabel: string;
    statusAll: string;
    statusMastered: string;
    statusInProgress: string;
    statusNeedsWork: string;
    dateFromLabel: string;
    dateToLabel: string;
    minScoreLabel: string;
    sortLabel: string;
    sortRecent: string;
    sortBest: string;
    sortMostPracticed: string;
    noResults: string;
    overviewTopicsTracked: string;
    overviewMasteredCount: string;
    overviewHardestTitle: string;
    overviewMasteredTitle: string;
    overviewEmpty: string;
    firstAttemptLabel: string;
    lastAttemptLabel: string;
    bestScoreLabel: string;
    averageScoreLabel: string;
    repetitionsLabel: string;
    improvementLabel: string;
    daysPracticedLabel: string;
    daysPracticedShortLabel: string;
    daysPracticedToday: string;
    topMistakeLabel: string;
    attemptLabel: string;
    whatYouAnsweredLabel: string;
    fileSubmissionNote: string;
    voiceNoTranscriptNote: string;
    chartTitle: string;
  };
  rooms: {
    title: string;
    subtitle: string;
    signInPrompt: string;
    createTitle: string;
    joinTitle: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    topicLabel: string;
    topicPlaceholder: string;
    randomTopic: string;
    randomTopicLoading: string;
    randomTopicError: string;
    levelLabel: string;
    gradeLabel: string;
    roundsLabel: string;
    secondsLabel: string;
    createSubmit: string;
    creating: string;
    codeLabel: string;
    codePlaceholder: string;
    joinSubmit: string;
    joining: string;
    notConfigured: string;
    roomNotFound: string;
    genericError: string;
    lobbyTitle: string;
    lobbyWaiting: string;
    lobbyHostHint: string;
    participantsTitle: string;
    hostBadge: string;
    youBadge: string;
    startRound: string;
    starting: string;
    shareHint: string;
    copyCode: string;
    copied: string;
    roundLabel: string;
    ofLabel: string;
    timeLeft: string;
    timeUp: string;
    answerLabel: string;
    answerPlaceholder: string;
    submitAnswer: string;
    submittingAnswer: string;
    answerSubmitted: string;
    waitingOthers: string;
    submittedCount: string;
    leaderboardTitle: string;
    roundScoreLabel: string;
    totalScoreLabel: string;
    yourFeedback: string;
    winnerAnswerLabel: string;
    nextRound: string;
    finishRoom: string;
    finalLeaderboardTitle: string;
    playAgain: string;
    backHome: string;
    leaveRoom: string;
    hostOnlyHint: string;
    noAnswerSubmitted: string;
  };
  reviews: {
    leaveReviewTitle: string;
    ratingLabel: string;
    textPlaceholder: string;
    submit: string;
    submitting: string;
    posted: string;
    editHint: string;
    signInPrompt: string;
    notConfigured: string;
    textError: string;
    genericError: string;
    empty: string;
  };
};

export const translations: Record<Lang, Dictionary> = {
  en: {
    nav: {
      home: "Home",
      howItWorks: "How it Works",
      features: "Features",
      tryEcho: "Try Echo",
      rooms: "Rooms",
      reviews: "Reviews",
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
      levelSchoolchild: "Schoolchild (school curriculum)",
      levelStudent: "University student",
      levelProfessional: "Professional",
      gradeLabel: "Grade",
      gradeOption: "Grade {n}",
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
      transcribing: "Transcribing your recording...",
      transcribeError: "Couldn't transcribe the recording. You can retry, or submit the audio as-is.",
      transcribeRetry: "Retry transcription",
      transcriptEditLabel: "Here's what we heard — edit it if anything's off",
      transcriptEditHint: "Fix any mistranscribed words before submitting for the most accurate analysis.",
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
      modeFile: "Photo/File",
      fileChoose: "Choose a photo or file",
      fileChooseAnother: "Choose a different file",
      fileHint: "JPG, PNG, or PDF — a photo of your notes, a diagram, or a scanned page.",
      fileTypeError: "That file type isn't supported. Please upload a JPG, PNG, WEBP, or PDF.",
      fileSizeError: "That file is too large. Please keep it under 15MB.",
      signUpPrompt: "Sign up to save this progress and see it on any device.",
      clearExplanation: "Clear",
    },
    footer: {
      tagline:
        "Learn by explaining. AI feedback that finds your gaps and helps you close them.",
      rightsReserved: "All rights reserved.",
    },
    auth: {
      signInTitle: "Sign In",
      signUpTitle: "Sign Up",
      signInSubmit: "Sign In",
      signUpSubmit: "Create Account",
      submitting: "Please wait...",
      continueWithGoogle: "Continue with Google",
      orDivider: "or",
      emailLabel: "Email",
      passwordLabel: "Password",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      backHome: "Back to Echo",
      checkEmail: "Check your inbox to confirm your email, then sign in.",
      notConfigured:
        "Accounts aren't set up for this deployment yet — you can still use Echo as a guest.",
      signOut: "Sign Out",
      history: "History",
      profile: "Profile",
      displayNameLabel: "Display name",
      displayNamePlaceholder: "How should we call you?",
      saveChanges: "Save changes",
      saved: "Saved.",
      newPasswordLabel: "New password",
      confirmPasswordLabel: "Confirm new password",
      passwordMismatch: "Passwords don't match.",
      passwordTooShort: "Password must be at least 6 characters.",
      avatarLabel: "Profile photo",
      avatarChoose: "Change photo",
      avatarTypeError: "Please upload a JPG, PNG, or WEBP image.",
      avatarSizeError: "That image is too large. Please keep it under 5MB.",
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
    history: {
      title: "Your Progress",
      subtitle: "Every AI-graded attempt, saved to your account.",
      empty: "No attempts yet — go explain something on the homepage.",
      signInPrompt: "Sign in to see your saved progress.",
      backHome: "← Back to Echo",
      loading: "Loading your history...",
      scoreLabel: "Score",
      dateLabel: "Date",
      topicLabel: "Topic",
      clearAll: "Clear history",
      searchPlaceholder: "Search your topics...",
      statusLabel: "Status",
      statusAll: "All",
      statusMastered: "Mastered",
      statusInProgress: "In progress",
      statusNeedsWork: "Needs work",
      dateFromLabel: "From",
      dateToLabel: "To",
      minScoreLabel: "Minimum score",
      sortLabel: "Sort by",
      sortRecent: "Most recent",
      sortBest: "Best score",
      sortMostPracticed: "Most practiced",
      noResults: "No topics match your filters.",
      overviewTopicsTracked: "Topics tracked",
      overviewMasteredCount: "Mastered",
      overviewHardestTitle: "Toughest topics",
      overviewMasteredTitle: "Fully mastered",
      overviewEmpty: "Not enough data yet.",
      firstAttemptLabel: "First attempt",
      lastAttemptLabel: "Last attempt",
      bestScoreLabel: "Best score",
      averageScoreLabel: "Average score",
      repetitionsLabel: "Repetitions",
      improvementLabel: "Improvement",
      daysPracticedLabel: "Practiced over {n} days",
      daysPracticedShortLabel: "Days practiced",
      daysPracticedToday: "Practiced today",
      topMistakeLabel: "Most common mistake",
      attemptLabel: "Attempt",
      whatYouAnsweredLabel: "What you answered",
      fileSubmissionNote: "Submitted as a photo/file — original not stored.",
      voiceNoTranscriptNote: "Submitted by voice.",
      chartTitle: "Understanding over time",
    },
    rooms: {
      title: "Study Rooms",
      subtitle: "Create a room, invite friends with a code, and see who explains it best.",
      signInPrompt: "Sign in to create or join a room.",
      createTitle: "Create a room",
      joinTitle: "Join a room",
      subjectLabel: "Subject",
      subjectPlaceholder: "e.g. Biology, Math, History...",
      topicLabel: "Topic",
      topicPlaceholder: "e.g. Osmosis, Newton's second law...",
      randomTopic: "🎲 Random topic",
      randomTopicLoading: "Picking...",
      randomTopicError: "Couldn't generate a topic. Try again or type your own.",
      levelLabel: "Level",
      gradeLabel: "Grade",
      roundsLabel: "Rounds",
      secondsLabel: "Seconds per round",
      createSubmit: "Create room",
      creating: "Creating...",
      codeLabel: "Room code",
      codePlaceholder: "e.g. AB3F9",
      joinSubmit: "Join room",
      joining: "Joining...",
      notConfigured: "Accounts aren't set up for this deployment yet, so Rooms isn't available.",
      roomNotFound: "No room found with that code.",
      genericError: "Something went wrong. Try again.",
      lobbyTitle: "Lobby",
      lobbyWaiting: "Waiting for the host to start the first round...",
      lobbyHostHint: "Share the code below, then start the round once everyone's in.",
      participantsTitle: "Participants",
      hostBadge: "Host",
      youBadge: "You",
      startRound: "Start round",
      starting: "Starting...",
      shareHint: "Share this code so others can join:",
      copyCode: "Copy code",
      copied: "Copied!",
      roundLabel: "Round",
      ofLabel: "of",
      timeLeft: "Time left",
      timeUp: "Time's up",
      answerLabel: "Your explanation",
      answerPlaceholder: "Explain it in your own words...",
      submitAnswer: "Submit answer",
      submittingAnswer: "Grading...",
      answerSubmitted: "Answer submitted — waiting for the round to end.",
      waitingOthers: "Waiting for other participants...",
      submittedCount: "submitted",
      leaderboardTitle: "Round leaderboard",
      roundScoreLabel: "Round score",
      totalScoreLabel: "Total score",
      yourFeedback: "Your feedback",
      winnerAnswerLabel: "Everyone's answers this round",
      nextRound: "Next round",
      finishRoom: "Finish room",
      finalLeaderboardTitle: "Final results",
      playAgain: "Create another room",
      backHome: "← Back to Echo",
      leaveRoom: "Leave room",
      hostOnlyHint: "Only the host can do this.",
      noAnswerSubmitted: "No answer submitted in time.",
    },
    reviews: {
      leaveReviewTitle: "Leave a review",
      ratingLabel: "Your rating",
      textPlaceholder: "What's your experience with Echo been like?",
      submit: "Post review",
      submitting: "Posting...",
      posted: "Thanks for your review!",
      editHint: "You've already reviewed Echo — posting again will update it.",
      signInPrompt: "Sign in to leave a review.",
      notConfigured: "Accounts aren't set up for this deployment yet, so reviews aren't available.",
      textError: "Write a few words about your experience.",
      genericError: "Something went wrong. Try again.",
      empty: "No reviews yet — be the first!",
    },
  },

  ru: {
    nav: {
      home: "Главная",
      howItWorks: "Как это работает",
      features: "Возможности",
      tryEcho: "Попробовать Echo",
      rooms: "Комнаты",
      reviews: "Отзывы",
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
      levelSchoolchild: "Школьник (школьная программа)",
      levelStudent: "Студент (университет)",
      levelProfessional: "Профессионал",
      gradeLabel: "Класс",
      gradeOption: "{n} класс",
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
      transcribing: "Распознаём запись...",
      transcribeError: "Не удалось распознать запись. Можешь повторить попытку или отправить аудио как есть.",
      transcribeRetry: "Повторить распознавание",
      transcriptEditLabel: "Вот что мы услышали — отредактируй, если что-то не так",
      transcriptEditHint: "Исправь неточности перед отправкой, чтобы анализ был точнее.",
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
      modeFile: "Фото/Файл",
      fileChoose: "Выбрать фото или файл",
      fileChooseAnother: "Выбрать другой файл",
      fileHint: "JPG, PNG или PDF — фото твоих конспектов, схема или скан страницы.",
      fileTypeError: "Этот тип файла не поддерживается. Загрузи JPG, PNG, WEBP или PDF.",
      fileSizeError: "Файл слишком большой. Держи его меньше 15МБ.",
      signUpPrompt: "Зарегистрируйся, чтобы сохранить этот прогресс и видеть его на любом устройстве.",
      clearExplanation: "Очистить",
    },
    footer: {
      tagline: "Учись, объясняя. ИИ-фидбек находит твои пробелы и помогает их закрыть.",
      rightsReserved: "Все права защищены.",
    },
    auth: {
      signInTitle: "Войти",
      signUpTitle: "Регистрация",
      signInSubmit: "Войти",
      signUpSubmit: "Создать аккаунт",
      submitting: "Подождите...",
      continueWithGoogle: "Продолжить с Google",
      orDivider: "или",
      emailLabel: "Email",
      passwordLabel: "Пароль",
      noAccount: "Нет аккаунта?",
      haveAccount: "Уже есть аккаунт?",
      backHome: "Назад в Echo",
      checkEmail: "Проверь почту, чтобы подтвердить email, затем войди.",
      notConfigured:
        "Аккаунты пока не настроены для этого деплоя — можно пользоваться Echo как гость.",
      signOut: "Выйти",
      history: "История",
      profile: "Профиль",
      displayNameLabel: "Отображаемое имя",
      displayNamePlaceholder: "Как тебя называть?",
      saveChanges: "Сохранить",
      saved: "Сохранено.",
      newPasswordLabel: "Новый пароль",
      confirmPasswordLabel: "Повтори новый пароль",
      passwordMismatch: "Пароли не совпадают.",
      passwordTooShort: "Пароль должен быть не короче 6 символов.",
      avatarLabel: "Фото профиля",
      avatarChoose: "Изменить фото",
      avatarTypeError: "Загрузи изображение JPG, PNG или WEBP.",
      avatarSizeError: "Файл слишком большой. Держи его меньше 5МБ.",
      showPassword: "Показать пароль",
      hidePassword: "Скрыть пароль",
    },
    history: {
      title: "Твой прогресс",
      subtitle: "Каждая попытка, оценённая ИИ, сохранена в твоём аккаунте.",
      empty: "Пока нет попыток — объясни что-нибудь на главной странице.",
      signInPrompt: "Войди, чтобы увидеть сохранённый прогресс.",
      backHome: "← Назад в Echo",
      loading: "Загружаю историю...",
      scoreLabel: "Оценка",
      dateLabel: "Дата",
      topicLabel: "Тема",
      clearAll: "Очистить историю",
      searchPlaceholder: "Поиск по темам...",
      statusLabel: "Статус",
      statusAll: "Все",
      statusMastered: "Освоено",
      statusInProgress: "В процессе",
      statusNeedsWork: "Нужно доработать",
      dateFromLabel: "С",
      dateToLabel: "По",
      minScoreLabel: "Минимальный балл",
      sortLabel: "Сортировка",
      sortRecent: "Сначала недавние",
      sortBest: "По лучшему баллу",
      sortMostPracticed: "По числу попыток",
      noResults: "Нет тем, подходящих под фильтры.",
      overviewTopicsTracked: "Тем отслеживается",
      overviewMasteredCount: "Освоено",
      overviewHardestTitle: "Сложнее всего даётся",
      overviewMasteredTitle: "Полностью освоено",
      overviewEmpty: "Пока недостаточно данных.",
      firstAttemptLabel: "Первая попытка",
      lastAttemptLabel: "Последняя попытка",
      bestScoreLabel: "Лучший балл",
      averageScoreLabel: "Средний балл",
      repetitionsLabel: "Повторений",
      improvementLabel: "Улучшение",
      daysPracticedLabel: "Практика в течение {n} дней",
      daysPracticedShortLabel: "Дней практики",
      daysPracticedToday: "Практика сегодня",
      topMistakeLabel: "Частая ошибка",
      attemptLabel: "Попытка",
      whatYouAnsweredLabel: "Твой ответ",
      fileSubmissionNote: "Отправлено как фото/файл — оригинал не сохраняется.",
      voiceNoTranscriptNote: "Отправлено голосом.",
      chartTitle: "Понимание со временем",
    },
    rooms: {
      title: "Комнаты",
      subtitle: "Создай комнату, пригласи друзей по коду и узнай, кто объясняет лучше всех.",
      signInPrompt: "Войди, чтобы создать или зайти в комнату.",
      createTitle: "Создать комнату",
      joinTitle: "Зайти в комнату",
      subjectLabel: "Предмет",
      subjectPlaceholder: "например, биология, математика, история...",
      topicLabel: "Тема",
      topicPlaceholder: "например, осмос, второй закон Ньютона...",
      randomTopic: "🎲 Случайная тема",
      randomTopicLoading: "Подбираю...",
      randomTopicError: "Не удалось подобрать тему. Попробуй ещё раз или впиши свою.",
      levelLabel: "Уровень",
      gradeLabel: "Класс",
      roundsLabel: "Раунды",
      secondsLabel: "Секунд на раунд",
      createSubmit: "Создать комнату",
      creating: "Создаю...",
      codeLabel: "Код комнаты",
      codePlaceholder: "например, AB3F9",
      joinSubmit: "Зайти",
      joining: "Захожу...",
      notConfigured: "Аккаунты пока не настроены для этого деплоя, поэтому Комнаты недоступны.",
      roomNotFound: "Комната с таким кодом не найдена.",
      genericError: "Что-то пошло не так. Попробуй ещё раз.",
      lobbyTitle: "Лобби",
      lobbyWaiting: "Ждём, пока хост начнёт первый раунд...",
      lobbyHostHint: "Поделись кодом ниже, затем начни раунд, когда все зайдут.",
      participantsTitle: "Участники",
      hostBadge: "Хост",
      youBadge: "Ты",
      startRound: "Начать раунд",
      starting: "Начинаю...",
      shareHint: "Поделись этим кодом, чтобы другие могли зайти:",
      copyCode: "Скопировать код",
      copied: "Скопировано!",
      roundLabel: "Раунд",
      ofLabel: "из",
      timeLeft: "Осталось времени",
      timeUp: "Время вышло",
      answerLabel: "Твоё объяснение",
      answerPlaceholder: "Объясни своими словами...",
      submitAnswer: "Отправить ответ",
      submittingAnswer: "Проверяю...",
      answerSubmitted: "Ответ отправлен — ждём окончания раунда.",
      waitingOthers: "Ждём остальных участников...",
      submittedCount: "отправили",
      leaderboardTitle: "Рейтинг раунда",
      roundScoreLabel: "Очки за раунд",
      totalScoreLabel: "Всего очков",
      yourFeedback: "Твой фидбек",
      winnerAnswerLabel: "Ответы всех участников в этом раунде",
      nextRound: "Следующий раунд",
      finishRoom: "Завершить комнату",
      finalLeaderboardTitle: "Итоговый результат",
      playAgain: "Создать ещё одну комнату",
      backHome: "← Назад в Echo",
      leaveRoom: "Покинуть комнату",
      hostOnlyHint: "Это может сделать только хост.",
      noAnswerSubmitted: "Ответ не был отправлен вовремя.",
    },
    reviews: {
      leaveReviewTitle: "Оставить отзыв",
      ratingLabel: "Твоя оценка",
      textPlaceholder: "Как тебе Echo? Поделись впечатлением.",
      submit: "Опубликовать",
      submitting: "Публикую...",
      posted: "Спасибо за отзыв!",
      editHint: "Ты уже оставлял отзыв — повторная публикация обновит его.",
      signInPrompt: "Войди, чтобы оставить отзыв.",
      notConfigured: "Аккаунты пока не настроены для этого деплоя, поэтому отзывы недоступны.",
      textError: "Напиши пару слов о своём опыте.",
      genericError: "Что-то пошло не так. Попробуй ещё раз.",
      empty: "Пока нет отзывов — стань первым!",
    },
  },

  tg: {
    nav: {
      home: "Асосӣ",
      howItWorks: "Чӣ тавр кор мекунад",
      features: "Хусусиятҳо",
      tryEcho: "Echo-ро санҷед",
      rooms: "Утоқҳо",
      reviews: "Тақризҳо",
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
      levelSchoolchild: "Хонандаи мактаб (барномаи мактабӣ)",
      levelStudent: "Донишҷӯ (донишгоҳ)",
      levelProfessional: "Мутахассис",
      gradeLabel: "Синф",
      gradeOption: "Синфи {n}",
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
      transcribing: "Сабт дар ҳоли шинохта шудан аст...",
      transcribeError: "Сабт шинохта нашуд. Метавонед аз нав кӯшиш кунед ё аудиоро ҳамин тавр фиристед.",
      transcribeRetry: "Аз нав шинохтан",
      transcriptEditLabel: "Инак чизе ки шунидем — агар чизе нодуруст бошад, тағир диҳед",
      transcriptEditHint: "Пеш аз фиристодан хатогиҳоро ислоҳ кунед, то таҳлил дақиқтар шавад.",
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
      modeFile: "Акс/Файл",
      fileChoose: "Акс ё файл интихоб кунед",
      fileChooseAnother: "Файли дигар интихоб кунед",
      fileHint: "JPG, PNG ё PDF — акси конспектҳои шумо, диаграмма ё саҳифаи сканшуда.",
      fileTypeError: "Ин навъи файл дастгирӣ намешавад. JPG, PNG, WEBP ё PDF бор кунед.",
      fileSizeError: "Файл хеле калон аст. Онро то 15МБ нигоҳ доред.",
      signUpPrompt: "Барои нигоҳ доштани ин пешрафт ва дидани он дар ҳар дастгоҳ бақайд гиред.",
      clearExplanation: "Тоза кардан",
    },
    footer: {
      tagline:
        "Бо шарҳ додан омӯзед. Бозхӯрии AI норасоиҳои шуморо ёфта, дар бартараф кардани онҳо кӯмак мекунад.",
      rightsReserved: "Ҳама ҳуқуқҳо ҳифз шудаанд.",
    },
    auth: {
      signInTitle: "Ворид шудан",
      signUpTitle: "Бақайдгирӣ",
      signInSubmit: "Ворид шудан",
      signUpSubmit: "Ҳисоб созед",
      submitting: "Лутфан интизор шавед...",
      continueWithGoogle: "Бо Google идома диҳед",
      orDivider: "ё",
      emailLabel: "Email",
      passwordLabel: "Парол",
      noAccount: "Ҳисоб надоред?",
      haveAccount: "Аллакай ҳисоб доред?",
      backHome: "Бозгашт ба Echo",
      checkEmail: "Барои тасдиқи email-и худ почтаро тафтиш кунед, сипас ворид шавед.",
      notConfigured:
        "Ҳисобҳо барои ин деплой ҳанӯз танзим нашудаанд — шумо метавонед Echo-ро ҳамчун меҳмон истифода баред.",
      signOut: "Баромадан",
      history: "Таърих",
      profile: "Профил",
      displayNameLabel: "Номи намоишӣ",
      displayNamePlaceholder: "Шуморо чӣ тавр номем?",
      saveChanges: "Нигоҳ доштан",
      saved: "Нигоҳ дошта шуд.",
      newPasswordLabel: "Пароли нав",
      confirmPasswordLabel: "Пароли нави худро такрор кунед",
      passwordMismatch: "Паролҳо мувофиқат намекунанд.",
      passwordTooShort: "Парол бояд ҳадди ақал аз 6 аломат иборат бошад.",
      avatarLabel: "Акси профил",
      avatarChoose: "Иваз кардани акс",
      avatarTypeError: "Лутфан тасвири JPG, PNG ё WEBP бор кунед.",
      avatarSizeError: "Файл хеле калон аст. Онро то 5МБ нигоҳ доред.",
      showPassword: "Намоиш додани парол",
      hidePassword: "Пинҳон кардани парол",
    },
    history: {
      title: "Пешрафти шумо",
      subtitle: "Ҳар кӯшише, ки аз ҷониби AI баҳо дода шудааст, дар ҳисоби шумо нигоҳ дошта мешавад.",
      empty: "Ҳанӯз кӯшише нест — дар саҳифаи асосӣ чизеро шарҳ диҳед.",
      signInPrompt: "Барои дидани пешрафти сабтшуда ворид шавед.",
      backHome: "← Бозгашт ба Echo",
      loading: "Таърих бор карда истодааст...",
      scoreLabel: "Хол",
      dateLabel: "Сана",
      topicLabel: "Мавзӯъ",
      clearAll: "Тоза кардани таърих",
      searchPlaceholder: "Ҷустуҷӯ бо мавзӯъҳо...",
      statusLabel: "Ҳолат",
      statusAll: "Ҳама",
      statusMastered: "Азхудшуда",
      statusInProgress: "Дар раванд",
      statusNeedsWork: "Ниёз ба кор дорад",
      dateFromLabel: "Аз",
      dateToLabel: "То",
      minScoreLabel: "Ҳадди ақали хол",
      sortLabel: "Тартиб",
      sortRecent: "Аввал охирин",
      sortBest: "Аз рӯи беҳтарин хол",
      sortMostPracticed: "Аз рӯи шумораи кӯшишҳо",
      noResults: "Ягон мавзӯъ ба филтрҳо мувофиқат намекунад.",
      overviewTopicsTracked: "Мавзӯъҳои пайгирӣшуда",
      overviewMasteredCount: "Азхудшуда",
      overviewHardestTitle: "Мушкилтарин мавзӯъҳо",
      overviewMasteredTitle: "Пурра азхудшуда",
      overviewEmpty: "Маълумот ҳанӯз кофӣ нест.",
      firstAttemptLabel: "Кӯшиши аввалин",
      lastAttemptLabel: "Кӯшиши охирин",
      bestScoreLabel: "Беҳтарин хол",
      averageScoreLabel: "Холи миёна",
      repetitionsLabel: "Такрорҳо",
      improvementLabel: "Беҳбудӣ",
      daysPracticedLabel: "Дар давоми {n} рӯз машқ карда шуд",
      daysPracticedShortLabel: "Рӯзҳои машқ",
      daysPracticedToday: "Имрӯз машқ карда шуд",
      topMistakeLabel: "Хатои маъмултарин",
      attemptLabel: "Кӯшиш",
      whatYouAnsweredLabel: "Ҷавоби шумо",
      fileSubmissionNote: "Ҳамчун акс/файл фиристода шуд — нусхаи аслӣ нигоҳ дошта намешавад.",
      voiceNoTranscriptNote: "Бо овоз фиристода шуд.",
      chartTitle: "Фаҳмиш бо гузашти вақт",
    },
    rooms: {
      title: "Утоқҳо",
      subtitle: "Утоқ созед, дӯстонро бо код даъват кунед ва бинед, ки кӣ беҳтарин шарҳ медиҳад.",
      signInPrompt: "Барои сохтан ё пайвастан ба утоқ ворид шавед.",
      createTitle: "Утоқ созед",
      joinTitle: "Ба утоқ пайвастан",
      subjectLabel: "Фан",
      subjectPlaceholder: "масалан, биология, математика, таърих...",
      topicLabel: "Мавзӯъ",
      topicPlaceholder: "масалан, осмос, қонуни дуюми Нютон...",
      randomTopic: "🎲 Мавзӯи тасодуфӣ",
      randomTopicLoading: "Интихоб шуда истодааст...",
      randomTopicError: "Мавзӯъ интихоб карда нашуд. Дубора кӯшиш кунед ё худатон нависед.",
      levelLabel: "Сатҳ",
      gradeLabel: "Синф",
      roundsLabel: "Даврҳо",
      secondsLabel: "Сония барои як давр",
      createSubmit: "Утоқ созед",
      creating: "Сохта истодааст...",
      codeLabel: "Коди утоқ",
      codePlaceholder: "масалан, AB3F9",
      joinSubmit: "Пайвастан",
      joining: "Пайваст шуда истодааст...",
      notConfigured: "Ҳисобҳо барои ин деплой ҳанӯз танзим нашудаанд, бинобар ин Утоқҳо дастрас нест.",
      roomNotFound: "Утоқ бо ин код ёфт нашуд.",
      genericError: "Хатое рух дод. Дубора кӯшиш кунед.",
      lobbyTitle: "Лобби",
      lobbyWaiting: "Интизори он ҳастем, ки хост давраи якумро оғоз кунад...",
      lobbyHostHint: "Коди зеринро мубодила кунед, сипас вақте ҳама пайваст шуданд, давраро оғоз кунед.",
      participantsTitle: "Иштирокчиён",
      hostBadge: "Хост",
      youBadge: "Шумо",
      startRound: "Давраро оғоз кунед",
      starting: "Оғоз шуда истодааст...",
      shareHint: "Ин кодро мубодила кунед, то дигарон пайваст шаванд:",
      copyCode: "Нусхабардории код",
      copied: "Нусха бардошта шуд!",
      roundLabel: "Давра",
      ofLabel: "аз",
      timeLeft: "Вақти боқимонда",
      timeUp: "Вақт тамом шуд",
      answerLabel: "Шарҳи шумо",
      answerPlaceholder: "Бо суханони худ шарҳ диҳед...",
      submitAnswer: "Ҷавобро фиристед",
      submittingAnswer: "Санҷида истодааст...",
      answerSubmitted: "Ҷавоб фиристода шуд — интизори анҷоми давра ҳастем.",
      waitingOthers: "Интизори дигар иштирокчиён ҳастем...",
      submittedCount: "фиристоданд",
      leaderboardTitle: "Рейтинги давра",
      roundScoreLabel: "Холи давра",
      totalScoreLabel: "Ҳамагӣ хол",
      yourFeedback: "Бозхӯрии шумо",
      winnerAnswerLabel: "Ҷавобҳои ҳамаи иштирокчиён дар ин давра",
      nextRound: "Давраи навбатӣ",
      finishRoom: "Утоқро анҷом диҳед",
      finalLeaderboardTitle: "Натиҷаи ниҳоӣ",
      playAgain: "Утоқи дигар созед",
      backHome: "← Бозгашт ба Echo",
      leaveRoom: "Утоқро тарк кунед",
      hostOnlyHint: "Инро танҳо хост карда метавонад.",
      noAnswerSubmitted: "Ҷавоб дар вақташ фиристода нашуд.",
    },
    reviews: {
      leaveReviewTitle: "Тақриз гузоштан",
      ratingLabel: "Баҳои шумо",
      textPlaceholder: "Таассуроти шумо аз Echo чӣ гуна аст?",
      submit: "Нашр кардан",
      submitting: "Нашр шуда истодааст...",
      posted: "Ташаккур барои тақриз!",
      editHint: "Шумо аллакай тақриз гузоштаед — нашри такрорӣ онро навсозӣ мекунад.",
      signInPrompt: "Барои гузоштани тақриз ворид шавед.",
      notConfigured: "Ҳисобҳо барои ин деплой ҳанӯз танзим нашудаанд, бинобар ин тақризҳо дастрас нестанд.",
      textError: "Дар бораи таассуроти худ чанд калима нависед.",
      genericError: "Хатое рух дод. Дубора кӯшиш кунед.",
      empty: "Ҳанӯз тақризе нест — аввалин шавед!",
    },
  },
};
