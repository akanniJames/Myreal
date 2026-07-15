/* =========================================================
   COS 106 Term Project — Akanni James Student Portfolio
   Shared JavaScript: navigation, typing effect, academic
   planner (arrays + DOM manipulation), contact form validation.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initTypingEffect();
  initPlanner();
  initContactForm();
});

/* ---------------------------------------------------------
   1. Mobile navigation toggle
--------------------------------------------------------- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ---------------------------------------------------------
   2. Typing effect for the homepage welcome message
--------------------------------------------------------- */
function initTypingEffect() {
  const el = document.querySelector('[data-typed]');
  if (!el) return;

  const fullText = el.getAttribute('data-typed');
  el.textContent = '';
  let i = 0;

  function type() {
    if (i <= fullText.length) {
      el.textContent = fullText.slice(0, i);
      i++;
      setTimeout(type, 18);
    }
  }
  type();
}

/* ---------------------------------------------------------
   3. Academic Planner
   - Tasks stored as an array of objects in localStorage
   - Add, complete/uncomplete, delete
--------------------------------------------------------- */
const PLANNER_KEY = 'aj_academic_planner_tasks';

function loadTasks() {
  try {
    const raw = localStorage.getItem(PLANNER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Could not read saved tasks:', err);
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(PLANNER_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Could not save tasks:', err);
  }
}

function initPlanner() {
  const form = document.querySelector('#plannerForm');
  const list = document.querySelector('#taskList');
  const emptyState = document.querySelector('#taskEmpty');
  const summary = document.querySelector('#plannerSummary');
  const input = document.querySelector('#taskInput');
  const dueInput = document.querySelector('#taskDue');

  if (!form || !list) return; // not on the planner page

  let tasks = loadTasks();

  function render() {
    list.innerHTML = '';

    if (tasks.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }

    tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.done;
      checkbox.setAttribute('aria-label', 'Mark task as completed');
      checkbox.addEventListener('change', () => toggleTask(task.id));

      const text = document.createElement('span');
      text.className = 'task-text';
      text.textContent = task.text;

      const meta = document.createElement('span');
      meta.className = 'task-meta';
      meta.textContent = task.due ? `due ${task.due}` : 'no due date';

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'task-delete';
      del.textContent = 'Delete';
      del.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(meta);
      li.appendChild(del);
      list.appendChild(li);
    });

    const completed = tasks.filter((t) => t.done).length;
    summary.textContent = `${completed}/${tasks.length} task(s) completed`;
  }

  function addTask(text, due) {
    tasks.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      due,
      done: false,
    });
    saveTasks(tasks);
    render();
  }

  function toggleTask(id) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    saveTasks(tasks);
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks(tasks);
    render();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) {
      input.focus();
      return;
    }
    addTask(value, dueInput.value);
    form.reset();
    input.focus();
  });

  render();
}

/* ---------------------------------------------------------
   4. Contact form validation
   - No field may be empty
   - Email must be a valid format
   - Phone must be a valid Nigerian number
     (07/08/09 + 9 digits, or +234 7/8/9 + 9 digits)
--------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  const status = document.querySelector('#formStatus');
  const fields = {
    name: form.querySelector('#name'),
    email: form.querySelector('#email'),
    phone: form.querySelector('#phone'),
    message: form.querySelector('#message'),
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Nigerian numbers: 0 followed by 7/8/9 and 9 more digits (11 digits total)
  // or +234 followed by 7/8/9 and 9 more digits.
  const ngPhonePattern = /^(?:\+234|0)[789]\d{9}$/;

  function setError(field, message) {
    const errorEl = document.querySelector(`[data-error-for="${field}"]`);
    if (errorEl) errorEl.textContent = message;
  }

  function clearErrors() {
    Object.keys(fields).forEach((key) => setError(key, ''));
  }

  function validate() {
    clearErrors();
    let valid = true;

    if (!fields.name.value.trim()) {
      setError('name', 'Name is required.');
      valid = false;
    }

    const emailVal = fields.email.value.trim();
    if (!emailVal) {
      setError('email', 'Email address is required.');
      valid = false;
    } else if (!emailPattern.test(emailVal)) {
      setError('email', 'Enter a valid email address (e.g. name@example.com).');
      valid = false;
    }

    const phoneRaw = fields.phone.value.trim();
    const phoneVal = phoneRaw.replace(/[\s-]/g, '');
    if (!phoneRaw) {
      setError('phone', 'Phone number is required.');
      valid = false;
    } else if (!/^[0-9+]+$/.test(phoneVal)) {
      setError('phone', 'Phone number must contain digits only.');
      valid = false;
    } else if (!ngPhonePattern.test(phoneVal)) {
      setError('phone', 'Enter a valid Nigerian number, e.g. 08012345678 or +2348012345678.');
      valid = false;
    }

    if (!fields.message.value.trim()) {
      setError('message', 'Message cannot be empty.');
      valid = false;
    }

    return valid;
  }

  // Live validation as the user leaves each field
  Object.values(fields).forEach((field) => {
    field.addEventListener('blur', validate);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const isValid = validate();

    status.classList.remove('show', 'success', 'error');

    if (!isValid) {
      status.textContent = 'Please fix the highlighted fields above.';
      status.classList.add('show', 'error');
      return;
    }

    // No backend is connected — simulate a successful submission.
    status.textContent = `Thanks, ${fields.name.value.trim()}. Your message has been received and James will respond shortly.`;
    status.classList.add('show', 'success');
    form.reset();
  });
}
