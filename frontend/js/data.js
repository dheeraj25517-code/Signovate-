// Static fallback — used when backend is unreachable
const staticModules = [
  {
    id: 1,
    name: "Greetings",
    emoji: "👋",
    signs: [
      { word: "Hello",              video: "assets/greetings/Hello.mp4",              quizVideo: "assets/greetings/Quiz_videos/Hello.mp4" },
      { word: "Good Morning",       video: "assets/greetings/Good_Morning.mp4",       quizVideo: "assets/greetings/Quiz_videos/Good_Morning.mp4" },
      { word: "Good Afternoon",     video: "assets/greetings/Good_Afternoon.mp4",     quizVideo: "assets/greetings/Quiz_videos/Good_Afternoon.mp4" },
      { word: "Good Evening",       video: "assets/greetings/Good_Evening.mp4",       quizVideo: "assets/greetings/Quiz_videos/Good_Evening.mp4" },
      { word: "Good Night",         video: "assets/greetings/Good_Night.mp4",         quizVideo: "assets/greetings/Quiz_videos/Good_Night.mp4" },
      { word: "Nice to Meet You",   video: "assets/greetings/Nice_to_Meet_You.mp4",   quizVideo: "assets/greetings/Quiz_videos/Nice_to_Meet_You.mp4" },
      { word: "Thank You",          video: "assets/greetings/Thank_You.mp4",          quizVideo: "assets/greetings/Quiz_videos/Thank_You.mp4" },
      { word: "Please",             video: "assets/greetings/Please.mp4",             quizVideo: "assets/greetings/Quiz_videos/Please.mp4" },
      { word: "Yes",                video: "assets/greetings/Yes.mp4",                quizVideo: "assets/greetings/Quiz_videos/Yes.mp4" },
      { word: "No",                 video: "assets/greetings/No.mp4",                 quizVideo: "assets/greetings/Quiz_videos/No.mp4" },
      { word: "Okay",               video: "assets/greetings/Okay.mp4",               quizVideo: "assets/greetings/Quiz_videos/Okay.mp4" },
      { word: "Excuse Me",          video: "assets/greetings/Excuse_Me.mp4",          quizVideo: "assets/greetings/Quiz_videos/Excuse_Me.mp4" },
      { word: "Wait",               video: "assets/greetings/Wait.mp4",               quizVideo: "assets/greetings/Quiz_videos/Wait.mp4" },
      { word: "Welcome",            video: "assets/greetings/Welcome_(Reply_to_Thanks).mp4", quizVideo: "assets/greetings/Quiz_videos/Welcome.mp4" },
      { word: "What's Up",          video: "assets/greetings/What's_Up.mp4",          quizVideo: "assets/greetings/Quiz_videos/What's_Up.mp4" },
      { word: "What Is Your Name",  video: "assets/greetings/What_Is_Your_Name.mp4",  quizVideo: "assets/greetings/Quiz_videos/What_Is_Your_Name.mp4" },
      { word: "Help",               video: "assets/greetings/Help.mp4",               quizVideo: "assets/greetings/Quiz_videos/Help.mp4" }
    ],
    progress: 0
  }
];

// Live data — populated at runtime
let modules = [];

async function loadModulesFromBackend() {
  // If api.js didn't load for some reason, fall back immediately
  if (typeof getModules !== 'function') {
    modules = staticModules;
    triggerInit();
    return;
  }

  try {
    // 1. Fetch module list + completed lesson ids in parallel
    const [metas, completedIds] = await Promise.all([
      getModules(),
      getProgress().catch(() => [])   // progress failing is non-fatal
    ]);

    // 2. For each module, fetch its lessons
    modules = await Promise.all(metas.map(async (m) => {
      const lessons = await getModuleLessons(m.id).catch(() => []);

      const signs = lessons.map(lesson => ({
        id:    lesson.id,
        word:  lesson.word,
        // backend returns video_path (e.g. "assets/greetings/Hello.mp4")
        video: lesson.video_path || '',
        // backend returns quiz_video_path (e.g. "assets/greetings/Quiz_videos/Hello.mp4")
        // falls back to the lesson video if no separate quiz video exists for this sign
        quizVideo: lesson.quiz_video_path || lesson.video_path || ''
      }));

      const progress = signs.filter(s => completedIds.includes(s.id)).length;

      return {
        id:       m.id,
        name:     m.name,         // backend sends "name" not "title"
        emoji:    m.emoji || '📘',
        signs,
        progress
      };
    }));

  } catch (e) {
    console.warn('Backend unavailable, using static data.', e);
    modules = staticModules;
  }

  triggerInit();
}

// Call whichever page-specific init function is waiting
function triggerInit() {
  if (window.initModules)    window.initModules();
  else if (window.initLesson) window.initLesson();
  else if (window.initQuiz)   window.initQuiz();
  else if (window.initCompletion) window.initCompletion();
}

loadModulesFromBackend();