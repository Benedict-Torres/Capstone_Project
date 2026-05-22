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
  const options = getOptions();
  const text = password || output.value;
  const score = calculateStrength(text, options);
  applyStrengthVisual(generatorStrengthPanel, strengthLabel, strengthBar, score, text);
}

function updateCheckerStrength() {
  const text = checkerInput.value;
  const options = getPasswordOptions(text);
  const score = calculateStrength(text, options);
  applyStrengthVisual(checkerStrengthPanel, checkerStrengthLabel, checkerStrengthBar, score, text);
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

function getPasswordOptions(password) {
  return {
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password)
  };
}

function calculateStrength(password, options) {
  if (!password) return 0;
  let score = 0;
  const length = password.length;
  score += Math.min(40, length * 2);
  const variety = [options.upper, options.lower, options.number, options.symbol].filter(Boolean).length;
  score += variety * 15;
  if (/[A-Z]/.test(password)) score += 5;
  if (/[a-z]/.test(password)) score += 5;
  if (/[0-9]/.test(password)) score += 5;
  if (/[^A-Za-z0-9]/.test(password)) score += 5;
  return Math.min(100, score);
}

// Initialize with a default generated password
updateStrength('');
updateCheckerStrength();

