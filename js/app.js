// Application State
let currentLevel = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let quizScore = 0;
let userProgress = {
    wordsLearned: 0,
    quizzesCompleted: 0,
    levelProgress: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
    }
};

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('hskProgress');
    if (saved) {
        userProgress = JSON.parse(saved);
        updateProgressDisplay();
    }
}

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem('hskProgress', JSON.stringify(userProgress));
}

// Navigation
function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`a[href="#${sectionId}"]`).classList.add('active');
    
    // Update progress display if navigating to progress section
    if (sectionId === 'progress') {
        updateProgressDisplay();
    }
}

// Event listeners for navigation
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            navigateTo(sectionId);
        });
    });
});

// Level Selection
function selectLevel(level) {
    currentLevel = level;
    const levelData = window.hskData[level];
    
    // Show practice section
    navigateTo('practice');
    
    // Display vocabulary and quiz options
    displayPracticeContent(levelData);
}

function displayPracticeContent(levelData) {
    const practiceContent = document.getElementById('practice-content');
    
    practiceContent.innerHTML = `
        <div class="practice-header">
            <h3>${levelData.name} - ${levelData.totalWords} Words</h3>
            <div class="practice-tabs">
                <button class="btn btn-primary" onclick="showVocabulary()">Vocabulary</button>
                <button class="btn btn-secondary" onclick="startQuiz()">Take Quiz</button>
            </div>
        </div>
        <div id="practice-display"></div>
    `;
    
    // Show vocabulary by default
    showVocabulary();
}

function showVocabulary() {
    const levelData = window.hskData[currentLevel];
    const display = document.getElementById('practice-display');
    
    let html = '<div class="vocabulary-list"><h3>Vocabulary List</h3>';
    
    levelData.vocabulary.forEach((word, index) => {
        html += `
            <div class="vocabulary-item">
                <div class="chinese-char">${word.chinese}</div>
                <div class="pinyin">${word.pinyin}</div>
                <div class="translation">${word.english}</div>
            </div>
        `;
    });
    
    html += '</div>';
    display.innerHTML = html;
    
    // Mark words as learned
    userProgress.wordsLearned = Math.max(
        userProgress.wordsLearned,
        levelData.vocabulary.length
    );
    saveProgress();
}

function startQuiz() {
    const levelData = window.hskData[currentLevel];
    const display = document.getElementById('practice-display');
    
    // Generate quiz questions
    currentQuiz = generateQuiz(levelData.vocabulary, 10);
    currentQuestionIndex = 0;
    quizScore = 0;
    
    display.innerHTML = '<div class="quiz-container" id="quiz-container"></div>';
    showQuestion();
}

function generateQuiz(vocabulary, numQuestions) {
    // Shuffle and select questions
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(numQuestions, vocabulary.length));
    
    return selected.map(word => {
        // Generate wrong options
        const wrongOptions = vocabulary
            .filter(w => w !== word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => w.english);
        
        // Mix correct answer with wrong options
        const options = [word.english, ...wrongOptions]
            .sort(() => Math.random() - 0.5);
        
        return {
            question: word.chinese,
            pinyin: word.pinyin,
            correctAnswer: word.english,
            options: options
        };
    });
}

function showQuestion() {
    if (currentQuestionIndex >= currentQuiz.length) {
        showQuizResults();
        return;
    }
    
    const question = currentQuiz[currentQuestionIndex];
    const container = document.getElementById('quiz-container');
    
    container.innerHTML = `
        <div class="quiz-progress">
            <p>Question ${currentQuestionIndex + 1} of ${currentQuiz.length}</p>
        </div>
        <div class="quiz-question">
            <h3>${question.question}</h3>
            <p class="pinyin">${question.pinyin}</p>
            <p>What does this mean?</p>
        </div>
        <div class="quiz-options" id="quiz-options"></div>
        <div id="quiz-feedback"></div>
        <div class="quiz-controls" style="display: none;" id="quiz-controls">
            <button class="btn btn-primary" onclick="nextQuestion()">Next Question</button>
        </div>
    `;
    
    const optionsContainer = document.getElementById('quiz-options');
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectAnswer(option);
        optionsContainer.appendChild(optionDiv);
    });
}

function selectAnswer(selectedOption) {
    const question = currentQuiz[currentQuestionIndex];
    const options = document.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('quiz-feedback');
    const controls = document.getElementById('quiz-controls');
    
    // Disable further selection
    options.forEach(opt => opt.onclick = null);
    
    // Check if answer is correct
    const isCorrect = selectedOption === question.correctAnswer;
    
    if (isCorrect) {
        quizScore++;
    }
    
    // Highlight correct and incorrect answers
    options.forEach(opt => {
        if (opt.textContent === question.correctAnswer) {
            opt.classList.add('correct');
        } else if (opt.textContent === selectedOption && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });
    
    // Show feedback
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
    feedback.textContent = isCorrect 
        ? '✓ Correct!' 
        : `✗ Incorrect. The correct answer is: ${question.correctAnswer}`;
    
    // Show next button
    controls.style.display = 'flex';
}

function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

function showQuizResults() {
    const container = document.getElementById('quiz-container');
    const percentage = Math.round((quizScore / currentQuiz.length) * 100);
    
    // Update progress
    userProgress.quizzesCompleted++;
    userProgress.levelProgress[currentLevel] = Math.max(
        userProgress.levelProgress[currentLevel],
        percentage
    );
    saveProgress();
    
    container.innerHTML = `
        <div class="quiz-results">
            <h3>Quiz Complete!</h3>
            <div class="stat-card">
                <h2>${quizScore} / ${currentQuiz.length}</h2>
                <p>Correct Answers</p>
            </div>
            <div class="stat-card">
                <h2>${percentage}%</h2>
                <p>Score</p>
            </div>
            <div class="quiz-controls">
                <button class="btn btn-secondary" onclick="startQuiz()">Retry Quiz</button>
                <button class="btn btn-primary" onclick="showVocabulary()">Review Vocabulary</button>
            </div>
        </div>
    `;
}

function updateProgressDisplay() {
    // Update stats
    document.getElementById('words-learned').textContent = userProgress.wordsLearned;
    document.getElementById('quizzes-completed').textContent = userProgress.quizzesCompleted;
    
    // Determine current level
    const completedLevels = Object.entries(userProgress.levelProgress)
        .filter(([_, progress]) => progress >= 70)
        .map(([level, _]) => level);
    
    const currentLevelDisplay = completedLevels.length > 0 
        ? `HSK ${Math.max(...completedLevels.map(Number))}` 
        : 'Not Started';
    
    document.getElementById('current-level').textContent = currentLevelDisplay;
    
    // Update progress bars
    const progressBarsContainer = document.getElementById('level-progress-bars');
    let barsHtml = '';
    
    for (let level = 1; level <= 6; level++) {
        const progress = userProgress.levelProgress[level];
        barsHtml += `
            <div class="progress-bar-container">
                <div class="progress-label">
                    <span>HSK ${level}</span>
                    <span>${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }
    
    progressBarsContainer.innerHTML = barsHtml;
}
