
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwnQR15r9C6AwTp_eYY3RV6uNKu7FaYt0xSra776uZS70rifwMxLKpfDyW0Ls85f5EQ/exec";

let leadData = null;
let testSubmitted = false;

// Управление скроллом страницы в зависимости от открытых модал
function adjustBodyScroll() {
    const lead = document.getElementById('leadModal');
    const test = document.getElementById('testModal');
    const privacy = document.getElementById('privacyModal');

    const anyOpen = [lead, test, privacy].some(m => m && m.classList.contains('open'));
    document.body.style.overflow = anyOpen ? 'hidden' : '';
}

// Открыть модал заявки
function openLeadModal(source) {
    const modal = document.getElementById('leadModal');
    if (!modal) return;

    modal.classList.add('open');

    const banner = document.getElementById('testAccessBanner');
    if (banner) {
        banner.style.display = (source === 'test') ? 'block' : 'none';
    }

    adjustBodyScroll();
}

// Закрыть модал заявки
function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (!modal) return;
    modal.classList.remove('open');
    adjustBodyScroll();
}

// Открыть модал с тестом
function openTestModal() {
    const modal = document.getElementById('testModal');
    if (!modal) return;

    modal.classList.add('open');
    adjustBodyScroll();

    // Access Control
    const isCompleted = localStorage.getItem('teremok_test_completed');
    const savedResult = localStorage.getItem('teremok_test_result');

    if (isCompleted && savedResult) {
        // Show result directly
        showDetailedResult(savedResult);
    } else {
        // Start new test
        currentQuestionIndex = 0;
        userAnswers = {};

        const container = document.getElementById('testContainer');
        const resultContainer = document.getElementById('testResultContainer');
        const nextStep = document.getElementById('testNextStep');
        const telegramBlock = document.getElementById('testTelegramBlock');

        if (container) container.style.display = 'block';
        if (resultContainer) resultContainer.style.display = 'none';
        if (nextStep) nextStep.style.display = 'none';
        if (telegramBlock) telegramBlock.style.display = 'none';

        renderQuestion();
    }
}

// Закрыть модал теста
function closeTestModal() {
    const modal = document.getElementById('testModal');
    if (!modal) return;
    modal.classList.remove('open');
    adjustBodyScroll();
}

// Открыть модал политики конфиденциальности
function openPrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (!modal) return;
    modal.classList.add('open');
    adjustBodyScroll();
}

// Закрыть модал политики конфиденциальности
function closePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (!modal) return;
    modal.classList.remove('open');
    adjustBodyScroll();
}

// Обработка отправки формы заявки
function onLeadFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    leadData = Object.fromEntries(formData.entries());

    // после регистрации открываем тест
    closeLeadModal();
    openTestModal();
}

// Логика Test 2.0
const testQuestions = [
    {
        id: 'q1',
        text: '1. Как он обычно реагирует на новую задачу?',
        options: [
            { value: 'ptica', text: 'Тянет время, ждет напоминаний, сам не уточняет детали.' },
            { value: 'homiak', text: 'Сначала спрашивает, что получит лично он (бонус, процент и т.п.).' },
            { value: 'lisa', text: 'Интересуется, кто увидит результат, как это выглядит для руководства.' },
            { value: 'profi', text: 'Уточняет детали, сроки, критерии качества и спокойно берётся за дело.' }
        ]
    },
    {
        id: 'q2',
        text: '2. Как он ведёт себя под контролем?',
        options: [
            { value: 'ptica', text: 'Начинает шевелиться только при жёстком контроле и дедлайнах.' },
            { value: 'homiak', text: 'Делает ровно столько, сколько оплачивается, не больше.' },
            { value: 'lisa', text: 'Активизируется, когда есть шанс показать себя «наверху».' },
            { value: 'profi', text: 'Контроль воспринимает нормально, держит стабильное качество.' }
        ]
    },
    {
        id: 'q3',
        text: '3. Как он ведёт себя в конфликте с клиентом или коллегой?',
        options: [
            { value: 'ptica', text: 'Уходит от ответственности, переводит стрелки, старается спрятаться.' },
            { value: 'homiak', text: 'В первую очередь защищает свои интересы и деньги.' },
            { value: 'lisa', text: 'Думает о том, как ситуация повлияет на его статус и репутацию.' },
            { value: 'profi', text: 'Смотрит на ситуацию через призму работы и результата для компании.' }
        ]
    },
    {
        id: 'q4',
        text: '4. Как он относится к обучению и изменениям?',
        options: [
            { value: 'ptica', text: 'Избегает, откладывает, соглашается только под давлением.' },
            { value: 'homiak', text: 'Готов учиться, если это прямо влияет на его доход.' },
            { value: 'lisa', text: 'Учится, если это усиливает его позицию и влияние.' },
            { value: 'profi', text: 'Видит в обучении инструмент для результата и задаёт вопросы по сути.' }
        ]
    },
    {
        id: 'q5',
        text: '5. Как он говорит о работе в целом?',
        options: [
            { value: 'ptica', text: 'Чаще жалуется, говорит про усталость, «слишком много требуют».' },
            { value: 'homiak', text: 'Делает акцент на зарплате, премиях, «выгоде».' },
            { value: 'lisa', text: 'Больше про статус, позиции, «кто кому подчиняется».' },
            { value: 'profi', text: 'Обсуждает задачи, клиентов, качество, профессиональный рост.' }
        ]
    },
    {
        id: 'q6',
        text: '6. Как он реагирует на дополнительную ответственность?',
        options: [
            { value: 'ptica', text: 'Старается избежать, ищет, кому бы передать.' },
            { value: 'homiak', text: 'Считает, сколько за это заплатят, и от этого зависит согласие.' },
            { value: 'lisa', text: 'Оценивает, даст ли это больше влияния и статуса.' },
            { value: 'profi', text: 'Смотрит, насколько это логично для процесса и результата.' }
        ]
    },
    {
        id: 'q7',
        text: '7. Как он ведёт себя, когда руководитель «отпускает» контроль?',
        options: [
            { value: 'ptica', text: 'Расслабляется, теряет темп, начинаются задержки.' },
            { value: 'homiak', text: 'Делает минимальный объём, старается особо не напрягаться.' },
            { value: 'lisa', text: 'Подстраивает картинку так, чтобы выглядеть хорошо при минимуме усилий.' },
            { value: 'profi', text: 'Держит стабильный уровень, сам контролирует качество.' }
        ]
    },
    {
        id: 'q8',
        text: '8. Что его мотивирует лучше всего?',
        options: [
            { value: 'ptica', text: 'Страх наказания и жесткий контроль.' },
            { value: 'homiak', text: 'Деньги, бонусы, материальные блага.' },
            { value: 'lisa', text: 'Публичная похвала, грамоты, должности.' },
            { value: 'profi', text: 'Интересные задачи и признание профессионализма.' }
        ]
    }
];

let currentQuestionIndex = 0;
let userAnswers = {};

function renderQuestion() {
    const container = document.getElementById('testQuestionCard');
    const progressBar = document.getElementById('testProgressBar');

    if (!container || !progressBar) return;

    const question = testQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / testQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;

    let html = `<h3>${question.text}</h3><div class="test-options">`;

    question.options.forEach(opt => {
        html += `<button class="test-option-btn" onclick="handleAnswer('${opt.value}')">
            ${opt.text}
        </button>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function handleAnswer(value) {
    userAnswers[testQuestions[currentQuestionIndex].id] = value;
    currentQuestionIndex++;

    if (currentQuestionIndex < testQuestions.length) {
        renderQuestion();
    } else {
        finishTest();
    }
}

function finishTest() {
    const progressBar = document.getElementById('testProgressBar');
    if (progressBar) progressBar.style.width = '100%';

    // Calculate Result
    const scores = { ptica: 0, homiak: 0, lisa: 0, profi: 0 };
    Object.values(userAnswers).forEach(val => {
        if (scores[val] !== undefined) scores[val]++;
    });

    let maxScore = -1;
    let resultType = 'profi'; // default
    for (const [type, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            resultType = type;
        }
    }

    showDetailedResult(resultType);

    // Save completion status
    localStorage.setItem('teremok_test_completed', 'true');
    localStorage.setItem('teremok_test_result', resultType);

    // Send to Google Sheet
    sendToGoogleSheet(resultType, scores, `Test 2.0 Result: ${resultType}`);
}

function showDetailedResult(type) {
    const container = document.getElementById('testContainer');
    const resultContainer = document.getElementById('testResultContainer');
    const telegramBlock = document.getElementById('testTelegramBlock');

    if (container) container.style.display = 'none';
    if (resultContainer) {
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = getResultHTML(type);
    }
    if (telegramBlock) telegramBlock.style.display = 'flex';
}

function getResultHTML(type) {
    const content = {
        ptica: {
            icon: '🐦',
            title: 'Птица',
            subtitle: 'Мотивация: Принуждение',
            desc: 'Сотрудник, который работает эффективно только под жестким контролем. Избегает ответственности и инициативы.',
            risks: 'Главный риск — руководитель тратит 80% времени на контроль Птицы, вместо развития бизнеса. Если ослабить хватку, работа встанет.',
            advice: 'Стратегия «Подрезать крылья». Не давайте им «летать» где вздумается. Четкие инструкции, жесткие дедлайны и неотвратимость наказания. Либо создайте условия, где они вынуждены работать, либо прощайтесь.'
        },
        homiak: {
            icon: '🐹',
            title: 'Хомяк',
            subtitle: 'Мотивация: Выгода (Деньги)',
            desc: 'Рассматривает работу исключительно как источник ресурсов. Лоялен не компании, а своему кошельку.',
            risks: 'Легко уйдет к конкурентам за небольшую прибавку. Может торговаться за каждый шаг. Ненадежен в кризис.',
            advice: 'Стратегия «Субсидиарная ответственность». Привязывайте их доход к результатам команды, чтобы они начали видеть других. Не позволяйте шантажировать себя. Четкий KPI: сделал — получил.'
        },
        lisa: {
            icon: '🦊',
            title: 'Лиса',
            subtitle: 'Мотивация: Личная выгода (Статус)',
            desc: 'Ориентирован на власть, влияние и статус. Мастер создавать видимость работы и плести интриги.',
            risks: 'Разрушает коллектив изнутри, стравливает людей, присваивает чужие заслуги. Токсичен для Профи.',
            advice: 'Стратегия «Внутренняя конкуренция». Направьте их энергию на соревнование с другими Лисами. Жестко пресекайте интриги. Требуйте реальных, измеримых результатов, а не красивых отчетов.'
        },
        profi: {
            icon: '🦁',
            title: 'Профи',
            subtitle: 'Мотивация: Результат / Интерес',
            desc: 'Сотрудник, который болеет за дело. Берет ответственность, держит качество, ищет решения.',
            risks: 'Риск выгорания, так как часто тащит на себе работу за Птиц и Лис. Может уйти, если не видит смысла или уважения.',
            advice: 'Стратегия «Партнерство и Защита». Оградите их от бюрократии и токсичных коллег. Дайте интересные задачи и свободу действий. Признавайте их экспертность публично.'
        }
    };

    const data = content[type] || content.profi;

    return `
        <div class="result-card">
            <div class="result-header">
                <span class="result-icon">${data.icon}</span>
                <h2 class="result-title">${data.title}</h2>
                <p class="result-subtitle">${data.subtitle}</p>
            </div>
            
            <div class="result-section">
                <h4>Диагноз</h4>
                <p>${data.desc}</p>
            </div>

            <div class="result-warning">
                <h4>⚠️ Риски для бизнеса</h4>
                <p>${data.risks}</p>
            </div>

            <div class="result-advice">
                <h4>💡 Как управлять</h4>
                <p>${data.advice}</p>
            </div>
        </div>
    `;
}

// Отправка данных в Google Script
function sendToGoogleSheet(mainType, types, resultText) {
    const fd = new FormData();

    if (leadData) {
        fd.append('name', leadData.name || '');
        fd.append('role', leadData.role || '');
        fd.append('company', leadData.company || '');
        fd.append('team_size', leadData.team_size || '');
        fd.append('phone', leadData.phone || '');
        fd.append('messenger', leadData.messenger || '');
        fd.append('email', leadData.email || '');
        fd.append('request', leadData.request || '');
    } else {
        fd.append('name', '');
        fd.append('role', '');
        fd.append('company', '');
        fd.append('team_size', '');
        fd.append('phone', '');
        fd.append('messenger', '');
        fd.append('email', '');
        fd.append('request', '');
    }

    fd.append('test_main_type', mainType || '');
    fd.append('test_main_text', resultText || '');
    fd.append('test_ptica', types.ptica || 0);
    fd.append('test_homiak', types.homiak || 0);
    fd.append('test_lisa', types.lisa || 0);
    fd.append('test_profi', types.profi || 0);

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: fd,
        mode: 'no-cors'
    }).catch(function (err) {
        console.error('Ошибка отправки в Google Script', err);
    });
}

// Инициализация полоски отсчёта времени до мероприятия
function initEventCountdown() {
    const textEl = document.getElementById('eventCountdownText');
    const barEl = document.getElementById('eventCountdownFill');
    if (!textEl || !barEl) return;

    // 18 декабря 2025, 10:00 — локальное время
    const eventStart = new Date(2025, 11, 18, 10, 0, 0);
    const windowMs = 30 * 24 * 60 * 60 * 1000; // 30 дней до события как "полная шкала"

    function formatUnit(value, forms) {
        const v = Math.abs(value) % 100;
        const v1 = v % 10;
        if (v > 10 && v < 20) return value + ' ' + forms[2];
        if (v1 > 1 && v1 < 5) return value + ' ' + forms[1];
        if (v1 === 1) return value + ' ' + forms[0];
        return value + ' ' + forms[2];
    }

    function updateCountdown() {
        const now = new Date();
        let diff = eventStart - now;

        if (diff <= 0) {
            textEl.textContent = 'мероприятие уже началось или прошло';
            barEl.style.width = '100%';
            barEl.setAttribute('aria-valuenow', '100');
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * 1000 * 60 * 60 * 24;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(diff / (1000 * 60));

        let parts = [];
        if (days > 0) {
            parts.push(formatUnit(days, ['день', 'дня', 'дней']));
        }
        if (hours > 0) {
            parts.push(formatUnit(hours, ['час', 'часа', 'часов']));
        }
        if (days === 0 && hours === 0 && minutes > 0) {
            parts.push(formatUnit(minutes, ['минута', 'минуты', 'минут']));
        }

        textEl.textContent = parts.length ? parts.join(' ') : 'меньше минуты';

        let remainingForWindow = eventStart - now;
        if (remainingForWindow > windowMs) {
            remainingForWindow = windowMs;
        }
        if (remainingForWindow < 0) {
            remainingForWindow = 0;
        }

        const percent = 100 - (remainingForWindow / windowMs) * 100;
        const clamped = Math.max(0, Math.min(100, percent));

        barEl.style.width = clamped.toFixed(0) + '%';
        barEl.setAttribute('aria-valuenow', clamped.toFixed(0));
    }

    updateCountdown();
    setInterval(updateCountdown, 60000);
}

document.addEventListener('DOMContentLoaded', function () {
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', onLeadFormSubmit);
    }

    const miniTestForm = document.getElementById('miniTestForm');
    if (miniTestForm) {
        miniTestForm.addEventListener('submit', function (e) {
            e.preventDefault();
            submitMiniTest();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;

        const privacy = document.getElementById('privacyModal');
        const test = document.getElementById('testModal');
        const lead = document.getElementById('leadModal');

        // Сначала закрываем верхнее окно политики, если оно открыто
        if (privacy && privacy.classList.contains('open')) {
            closePrivacyModal();
            return;
        }

        // Потом — окно с тестом
        if (test && test.classList.contains('open')) {
            closeTestModal();
            return;
        }

        // И только потом — окно регистрации
        if (lead && lead.classList.contains('open')) {
            closeLeadModal();
        }
    });

    const animated = document.querySelectorAll('[data-animate]');
    if ('IntersectionObserver' in window && animated.length > 0) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        animated.forEach(el => observer.observe(el));
    } else {
        animated.forEach(el => el.classList.add('in-view'));
    }

    // Testimonials & experts accordion
    const testimonialHeaders = document.querySelectorAll('.testimonial-header');
    testimonialHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const item = header.closest('.testimonial-item');
            const isOpen = item.classList.contains('open');

            document.querySelectorAll('.testimonial-item.open').forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                }
            });

            if (!isOpen) {
                item.classList.add('open');
            } else {
                item.classList.remove('open');
            }
        });
    });

    // Инициализируем отсчёт до мероприятия
    initEventCountdown();



    // Interactive Cards Modal Logic
    document.querySelectorAll('.level-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // Allow clicking on the card itself or its children
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                openModal(modalId);
            }
        });
    });
});

// Generic Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('open');
        adjustBodyScroll();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
        adjustBodyScroll();
    }
}
