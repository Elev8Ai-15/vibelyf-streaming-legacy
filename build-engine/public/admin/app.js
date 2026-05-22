/**
 * VIBENICITY Build Engine Dashboard
 */

let pendingTerms = [];
let approvedTerms = [];
let currentFilter = 'all';

// Load data on page load
window.addEventListener('DOMContentLoaded', () => {
    loadPendingTerms();
});

async function loadPendingTerms() {
    try {
        const response = await fetch('../../data/pending_terms.json');
        const data = await response.json();
        
        pendingTerms = data.terms || [];
        
        updateStats();
        renderTerms();
        
        if (pendingTerms.length === 0) {
            document.getElementById('termsContainer').style.display = 'none';
            document.getElementById('emptyState').style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to load pending terms:', error);
        document.getElementById('emptyState').style.display = 'block';
    }
}

function updateStats() {
    document.getElementById('pendingCount').textContent = pendingTerms.length;
    document.getElementById('approvedCount').textContent = approvedTerms.length;
}

function renderTerms() {
    const container = document.getElementById('termsContainer');
    container.innerHTML = '';
    
    let filtered = pendingTerms;
    
    // Apply filters
    if (currentFilter !== 'all') {
        if (currentFilter === 'high') {
            filtered = pendingTerms.filter(t => t.confidence >= 90);
        } else {
            filtered = pendingTerms.filter(t => t.category === currentFilter);
        }
    }
    
    filtered.forEach(term => {
        container.appendChild(createTermCard(term));
    });
}

function createTermCard(term) {
    const card = document.createElement('div');
    card.className = 'term-card';
    card.dataset.term = term.term;
    
    const confidenceClass = term.confidence >= 90 ? 'high' : 'medium';
    
    card.innerHTML = `
        <div class="term-header">
            <h3 class="term-name">${term.term}</h3>
            <span class="confidence-badge ${confidenceClass}">${term.confidence}% Confidence</span>
        </div>
        
        <div class="term-body">
            <div class="field">
                <strong>Meaning:</strong> ${term.meaning}
            </div>
            <div class="field">
                <strong>Category:</strong> <span class="category-tag">${term.category.toUpperCase()}</span>
            </div>
            <div class="field">
                <strong>Found In:</strong> "${term.sourceSong?.title}" by ${term.sourceSong?.artist}
            </div>
            <div class="field">
                <strong>Etymology:</strong> ${term.etymology || 'N/A'}
            </div>
            <div class="field">
                <strong>Examples:</strong>
                <ul style="margin-left: 20px; margin-top: 4px;">
                    ${term.examples?.map(ex => `<li>${ex}</li>`).join('') || '<li>No examples</li>'}
                </ul>
            </div>
            <div class="field">
                <strong>Sources:</strong>
                <ul style="margin-left: 20px; margin-top: 4px;">
                    ${term.sources?.map(s => `<li>${s}</li>`).join('') || '<li>No sources</li>'}
                </ul>
            </div>
        </div>
        
        <div class="term-actions">
            <button onclick="approveTerm('${term.term}')" class="btn-approve">✅ Approve</button>
            <button onclick="editTerm('${term.term}')" class="btn-edit">✏️ Edit</button>
            <button onclick="rejectTerm('${term.term}')" class="btn-reject">❌ Reject</button>
        </div>
    `;
    
    return card;
}

function filterByCategory(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTerms();
}

function filterByConfidence(level) {
    currentFilter = level;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTerms();
}

function approveTerm(termName) {
    const term = pendingTerms.find(t => t.term === termName);
    if (!term) return;
    
    approvedTerms.push(term);
    pendingTerms = pendingTerms.filter(t => t.term !== termName);
    
    updateStats();
    renderTerms();
    
    alert(`✅ "${termName}" approved! It will be added to the database.`);
}

function editTerm(termName) {
    alert(`✏️ Edit functionality coming soon for "${termName}"`);
}

function rejectTerm(termName) {
    if (!confirm(`Are you sure you want to reject "${termName}"?`)) return;
    
    pendingTerms = pendingTerms.filter(t => t.term !== termName);
    
    updateStats();
    renderTerms();
    
    alert(`❌ "${termName}" rejected and removed from pending list.`);
}

function bulkApproveHighConfidence() {
    const highConfidence = pendingTerms.filter(t => t.confidence >= 90);
    
    if (highConfidence.length === 0) {
        alert('No high-confidence terms to approve.');
        return;
    }
    
    if (!confirm(`Approve ${highConfidence.length} high-confidence terms?`)) return;
    
    highConfidence.forEach(term => {
        approvedTerms.push(term);
    });
    
    pendingTerms = pendingTerms.filter(t => t.confidence < 90);
    
    updateStats();
    renderTerms();
    
    alert(`✅ Approved ${highConfidence.length} terms!`);
}

function exportApproved() {
    if (approvedTerms.length === 0) {
        alert('No approved terms to export.');
        return;
    }
    
    const dataStr = JSON.stringify(approvedTerms, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `approved-terms-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    alert(`📥 Exported ${approvedTerms.length} approved terms!`);
}

function refreshData() {
    location.reload();
}
