// Daily motivation widget logic.
// Extracted into a module so it can be unit-tested with `node --test`,
// while index.html imports the same pure functions for the browser.
//
// Spec: .kiro/specs/productivity-dashboard/{requirements,design,tasks}.md

// ----- Quote library (at least 15 entries, frozen so callers can't mutate) -----
export const QUOTES = Object.freeze([
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'Little by little, one travels far.', author: 'J. R. R. Tolkien' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'Do the hard jobs first. The easy jobs will take care of themselves.', author: 'Dale Carnegie' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'Great things are done by a series of small things brought together.', author: 'Vincent van Gogh' },
  { text: 'You do not have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
]);

// Day-of-year index (0-based) for a given date. Used as the modulo base so the
// selected quote is stable for a whole calendar day and changes each day.
// Pure and deterministic given its input.
export function dayIndex(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const current = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((current - start) / oneDay);
}

// Deterministically pick one quote per calendar day. The same date always
// yields the same quote, which also means it works fully offline.
export function pickDailyQuote(quotes = QUOTES, date = new Date()) {
  if (!Array.isArray(quotes) || quotes.length === 0) return null;
  const index = dayIndex(date) % quotes.length;
  return quotes[index];
}
