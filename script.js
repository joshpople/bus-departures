const WORKER_URL = 'https://bus-board.joshpople20.workers.dev'; // ← YOUR Worker URL
const STOP_CODE = '3600SOC31122';

let previousData = []; // Track changes to trigger flips

async function fetchDepartures() {
  try {
    const res = await fetch(`${WORKER_URL}?stop=${STOP_CODE}`);
    if (!res.ok) throw new Error('Worker fetch failed');
    const data = await res.json();

    const tbody = document.getElementById('departures-body');
    tbody.innerHTML = ''; // Clear old rows

    // Decide if we flip (only if data changed significantly)
    const dataChanged = JSON.stringify(data) !== JSON.stringify(previousData);
    previousData = data;

    data.forEach((dep, index) => {
      const row = document.createElement('tr');
      row.className = dataChanged ? 'flip-row' : ''; // Apply flip class if changed

      // Force reflow to restart animation
      if (dataChanged) {
        row.offsetHeight; // Trigger reflow
        setTimeout(() => row.classList.add('flipping'), 10);
        setTimeout(() => {
          row.classList.remove('flipping');
          row.classList.add('flipped');
        }, 50);
      }

      // Route
      const routeTd = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'route-badge';
      badge.textContent = dep.route;
      routeTd.appendChild(badge);

      // Destination
      const destTd = document.createElement('td');
      destTd.textContent = dep.destination;

      // Due (with flip emphasis)
      const dueTd = document.createElement('td');
      dueTd.className = 'due-cell';
      dueTd.textContent = dep.due;

      if (dep.mins <= 5 && dep.mins >= 0) {
        dueTd.classList.add('due-soon');
      } else if (dep.mins <= 0) {
        dueTd.classList.add('due');
        dueTd.textContent = 'Due';
      } else if (!dep.live) {
        dueTd.classList.add('scheduled');
      }

      if (dep.live) {
        const liveSpan = document.createElement('span');
        liveSpan.style.marginLeft = '10px';
        liveSpan.style.color = '#64ffda';
        liveSpan.style.fontSize = '0.9rem';
        liveSpan.textContent = 'Live';
        dueTd.appendChild(liveSpan);
      }

      // Time
      const timeTd = document.createElement('td');
      timeTd.className = 'time-cell';
      timeTd.textContent = dep.expected_time || dep.scheduled_time || '—';

      row.append(routeTd, destTd, dueTd, timeTd);
      tbody.appendChild(row);
    });

    document.getElementById('last-updated').textContent =
      `Last updated: ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

  } catch (err) {
    console.error(err);
    document.getElementById('departures-body').innerHTML =
      '<tr><td colspan="4" style="text-align:center; color:#ff6b6b; padding:30px;">Error loading data. Refresh page or check Worker.</td></tr>';
  }
}

// Load immediately, then every 60 seconds
fetchDepartures();
setInterval(fetchDepartures, 60000);