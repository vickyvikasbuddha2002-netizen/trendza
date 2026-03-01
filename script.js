import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://fbnnbkjdnvvtqeivjoyt.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE' // Put your actual key here
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Make functions global so HTML onclick works
window.handleAdminAction = handleAdminAction;
window.closeModal = closeModal;

async function fetchItems(table) {
    // SORTING: display_order (high to low), then created_at (newest first)
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('display_order', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) console.error(`Error fetching ${table}:`, error);
    return data || [];
}

async function renderGrids() {
    const prompts = await fetchItems('prompts');
    const products = await fetchItems('products');

    const promptsGrid = document.getElementById('prompts-grid');
    const productsGrid = document.getElementById('products-grid');

    promptsGrid.innerHTML = prompts.map(p => `
        <div class="card">
            <img src="/images/${p.image_base}.jpg" alt="${p.title}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
            <div class="card-info">
                <h3>${p.title}</h3>
                <p class="prompt-text">${p.prompt}</p>
                <button onclick="copyPrompt('${p.prompt.replace(/'/g, "\\'")}')" class="copy-btn">Copy Prompt</button>
            </div>
        </div>
    `).join('');

    productsGrid.innerHTML = products.map(p => `
        <div class="card">
            <img src="/images/${p.image}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/300x400?text=No+Image'">
            <div class="card-info">
                <h3>${p.title}</h3>
                <a href="${p.link}" target="_blank" class="buy-btn">View Product</a>
            </div>
        </div>
    `).join('');

    document.getElementById('prompts-loader').style.display = 'none';
    document.getElementById('products-loader').style.display = 'none';
}

function handleAdminAction(type) {
    const password = prompt("Enter Admin Password:");
    if (password === "Vikas@242002") { // Change this to your password
        openModal(type);
    } else {
        alert("Access Denied");
    }
}

function openModal(type) {
    const modal = document.getElementById('admin-modal');
    const itemType = document.getElementById('item-type');
    itemType.value = type;
    
    // Reset form
    document.getElementById('admin-form').reset();
    document.getElementById('item-id').value = '';

    // Show/Hide fields based on type
    document.getElementById('group-prompt').style.display = type === 'prompt' ? 'block' : 'none';
    document.getElementById('group-image-base').style.display = type === 'prompt' ? 'block' : 'none';
    document.getElementById('group-link').style.display = type === 'product' ? 'block' : 'none';
    document.getElementById('group-image').style.display = type === 'product' ? 'block' : 'none';

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('admin-modal').style.display = 'none';
}

document.getElementById('admin-form').onsubmit = async (e) => {
    e.preventDefault();
    const type = document.getElementById('item-type').value;
    const table = type === 'prompt' ? 'prompts' : 'products';
    
    const payload = {
        table: table,
        data: {
            title: document.getElementById('form-title').value,
            display_order: parseInt(document.getElementById('form-order').value) || 0
        }
    };

    if (type === 'prompt') {
        payload.data.prompt = document.getElementById('form-prompt').value;
        payload.data.image_base = document.getElementById('form-image-base').value;
    } else {
        payload.data.link = document.getElementById('form-link').value;
        payload.data.image = document.getElementById('form-image').value;
    }

    try {
        const response = await fetch('/api/createItem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Saved successfully!");
            closeModal();
            renderGrids();
        } else {
            alert("Error saving data.");
        }
    } catch (err) {
        console.error(err);
    }
};

window.copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    alert("Prompt copied to clipboard!");
}

// Initial Load
renderGrids();
