document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const app = document.getElementById('app');
    const loader = document.getElementById('loader');
    const passwordInput = document.getElementById('password-input');
    const toggleVisibilityBtn = document.getElementById('toggle-visibility');
    const eyeIcon = document.getElementById('eye-icon');
    const copyBtn = document.getElementById('copy-btn');
    
    const strengthText = document.getElementById('strength-text');
    const meterFill = document.getElementById('meter-fill');
    const suggestionsContainer = document.getElementById('suggestions');
    
    const lengthSlider = document.getElementById('length-slider');
    const lengthVal = document.getElementById('length-val');
    
    const chkUpper = document.getElementById('chk-uppercase');
    const chkLower = document.getElementById('chk-lowercase');
    const chkNumbers = document.getElementById('chk-numbers');
    const chkSymbols = document.getElementById('chk-symbols');
    
    const generateBtn = document.getElementById('generate-btn');

    // Simulate Loading for Cyberpunk feel
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            app.style.display = 'flex';
        }, 500);
    }, 1500);

    // Toggle Password Visibility
    toggleVisibilityBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'text') {
            eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                 <line x1="2" y1="2" x2="22" y2="22"></line>`;
            eyeIcon.style.stroke = 'var(--neon-green)';
        } else {
            eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                 <circle cx="12" cy="12" r="3"></circle>`;
            eyeIcon.style.stroke = 'currentColor';
        }
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        if (!passwordInput.value) return;
        
        navigator.clipboard.writeText(passwordInput.value).then(() => {
            showToast('COPIED TO CLIPBOARD');
            copyBtn.style.color = 'var(--neon-green)';
            setTimeout(() => copyBtn.style.color = '', 2000);
        });
    });

    // Slider Update
    lengthSlider.addEventListener('input', (e) => {
        lengthVal.textContent = e.target.value;
    });

    // Password Generation
    const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
    const NUMBER_CHARS = '0123456789';
    const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    function generatePassword() {
        let chars = '';
        let password = '';
        
        if (chkUpper.checked) chars += UPPERCASE_CHARS;
        if (chkLower.checked) chars += LOWERCASE_CHARS;
        if (chkNumbers.checked) chars += NUMBER_CHARS;
        if (chkSymbols.checked) chars += SYMBOL_CHARS;
        
        // Ensure at least one option is selected
        if (chars.length === 0) {
            chkLower.checked = true;
            chars += LOWERCASE_CHARS;
        }

        const length = parseInt(lengthSlider.value);
        
        // Ensure at least one char from each selected pool
        const guaranteedChars = [];
        if (chkUpper.checked) guaranteedChars.push(UPPERCASE_CHARS[Math.floor(Math.random() * UPPERCASE_CHARS.length)]);
        if (chkLower.checked) guaranteedChars.push(LOWERCASE_CHARS[Math.floor(Math.random() * LOWERCASE_CHARS.length)]);
        if (chkNumbers.checked) guaranteedChars.push(NUMBER_CHARS[Math.floor(Math.random() * NUMBER_CHARS.length)]);
        if (chkSymbols.checked) guaranteedChars.push(SYMBOL_CHARS[Math.floor(Math.random() * SYMBOL_CHARS.length)]);

        // Fill remaining
        for (let i = guaranteedChars.length; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }

        // Add guaranteed chars and shuffle
        password = (password + guaranteedChars.join(''))
            .split('')
            .sort(() => 0.5 - Math.random())
            .join('');

        passwordInput.value = password;
        analyzePassword(password);
    }

    generateBtn.addEventListener('click', generatePassword);

    // Password Analysis
    passwordInput.addEventListener('input', (e) => analyzePassword(e.target.value));

    function analyzePassword(password) {
        if (!password) {
            resetMeter();
            return;
        }

        let score = 0;
        const checks = {
            length: password.length >= 12,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[^A-Za-z0-9]/.test(password)
        };

        // Base score for length
        score += Math.min(password.length * 4, 40);
        
        // Additive scores
        if (checks.upper) score += 15;
        if (checks.lower) score += 15;
        if (checks.number) score += 15;
        if (checks.symbol) score += 15;

        // Deductions for missing basic requirements if short
        if (password.length < 8) score -= 20;

        // Cap score
        score = Math.max(0, Math.min(100, score));

        updateUI(score, checks);
    }

    function updateUI(score, checks) {
        meterFill.style.width = `${score}%`;
        
        // Update styling based on score
        if (score < 40) {
            meterFill.style.backgroundColor = 'var(--strength-weak)';
            meterFill.style.boxShadow = '0 0 10px var(--strength-weak)';
            strengthText.textContent = 'WEAK';
            strengthText.className = 'status-weak';
        } else if (score < 80) {
            meterFill.style.backgroundColor = 'var(--strength-medium)';
            meterFill.style.boxShadow = '0 0 10px var(--strength-medium)';
            strengthText.textContent = 'MEDIUM';
            strengthText.className = 'status-medium';
        } else {
            meterFill.style.backgroundColor = 'var(--strength-strong)';
            meterFill.style.boxShadow = '0 0 10px var(--strength-strong)';
            strengthText.textContent = 'STRONG';
            strengthText.className = 'status-strong';
        }

        // Render Suggestions
        suggestionsContainer.innerHTML = '';
        const suggestions = [
            { met: checks.length, text: 'At least 12 characters' },
            { met: checks.upper, text: 'Contains uppercase letters' },
            { met: checks.lower, text: 'Contains lowercase letters' },
            { met: checks.number, text: 'Contains numbers' },
            { met: checks.symbol, text: 'Contains symbols (!@#$)' }
        ];

        suggestions.forEach(s => {
            const div = document.createElement('div');
            div.className = `suggestion-item ${s.met ? 'met' : ''}`;
            div.textContent = s.text;
            suggestionsContainer.appendChild(div);
        });
    }

    function resetMeter() {
        meterFill.style.width = '0%';
        strengthText.textContent = 'Awaiting Input';
        strengthText.className = 'status-unknown';
        suggestionsContainer.innerHTML = '';
    }

    // Toast Notification System
    function showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
