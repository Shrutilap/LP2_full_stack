const API_URL = '/api/posts';
const blogGrid = document.getElementById('blog-grid');
const modal = document.getElementById('modal');
const postForm = document.getElementById('post-form');
const createPostBtn = document.getElementById('create-post-btn');
const closeBtn = document.querySelector('.close-btn');
const modalTitle = document.getElementById('modal-title');
const readModal = document.getElementById('read-modal');
const closeReadModalBtn = document.getElementById('close-read-modal');

// Fetch and render posts
async function fetchPosts() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        blogGrid.innerHTML = '<div class="loader">Error loading stories. Please check your connection.</div>';
    }
}

function renderPosts(posts) {
    if (posts.length === 0) {
        blogGrid.innerHTML = '<div class="loader">No stories found. Be the first to write one!</div>';
        return;
    }

    blogGrid.innerHTML = posts.map(post => `
        <article class="blog-card" data-id="${post._id}">
            <img src="${post.imageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1000'}" alt="${post.title}" class="card-image">
            <div class="card-content">
                <span class="category-tag">${post.category || 'General'}</span>
                <h3>${post.title}</h3>
                <button onclick="readPost('${post._id}')" class="read-btn">Read More →</button>
                <div class="card-footer">
                    <div class="author-info">
                        <strong>${post.author}</strong> • ${new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    <div class="actions">
                        <button onclick="editPost('${post._id}')" class="btn-icon" title="Edit">✎</button>
                        <button onclick="deletePost('${post._id}')" class="btn-icon" title="Delete">🗑</button>
                    </div>
                </div>
            </div>
        </article>
    `).join('');
}

// Create or Update Post
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('post-id').value;
    const postData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        category: document.getElementById('category').value,
        imageUrl: document.getElementById('imageUrl').value || undefined,
        content: document.getElementById('content').value
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            closeModal();
            fetchPosts();
            postForm.reset();
        } else {
            const errorData = await response.json();
            alert('Error saving post: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error saving post:', error);
    }
});

// Delete Post
async function deletePost(id) {
    if (confirm('Are you sure you want to delete this story?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }
}

// Read Post
async function readPost(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const post = await response.json();

        document.getElementById('read-image').src = post.imageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1000';
        document.getElementById('read-title').innerText = post.title;
        document.getElementById('read-author').innerText = post.author;
        document.getElementById('read-date').innerText = new Date(post.createdAt).toLocaleDateString();
        document.getElementById('read-body').innerText = post.content;

        readModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    } catch (error) {
        console.error('Error fetching post details:', error);
    }
}

// Edit Post
async function editPost(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const post = await response.json();

        document.getElementById('post-id').value = post._id;
        document.getElementById('title').value = post.title;
        document.getElementById('author').value = post.author;
        document.getElementById('category').value = post.category;
        document.getElementById('imageUrl').value = post.imageUrl || '';
        document.getElementById('content').value = post.content;

        modalTitle.innerText = 'Edit Story';
        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error fetching post details:', error);
    }
}

// Modal Toggle
createPostBtn.onclick = () => {
    postForm.reset();
    document.getElementById('post-id').value = '';
    modalTitle.innerText = 'Create New Story';
    modal.style.display = 'flex';
};

closeBtn.onclick = closeModal;
closeReadModalBtn.onclick = closeReadModal;
window.onclick = (e) => { 
    if (e.target == modal) closeModal(); 
    if (e.target == readModal) closeReadModal();
};

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeReadModal() {
    readModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Initial Fetch
fetchPosts();
