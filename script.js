const SUPABASE_URL = "https://fbnnbkjdnvvtqeivjoyt.supabase.co";
const SUPABASE_KEY = "sb_publishable_dte-0n8c1xWsI1Aw9rgQ5g_28zwHqJB";

const supabase = window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

let isAdmin = false;

function showSection(id){
document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

async function loadPrompts(){
let search = document.getElementById("searchPrompt").value.toLowerCase();

const {data,error} = await supabase
.from("prompts")
.select("*")
.order("created_at",{ascending:false});

if(error){console.log(error);return;}

let container=document.getElementById("promptContainer");
container.innerHTML="";

data
.filter(p=>p.title.toLowerCase().includes(search))
.forEach(p=>{
container.innerHTML+=`
<div class="card">
<h2>${p.title}</h2>
<div class="images">
<img src="${SUPABASE_URL}/storage/v1/object/public/ai-prompts/${p.id}-1.jpg">
<img src="${SUPABASE_URL}/storage/v1/object/public/ai-prompts/${p.id}-2.jpg">
</div>
<p>${p.prompt}</p>
<button class="copy-btn" onclick="copyText('${p.prompt}')">Copy</button>
${isAdmin ? `<button class="delete-btn" onclick="deletePrompt('${p.id}')">Delete</button>` : ""}
</div>
`;
});
}

async function loadProducts(){
let search = document.getElementById("searchProduct").value.toLowerCase();

const {data,error} = await supabase
.from("products")
.select("*")
.order("created_at",{ascending:false});

if(error){console.log(error);return;}

let container=document.getElementById("productContainer");
container.innerHTML="";

data
.filter(p=>p.title.toLowerCase().includes(search))
.forEach(p=>{
container.innerHTML+=`
<div class="card">
<img class="product-img" src="${SUPABASE_URL}/storage/v1/object/public/viral-products/${p.id}.jpg">
<h2>${p.title}</h2>
<a href="${p.link}" target="_blank">Buy Here</a>
${isAdmin ? `<
