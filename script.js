let categories = [];
let tasks = [];
let collapsedCategories = [];

function saveAndRender() {
  localStorage.setItem('categories', JSON.stringify(categories));
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('collapsed', JSON.stringify(collapsedCategories));
  renderCategories();
  renderTasks();
}

function load() {
  categories = JSON.parse(localStorage.getItem('categories')) || [];
  tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  collapsedCategories = JSON.parse(localStorage.getItem('collapsed')) || [];
  renderCategories();
  renderTasks();
}

function addCategory() {
  const input = document.getElementById('newCategory');
  const name = input.value.trim();
  if (name && !categories.includes(name)) {
    categories.push(name);
    input.value = '';
    saveAndRender();
  }
}

function deleteCategory(cat) {
  if (confirm(`Excluir categoria "${cat}"?`)) {
    categories = categories.filter(c => c !== cat);
    tasks = tasks.filter(t => t.categoria !== cat);
    collapsedCategories = collapsedCategories.filter(c => c !== cat);
    saveAndRender();
  }
}

function addTask() {
  const input = document.getElementById('newTask');
  const title = input.value.trim();
  const categoria = categories.length > 0 ? categories[0] : null;
  if (title && categoria) {
    tasks.push({ id: crypto.randomUUID(), titulo: title, categoria, status: 'A Fazer', concluida: false });
    input.value = '';
    saveAndRender();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

function toggleTaskCompletion(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.concluida = !task.concluida;
  saveAndRender();
}

function toggleCategoryVisibility(cat) {
  const index = collapsedCategories.indexOf(cat);
  if (index >= 0) collapsedCategories.splice(index, 1);
  else collapsedCategories.push(cat);
  saveAndRender();
}

function isCategoryVisible(cat) {
  return !collapsedCategories.includes(cat);
}

function renderCategories() {
  const list = document.getElementById('categoryList');
  list.innerHTML = categories.map(cat => `
    <li class="category-item">
      <span class="category-name">${cat}</span>
      <div class="category-buttons">
        <button onclick="toggleCategoryVisibility('${cat}')">
          ${isCategoryVisible(cat) ? 'Ocultar' : 'Mostrar'}
        </button>
        <button class="danger" onclick="deleteCategory('${cat}')">Excluir</button>
      </div>
    </li>
  `).join('');
}

function renderTasks() {
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = '';

  const statusList = ['A Fazer', 'Em Progresso', 'Concluído'];
  const kanban = document.createElement('div');
  kanban.className = 'kanban';

  statusList.forEach(status => {
    const column = document.createElement('div');
    column.className = 'column';

    const title = document.createElement('h3');
    title.innerText = status;
    column.appendChild(title);

    categories.forEach(cat => {
      if (isCategoryVisible(cat)) {
        const catTitle = document.createElement('h4');
        catTitle.innerText = cat;
        catTitle.style.margin = '10px 0 5px 0';
        catTitle.style.fontWeight = '500';
        catTitle.style.color = '#999';
        column.appendChild(catTitle);

        tasks.filter(t => t.status === status && t.categoria === cat)
          .forEach(task => {
            const div = document.createElement('div');
            div.className = 'task';
            if (task.concluida) div.classList.add('completed');

            div.innerHTML = `
              <span onclick="toggleTaskCompletion('${task.id}')">${task.titulo}</span>
              <button onclick="deleteTask('${task.id}')">&times;</button>
            `;
            column.appendChild(div);
          });
      }
    });

    kanban.appendChild(column);
  });

  board.appendChild(kanban);
}

load();