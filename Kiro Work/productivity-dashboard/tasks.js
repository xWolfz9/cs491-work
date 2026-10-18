// Task-tracker widget logic.
// Pure functions over an array of task objects { id, title, done }.
// Every mutating-looking operation returns a NEW array so the data flow stays
// predictable and the functions are easy to test with `node --test`.
//
// Spec: .kiro/specs/productivity-dashboard/{requirements,design,tasks}.md

// Generate a reasonably unique id. Prefers crypto.randomUUID() (available in
// modern browsers and Node), falling back for environments that lack it.
function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Create a new task object. Not added to any list by itself.
export function createTask(title) {
  return { id: makeId(), title: String(title ?? '').trim(), done: false };
}

// Return a new list with a freshly created task appended. Input is not mutated.
export function addTask(list = [], title) {
  const task = createTask(title);
  return [...list, task];
}

// Return a new list with the task matching `id` toggled. Input is not mutated.
export function toggleTask(list = [], id) {
  return list.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}

// Return a new list with the task matching `id` removed. Input is not mutated.
export function removeTask(list = [], id) {
  return list.filter((task) => task.id !== id);
}

// Integer completion percentage (0..100). Empty lists are 0.
export function completionPercent(list = []) {
  if (!Array.isArray(list) || list.length === 0) return 0;
  const done = list.filter((task) => task && task.done).length;
  return Math.round((done / list.length) * 100);
}

// Color thresholds for the progress bar. Each band applies when
// percent <= max. Exported so tests can assert the mapping.
export const PROGRESS_COLORS = Object.freeze([
  { max: 24, color: '#FF5370' }, // red: just starting
  { max: 49, color: '#FF9E64' }, // orange
  { max: 74, color: '#FFCB6B' }, // amber/yellow
  { max: 99, color: '#9B6DFF' }, // Kiro purple: almost there
  { max: 100, color: '#4ADE80' }, // green: complete
]);

// Map a percentage (0..100) to a colorful bar color using PROGRESS_COLORS.
export function progressColor(percent) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  for (const band of PROGRESS_COLORS) {
    if (p <= band.max) return band.color;
  }
  return PROGRESS_COLORS[PROGRESS_COLORS.length - 1].color;
}
