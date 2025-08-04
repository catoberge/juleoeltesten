let beers = [];
let chart;

fetch('sorted_data.json')
  .then(res => res.json())
  .then(data => {
    beers = data;
    initFilters();
    updateDashboard();
  });

function initFilters() {
  const years = [...new Set(beers.map(b => b.Year))].sort();
  const yearSelect = document.getElementById('year-filter');
  yearSelect.innerHTML = `<option value="">Alle år</option>` +
    years.map(y => `<option value="${y}">${y}</option>`).join('');

  document.getElementById('year-filter').addEventListener('change', updateDashboard);
  document.getElementById('type-filter').addEventListener('change', updateDashboard);
  document.getElementById('search-input').addEventListener('input', updateDashboard);
}

function updateDashboard() {
  const year = document.getElementById('year-filter').value;
  const type = document.getElementById('type-filter').value;
  const search = document.getElementById('search-input').value.toLowerCase();

  const filtered = beers.filter(b => {
    return (!year || b.Year == year) &&
      (!type || b.Type === type) &&
      (!search || b.Name.toLowerCase().includes(search));
  });

  renderChart(filtered);
  renderTable(filtered);
}

function renderChart(data) {
  const top = [...data].sort((a, b) => b.Score - a.Score).slice(0, 10);

  const labels = top.map(b => `${b.Name} (${b.Year})`);
  const scores = top.map(b => b.Score);

  const ctx = document.getElementById('score-chart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Top 10 Scores',
        data: scores,
        backgroundColor: 'rgba(200, 50, 50, 0.7)'
      }]
    }
  });
}

function renderTable(data) {
  const container = document.getElementById('table-container');
  container.innerHTML = `
    <table border="1" cellspacing="0" cellpadding="5">
      <thead>
        <tr>
          <th>Year</th><th>Name</th><th>Type</th><th>Score</th><th>Rank</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(b => `
          <tr>
            <td>${b.Year}</td>
            <td>${b.Name}</td>
            <td>${b.Type}</td>
            <td>${b.Score}</td>
            <td>${b.Rank}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;
}
