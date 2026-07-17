// Coordinate Finder - Main Application Logic

// State management
let coordinates = [];
let toastTimeout = null;

// DOM Elements
const btnStart = document.getElementById('btn-start');
const btnClearAll = document.getElementById('btn-clear-all');
const btnExportCsv = document.getElementById('btn-export-csv');
const btnExportJson = document.getElementById('btn-export-json');
const fullscreenContainer = document.getElementById('fullscreen-container');
const toast = document.getElementById('toast');
const tbody = document.getElementById('coordinates-tbody');
const emptyState = document.getElementById('empty-state');
const themeToggle = document.getElementById('theme-toggle');

// Load coordinates from LocalStorage on load
function init() {
  const stored = localStorage.getItem('coordinates');
  if (stored) {
    try {
      coordinates = JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored coordinates", e);
      coordinates = [];
    }
  }
  renderCoordinates();
}

// Save coordinates to LocalStorage
function saveCoordinates() {
  localStorage.setItem('coordinates', JSON.stringify(coordinates));
}

// Render the coordinates list in the main page
function renderCoordinates() {
  tbody.innerHTML = '';
  
  if (coordinates.length === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    
    // Render coordinates in reverse order (newest first)
    coordinates.slice().reverse().forEach((coord, idx) => {
      const actualIndex = coordinates.length - idx;
      const row = document.createElement('tr');
      
      // Index cell
      const cellIndex = document.createElement('td');
      cellIndex.textContent = actualIndex;
      row.appendChild(cellIndex);
      
      // X coordinate cell
      const cellX = document.createElement('td');
      cellX.className = 'font-mono';
      cellX.textContent = `${coord.x}px`;
      row.appendChild(cellX);
      
      // Y coordinate cell
      const cellY = document.createElement('td');
      cellY.className = 'font-mono';
      cellY.textContent = `${coord.y}px`;
      row.appendChild(cellY);
      
      // Timestamp cell
      const cellTime = document.createElement('td');
      const date = new Date(coord.timestamp);
      cellTime.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      cellTime.title = date.toLocaleString();
      row.appendChild(cellTime);
      
      // Action (delete) cell
      const cellAction = document.createElement('td');
      cellAction.style.textAlign = 'center';
      
      const btnDelete = document.createElement('button');
      btnDelete.className = 'btn-delete-row';
      btnDelete.title = 'Delete this coordinate';
      btnDelete.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;
      
      btnDelete.addEventListener('click', () => {
        deleteCoordinate(actualIndex - 1);
      });
      
      cellAction.appendChild(btnDelete);
      row.appendChild(cellAction);
      
      tbody.appendChild(row);
    });
  }
}

// Delete individual coordinate
function deleteCoordinate(index) {
  coordinates.splice(index, 1);
  saveCoordinates();
  renderCoordinates();
}

// Show mini popup toast at the bottom right
function showToast(x, y) {
  toast.textContent = `Captured: X: ${x}, Y: ${y}`;
  toast.classList.add('show');
  
  // Trigger a subtle pop-in animation on new click
  toast.classList.remove('pulse');
  void toast.offsetWidth; // Trigger reflow to restart CSS animation
  toast.classList.add('pulse');
  
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  
  // Hide toast after 2 seconds
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.remove('pulse');
  }, 2000);
}

// Fullscreen actions
function enterFullscreen() {
  if (fullscreenContainer.requestFullscreen) {
    fullscreenContainer.requestFullscreen().catch(err => {
      console.error("Error requesting fullscreen:", err);
      // Fallback
      fullscreenContainer.classList.add('active');
    });
  } else if (fullscreenContainer.webkitRequestFullscreen) { /* Safari */
    fullscreenContainer.webkitRequestFullscreen();
  } else if (fullscreenContainer.msRequestFullscreen) { /* IE11 */
    fullscreenContainer.msRequestFullscreen();
  } else {
    // Non-supported browsers fallback
    fullscreenContainer.classList.add('active');
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen().catch(err => {
      console.error("Error exiting fullscreen:", err);
      fullscreenContainer.classList.remove('active');
    });
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  } else {
    fullscreenContainer.classList.remove('active');
  }
}

// Fullscreen state change listener
function handleFullscreenChange() {
  const isFs = document.fullscreenElement === fullscreenContainer ||
               document.webkitFullscreenElement === fullscreenContainer ||
               document.msFullscreenElement === fullscreenContainer;
               
  if (isFs) {
    fullscreenContainer.classList.add('active');
  } else {
    fullscreenContainer.classList.remove('active');
    renderCoordinates(); // Update list in case of changes
  }
}

// Toggle between Light and Dark themes
function toggleTheme() {
  let currentTheme = document.documentElement.getAttribute('data-theme');
  if (!currentTheme) {
    // If no explicit data-theme is set, read prefers-color-scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = prefersDark ? 'dark' : 'light';
  }
  
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaColorScheme) {
    metaColorScheme.content = newTheme;
  }
  
  localStorage.setItem('color-scheme', newTheme);
}

// Event Listeners
btnStart.addEventListener('click', enterFullscreen);
themeToggle.addEventListener('click', toggleTheme);

// Fullscreen container click - record coordinates
fullscreenContainer.addEventListener('click', (e) => {
  // Calculate relative coordinates (Top-Left as 0,0)
  const x = e.clientX;
  const y = e.clientY;
  
  // Record coordinate
  coordinates.push({
    x: x,
    y: y,
    timestamp: new Date().toISOString()
  });
  
  saveCoordinates();
  showToast(x, y);
});

// Clear all coordinates
btnClearAll.addEventListener('click', () => {
  if (coordinates.length === 0) return;
  
  if (confirm("Are you sure you want to clear all recorded coordinates?")) {
    coordinates = [];
    saveCoordinates();
    renderCoordinates();
  }
});

// CSV Export utility
btnExportCsv.addEventListener('click', () => {
  if (coordinates.length === 0) return;
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Index,X (Relative px),Y (Relative px),Timestamp\n";
  
  coordinates.forEach((coord, index) => {
    const timeStr = new Date(coord.timestamp).toLocaleString().replace(/,/g, '');
    csvContent += `${index + 1},${coord.x},${coord.y},${timeStr}\n`;
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `coordinates_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// JSON Export utility
btnExportJson.addEventListener('click', () => {
  if (coordinates.length === 0) return;
  
  const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(coordinates, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", jsonContent);
  link.setAttribute("download", `coordinates_export_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Watch for browser fullscreen state changes
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

// Run initial load
window.addEventListener('DOMContentLoaded', init);
