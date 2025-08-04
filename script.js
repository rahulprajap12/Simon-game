class SimonGame {
    constructor() {
        this.gameSequence = [];
        this.userSequence = [];
        this.started = false;
        this.level = 0;
        this.score = 0;
        this.bestScore = localStorage.getItem('simonBestScore') || 0;
        this.isGamePlaying = false;
        this.strictMode = false;
        this.speed = 800;
        
        this.initializeElements();
        this.addEventListeners();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.buttons = document.querySelectorAll('.btn');
        this.levelDisplay = document.getElementById('level');
        this.scoreDisplay = document.getElementById('score');
        this.bestDisplay = document.getElementById('best');
        this.gameStatus = document.getElementById('game-status');
        this.startBtn = document.getElementById('start-btn');
        this.strictBtn = document.getElementById('strict-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.modal = document.getElementById('game-over-modal');
        this.finalScore = document.getElementById('final-score');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        this.bestDisplay.textContent = this.bestScore;
    }
    
    addEventListeners() {
        // Button clicks
        this.buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                if (this.started && !this.isGamePlaying) {
                    this.handleButtonClick(index);
                }
            });
        });
        
        // Keyboard start
        document.addEventListener('keydown', (e) => {
            if (!this.started && e.key !== 'F5' && e.key !== 'F12') {
                this.startGame();
            }
        });
        
        // Control buttons
        this.startBtn.addEventListener('click', () => this.startGame());
        this.strictBtn.addEventListener('click', () => this.toggleStrictMode());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.closeModal());
        
        // Modal close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }
    
    startGame() {
        if (this.started) return;
        
        this.started = true;
        this.gameStatus.textContent = 'Game Started!';
        this.startBtn.classList.add('active');
        
        setTimeout(() => {
            this.levelUp();
        }, 1000);
    }
    
    toggleStrictMode() {
        this.strictMode = !this.strictMode;
        this.strictBtn.classList.toggle('active');
        this.gameStatus.textContent = this.strictMode ? 'Strict Mode ON' : 'Strict Mode OFF';
    }
    
    resetGame() {
        this.gameSequence = [];
        this.userSequence = [];
        this.started = false;
        this.level = 0;
        this.score = 0;
        this.isGamePlaying = false;
        this.gameStatus.textContent = 'Press any key to start';
        this.startBtn.classList.remove('active');
        this.strictBtn.classList.remove('active');
        this.strictMode = false;
        this.updateDisplay();
    }
    
    handleButtonClick(buttonIndex) {
        // Add visual and audio feedback
        this.flashButton(buttonIndex);
        this.playSound(buttonIndex);
        
        // Add to user sequence
        this.userSequence.push(buttonIndex);
        
        // Check if user sequence matches game sequence
        if (this.userSequence[this.userSequence.length - 1] !== this.gameSequence[this.userSequence.length - 1]) {
            // Wrong button pressed
            this.playErrorSound();
            this.gameOver();
            return;
        }
        
        // Check if user completed the current level
        if (this.userSequence.length === this.gameSequence.length) {
            // Level completed successfully
            this.score += this.level * 10;
            this.updateDisplay();
            
            setTimeout(() => {
                this.levelUp();
            }, 1000);
        }
    }
    
    flashButton(buttonIndex) {
        const button = this.buttons[buttonIndex];
        button.classList.add('active');
        
        setTimeout(() => {
            button.classList.remove('active');
        }, 300);
    }
    
    playSound(buttonIndex) {
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        const frequencies = [523.25, 659.25, 783.99, 987.77]; // C, E, G, B
        oscillator.frequency.setValueAtTime(frequencies[buttonIndex], audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    playErrorSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    levelUp() {
        this.level++;
        this.gameStatus.textContent = `Level ${this.level}`;
        
        // Add new random button to sequence
        const randomButton = Math.floor(Math.random() * 4);
        this.gameSequence.push(randomButton);
        
        // Reset user sequence
        this.userSequence = [];
        
        // Update speed based on level
        this.speed = Math.max(400, 800 - (this.level * 20));
        
        // Play the sequence
        this.playSequence();
    }
    
    playSequence() {
        this.isGamePlaying = true;
        let i = 0;
        
        const playNext = () => {
            if (i < this.gameSequence.length) {
                this.flashButton(this.gameSequence[i]);
                this.playSound(this.gameSequence[i]);
                i++;
                setTimeout(playNext, this.speed);
            } else {
                // Sequence finished, now user can play
                this.isGamePlaying = false;
                this.gameStatus.textContent = 'Your turn!';
            }
        };
        
        setTimeout(playNext, 500);
    }
    
    gameOver() {
        console.log('Game Over! Your score:', this.score);
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('simonBestScore', this.bestScore);
            this.bestDisplay.textContent = this.bestScore;
        }
        
        // Visual feedback
        document.body.classList.add('game-over');
        
        // Show game over modal
        this.finalScore.textContent = `You reached level ${this.level} with ${this.score} points!`;
        this.modal.style.display = 'block';
        
        // Reset game state
        setTimeout(() => {
            document.body.classList.remove('game-over');
            this.resetGame();
        }, 500);
    }
    
    closeModal() {
        this.modal.style.display = 'none';
    }
    
    updateDisplay() {
        this.levelDisplay.textContent = this.level;
        this.scoreDisplay.textContent = this.score;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimonGame();
});