/**
 * Linguistics Education Module
 * Interactive learning about AAVE and language legitimacy
 */

// Toggle lesson content
function toggleLesson(lessonId) {
    const content = document.getElementById(`content-${lessonId}`);
    const icon = document.getElementById(`icon-${lessonId}`);
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        content.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
}

// Quiz functionality
function checkQuiz() {
    const questions = document.querySelectorAll('.quiz-question');
    let score = 0;
    let total = questions.length;
    let results = [];

    questions.forEach((question, index) => {
        const correctAnswer = question.dataset.correct;
        const selectedInput = question.querySelector('input[type="radio"]:checked');
        
        if (selectedInput) {
            const selectedAnswer = selectedInput.value;
            const isCorrect = selectedAnswer === correctAnswer;
            
            if (isCorrect) {
                score++;
                results.push({
                    question: index + 1,
                    correct: true
                });
                
                // Visual feedback
                selectedInput.parentElement.classList.add('bg-green-100', 'border-green-500', 'border-2');
            } else {
                results.push({
                    question: index + 1,
                    correct: false,
                    selected: selectedAnswer,
                    correctAnswer: correctAnswer
                });
                
                // Visual feedback - wrong answer
                selectedInput.parentElement.classList.add('bg-red-100', 'border-red-500', 'border-2');
                
                // Show correct answer
                const correctLabel = question.querySelector(`input[value="${correctAnswer}"]`).parentElement;
                correctLabel.classList.add('bg-green-100', 'border-green-500', 'border-2');
            }
        } else {
            results.push({
                question: index + 1,
                correct: false,
                message: 'No answer selected'
            });
        }
    });

    // Display results
    displayQuizResults(score, total, results);
}

function displayQuizResults(score, total, results) {
    const resultsDiv = document.getElementById('quiz-results');
    resultsDiv.classList.remove('hidden');

    const percentage = (score / total) * 100;
    let message = '';
    let colorClass = '';

    if (percentage === 100) {
        message = 'Perfect! You understand AAVE linguistics! 🎉';
        colorClass = 'bg-green-50 border-green-500 text-green-800';
    } else if (percentage >= 66) {
        message = 'Great job! You\'re learning well. 👏';
        colorClass = 'bg-blue-50 border-blue-500 text-blue-800';
    } else {
        message = 'Keep learning! Review the lessons above. 📚';
        colorClass = 'bg-yellow-50 border-yellow-500 text-yellow-800';
    }

    resultsDiv.innerHTML = `
        <div class="${colorClass} border-l-4 p-6 rounded-lg">
            <h3 class="text-xl font-semibold mb-2">Quiz Results</h3>
            <p class="text-2xl font-bold mb-2">Score: ${score} / ${total} (${percentage.toFixed(0)}%)</p>
            <p class="text-lg">${message}</p>
        </div>
    `;
}

// Add progress tracking
class LinguisticsProgress {
    constructor() {
        this.progress = this.loadProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem('vibecoder_linguistics_progress');
        return saved ? JSON.parse(saved) : {
            lessonsViewed: [],
            quizzesTaken: 0,
            bestScore: 0,
            completedModules: []
        };
    }

    saveProgress() {
        localStorage.setItem('vibecoder_linguistics_progress', JSON.stringify(this.progress));
    }

    markLessonViewed(lessonId) {
        if (!this.progress.lessonsViewed.includes(lessonId)) {
            this.progress.lessonsViewed.push(lessonId);
            this.saveProgress();
        }
    }

    recordQuizScore(score) {
        this.progress.quizzesTaken++;
        if (score > this.progress.bestScore) {
            this.progress.bestScore = score;
        }
        this.saveProgress();
    }

    getProgress() {
        return {
            ...this.progress,
            completionPercentage: this.calculateCompletion()
        };
    }

    calculateCompletion() {
        const totalLessons = 5; // Number of grammar lessons
        const viewed = this.progress.lessonsViewed.length;
        const quizComplete = this.progress.bestScore >= 2 ? 1 : 0;
        
        return Math.round(((viewed + quizComplete) / (totalLessons + 1)) * 100);
    }
}

// Initialize progress tracker
const linguisticsProgress = new LinguisticsProgress();

// Track lesson views
document.addEventListener('click', (e) => {
    const lessonDiv = e.target.closest('[onclick^="toggleLesson"]');
    if (lessonDiv) {
        const onclickAttr = lessonDiv.getAttribute('onclick');
        const match = onclickAttr.match(/toggleLesson\('([^']+)'\)/);
        if (match) {
            linguisticsProgress.markLessonViewed(match[1]);
        }
    }
});

// Enhanced quiz checking with progress tracking
const originalCheckQuiz = checkQuiz;
checkQuiz = function() {
    originalCheckQuiz();
    
    // Calculate score
    const questions = document.querySelectorAll('.quiz-question');
    let score = 0;
    questions.forEach((question) => {
        const correctAnswer = question.dataset.correct;
        const selectedInput = question.querySelector('input[type="radio"]:checked');
        if (selectedInput && selectedInput.value === correctAnswer) {
            score++;
        }
    });
    
    linguisticsProgress.recordQuizScore(score);
};

// Display progress on page load
document.addEventListener('DOMContentLoaded', () => {
    const progress = linguisticsProgress.getProgress();
    
    // Could add a progress indicator to the page
    console.log('Learning Progress:', progress);
});

// Interactive examples
function createInteractiveExample(aaveText, standardText, explanation) {
    return `
        <div class="interactive-example bg-white p-4 rounded-lg border-2 border-purple-200 mb-4 hover:shadow-md transition">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                    <p class="text-sm font-semibold text-purple-800 mb-1">AAVE</p>
                    <p class="text-lg text-gray-800">"${aaveText}"</p>
                </div>
                <div>
                    <p class="text-sm font-semibold text-blue-800 mb-1">Standard English</p>
                    <p class="text-lg text-gray-800">"${standardText}"</p>
                </div>
            </div>
            <div class="bg-gray-50 p-3 rounded">
                <p class="text-sm text-gray-700"><strong>Explanation:</strong> ${explanation}</p>
            </div>
        </div>
    `;
}

// Add code translation examples
function addCodeTranslation(concept, code, explanation) {
    return `
        <div class="code-translation bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
            <p class="text-white mb-2"><strong>Concept:</strong> ${concept}</p>
            <pre class="mb-2">${code}</pre>
            <p class="text-gray-300 text-xs">${explanation}</p>
        </div>
    `;
}

// Gamification: Achievements
class LinguisticsAchievements {
    constructor() {
        this.achievements = [
            {
                id: 'first_lesson',
                name: 'First Steps',
                description: 'Viewed your first AAVE grammar lesson',
                icon: '🎓',
                unlocked: false
            },
            {
                id: 'all_lessons',
                name: 'Grammar Master',
                description: 'Viewed all AAVE grammar lessons',
                icon: '📚',
                unlocked: false
            },
            {
                id: 'perfect_quiz',
                name: 'Perfect Score',
                description: 'Got 100% on the knowledge quiz',
                icon: '⭐',
                unlocked: false
            },
            {
                id: 'linguist',
                name: 'Junior Linguist',
                description: 'Completed all educational modules',
                icon: '🔬',
                unlocked: false
            }
        ];
        
        this.loadAchievements();
    }

    loadAchievements() {
        const saved = localStorage.getItem('vibecoder_linguistics_achievements');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            this.achievements = this.achievements.map(achievement => {
                const savedAchievement = savedAchievements.find(a => a.id === achievement.id);
                return savedAchievement || achievement;
            });
        }
    }

    saveAchievements() {
        localStorage.setItem('vibecoder_linguistics_achievements', JSON.stringify(this.achievements));
    }

    unlock(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.saveAchievements();
            this.showAchievementNotification(achievement);
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="text-4xl mr-3">${achievement.icon}</span>
                <div>
                    <p class="font-bold">Achievement Unlocked!</p>
                    <p class="text-sm">${achievement.name}: ${achievement.description}</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    checkAchievements() {
        const progress = linguisticsProgress.getProgress();
        
        // First lesson
        if (progress.lessonsViewed.length >= 1) {
            this.unlock('first_lesson');
        }
        
        // All lessons
        if (progress.lessonsViewed.length >= 5) {
            this.unlock('all_lessons');
        }
        
        // Perfect quiz
        if (progress.bestScore === 3) {
            this.unlock('perfect_quiz');
        }
        
        // Complete all
        if (progress.completionPercentage === 100) {
            this.unlock('linguist');
        }
    }
}

// Initialize achievements
const achievements = new LinguisticsAchievements();

// Check achievements periodically
setInterval(() => {
    achievements.checkAchievements();
}, 5000);

// Export functions for global use
window.toggleLesson = toggleLesson;
window.checkQuiz = checkQuiz;
window.linguisticsProgress = linguisticsProgress;
window.achievements = achievements;
