class QuantumCalculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.resetScreen = false;
        this.angleMode = 'DEG'; // DEG, RAD, GRAD
        this.memoryValue = 0;
        this.hasMemory = false;
        this.isSecondFuncActive = false;
        this.history = '';
        
        // DOM Elements
        this.resultDisplay = document.getElementById('result');
        this.historyDisplay = document.getElementById('history');
        this.angleModeDisplay = document.getElementById('angleMode');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        
        this.initEventListeners();
        this.updateDisplay();
    }
    
    initEventListeners() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const number = button.dataset.number;
                
                if (number) {
                    this.appendNumber(number);
                } else if (action) {
                    this.handleAction(action);
                }
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') this.appendNumber(e.key);
            else if (e.key === '.') this.appendDecimal();
            else if (e.key === '+') this.handleAction('add');
            else if (e.key === '-') this.handleAction('subtract');
            else if (e.key === '*') this.handleAction('multiply');
            else if (e.key === '/') this.handleAction('divide');
            else if (e.key === '%') this.handleAction('percent');
            else if (e.key === 'Enter' || e.key === '=') this.handleAction('equals');
            else if (e.key === 'Escape') this.handleAction('clear');
            else if (e.key === 'Backspace') this.handleAction('backspace');
            else if (e.key === '(') this.handleAction('openParen');
            else if (e.key === ')') this.handleAction('closeParen');
            else if (e.key === 'p' && e.ctrlKey) this.handleAction('pi');
            else if (e.key === 'e' && e.ctrlKey) this.handleAction('e');
            else if (e.key === 'm') {
                if (e.ctrlKey) this.handleAction('memoryClear');
                else if (e.shiftKey) this.handleAction('memoryAdd');
                else this.handleAction('memoryRecall');
            }
            else if (e.key === 's') this.handleAction('secondFunc');
        });
    }
    
    handleAction(action) {
        switch (action) {
            // Basic operations
            case 'clear': this.clearAll(); break;
            case 'backspace': this.backspace(); break;
            case 'equals': this.calculate(); break;
            case 'decimal': this.appendDecimal(); break;
            case 'add': this.appendOperator('+'); break;
            case 'subtract': this.appendOperator('-'); break;
            case 'multiply': this.appendOperator('×'); break;
            case 'divide': this.appendOperator('÷'); break;
            case 'percent': this.calculatePercentage(); break;
            
            // Memory functions
            case 'memoryClear': this.memoryClear(); break;
            case 'memoryRecall': this.memoryRecall(); break;
            case 'memoryAdd': this.memoryAdd(); break;
            
            // Scientific functions
            case 'sin': this.trigFunction('sin'); break;
            case 'cos': this.trigFunction('cos'); break;
            case 'tan': this.trigFunction('tan'); break;
            case 'asin': this.trigFunction('asin'); break;
            case 'acos': this.trigFunction('acos'); break;
            case 'atan': this.trigFunction('atan'); break;
            case 'log': this.calculateLog(); break;
            case 'ln': this.calculateLn(); break;
            case 'log2': this.calculateLog2(); break;
            case 'sqrt': this.calculateSqrt(); break;
            case 'square': this.calculateSquare(); break;
            case 'cube': this.calculateCube(); break;
            case 'power': this.setPowerOperation(); break;
            case 'factorial': this.calculateFactorial(); break;
            case 'reciprocal': this.calculateReciprocal(); break;
            case 'abs': this.calculateAbs(); break;
            case 'exp': this.calculateExp(); break;
            case 'power10': this.calculatePower10(); break;
            
            // Constants
            case 'pi': this.insertConstant('π', Math.PI); break;
            case 'e': this.insertConstant('e', Math.E); break;
            
            // Parentheses
            case 'openParen': this.openParenthesis(); break;
            case 'closeParen': this.closeParenthesis(); break;
            
            // Mode toggles
            case 'toggleAngle': this.toggleAngleMode(); break;
            case 'secondFunc': this.toggleSecondFunctions(); break;
        }
    }
    
    // Core calculator functions
    appendNumber(number) {
        if (this.currentInput === '0' || this.resetScreen) {
            this.currentInput = number;
            this.resetScreen = false;
        } else {
            this.currentInput += number;
        }
        this.updateDisplay();
    }
    
    appendDecimal() {
        if (this.resetScreen) {
            this.currentInput = '0.';
            this.resetScreen = false;
            return;
        }
        if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }
    
    appendOperator(operator) {
        if (this.operation !== null) this.calculate();
        this.previousInput = this.currentInput;
        this.operation = operator;
        this.history = `${this.previousInput} ${this.operation}`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculate() {
        let computation;
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev)) return;
        
        switch (this.operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷': computation = prev / current; break;
            case '^': computation = Math.pow(prev, current); break;
            default: return;
        }
        
        this.currentInput = this.roundResult(computation).toString();
        this.operation = null;
        this.history = '';
        this.updateDisplay();
    }
    
    // Memory functions
    memoryClear() {
        this.memoryValue = 0;
        this.hasMemory = false;
        this.memoryIndicator.classList.remove('active');
    }
    
    memoryRecall() {
        if (this.hasMemory) {
            this.currentInput = this.memoryValue.toString();
            this.resetScreen = true;
            this.updateDisplay();
        }
    }
    
    memoryAdd() {
        const currentValue = parseFloat(this.currentInput) || 0;
        this.memoryValue += currentValue;
        this.hasMemory = true;
        this.memoryIndicator.classList.add('active');
    }
    
    // Scientific functions
    trigFunction(func) {
        let value = parseFloat(this.currentInput);
        let result;
        
        // Convert to radians if in degree mode
        if (this.angleMode === 'DEG') {
            value = value * Math.PI / 180;
        } else if (this.angleMode === 'GRAD') {
            value = value * Math.PI / 200;
        }
        
        switch (func) {
            case 'sin': result = Math.sin(value); break;
            case 'cos': result = Math.cos(value); break;
            case 'tan': result = Math.tan(value); break;
            case 'asin': result = Math.asin(value); break;
            case 'acos': result = Math.acos(value); break;
            case 'atan': result = Math.atan(value); break;
        }
        
        // Convert back if needed
        if (func.startsWith('a')) {
            if (this.angleMode === 'DEG') {
                result = result * 180 / Math.PI;
            } else if (this.angleMode === 'GRAD') {
                result = result * 200 / Math.PI;
            }
        }
        
        this.currentInput = this.roundResult(result).toString();
        this.history = `${func}(${parseFloat(this.currentInput)})`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculateLog() {
        const value = parseFloat(this.currentInput);
        const result = Math.log10(value);
        this.currentInput = this.roundResult(result).toString();
        this.history = `log(${value})`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculateLn() {
        const value = parseFloat(this.currentInput);
        const result = Math.log(value);
        this.currentInput = this.roundResult(result).toString();
        this.history = `ln(${value})`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculateLog2() {
        const value = parseFloat(this.currentInput);
        const result = Math.log2(value);
        this.currentInput = this.roundResult(result).toString();
        this.history = `log₂(${value})`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculateSqrt() {
        const value = parseFloat(this.currentInput);
        const result = Math.sqrt(value);
        this.currentInput = this.roundResult(result).toString();
        this.history = `√(${value})`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculateSquare() {
        const value = parseFloat(this.currentInput);
        const result = Math.pow(value, 2);
        this.currentInput = this.roundResult(result).toString();
        this.history = `(${value})²`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculateCube() {
        const value = parseFloat(this.currentInput);
        const result = Math.pow(value, 3);
        this.currentInput = this.roundResult(result).toString();
        this.history = `(${value})³`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    setPowerOperation() {
        this.previousInput = this.currentInput;
        this.operation = '^';
        this.history = `${this.previousInput}^`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculateFactorial() {
        let value = parseInt(this.currentInput);
        if (value < 0) {
            this.currentInput = 'Error';
            this.updateDisplay();
            return;
        }
        
        let result = 1;
        for (let i = 2; i <= value; i++) {
            result *= i;
        }
        
        this.currentInput = result.toString();
        this.history = `(${value})!`;
        this.updateDisplay();
    }
    
    calculateReciprocal() {
        const value = parseFloat(this.currentInput);
        const result = 1 / value;
        this.currentInput = this.roundResult(result).toString();
        this.history = `1/(${value})`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculateAbs() {
        const value = parseFloat(this.currentInput);
        const result = Math.abs(value);
        this.currentInput = result.toString();
        this.history = `|${value}|`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculateExp() {
        const value = parseFloat(this.currentInput);
        const result = Math.exp(value);
        this.currentInput = this.roundResult(result).toString();
        this.history = `exp(${value})`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculatePower10() {
        const value = parseFloat(this.currentInput);
        const result = Math.pow(10, value);
        this.currentInput = this.roundResult(result).toString();
        this.history = `10^(${value})`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    calculatePercentage() {
        const value = parseFloat(this.currentInput);
        const result = value / 100;
        this.currentInput = result.toString();
        this.history = `(${value})%`;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    // Utility functions
    insertConstant(name, value) {
        this.currentInput = value.toString();
        this.history = name;
        this.resetScreen = true;
        this.updateDisplay();
    }
    
    openParenthesis() {
        if (this.resetScreen || this.currentInput === '0') {
            this.currentInput = '(';
            this.resetScreen = false;
        } else {
            this.currentInput += '(';
        }
        this.updateDisplay();
    }
    
    closeParenthesis() {
        if (this.resetScreen || this.currentInput === '0') {
            this.currentInput = ')';
            this.resetScreen = false;
        } else {
            this.currentInput += ')';
        }
        this.updateDisplay();
    }
    
    clearAll() {
        this.currentInput = '0';
        this.previousInput = '';
        this.history = '';
        this.operation = null;
        this.updateDisplay();
    }
    
    backspace() {
        if (this.currentInput.length === 1 || 
            (this.currentInput.length === 2 && this.currentInput.startsWith('-'))) {
            this.currentInput = '0';
        } else {
            this.currentInput = this.currentInput.slice(0, -1);
        }
        this.updateDisplay();
    }
    
    toggleAngleMode() {
        const modes = ['DEG', 'RAD', 'GRAD'];
        const currentIndex = modes.indexOf(this.angleMode);
        this.angleMode = modes[(currentIndex + 1) % modes.length];
        this.angleModeDisplay.textContent = this.angleMode;
    }
    
    toggleSecondFunctions() {
        this.isSecondFuncActive = !this.isSecondFuncActive;
        const secondFuncButtons = document.querySelectorAll('.btn[data-action="secondFunc"]');
        const hiddenButtons = document.querySelectorAll('.hidden');
        
        secondFuncButtons.forEach(btn => {
            btn.style.backgroundColor = this.isSecondFuncActive ? 
                'rgba(255, 0, 204, 0.3)' : 'rgba(106, 0, 244, 0.3)';
        });
        
        hiddenButtons.forEach(btn => {
            btn.style.display = this.isSecondFuncActive ? 'flex' : 'none';
        });
    }
    
    roundResult(value) {
        return Math.round(value * 10000000000) / 10000000000;
    }
    
    updateDisplay() {
        this.resultDisplay.textContent = this.currentInput;
        this.historyDisplay.textContent = this.history;
    }
}

// Initialize calculator
const calculator = new QuantumCalculator();