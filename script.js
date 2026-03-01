// === SUPABASE CONNECTION ===
const SUPABASE_URL = "https://fbnnbkjdnvvtqeivjoyt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_dte-0n8c1xWsI1Aw9rgQ5g_28zwHqJB";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// === SECTION SWITCH ===
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

// === LOAD PROMPTS ===
async function loadPrompts() {
  const { data } = await supabase
    .from("prompts")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("promptContainer");
  container.innerHTML = "";

  data.forEach(post => {
    container.innerHTML += `
      <div class="card">
        <h3>${post.title}</h3>
        <img src="/images/${post.image_base}1.jpg">
        <img src="/images/${post.image_base}2.jpg">
        <button onclick="copyPrompt(\`${post.prompt}\`)">COPY</button>
        <p>${post.prompt}</p>
      </div>
    `;
  });
}

// === LOAD PRODUCTS ===
async function loadProducts() {
  const { data } = await supabase
    .from("Products")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("productContainer");
  container.innerHTML = "";

  data.forEach(product => {
    container.innerHTML += `
      <div class="card">
        <img src="/images/${product.image}">
        <h3>${product.title}</h3>
        <a href="${product.link}" target="_blank">BUY HERE</a>
      </div>
    `;
  });
}

// === COPY FUNCTION ===
function copyPrompt(text) {
  navigator.clipboard.writeText(text);
  alert("Copied");
}

// === INIT ===
loadPrompts();
loadProducts();
