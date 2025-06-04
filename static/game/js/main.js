document.addEventListener('DOMContentLoaded', () => {
  // Find the checkbox and the background‐music audio element
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic     = document.getElementById('bgMusic');

  if (musicToggle && bgMusic) {
    // Restore last setting (optional)
    const saved = localStorage.getItem('musicOn');
    if (saved === 'false') {
      bgMusic.pause();
      musicToggle.checked = false;
    } else {
      bgMusic.play();
      musicToggle.checked = true;
    }

    // Toggle music on/off
    musicToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        bgMusic.play();
        localStorage.setItem('musicOn', 'true');
      } else {
        bgMusic.pause();
        localStorage.setItem('musicOn', 'false');
      }
    });
  }
});
