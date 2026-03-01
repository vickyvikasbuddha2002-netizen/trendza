import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Your actual Supabase project URL and anon key are securely set here
const supabaseUrl = 'https://fbnnbkjdnvvtqeivjoyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_dte-0n8c1xWsI1Aw9rgQ5g_28zwHqJB';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PAGE_SIZE = 9;
let state = {
    prompts: { page: 0, loading: false, hasMore: true, query: '' },
    products: { page: 0, loading: false, hasMore: true, query: '' }
};

let adminToken = sessionStorage.getItem('netizen_admin') || null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadItems('prompts');
    loadItems('products');
    setupSearch();
    setupInfiniteScroll();
    setupModal();
});

// Fetch Data
async function loadItems(type) {
    if (state[type].loading || !state[type].hasMore) return;
    state[type].loading = true;
    document.getElementById(`${type}-loader`).style.display = 'block';

    const from = state[type].page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from(type).select('*').order('created_at', { ascending: false }).range(from, to);
    
    if (state[type].query) {
        query = query.ilike('title', `%${state[type].query}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error(`Error fetching ${type}:`, error);
    } else {
        if (data.length < PAGE_SIZE) state[type].hasMore = false;
        renderItems(type, data, state[type].page === 0);
        state[type].page++;
    }

    state[type].loading = false;
    document.getElementById(`${type}-loader`).style.display = 'none';
}

// Rendering
function renderItems(type, items, clear) {
    const grid = document.getElementById(`${type}-grid`);
    if (clear) grid.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = item.id;
        card.dataset.type = type;

        let content = '';
        if (type === 'prompts') {
            content = `
                <div class="card-images">
                    <img src="/images/${item.image_base}1.jpg" loading="lazy" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                    <img src="/images/${item.image_base}2.jpg" loading="lazy" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                </div>
                <h3>${item.title}</h3>
                <p class="prompt-text">${item.prompt}</p>
                <button class="action-btn copy-btn" onclick="copyText(this, \`${item.prompt.replace(/`/g, '\\`')}\`)">COPY PROMPT</button>
            `;
        } else {
            content = `
                <img src="/images/${item.image}" loading="lazy" style="margin-bottom: 1.5rem" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <h3>${item.title}</h3>
                <a href="${item.link}" target="_blank" class="action-btn">BUY NOW</a>
            `;
        }

        if (adminToken) {
            content += `
                <div class="admin-controls">
                    <button class="admin-btn" onclick='openEditModal(${JSON.stringify(item)}, "${type}")'>Edit</button>
                    <button class="admin-btn" onclick="deleteItem('${item.id}', '${type}')">Delete</button>
                </div>
            `;
        }

        card.innerHTML = content;
        grid.appendChild(card);
    });
}

// Utility functions
window.copyText = (btn, text) => {
    navigator.clipboard.writeText(text);
    const originalText = btn.innerText;
    btn.innerText = 'COPIED!';
    setTimeout(() => btn.innerText = originalText, 2000);
};

// Search filtering
function setupSearch() {
    ['prompts', 'products'].forEach(type => {
        document.getElementById(`search-${type}`).addEventListener('input', (e) => {
            state[type].query = e.target.value;
            state[type].page = 0;
            state[type].hasMore = true;
            loadItems(type);
        });
    });
}

// Infinite Scroll
function setupInfiniteScroll() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'prompts-loader') loadItems('prompts');
                if (entry.target.id === 'products-loader') loadItems('products');
            }
        });
    }, { rootMargin: '200px' });

    observer.observe(document.getElementById('prompts-loader'));
    observer.observe(document.getElementById('products-loader'));
}

/* --- ADMIN SYSTEM --- */

window.handleAdminAction = async (type) => {
    if (!adminToken) {
        const pass = prompt("Enter Admin Password:");
        if (!pass) return;
        
        // Verify password
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });
        
        if (res.ok) {
            adminToken = pass;
            sessionStorage.setItem('netizen_admin', pass);
            
            // Reload the grids silently so the Edit/Delete buttons appear
            state.prompts.page = 0; state.prompts.hasMore = true; 
            document.getElementById('prompts-grid').innerHTML = ''; 
            loadItems('prompts');
            
            state.products.page = 0; state.products.hasMore = true; 
            document.getElementById('products-grid').innerHTML = ''; 
            loadItems('products');
        } else {
            alert("Invalid password. Check your Vercel Environment Variables.");
            return;
        }
    }
    
    // Open modal for Add immediately without refreshing the page
    document.getElementById('item-id').value = '';
    document.getElementById('item-type').value = type;
    document.getElementById('modal-title').innerText = `Add New ${type}`;
    document.getElementById('admin-form').reset();
    toggleFormFields(type);
    document.getElementById('admin-modal').style.display = 'flex';
};

window.openEditModal = (item, type) => {
    document.getElementById('item-id').value = item.id;
    document.getElementById('item-type').value = type;
    document.getElementById('modal-title').innerText = `Edit ${type}`;
    document.getElementById('form-title').value = item.title;
    
    if (type === 'prompts') {
        document.getElementById('form-prompt').value = item.prompt;
        document.getElementById('form-image-base').value = item.image_base;
    } else {
        document.getElementById('form-link').value = item.link;
        document.getElementById('form-image').value = item.image;
    }
    
    toggleFormFields(type);
    document.getElementById('admin-modal').style.display = 'flex';
};

function toggleFormFields(type) {
    const isPrompt = type === 'prompt' || type === 'prompts';
    document.getElementById('group-prompt').style.display = isPrompt ? 'block' : 'none';
    document.getElementById('group-image-base').style.display = isPrompt ? 'block' : 'none';
    document.getElementById('group-link').style.display = !isPrompt ? 'block' : 'none';
    document.getElementById('group-image').style.display = !isPrompt ? 'block' : 'none';
}

window.closeModal = () => {
    document.getElementById('admin-modal').style.display = 'none';
};

function setupModal() {
    document.getElementById('admin-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Saving...';
        submitBtn.disabled = true;

        const id = document.getElementById('item-id').value;
        const type = document.getElementById('item-type').value;
        const table = type === 'prompt' ? 'prompts' : (type === 'product' ? 'products' : type);
        
        const payload = { table, data: { title: document.getElementById('form-title').value }};
        if (table === 'prompts') {
            payload.data.prompt = document.getElementById('form-prompt').value;
            payload.data.image_base = document.getElementById('form-image-base').value;
        } else {
            payload.data.link = document.getElementById('form-link').value;
            payload.data.image = document.getElementById('form-image').value;
        }

        const endpoint = id ? `/api/editItem` : `/api/createItem`;
        if (id) payload.id = id;

        try {
            const res = await fetch(endpoint, {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-pass': adminToken },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                closeModal();
                state[table].page = 0;
                state[table].hasMore = true;
                loadItems(table); // Refresh grid to show new item
            } else {
                const errorData = await res.json();
                alert(`Failed to save item: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Network error. Make sure your environment variables are set in Vercel.");
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

window.deleteItem = async (id, table) => {
    if(!confirm("Are you sure you want to delete this item?")) return;
    try {
        const res = await fetch(`/api/deleteItem`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'x-admin-pass': adminToken },
            body: JSON.stringify({ id, table })
        });
        if(res.ok) {
            document.querySelector(`.card[data-id="${id}"]`).remove();
        } else {
            alert("Failed to delete item.");
        }
    } catch (err) {
        console.error(err);
    }
};
