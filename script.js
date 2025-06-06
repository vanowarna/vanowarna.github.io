// Theme toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  // Optional: Change icon
  const btn = document.getElementById('theme-toggle');
  btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});
