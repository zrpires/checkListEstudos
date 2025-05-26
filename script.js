let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let currentCategory = null;
let score = parseInt(localStorage.getItem("score")) || 0;
let chart;

updateScore();
renderCategories();
renderTasks();
renderKanban();
updateChart();

function addCategory() {
  const input = document.getElementById("categoryInput");
  const category = input.value.trim();
  if (category && !categories.includes(category)) {
    categories.push(category);
    input.value = "";
    saveAndRender();
  }
}

function renderCategories() {
  const list = document.getElementById("categoryList");
  list.innerHTML = categories.map(cat => `<button onclick="selectCategory('${cat}')">${cat}</button>`).join(" ");
}

function selectCategory(cat) {
  currentCategory = cat;
  renderTasks();
  renderKanban();
  updateChart();
}

function addTask() {
  const input = document.getElementById("taskInput");
  const name = input.value.trim();
  if (name && currentCategory) {
    tasks.push({
      id: Date.now(),
      name,
      completed: false,
      categoria: currentCategory,
      status: 'todo'
    });
    input.value = "";
    saveAndRender();
  }
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    score += task.completed ? 10 : -10;
    if (score < 0) score = 0;
    document.getElementById("completeSound").play();
    saveAndRender();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  const filtered = tasks.filter(t => t.categoria === currentCategory);
  list.innerHTML = filtered.map(t => `
    <div class="task ${t.completed ? 'completed' : ''}" onclick="toggleTask(${t.id})">
      ${t.name}
      <button onclick="event.stopPropagation(); deleteTask(${t.id})">Excluir</button>
    </div>
  `).join("");
  updateProgress(filtered);
}

function updateProgress(filtered) {
  const completed = filtered.filter(t => t.completed).length;
  const percent = filtered.length ? (completed / filtered.length) * 100 : 0;
  document.getElementById("progressFill").style.width = `${percent}%`;
  document.getElementById("progressText").textContent = `${completed} de ${filtered.length} tarefas concluídas`;
}

function updateScore() {
  document.getElementById("score").textContent = score;
  let conquista = "Nenhuma conquista";
  if (score >= 50) conquista = "Iniciante";
  if (score >= 150) conquista = "Produtivo";
  if (score >= 300) conquista = "Especialista em CheckList";
  document.getElementById("achievements").textContent = conquista;
}

function renderKanban() {
  ["todo", "inprogress", "done"].forEach(id => {
    let title = "";
    if (id === "todo") title = "A Fazer";
    else if (id === "inprogress") title = "Em Progresso";
    else if (id === "done") title = "Concluído";
    document.getElementById(id).innerHTML = `<h3>${title}</h3>`;
  });

  tasks.filter(t => t.categoria === currentCategory).forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.textContent = task.name;
    div.onclick = () => {
      task.status = task.status === "todo" ? "inprogress" : task.status === "inprogress" ? "done" : "todo";
      saveAndRender();
    };
    document.getElementById(task.status).appendChild(div);
  });
}

function updateChart() {
  const ctx = document.getElementById('taskChart').getContext('2d');
  if (chart) chart.destroy();
  const dados = categories.map(cat => {
    const total = tasks.filter(t => t.categoria === cat).length;
    const concluidas = tasks.filter(t => t.categoria === cat && t.completed).length;
    return { total, concluidas };
  });
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [
        { label: 'Totais', data: dados.map(d => d.total), backgroundColor: '#6666ff' },
        { label: 'Concluídas', data: dados.map(d => d.concluidas), backgroundColor: '#33cc66' }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: '#eee' } } },
      scales: { x: { ticks: { color: '#eee' } }, y: { ticks: { color: '#eee' } } }
    }
  });
}

function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("score", score);
  renderCategories();
  renderTasks();
  renderKanban();
  updateChart();
  updateScore();
}

function exportBackup() {
  const data = { tasks, categories, score };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'backup.json';
  a.click();
}

function importBackup() {
  document.getElementById('importFile').click();
  document.getElementById('importFile').onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      tasks = data.tasks || [];
      categories = data.categories || [];
      score = data.score || 0;
      saveAndRender();
    };
    reader.readAsText(file);
  };
}
