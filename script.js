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

  // Store current data in case we want to sort it
  container.sortedData = data;

  container.innerHTML = `
    <table id="beer-table">
      <thead>
        <tr>
          <th data-key="År">År</th>
          <th data-key="Navn">Navn</th>
          <th data-key="Type">Type</th>
          <th data-key="Score">Score</th>
          <th data-key="Rank">Rank</th>
        </tr>
      </thead>
      <tbody>
        ${generateTableRows(data)}
      </tbody>
    </table>
  `;

  // Add sorting listeners
  document.querySelectorAll('#beer-table th').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => sortTable(th.dataset.key, th));
  });
}

function generateTableRows(data) {
  return data.map(b => `
    <tr>
      <td>${b.År}</td>
      <td>${b.Navn}</td>
      <td>${b.Type}</td>
      <td>${b.Score}</td>
      <td>${b.Rank}</td>
    </tr>
  `).join('');
}

let currentSortKey = null;
let currentSortAsc = true;

function sortTable(key, th) {
  const container = document.getElementById('table-container');
  let data = [...container.sortedData];

  // Toggle sort direction
  if (key === currentSortKey) {
    currentSortAsc = !currentSortAsc;
  } else {
    currentSortKey = key;
    currentSortAsc = true;
  }

  // Sort data
  data.sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    if (typeof valA === 'number') {
      return currentSortAsc ? valA - valB : valB - valA;
    }

    return currentSortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Re-render table body
  document.querySelector('#beer-table tbody').innerHTML = generateTableRows(data);

  // Reset all sort indicators
  document.querySelectorAll('#beer-table th').forEach(header => {
    header.classList.remove('sort-asc', 'sort-desc');
  });

  // Apply current sort indicator
  th.classList.add(currentSortAsc ? 'sort-asc' : 'sort-desc');
}

