/* ============================================
   Кинеограф — основной скрипт
   Содержит: мобильное меню, Intersection Observer,
   маску телефона, отправку формы (Yandex Cloud Function + reCAPTCHA)
   ============================================ */

/* === АДРЕС CLOUD FUNCTION (Yandex Cloud) === */
const API_URL = 'https://functions.yandexcloud.net/d4eqi3bldrtqhecvrngk';

/* === КОНФИГУРАЦИЯ RECAPTCHA === */
const RECAPTCHA_SITE_KEY = '6LerAagtAAAAADOeiDaYEO4v5KVuOBtH04mnnsHg';

/* === МОБИЛЬНОЕ МЕНЮ (бургер) === */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

if (burger && nav) {
    burger.addEventListener('click', () => {
        const expanded = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', !expanded);
        burger.classList.toggle('active');
        nav.classList.toggle('active');
    });

    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
            burger.setAttribute('aria-expanded', 'false');
        });
    });
}

/* === FADE-IN АНИМАЦИЯ ПРИ ПРОКРУТКЕ === */
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.about__inner, .steps__grid .step-card, .works__grid .work-card, .reviews__grid .review-card, .location__inner'
    );
    
    animatedElements.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
});


/* =====================================================
   ГАЛЕРЕЯ
   ===================================================== */
(() => {
    // 1. КАТЕГОРИИ (кнопки фильтра)
    const CATS = ['Занятия', 'Работы', 'Закулисье', 'Материалы'];

    // 2. НАЗВАНИЯ ФОТО
    // Ключ — категория, значение — массив названий.
    // Порядок названий совпадает с порядком фото в этой категории.
    const T = {
        'Занятия': ['Снимаем покадрово', 'Двигаем героя по миллиметру', 'Рисуем раскадровку', 'Работаем командой', 'Первый кадр'],
        'Работы': ['Пластилиновый герой', 'Перекладной лес', 'Рисованная погоня', 'Игрушки оживают', 'Кадр из мультфильма'],
        'Закулисье': ['Свет и камера', 'Стол аниматора', 'Готовимся к съёмке', 'Декорации', 'Оптические игрушки'],
        'Материалы': ['Пластилин и стеки', 'Бумага и ножницы', 'Зоотроп', 'Фенакистископ', 'Краски и кисти']
    };

        // 3. СПИСОК ВСЕХ ФОТО
    // ЗДЕСЬ ТЫ МЕНЯЕШЬ ПУТИ К ФОТО.
    // src: 'photos/папка/имя_файла.jpg'
    // cat: 'Категория' (к которой относится фото)
    // title: 'Название' (то, что появится при наведении и в просмотре)
    const items = [
        // --- ЗАНЯТИЯ (папка classes) ---
        { src: 'photos/classes/1.jpg', cat: 'Занятия', title: 'Снимаем покадрово' },
        { src: 'photos/classes/2.jpg', cat: 'Занятия', title: 'Двигаем героя по миллиметру' },
        { src: 'photos/classes/3.jpg', cat: 'Занятия', title: 'Рисуем раскадровку' },
        { src: 'photos/classes/4.jpg', cat: 'Занятия', title: 'Работаем командой' },
        { src: 'photos/classes/5.jpg', cat: 'Занятия', title: 'Первый кадр' },

        // --- РАБОТЫ (папка works) ---
        { src: 'photos/works/1.jpg', cat: 'Работы', title: 'Пластилиновый герой' },
        { src: 'photos/works/2.jpg', cat: 'Работы', title: 'Перекладной лес' },
        { src: 'photos/works/3.jpg', cat: 'Работы', title: 'Рисованная погоня' },
        { src: 'photos/works/4.jpg', cat: 'Работы', title: 'Игрушки оживают' },
        { src: 'photos/works/5.jpg', cat: 'Работы', title: 'Кадр из мультфильма' },

        // --- ЗАКУЛИСЬЕ (папка backstage) ---
        { src: 'photos/backstage/1.jpg', cat: 'Закулисье', title: 'Свет и камера' },
        { src: 'photos/backstage/2.jpg', cat: 'Закулисье', title: 'Стол аниматора' },
        { src: 'photos/backstage/3.jpg', cat: 'Закулисье', title: 'Готовимся к съёмке' },
        { src: 'photos/backstage/4.jpg', cat: 'Закулисье', title: 'Декорации' },
        { src: 'photos/backstage/5.jpg', cat: 'Закулисье', title: 'Оптические игрушки' },

        // --- МАТЕРИАЛЫ (папка materials) ---
        { src: 'photos/materials/1.jpg', cat: 'Материалы', title: 'Пластилин и стеки' },
        { src: 'photos/materials/2.jpg', cat: 'Материалы', title: 'Бумага и ножницы' },
        { src: 'photos/materials/3.jpg', cat: 'Материалы', title: 'Зоотроп' },
        { src: 'photos/materials/4.jpg', cat: 'Материалы', title: 'Фенакистископ' },
        { src: 'photos/materials/5.jpg', cat: 'Материалы', title: 'Краски и кисти' }
    ];

    const $ = s => document.querySelector(s);
    const grid = $('#gallery-grid'), chips = $('#gallery-chips'), more = $('#gallery-more'), count = $('#gallery-count');
    const lb = $('#gallery-lb'), lbimg = $('#gallery-lb-img'), strip = $('#gallery-strip');
    
    if (!grid) return; // Если галереи нет на странице, ничего не делаем

    let f = 'Все', shown = 12, list = items, cur = 0, last = null;
    const pad = n => String(n).padStart(2, '0');
    
    // Вспомогательная функция для склонения слова "фото"
    const pl = n => (n % 10 === 1 && n % 100 !== 11) ? 'фото' : 'фото';

    function drawChips() {
        chips.innerHTML = ['Все', ...CATS].map(c => {
            const n = c === 'Все' ? items.length : items.filter(x => x.cat === c).length;
            return `<button class="gallery-chip${c === f ? ' on' : ''}" data-c="${c}" aria-pressed="${c === f}">${c}<i>${n}</i></button>`;
        }).join('');
    }

    function render() {
        list = f === 'Все' ? items : items.filter(x => x.cat === f);
        grid.innerHTML = list.length ? list.slice(0, shown).map((it, k) =>
            `<button class="gallery-tile" data-k="${k}" style="transition-delay:${(k % 8) * 45}ms" aria-label="Открыть: ${it.title}">
                <div class="gallery-art">
                    <img src="${it.src}" alt="${it.title}" loading="lazy">
                </div>
                <span class="gallery-cap"><small>${it.cat}</small>${it.title}</span>
            </button>`
        ).join('') : '<p class="empty">В этой категории пока нет фотографий.</p>';

        count.textContent = list.length + ' ' + pl(list.length);
        if (more) more.parentElement.hidden = shown >= list.length;
        
        requestAnimationFrame(() => requestAnimationFrame(() => {
            grid.querySelectorAll('.gallery-tile').forEach(t => t.classList.add('in'));
        }));
    }

    chips.addEventListener('click', e => {
        const b = e.target.closest('.gallery-chip');
        if (!b) return;
        f = b.dataset.c;
        shown = 12;
        drawChips();
        render();
    });

    if (more) more.addEventListener('click', () => { shown += 12; render(); });

    function show(k) {
        cur = (k + list.length) % list.length;
        const it = list[cur];
        lbimg.innerHTML = `<img src="${it.src}" alt="${it.title}">`;
        $('#gallery-lb-title').textContent = it.title;
        $('#gallery-lb-cat').textContent = it.cat;
        $('#gallery-lb-count').textContent = pad(cur + 1) + ' из ' + pad(list.length);
        strip.querySelectorAll('.gallery-th').forEach((t, j) => t.classList.toggle('on', j === cur));
        const a = strip.children[cur];
        if (a) a.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }

    function open(k) {
        last = document.activeElement;
        strip.innerHTML = list.map((it, j) => `<button class="gallery-th" data-k="${j}" aria-label="Фото ${j + 1}"><img src="${it.src}" alt=""></button>`).join('');
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        show(k);
        $('#gallery-lb-x').focus();
    }

    function close() {
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (last) last.focus();
    }

    grid.addEventListener('click', e => {
        const t = e.target.closest('.gallery-tile');
        if (t) open(+t.dataset.k);
    });
    
    strip.addEventListener('click', e => {
        const t = e.target.closest('.gallery-th');
        if (t) show(+t.dataset.k);
    });
    
    $('#gallery-prev').onclick = () => show(cur - 1);
    $('#gallery-next').onclick = () => show(cur + 1);
    $('#gallery-lb-x').onclick = close;
    
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    
    document.addEventListener('keydown', e => {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(cur - 1);
        if (e.key === 'ArrowRight') show(cur + 1);
    });
    
    let x0 = null;
    lb.addEventListener('touchstart', e => { x0 = e.target.closest('.gallery-lb__rail') ? null : e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
        if (x0 === null) return;
        const d = e.changedTouches[0].clientX - x0;
        if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1));
        x0 = null;
    });

    drawChips();
    render();
})();


/* === МАСКА ТЕЛЕФОНА === */
const phoneInput = document.getElementById('phone');

if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.startsWith('7') || value.startsWith('8')) {
            value = value.slice(1);
        }
        
        let formatted = '+7 (';
        if (value.length > 0) formatted += value.substring(0, 3);
        if (value.length >= 3) formatted += ') ';
        if (value.length > 3) formatted += value.substring(3, 6);
        if (value.length >= 6) formatted += '-';
        if (value.length > 6) formatted += value.substring(6, 8);
        if (value.length >= 8) formatted += '-';
        if (value.length > 8) formatted += value.substring(8, 10);
        
        e.target.value = formatted;
    });

    phoneInput.addEventListener('keydown', (e) => {
        const digits = e.target.value.replace(/\D/g, '').length;
        if (digits >= 11 && e.key >= '0' && e.key <= '9') {
            e.preventDefault();
        }
    });
}

/* === ОТПРАВКА ФОРМЫ (Yandex Cloud Function) === */
const form = document.getElementById('application-form');
const formMessage = document.getElementById('form-message');
const submitBtn = document.getElementById('submit-btn');
const recaptchaTokenInput = document.getElementById('recaptcha-token');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        formMessage.textContent = '';
        formMessage.className = 'form__message';
        
        const honeypot = document.getElementById('website');
        if (honeypot && honeypot.value.trim() !== '') {
            formMessage.textContent = 'Спасибо! Мы скоро свяжемся с вами';
            formMessage.classList.add('form__message--success');
            form.reset();
            return;
        }
        
        const studentName = document.getElementById('student-name').value.trim();
        const parentName = document.getElementById('parent-name').value.trim();
        const childAgeField = document.getElementById('child-age');
        const childAge = childAgeField ? childAgeField.value.trim() : '';
        const phone = document.getElementById('phone').value.trim();
        const agree = document.getElementById('agree').checked;
        
        let isValid = true;
        
        if (!studentName) {
            markError('student-name', 'Пожалуйста, укажите имя и фамилию ученика');
            isValid = false;
        } else clearError('student-name');
        
        if (!parentName) {
            markError('parent-name', 'Пожалуйста, укажите имя родителя');
            isValid = false;
        } else clearError('parent-name');

        if (childAgeField) {
            if (!childAge || childAge < 7 || childAge > 18) {
                markError('child-age', 'Укажите возраст ребёнка от 7 до 18 лет');
                isValid = false;
            } else clearError('child-age');
        }
        
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 11) {
            markError('phone', 'Введите полный номер телефона');
            isValid = false;
        } else clearError('phone');
        
        if (!agree) {
            markError('agree', 'Необходимо согласие на обработку данных');
            isValid = false;
        } else clearError('agree');
        
        if (!isValid) return;
        
        let recaptchaToken = '';
        try {
            recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
            if (recaptchaTokenInput) recaptchaTokenInput.value = recaptchaToken;
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            formMessage.textContent = 'Ошибка проверки reCAPTCHA. Пожалуйста, обновите страницу и попробуйте снова.';
            formMessage.classList.add('form__message--error');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: studentName,
                    parentName: parentName,
                    childAge: childAge,
                    phone: phone,
                    recaptchaToken: recaptchaToken,
                    website: honeypot ? honeypot.value : ''
                }),
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                formMessage.textContent = 'Спасибо! Мы скоро свяжемся с вами';
                formMessage.classList.add('form__message--success');
                form.reset();
                if (recaptchaTokenInput) recaptchaTokenInput.value = '';
            } else {
                throw new Error(result.error || 'Ошибка отправки');
            }
        } catch (error) {
            console.error('Send error:', error);
            formMessage.textContent = 'Не удалось отправить заявку. Позвоните нам: +7 995 168 8246';
            formMessage.classList.add('form__message--error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить заявку';
        }
    });
}

function markError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    if (field) field.classList.add('form__input--error');
    if (errorEl) errorEl.textContent = message;
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    if (field) field.classList.remove('form__input--error');
    if (errorEl) errorEl.textContent = '';
}

/* === ПЛАВНЫЙ СКРОЛЛ ДЛЯ ЯКОРНЫХ ССЫЛОК === */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});