const API_BASE = "http://localhost:8000";

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    throw new Error(`API error ${response.status} on ${path}`);
  }
  return response.json();
}

async function getModules() {
  return fetchJson("/modules");
}

async function getModuleLessons(moduleId) {
  return fetchJson(`/modules/${moduleId}/lessons`);
}

async function getLesson(lessonId) {
  return fetchJson(`/lessons/${lessonId}`);
}

async function getLessonQuiz(lessonId) {
  return fetchJson(`/lessons/${lessonId}/quiz`);
}

async function getProgress() {
  return fetchJson("/progress");
}

async function getStreak() {
  return fetchJson("/streak");
}

async function recordStreak() {
  return fetchJson("/streak/record", { method: "POST" });
}

async function postProgressComplete(payload) {
  return fetchJson("/progress/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Expose as globals (no ES modules — plain script tags)
window.getModules           = getModules;
window.getModuleLessons     = getModuleLessons;
window.getLesson            = getLesson;
window.getLessonQuiz        = getLessonQuiz;
window.getProgress          = getProgress;
window.getStreak            = getStreak;
window.recordStreak         = recordStreak;
window.postProgressComplete = postProgressComplete;
