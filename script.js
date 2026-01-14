const WORKER_URL = 'bus-board.joshpople20.workers.dev'; // ← Replace with your Worker URL
const STOP_CODE = '3600SOC31122'; // or make dynamic via ?stop= in URL

async function fetchDepartures() {
  try {
    const res = await fetch(`${WORKER_URL}?stop=${STOP_CODE}`);
    if (!res.ok) throw new Error('Worker error');
    const data = await res.json();

    const tbody = document.getElementById('departures-body');
    tbody.innerHTML = '';

    if (data.departures) { // if wrapped in future
      data = data.departures;
    }

    data.forEach(dep => {
      const row = document.createElement('tr');

      const routeTd = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'route-badge';
      badge.textContent = dep.route;
      routeTd.appendChild(badge);

      const destTd = document.createElement('td');
      destTd.textContent = dep.destination;

      const dueTd = document.createElement('td');
      dueTd.textContent = dep.due;
      if (dep.mins <= 5 && dep.mins >= 0) {
        dueTd.className = 'due-soon';
      } else if (dep.mins <= 0) {
        dueTd.className = 'due';
        dueTd.textContent = 'Due';
      } else if (!dep.live) {
        dueTd.className = 'scheduled';
      }

      if (dep.live) {
        const liveSpan = document.createElement('span');
        liveSpan.className = 'live-indicator';
        liveSpan.textContent = 'Live';
        dueTd.appendChild(liveSpan);
      }

      const timeTd = document.createElement('td');
      timeTd.textContent = dep.expected_time || dep.scheduled_time || '—';

      row.append(routeTd, destTd, dueTd, timeTd);
      tbody.appendChild(row);
    });

    document.getElementById('last-updated').textContent =
      `Last updated: ${new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'})}`;

  } catch (err) {
    console.error(err);
    document.getElementById('departures-body').innerHTML =
      '<tr><td colspan="4" style="text-align:center;color:#d32f2f;">Error loading departures. Try refreshing.</td></tr>';
  }
}

// Initial load + auto-refresh every 60 seconds
fetchDepartures();
setInterval(fetchDepartures, 60000);