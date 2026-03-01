let ADMIN_PASSWORD = "trendza123";

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function loadPrompts() {
  const res = await fetch('data/ai-prompts.json');
  const data = await res.json();

  const container = document.getElementById('promptContainer');
  container.innerHTML = "";

  data.forEach(item => {
    container.innerHTML += `
      <div class="card">
        <h2>${item.title}</h2>
        <div style="display:flex; gap:10px;">
          <img src="ai-prompts/${item.title}-prompt1.jpg">
          <img src="ai-prompts/${item.title}-prompt2.jpg">
        </div>
        <p>${item.prompt}</p>
        <button onclick="copyText('${item.prompt}')">Copy</button>
      </div>
    `;
  });
}

async function loadProducts() {
  const res = await fetch('data/viral-products.json');
  const data = await res.json();

  const container = document.getElementById('productContainer');
  container.innerHTML = "";

  data.forEach(item => {
    container.innerHTML += `
      <div class="card">
        <img src="viral-products/${item.title}.jpg">
        <h2>${item.title}</h2>
        <a href="${item.link}" target="_blank">Buy Here</a>
      </div>
    `;
  });
}

function copyText(text) {
  navigator.clipboard.writeText(text);
  alert("Copied!");
}

function adminAccess(type) {
  let pass = prompt("Enter Admin Password");
  if (pass !== ADMIN_PASSWORD) {
    alert("Wrong password");
    return;
  }

  let title = prompt("Enter Title");
  let content = prompt("Enter Prompt / Link");

  alert("Now manually update JSON file in GitHub.");
}

loadPrompts();
loadProducts();
