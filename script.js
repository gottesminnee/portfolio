const projects = [
  {
    title: 'BLUSH CLUB',
    description: 'Разработка интернет-магазина крафтовых напитков, проект включает каталог товаров, корзину, оформление заказов и админ-панель для управления заказами. Backend на Java со Spring Boot, база данных PostgreSQL',
    tags: [
      'JavaScript',
      'Java',
      'Spring Boot',
      'PostgreSQL',
      'HTML',
      'CSS',
      'REST API',
      'GitHub'
    ],
    url: 'https://github.com/gottesminnee/blush-club'
  }
];

const aboutWin = document.getElementById('about');
const projectWin = document.getElementById('project');
const foldersEl = document.getElementById('folders');
const pathEl = document.getElementById('path');
const countEl = document.getElementById('count');
const tabs = document.querySelectorAll('.tab');
const filesEl = document.getElementById('files');
const mobile = window.matchMedia('(max-width: 760px)');

let currentTab = 'home';
let zTop = 10;

function bringToFront(win) {
  zTop += 1;
  win.style.zIndex = zTop;
}

function setPath(text) {
  pathEl.textContent = 'C:\\portfolio\\' + text;
}

function restorePath() {
  setPath(aboutWin.hidden ? 'projects' : 'about_me.txt');
}

function setTab(name) {
  currentTab = name;
  filesEl.dataset.view = name;
  tabs.forEach(function (tab) {
    const active = tab.dataset.tab === name;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  if (name === 'home') {
    aboutWin.hidden = false;
    bringToFront(aboutWin);
  } else {
    aboutWin.hidden = true;
    projectWin.hidden = true;
  }
  restorePath();
}

function renderFolders() {
  foldersEl.innerHTML = '';
  const items = projects.length
    ? projects
    : Array.from({ length: 6 }, function (_, i) {
        return { title: 'project_' + String(i + 1).padStart(2, '0'), empty: true };
      });

  items.forEach(function (project) {
    const el = document.createElement(project.empty ? 'div' : 'button');
    el.className = 'folder' + (project.empty ? ' is-empty' : '');
    if (!project.empty) el.type = 'button';

    const icon = document.createElement('span');
    icon.className = 'folder-icon';
    const name = document.createElement('span');
    name.className = 'folder-name';
    name.textContent = project.title;
    el.append(icon, name);

    if (!project.empty) {
      el.addEventListener('click', function () {
        openProject(project);
      });
    }
    foldersEl.append(el);
  });

  countEl.textContent = 'проектов: ' + projects.length;
}

function bind(name) {
  return projectWin.querySelector('[data-bind="' + name + '"]');
}

function openProject(project) {
  bind('window-title').textContent = 'ПРОЕКТ—' + project.title;
  bind('title').textContent = project.title || '';
  bind('description').textContent = project.description || '';

  const tagList = bind('tags');
  tagList.innerHTML = '';
  (project.tags || []).forEach(function (tag) {
    const li = document.createElement('li');
    li.textContent = tag;
    tagList.append(li);
  });

  const link = bind('link');
  if (project.url) {
    link.href = project.url;
    link.hidden = false;
  } else {
    link.removeAttribute('href');
    link.hidden = true;
  }

  projectWin.classList.remove('is-max', 'is-shaded');
  projectWin.hidden = false;
  bringToFront(projectWin);
  setPath('projects\\' + project.title);
}

function makeDraggable(win) {
  const bar = win.querySelector('.titlebar');
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let box = null;
  let area = null;

  bar.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button') || mobile.matches || win.classList.contains('is-max')) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    originX = Number(win.dataset.tx || 0);
    originY = Number(win.dataset.ty || 0);
    box = win.getBoundingClientRect();
    area = win.parentElement.getBoundingClientRect();
    bar.setPointerCapture(e.pointerId);
  });

  bar.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    const dx = Math.min(Math.max(e.clientX - startX, area.left - box.left), area.right - box.right);
    const dy = Math.min(Math.max(e.clientY - startY, area.top - box.top), area.bottom - box.top - 30);
    win.dataset.tx = originX + dx;
    win.dataset.ty = originY + dy;
    win.style.translate = win.dataset.tx + 'px ' + win.dataset.ty + 'px';
  });

  function stop() {
    dragging = false;
  }
  bar.addEventListener('pointerup', stop);
  bar.addEventListener('pointercancel', stop);
}

document.querySelectorAll('.window').forEach(function (win) {
  makeDraggable(win);
  win.addEventListener('pointerdown', function () {
    bringToFront(win);
  });
  win.querySelectorAll('[data-action="close"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      win.hidden = true;
      restorePath();
    });
  });
  win.querySelectorAll('[data-action="max"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      win.classList.remove('is-shaded');
      win.classList.toggle('is-max');
    });
  });
  win.querySelectorAll('[data-action="shade"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      win.classList.remove('is-max');
      win.classList.toggle('is-shaded');
    });
  });
});

tabs.forEach(function (tab) {
  tab.addEventListener('click', function () {
    setTab(tab.dataset.tab);
  });
});

renderFolders();
setTab(currentTab);