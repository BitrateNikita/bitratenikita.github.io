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

/* === ФОТОГАЛЕРЕЯ === */
const GALLERY_FOLDER = 'photos/works/';  // папка с фото
const GALLERY_EXT = 'jpg';               // расширение файлов: jpg, png или webp
const GALLERY_COUNT = 12;                // сколько фото: 1.jpg ... 12.jpg
const GALLERY_STEP = 9;                  // сколько показывать за раз (кратно 3)

(function () {
    const rowsEl = document.getElementById('gallery-rows');
    const moreBtn = document.getElementById('gallery-more');
    if (!rowsEl || !moreBtn) return;

    const touchMode = window.matchMedia('(max-width: 768px), (hover: none)');
    let shown = 0, curRow = null, openItem = null;

    function expandedHeight(item) {
        // высота раскрытой рамки = реальные пропорции фото, но не выше 82% экрана
        return Math.min(item.clientWidth / (item._ar || 1.5), window.innerHeight * 0.82);
    }
    function openIt(item) {
        item.classList.add('is-open');
        item.setAttribute('aria-expanded', 'true');
        item.style.height = expandedHeight(item) + 'px';
        setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 580);
    }
    function closeIt(item) {
        item.classList.remove('is-open');
        item.setAttribute('aria-expanded', 'false');
        item.style.height = '';
    }

    function addPhotos(n) {
        const end = Math.min(shown + n, GALLERY_COUNT);
        for (let i = shown + 1; i <= end; i++) {
            if (!curRow || !curRow.isConnected || curRow.childElementCount >= 3) {
                curRow = document.createElement('div');
                curRow.className = 'g-row';
                rowsEl.appendChild(curRow);
            }
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'g-item';
            item.setAttribute('aria-label', 'Фото ' + i + ' со студии');

            const img = new Image();
            img.alt = 'Фото со студии «Кинеограф»';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.onload = () => { item._ar = img.naturalWidth / img.naturalHeight; };
            img.onerror = () => {               // нет такого файла — тихо убираем
                const row = item.parentElement;
                item.remove();
                if (row && !row.children.length) row.remove();
            };
            img.src = GALLERY_FOLDER + i + '.' + GALLERY_EXT;

            item.appendChild(img);
            curRow.appendChild(item);
        }
        shown = end;
        moreBtn.parentElement.hidden = shown >= GALLERY_COUNT;
    }

    // Тап на телефоне: раскрыть / свернуть (открытой бывает только одна)
    rowsEl.addEventListener('click', (e) => {
        if (!touchMode.matches) return;
        const item = e.target.closest('.g-item');
        if (!item) return;
        if (openItem && openItem !== item) closeIt(openItem);
        if (openItem === item) { closeIt(item); openItem = null; return; }
        openIt(item);
        openItem = item;
    });

    // Поворот экрана или смена режима
    window.addEventListener('resize', () => {
        if (!openItem) return;
        if (touchMode.matches) openItem.style.height = expandedHeight(openItem) + 'px';
        else { closeIt(openItem); openItem = null; }
    });

    moreBtn.addEventListener('click', () => addPhotos(GALLERY_STEP));
    addPhotos(GALLERY_STEP);
})();

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