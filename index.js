const output = document.getElementById('passwordOutput');
const copyButton = document.getElementById('copyButton');
const generateButton = document.getElementById('generateButton');
const lengthRange = document.getElementById('lengthRange');
const lengthValue = document.getElementById('lengthValue');
const includeUpper = document.getElementById('includeUpper');
const includeLower = document.getElementById('includeLower');
const includeNumbers = document.getElementById('includeNumbers');
const includeSymbols = document.getElementById('includeSymbols');
const strengthLabel = document.getElementById('strengthLabel');
const strengthBar = document.getElementById('strengthBar');
const generatorStrengthPanel = document.getElementById('generatorStrengthPanel');
const checkerInput = document.getElementById('passwordCheckerInput');
const checkerToggle = document.getElementById('checkerToggleVisibility');
const checkerStrengthLabel = document.getElementById('checkerStrengthLabel');
const checkerStrengthBar = document.getElementById('checkerStrengthBar');
const checkerStrengthPanel = document.getElementById('checkerStrengthPanel');
const checkerSuggestions = document.getElementById('checkerSuggestions');
let checkerVisible = false;

const CHAR_SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  number: '0123456789',
  symbol: '!@#$%^&*()-_=+[]{};:,.<>?'
};

lengthValue.textContent = lengthRange.value;

lengthRange.addEventListener('input', () => {
  lengthValue.textContent = lengthRange.value;
  updateStrength();
});

includeUpper.addEventListener('change', updateStrength);
includeLower.addEventListener('change', updateStrength);
includeNumbers.addEventListener('change', updateStrength);
includeSymbols.addEventListener('change', updateStrength);
checkerInput.addEventListener('input', updateCheckerStrength);
checkerToggle.addEventListener('click', () => {
  checkerVisible = !checkerVisible;
  checkerInput.classList.toggle('password-hidden', !checkerVisible);
  checkerToggle.textContent = checkerVisible ? 'Hide' : 'Show';
  checkerToggle.setAttribute('aria-pressed', checkerVisible.toString());
});

generateButton.addEventListener('click', () => {
  const password = generatePassword(getOptions());
  output.value = password;
  updateStrength(password);
});

copyButton.addEventListener('click', async () => {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    copyButton.textContent = 'Copied!';
    setTimeout(() => { copyButton.textContent = 'Copy'; }, 1500);
  } catch (error) {
    console.error('Copy failed', error);
  }
});

function getOptions() {
  return {
    length: Number(lengthRange.value),
    upper: includeUpper.checked,
    lower: includeLower.checked,
    number: includeNumbers.checked,
    symbol: includeSymbols.checked
  };
}

function generatePassword(options) {
  const availableSets = [];
  if (options.upper) availableSets.push(CHAR_SETS.upper);
  if (options.lower) availableSets.push(CHAR_SETS.lower);
  if (options.number) availableSets.push(CHAR_SETS.number);
  if (options.symbol) availableSets.push(CHAR_SETS.symbol);

  if (!availableSets.length) {
    alert('Please choose at least one character type.');
    return '';
  }

  const passwordChars = [];
  for (const set of availableSets) {
    passwordChars.push(getRandomChar(set));
  }

  const allChars = availableSets.join('');
  while (passwordChars.length < options.length) {
    passwordChars.push(getRandomChar(allChars));
  }

  shuffleArray(passwordChars);
  return passwordChars.slice(0, options.length).join('');
}

function getRandomChar(characters) {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  const index = values[0] % characters.length;
  return characters.charAt(index);
}

function shuffleArray(array) {
  const values = new Uint32Array(array.length);
  window.crypto.getRandomValues(values);
  for (let i = array.length - 1; i > 0; i--) {
    const j = values[i] % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function updateStrength(password) {
  const text = password || output.value;
  const score = calculateStrength(text);
  applyStrengthVisual(generatorStrengthPanel, strengthLabel, strengthBar, score, text);
}

function updateCheckerStrength() {
  const text = checkerInput.value;
  const score = calculateStrength(text);
  applyStrengthVisual(checkerStrengthPanel, checkerStrengthLabel, checkerStrengthBar, score, text);
  renderCheckerSuggestions(text, getStrengthSuggestions(text));
}

function applyStrengthVisual(panel, labelElement, barElement, score, text) {
  const label = !text ? 'None' : score < 35 ? 'Weak' : score < 70 ? 'Medium' : 'Strong';
  const width = text ? Math.min(100, Math.max(10, score)) : 0;

  panel.classList.remove('weak', 'medium', 'strong', 'none');
  if (!text) panel.classList.add('none');
  else if (score < 35) panel.classList.add('weak');
  else if (score < 70) panel.classList.add('medium');
  else panel.classList.add('strong');

  labelElement.textContent = label;
  labelElement.style.color = !text ? 'var(--muted)' : score < 35 ? 'var(--danger)' : score < 70 ? 'var(--warning)' : 'var(--success)';

  let fill = barElement.querySelector('.strength-fill');
  if (!fill) {
    fill = document.createElement('span');
    fill.className = 'strength-fill';
    barElement.appendChild(fill);
  }

  fill.style.width = `${width}%`;
  fill.style.background = !text ? 'transparent' : score < 35 ? 'linear-gradient(90deg, var(--danger), #fca5a5)' : score < 70 ? 'linear-gradient(90deg, var(--warning), #fcd34d)' : 'linear-gradient(90deg, var(--success), var(--accent))';
}

function calculateStrength(password) {
  if (!password) return 0;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const lengthValid = password.length >= 8 && password.length <= 32;

  return [hasUpper, hasLower, hasNumber, hasSymbol, lengthValid].filter(Boolean).length * 20;
}

function getStrengthSuggestions(password) {
  if (!password) return [];

  const suggestions = [];
  if (!/[A-Z]/.test(password)) suggestions.push('Add at least one uppercase letter.');
  if (!/[a-z]/.test(password)) suggestions.push('Add at least one lowercase letter.');
  if (!/[0-9]/.test(password)) suggestions.push('Add at least one number.');
  if (!/[^A-Za-z0-9]/.test(password)) suggestions.push('Add at least one symbol (for example: !@#$%).');
  if (password.length < 8) suggestions.push('Use at least 8 characters for a stronger password.');
  if (password.length > 32) suggestions.push('Use no more than 32 characters to match the checker range.');

  return suggestions;
}

function renderCheckerSuggestions(password, suggestions) {
  if (!checkerSuggestions) return;
  checkerSuggestions.innerHTML = '';

  if (!password) {
    checkerSuggestions.textContent = '';
    return;
  }

  if (suggestions.length === 0) {
    const message = document.createElement('p');
    message.className = 'suggestions-strong';
    message.textContent = 'Great! Your password meets all checklist criteria.';
    checkerSuggestions.appendChild(message);
    return;
  }

  const list = document.createElement('ul');
  suggestions.forEach((suggestion) => {
    const item = document.createElement('li');
    item.textContent = suggestion;
    list.appendChild(item);
  });
  checkerSuggestions.appendChild(list);
}

const learningModules = [
  {
    title: 'Use a longer password',
    description: 'Longer passwords are harder to guess and crack. Aim for at least 12 characters when possible.',
    question: 'Which password is the best choice for strength?',
    explanation: 'Longer passphrases with mixed characters are more secure than short or predictable ones.',
    choices: [
      { text: 'P@ssw0rd123', correct: false },
      { text: 'correcthorsebatteryStaple!', correct: true },
      { text: 'abc123ABC!', correct: false }
    ]
  },
  {
    title: 'Include a mix of characters',
    description: 'A strong password should combine uppercase, lowercase, numbers, and symbols to increase entropy.',
    question: 'What makes a password much harder to crack?',
    explanation: 'Passwords that use a variety of character types are less vulnerable to guessing and brute-force attacks.',
    choices: [
      { text: 'Only letters', correct: false },
      { text: 'Letters, numbers, and symbols', correct: true },
      { text: 'Only numbers', correct: false }
    ]
  },
  {
    title: 'Avoid reuse across accounts',
    description: 'Using the same password on multiple services increases risk if one site is breached.',
    question: 'Why should you avoid password reuse?',
    explanation: 'If one service is compromised, reused passwords allow attackers to access other accounts too.',
    choices: [
      { text: 'It is easier to remember', correct: false },
      { text: 'A breach on one site can expose all accounts', correct: true },
      { text: 'Passwords become stronger over time', correct: false }
    ]
  }
];

function renderLearningModules() {
  const container = document.getElementById('learningModules');
  container.innerHTML = '';

  learningModules.forEach((module, moduleIndex) => {
    const card = document.createElement('article');
    card.className = 'module-card';

    const title = document.createElement('h3');
    title.textContent = module.title;

    const description = document.createElement('p');
    description.textContent = module.description;

    const question = document.createElement('div');
    question.className = 'module-question';
    question.textContent = module.question;

    const actions = document.createElement('div');
    actions.className = 'module-actions';

    module.choices.forEach((choice, choiceIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'module-button';
      button.textContent = choice.text;
      button.addEventListener('click', () => handleModuleAnswer(moduleIndex, choiceIndex, card));
      actions.appendChild(button);
    });

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(question);
    card.appendChild(actions);
    container.appendChild(card);
  });
}

function handleModuleAnswer(moduleIndex, choiceIndex, card) {
  const module = learningModules[moduleIndex];
  const selected = module.choices[choiceIndex];
  const buttons = card.querySelectorAll('.module-button');

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === choiceIndex) {
      button.classList.add(selected.correct ? 'correct' : 'incorrect');
    }
  });

  const existingFeedback = card.querySelector('.module-feedback');
  if (existingFeedback) existingFeedback.remove();

  const feedback = document.createElement('div');
  feedback.className = `module-feedback ${selected.correct ? 'correct' : 'incorrect'}`;

  if (selected.correct) {
    feedback.textContent = 'Great choice! That option uses a strong, memorable phrase with high entropy.';
  } else {
    const correctAnswer = module.choices.find((choice) => choice.correct)?.text || 'the best answer';
    feedback.innerHTML = `Incorrect. The correct answer is <strong>${correctAnswer}</strong>.<br>${module.explanation}`;
  }

  card.appendChild(feedback);
}

renderLearningModules();

// Initialize with a default generated password
updateStrength('');
updateCheckerStrength();

