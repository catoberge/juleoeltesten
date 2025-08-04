let beers = [];
let chart;

// Load JSON file (must contain fields like "År", "Navn", "Type", etc.)
fetch('sorted_data.json')
  .then(res => res.json())
  .then(data => {
    beers = data;
    initFilters();
    updateDashboard();
  });

// Initialize dropdown filters
function initFilters() {
  const years = [...new Set(beers.map(b => b.År))].sort();
  const yearSelect = document.getElementById('year-filter');

  yearSelect.innerHTML = `<option value="">Alle år</option>` +
    years.map(y => `<option value="${y}">${y}</option>`).join('');

  // Attach filter event listeners
  document.getElementById('year-filter').addEventListener('change', updateDashboard);
  document.getElementById('type-filter').addEventListener('change', updateDashboard);
  document.getElementById('search-input').addEventListener('input', updateDashboard);
}

// Called every time a filter changes
function updateDashboard() {
  const år = document.getElementById('year-filter').value;
  const type = document.getElementById('type-filter').value;
  const søk = document.getElementById('search-input').value.toLowerCase();

  // Filter beers based on all selected criteria
  const filtered = beers.filter(b => {
    return (!år || b.År == år) &&
      (!type || b.Type === type) &&
      (!søk || (b.Navn && b.Navn.toLowerCase().includes(søk)));
  });

  renderChart(filtered);
  renderTable(filtered);
}

// Draw the bar chart with top 10 scores
function renderChart(data) {
  const top = [...data].sort((a, b) => b.Score - a.Score).slice(0, 10);
  const labels = top.map(b => `${b.Navn} (${b.År})`);
  const scores = top.map(b => b.Score);

  const ctx = document.getElementById('score-chart').getContext('2d');

  // Destroy old chart if it exists
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Topp 10 poengscore',
        data: scores,
        backgroundColor: 'rgba(200, 50, 50, 0.7)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Create an HTML table of the filtered beers
function renderTable(data) {
  const container = document.getElementById('table-container');
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>År</th><th>Navn</th><th>Type</th><th>Score</th><th>Rank</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(b => `
          <tr>
            <td>${b.År}</td>
            <td>${b.Navn}</td>
            <td>${b.Type}</td>
            <td>${b.Score}</td>
            <td>${b.Rank}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;
}
