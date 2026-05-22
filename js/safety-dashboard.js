/**
 * Safety Dashboard Controller
 * Manages content moderation, safety settings, and community reporting
 */

class SafetyDashboard {
    constructor() {
        this.processor = new AdvancedLanguageProcessor();
        this.flaggedQueue = [];
        this.statistics = {
            total: 0,
            flagged: 0,
            blocked: 0,
            safe: 0,
            categories: {
                sexual_explicit: 0,
                violence_threat: 0,
                hate_speech: 0,
                self_harm: 0,
                other: 0
            },
            trends: []
        };
        
        this.initializeEventListeners();
        this.loadSettings();
        this.updateStatistics();
        this.initializeCharts();
    }

    initializeEventListeners() {
        // Moderation level selection
        document.querySelectorAll('input[name="moderation"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.changeModerationLevel(e.target.value);
            });
        });

        // Save settings button
        document.getElementById('saveSettings')?.addEventListener('click', () => {
            this.saveSettings();
        });

        // Analyze content button
        document.getElementById('analyzeContent')?.addEventListener('click', () => {
            this.analyzeTestContent();
        });

        // Filter controls
        document.getElementById('filterSeverity')?.addEventListener('change', (e) => {
            this.filterQueue(e.target.value, document.getElementById('filterCategory').value);
        });

        document.getElementById('filterCategory')?.addEventListener('change', (e) => {
            this.filterQueue(document.getElementById('filterSeverity').value, e.target.value);
        });

        // Clear queue button
        document.getElementById('clearQueue')?.addEventListener('click', () => {
            this.clearResolvedItems();
        });
    }

    changeModerationLevel(level) {
        this.processor.setModerationLevel(level);
        
        // Update UI to show selected option
        document.querySelectorAll('.moderation-option').forEach(option => {
            const optionLevel = option.dataset.level;
            const label = option.querySelector('label');
            
            if (optionLevel === level) {
                label.classList.remove('border-gray-300', 'hover:border-purple-500');
                label.classList.add('border-purple-500', 'bg-purple-50');
            } else {
                label.classList.remove('border-purple-500', 'bg-purple-50');
                label.classList.add('border-gray-300', 'hover:border-purple-500');
            }
        });

        this.showNotification(`Moderation level changed to: ${level}`, 'success');
    }

    saveSettings() {
        const settings = {
            moderationLevel: document.querySelector('input[name="moderation"]:checked').value,
            autoNormalize: document.getElementById('autoNormalize').checked,
            showAlternatives: document.getElementById('showAlternatives').checked,
            uncertaintySignals: document.getElementById('uncertaintySignals').checked,
            culturalPreservation: document.getElementById('culturalPreservation').checked,
            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('vibecoder_safety_settings', JSON.stringify(settings));

        this.showNotification('Safety settings saved successfully!', 'success');
    }

    loadSettings() {
        const saved = localStorage.getItem('vibecoder_safety_settings');
        
        if (saved) {
            const settings = JSON.parse(saved);
            
            // Apply moderation level
            if (settings.moderationLevel) {
                document.getElementById(settings.moderationLevel).checked = true;
                this.changeModerationLevel(settings.moderationLevel);
            }

            // Apply checkbox settings
            if (settings.autoNormalize !== undefined) {
                document.getElementById('autoNormalize').checked = settings.autoNormalize;
            }
            if (settings.showAlternatives !== undefined) {
                document.getElementById('showAlternatives').checked = settings.showAlternatives;
            }
            if (settings.uncertaintySignals !== undefined) {
                document.getElementById('uncertaintySignals').checked = settings.uncertaintySignals;
            }
            if (settings.culturalPreservation !== undefined) {
                document.getElementById('culturalPreservation').checked = settings.culturalPreservation;
            }
        }
    }

    analyzeTestContent() {
        const input = document.getElementById('testInput').value;
        
        if (!input.trim()) {
            this.showNotification('Please enter some text to analyze', 'warning');
            return;
        }

        // Process the input
        const result = this.processor.processInput(input, null, {
            showAlternatives: document.getElementById('showAlternatives').checked
        });

        // Update statistics
        this.statistics.total++;
        
        if (result.blocked) {
            this.statistics.blocked++;
            this.addToFlaggedQueue(input, result);
        } else if (result.safetyFlags && result.safetyFlags.length > 0) {
            this.statistics.flagged++;
            this.addToFlaggedQueue(input, result);
        } else {
            this.statistics.safe++;
        }

        // Update category counts
        if (result.safetyFlags) {
            result.safetyFlags.forEach(flag => {
                const category = flag.type || flag.category;
                if (this.statistics.categories[category] !== undefined) {
                    this.statistics.categories[category]++;
                } else {
                    this.statistics.categories.other++;
                }
            });
        }

        this.updateStatistics();
        this.displayAnalysisResults(result);
        
        // Clear input
        document.getElementById('testInput').value = '';
    }

    displayAnalysisResults(result) {
        const resultsDiv = document.getElementById('analysisResults');
        const contentDiv = document.getElementById('resultsContent');
        
        resultsDiv.classList.remove('hidden');

        let html = '';

        // Safety Status
        if (result.blocked) {
            html += `
                <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div class="flex items-center">
                        <i class="fas fa-ban text-red-500 text-2xl mr-3"></i>
                        <div>
                            <h4 class="text-red-800 font-semibold">Content Blocked</h4>
                            <p class="text-red-700 text-sm">${result.blockReason}</p>
                        </div>
                    </div>
                </div>
            `;
        } else if (result.safetyFlags && result.safetyFlags.length > 0) {
            html += `
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-2xl mr-3"></i>
                        <div>
                            <h4 class="text-yellow-800 font-semibold">Content Flagged</h4>
                            <p class="text-yellow-700 text-sm">${result.warnings.join('; ')}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <div class="flex items-center">
                        <i class="fas fa-check-circle text-green-500 text-2xl mr-3"></i>
                        <div>
                            <h4 class="text-green-800 font-semibold">Content Safe</h4>
                            <p class="text-green-700 text-sm">No safety concerns detected</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // AAVE Features Detected
        if (result.features && result.features.length > 0) {
            html += `
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-purple-800 mb-2">
                        <i class="fas fa-language mr-2"></i>
                        AAVE Features Detected
                    </h4>
                    <div class="space-y-2">
            `;

            result.features.forEach(feature => {
                html += `
                    <div class="bg-white p-3 rounded">
                        <div class="flex items-start justify-between mb-1">
                            <span class="text-sm font-semibold text-gray-800">${feature.feature.replace(/_/g, ' ').toUpperCase()}</span>
                            <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">${Math.round(feature.confidence * 100)}% confidence</span>
                        </div>
                        <p class="text-xs text-gray-600 mb-1"><strong>Original:</strong> "${feature.original}"</p>
                        <p class="text-xs text-gray-600 mb-1"><strong>Normalized:</strong> "${feature.normalized}"</p>
                        ${feature.explanation ? `<p class="text-xs text-gray-500 italic">${feature.explanation}</p>` : ''}
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Slang Terms
        if (result.slangTerms && result.slangTerms.length > 0) {
            html += `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-blue-800 mb-2">
                        <i class="fas fa-hashtag mr-2"></i>
                        Slang Terms Detected
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            `;

            result.slangTerms.forEach(term => {
                html += `
                    <div class="bg-white p-2 rounded text-sm">
                        <span class="font-semibold text-gray-800">${term.term}</span>
                        <span class="text-gray-600"> → ${term.meaning}</span>
                        <span class="text-xs text-gray-500 block">Category: ${term.category} | Confidence: ${Math.round(term.confidence * 100)}%</span>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Abbreviations
        if (result.abbreviations && result.abbreviations.length > 0) {
            html += `
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-gray-800 mb-2">
                        <i class="fas fa-comment-dots mr-2"></i>
                        Abbreviations Expanded
                    </h4>
                    <div class="space-y-1">
            `;

            result.abbreviations.forEach(abbr => {
                const riskColor = abbr.risk === 'high_explicit' ? 'red' : abbr.risk === 'mild_profanity' ? 'yellow' : 'green';
                html += `
                    <div class="flex items-center justify-between text-sm">
                        <span><strong>${abbr.abbreviation.toUpperCase()}</strong> → ${abbr.expansion}</span>
                        <span class="text-xs bg-${riskColor}-100 text-${riskColor}-800 px-2 py-1 rounded">${abbr.risk}</span>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        // Alternative Normalizations
        if (result.alternatives && result.alternatives.length > 0) {
            html += `
                <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 class="font-semibold text-indigo-800 mb-2">
                        <i class="fas fa-code-branch mr-2"></i>
                        Alternative Translations
                    </h4>
                    <div class="space-y-2">
            `;

            result.alternatives.forEach(alt => {
                html += `
                    <div class="bg-white p-3 rounded">
                        <p class="text-sm font-semibold text-gray-800 mb-1">${alt.description}</p>
                        <p class="text-sm text-gray-600 mb-1">"${alt.text}"</p>
                        <p class="text-xs text-gray-500 italic">${alt.recommendation}</p>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        contentDiv.innerHTML = html;
    }

    addToFlaggedQueue(originalText, result) {
        const item = {
            id: Date.now(),
            text: originalText,
            normalized: result.normalized,
            severity: result.safetyFlags && result.safetyFlags.length > 0 ? result.safetyFlags[0].severity : 'medium',
            category: result.safetyFlags && result.safetyFlags.length > 0 ? result.safetyFlags[0].category : 'other',
            blocked: result.blocked || false,
            warnings: result.warnings || [],
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        this.flaggedQueue.push(item);
        this.updateFlaggedQueue();
    }

    updateFlaggedQueue() {
        const listDiv = document.getElementById('flaggedContentList');
        const countSpan = document.getElementById('queueCount');
        
        const pendingCount = this.flaggedQueue.filter(item => item.status === 'pending').length;
        countSpan.textContent = `(${pendingCount} items pending review)`;

        if (pendingCount === 0) {
            listDiv.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-check-circle text-6xl text-green-300 mb-4"></i>
                    <p>No flagged content at this time</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.flaggedQueue.filter(item => item.status === 'pending').forEach(item => {
            const severityColor = {
                'critical': 'red',
                'high': 'orange',
                'medium': 'yellow',
                'low': 'blue'
            }[item.severity] || 'gray';

            html += `
                <div class="border border-gray-200 rounded-lg p-4" data-item-id="${item.id}">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex-1">
                            <div class="flex items-center space-x-2 mb-2">
                                <span class="text-xs bg-${severityColor}-100 text-${severityColor}-800 px-2 py-1 rounded font-semibold">
                                    ${item.severity.toUpperCase()}
                                </span>
                                <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                    ${item.category.replace(/_/g, ' ')}
                                </span>
                                ${item.blocked ? '<span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">BLOCKED</span>' : ''}
                            </div>
                            <p class="text-sm text-gray-800 mb-1"><strong>Original:</strong> "${item.text}"</p>
                            <p class="text-sm text-gray-600 mb-2"><strong>Normalized:</strong> "${item.normalized}"</p>
                            ${item.warnings.length > 0 ? `<p class="text-xs text-${severityColor}-700 italic">${item.warnings.join('; ')}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                        <span>${new Date(item.timestamp).toLocaleString()}</span>
                        <div class="space-x-2">
                            <button onclick="safetyDashboard.approveItem(${item.id})" class="text-green-600 hover:text-green-800">
                                <i class="fas fa-check-circle mr-1"></i>Approve
                            </button>
                            <button onclick="safetyDashboard.rejectItem(${item.id})" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-times-circle mr-1"></i>Reject
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        listDiv.innerHTML = html;
    }

    approveItem(itemId) {
        const item = this.flaggedQueue.find(i => i.id === itemId);
        if (item) {
            item.status = 'approved';
            this.showNotification('Content approved', 'success');
            this.updateFlaggedQueue();
        }
    }

    rejectItem(itemId) {
        const item = this.flaggedQueue.find(i => i.id === itemId);
        if (item) {
            item.status = 'rejected';
            this.showNotification('Content rejected', 'success');
            this.updateFlaggedQueue();
        }
    }

    clearResolvedItems() {
        const pendingBefore = this.flaggedQueue.filter(item => item.status === 'pending').length;
        this.flaggedQueue = this.flaggedQueue.filter(item => item.status === 'pending');
        const cleared = pendingBefore - this.flaggedQueue.length;
        
        if (cleared > 0) {
            this.showNotification(`Cleared ${cleared} resolved items`, 'success');
        } else {
            this.showNotification('No resolved items to clear', 'info');
        }
        
        this.updateFlaggedQueue();
    }

    filterQueue(severity, category) {
        // This is a simplified filter - production would handle this more robustly
        this.updateFlaggedQueue();
    }

    updateStatistics() {
        document.getElementById('totalReviews').textContent = this.statistics.total;
        document.getElementById('flaggedCount').textContent = this.statistics.flagged;
        document.getElementById('blockedCount').textContent = this.statistics.blocked;
        document.getElementById('safeCount').textContent = this.statistics.safe;

        // Update charts if they exist
        if (this.categoryChart) {
            this.updateCategoryChart();
        }
        if (this.trendsChart) {
            this.updateTrendsChart();
        }
    }

    initializeCharts() {
        // Category distribution chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            this.categoryChart = new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Safe', 'Flagged', 'Blocked'],
                    datasets: [{
                        data: [this.statistics.safe, this.statistics.flagged, this.statistics.blocked],
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Trends chart
        const trendsCtx = document.getElementById('trendsChart');
        if (trendsCtx) {
            this.trendsChart = new Chart(trendsCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Safe Content',
                        data: [85, 88, 90, 92],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Flagged Content',
                        data: [12, 10, 8, 7],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Blocked Content',
                        data: [3, 2, 2, 1],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    updateCategoryChart() {
        if (this.categoryChart) {
            this.categoryChart.data.datasets[0].data = [
                this.statistics.safe,
                this.statistics.flagged,
                this.statistics.blocked
            ];
            this.categoryChart.update();
        }
    }

    updateTrendsChart() {
        // In production, this would update with real historical data
        if (this.trendsChart) {
            this.trendsChart.update();
        }
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize dashboard when page loads
let safetyDashboard;
document.addEventListener('DOMContentLoaded', () => {
    safetyDashboard = new SafetyDashboard();
});
