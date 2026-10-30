'use strict';
const excuses = [
  "I'm in an important meeting with a very small coffee.",
  'My out-of-office has developed ambitions.',
  "I've delegated urgency to a cushion.",
  "I'll circle back when the sun does.",
  'My five-year plan currently includes another five minutes.',
  "I'm reviewing the horizon. Initial findings: promising."
];
let excuseIndex = 0;
document.querySelector('#excuse-button').addEventListener('click', () => {
  excuseIndex = (excuseIndex + 1) % excuses.length;
  document.querySelector('#excuse-text').textContent = `“${excuses[excuseIndex]}”`;
  document.querySelector('#excuse-id').textContent = `NO. ${String(excuseIndex + 1).padStart(3, '0')}`;
});
// The film starts only when the visitor asks. No cookies, tracking or requests.
