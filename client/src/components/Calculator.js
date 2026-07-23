export function Calculator(targetInput) {
    const overlay = document.createElement('div');
    overlay.className = 'calc-overlay';

    const calc = document.createElement('div');
    calc.className = 'calc-panel';

    let expression = '';
    let display = '0';

    calc.innerHTML = `
        <div class="calc-display">
            <div class="calc-expr"></div>
            <div class="calc-result">0</div>
        </div>
        <div class="calc-grid">
            <button class="calc-btn calc-op" data-val="C">C</button>
            <button class="calc-btn calc-op" data-val="(">(</button>
            <button class="calc-btn calc-op" data-val=")">)</button>
            <button class="calc-btn calc-op" data-val="/">÷</button>
            <button class="calc-btn" data-val="7">7</button>
            <button class="calc-btn" data-val="8">8</button>
            <button class="calc-btn" data-val="9">9</button>
            <button class="calc-btn calc-op" data-val="*">×</button>
            <button class="calc-btn" data-val="4">4</button>
            <button class="calc-btn" data-val="5">5</button>
            <button class="calc-btn" data-val="6">6</button>
            <button class="calc-btn calc-op" data-val="-">−</button>
            <button class="calc-btn" data-val="1">1</button>
            <button class="calc-btn" data-val="2">2</button>
            <button class="calc-btn" data-val="3">3</button>
            <button class="calc-btn calc-op" data-val="+">+</button>
            <button class="calc-btn calc-zero" data-val="0">0</button>
            <button class="calc-btn" data-val=".">.</button>
            <button class="calc-btn calc-eq" data-val="=">=</button>
        </div>
    `;

    const exprEl = calc.querySelector('.calc-expr');
    const resultEl = calc.querySelector('.calc-result');

    function updateDisplay() {
        exprEl.textContent = expression;
        resultEl.textContent = display;
    }

    function safeEval(expr) {
        try {
            const sanitized = expr.replace(/[^0-9+\-*/().]/g, '');
            if (!sanitized) return 0;
            const result = Function('"use strict"; return (' + sanitized + ')')();
            return isNaN(result) || !isFinite(result) ? 0 : result;
        } catch {
            return 0;
        }
    }

    calc.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.dataset.val;

            if (val === 'C') {
                expression = '';
                display = '0';
            } else if (val === '=') {
                const result = safeEval(expression);
                display = result.toLocaleString('id-ID');
                targetInput.value = result;
                expression = result.toString();
                setTimeout(() => overlay.remove(), 300);
                return;
            } else {
                expression += val;
                const result = safeEval(expression);
                display = result.toLocaleString('id-ID');
            }
            updateDisplay();
        });
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    overlay.appendChild(calc);
    return overlay;
}
