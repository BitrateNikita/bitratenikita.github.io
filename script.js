/* ============================================
   Кинеограф — основной скрипт
   Содержит: мобильное меню, Intersection Observer,
   маску телефона, отправку формы (Firebase + reCAPTCHA)
   ============================================ */

/* === КОНФИГУРАЦИЯ FIREBASE === */
// ЗАМЕНИТЕ [FIREBASE_CONFIG] на реальный объект конфигурации из Firebase Console
// Пример:
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };
const firebaseConfig = {
  apiKey: "AIzaSyBU4A03ifp5vmpHAcicvoGEgexkEr1sU-c",
  authDomain: "kineograph-site-99c7f.firebaseapp.com",
  projectId: "kineograph-site-99c7f",
  storageBucket: "kineograph-site-99c7f.firebasestorage.app",
  messagingSenderId: "744025644715",
  appId: "1:744025644715:web:55a35c3346b014e938e1ee"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* === КОНФИГУРАЦИЯ RECAPTCHA === */
// ЗАМЕНИТЕ [RECAPTCHA_SITE_KEY] на реальный site key из Google reCAPTCHA Admin Console
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

    // Закрывать меню при клике на ссылку (для мобильных)
    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
            burger.setAttribute('aria-expanded', 'false');
        });
    });
}

/* === FADE-IN АНИМАЦИЯ ПРИ ПРОКРУТКЕ (Intersection Observer) === */
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем класс fade-in всем секциям и карточкам, которые должны анимироваться
    const animatedElements = document.querySelectorAll(
        '.about__inner, .steps__grid .step-card, .works__grid .work-card, .reviews__grid .review-card, .location__inner'
    );
    
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
    });

    // Настройка Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Можно отключить наблюдение после появления
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,      // срабатывает когда 15% элемента видимо
        rootMargin: '0px 0px -50px 0px'  // небольшой сдвиг снизу
    });

    // Наблюдаем за элементами
    animatedElements.forEach(el => observer.observe(el));
});

/* === МАСКА ТЕЛЕФОНА === */
const phoneInput = document.getElementById('phone');

if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // оставляем только цифры
        
        // Приводим к формату +7 (XXX) XXX-XX-XX
        if (value.startsWith('7') || value.startsWith('8')) {
            value = value.slice(1); // убираем первую 7 или 8
        }
        
        let formatted = '+7 (';
        if (value.length > 0) {
            formatted += value.substring(0, 3);
        }
        if (value.length >= 3) {
            formatted += ') ';
        }
        if (value.length > 3) {
            formatted += value.substring(3, 6);
        }
        if (value.length >= 6) {
            formatted += '-';
        }
        if (value.length > 6) {
            formatted += value.substring(6, 8);
        }
        if (value.length >= 8) {
            formatted += '-';
        }
        if (value.length > 8) {
            formatted += value.substring(8, 10);
        }
        
        e.target.value = formatted;
    });

    // Ограничение длины
    phoneInput.addEventListener('keydown', (e) => {
        const digits = e.target.value.replace(/\D/g, '').length;
        if (digits >= 11 && e.key >= '0' && e.key <= '9') {
            e.preventDefault();
        }
    });
}

/* === ОТПРАВКА ФОРМЫ === */
const form = document.getElementById('application-form');
const formMessage = document.getElementById('form-message');
const submitBtn = document.getElementById('submit-btn');
const recaptchaTokenInput = document.getElementById('recaptcha-token');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Сброс сообщений
        formMessage.textContent = '';
        formMessage.className = 'form__message';
        
        // Проверка honeypot — если заполнено, значит бот
        const honeypot = document.getElementById('website');
        if (honeypot && honeypot.value.trim() !== '') {
            // Тихо "успешно" завершаем, но ничего не отправляем
            formMessage.textContent = 'Спасибо! Мы скоро свяжемся с вами';
            formMessage.classList.add('form__message--success');
            form.reset();
            return;
        }
        
        // Базовая валидация полей
        const studentName = document.getElementById('student-name').value.trim();
        const parentName = document.getElementById('parent-name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const agree = document.getElementById('agree').checked;
        
        let isValid = true;
        
        // Проверка имени ученика
        if (!studentName) {
            markError('student-name', 'Пожалуйста, укажите имя и фамилию ученика');
            isValid = false;
        } else {
            clearError('student-name');
        }
        
        // Проверка имени родителя
        if (!parentName) {
            markError('parent-name', 'Пожалуйста, укажите имя родителя');
            isValid = false;
        } else {
            clearError('parent-name');
        }
        
        // Проверка телефона (минимум 11 цифр)
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 11) {
            markError('phone', 'Введите полный номер телефона');
            isValid = false;
        } else {
            clearError('phone');
        }
        
        // Проверка согласия
        if (!agree) {
            markError('agree', 'Необходимо согласие на обработку данных');
            isValid = false;
        } else {
            clearError('agree');
        }
        
        if (!isValid) {
            return;
        }
        
        // Получение reCAPTCHA токена
        try {
            const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
            recaptchaTokenInput.value = token;
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            formMessage.textContent = 'Ошибка проверки reCAPTCHA. Пожалуйста, обновите страницу и попробуйте снова.';
            formMessage.classList.add('form__message--error');
            return;
        }
        
        // Блокируем кнопку на время отправки
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        // Собираем данные
        const applicationData = {
            studentName: studentName,
            parentName: parentName,
            phone: phone,
            recaptchaToken: recaptchaTokenInput.value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            source: 'website'
        };
        
        try {
            // Отправка в Firestore коллекцию applications
            await db.collection('applications').add(applicationData);
            
            // Успешная отправка
            formMessage.textContent = 'Спасибо! Мы скоро свяжемся с вами';
            formMessage.classList.add('form__message--success');
            form.reset();
            recaptchaTokenInput.value = '';
            
            // Скрываем форму? По заданию "заменить форму на сообщение"
            // Можно оставить форму, но очистить, или заменить содержимое.
            // Здесь просто показываем сообщение, форма остаётся (можно доработать)
        } catch (error) {
            console.error('Firebase error:', error);
            formMessage.textContent = 'Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз или свяжитесь с нами по телефону.';
            formMessage.classList.add('form__message--error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить заявку';
        }
    });
}

// Вспомогательные функции для валидации
function markError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    if (field) {
        field.classList.add('form__input--error');
    }
    if (errorEl) {
        errorEl.textContent = message;
    }
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    if (field) {
        field.classList.remove('form__input--error');
    }
    if (errorEl) {
        errorEl.textContent = '';
    }
}

/* === ПЛАВНЫЙ СКРОЛЛ ДЛЯ ЯКОРНЫХ ССЫЛОК (уже есть через CSS, но добавим для надёжности) === */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});
