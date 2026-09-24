/* ============================================
   КИНЕОГРАФ — Портфолио
   Spine Player 4.2: рандом при загрузке, луп,
   переключение персонажей и анимаций
   ============================================ */

/* === СПИСОК ПЕРСОНАЖЕЙ === */
/* Каждая папка в /spine/ = один персонаж */
/* Иконка с тем же именем лежит в /icons/ */
const CHARACTERS = [
    { id: 'AwakeVampire',        name: 'Awake Vampire' },
    { id: 'Bat',                 name: 'Bat' },
    { id: 'Boss',                name: 'Boss' },
    { id: 'Catapult',            name: 'Catapult' },
    { id: 'CorruptedPriestBoss', name: 'Corrupted Priest Boss' },
    { id: 'Diver',               name: 'Diver' },
    { id: 'EvilBook',            name: 'Evil Book' },
    { id: 'Ghost',               name: 'Ghost' },
    { id: 'HeavyVampire',        name: 'Heavy Vampire' },
];

/* Пути формируются автоматически */
const SPINE_BASE = '/spine/';
const ICONS_BASE = '/icons/';

CHARACTERS.forEach(c => {
    c.json  = `${SPINE_BASE}${c.id}/${c.id}.json`;
    c.atlas = `${SPINE_BASE}${c.id}/${c.id}.atlas`;
    c.icon  = `${ICONS_BASE}${c.id}.png`;
    c.animations = []; // заполнится после загрузки json
});

/* === ПЛЕЕР === */
let player = null;

function loadSpine(character, animationName) {
    // Уничтожаем старый плеер
    if (player && typeof player.dispose === 'function') {
        player.dispose();
        player = null;
    }

    // Очищаем контейнер
    const container = document.getElementById('spine-player');
    if (container) container.innerHTML = '';

    player = new spine.SpinePlayer('spine-player', {
        jsonUrl: character.json,
        atlasUrl: character.atlas,
        animation: animationName || undefined,
        showControls: false,           // скрываем встроенные кнопки
        loop: true,                    // бесконечный луп
        premultipliedAlpha: true,
        backgroundColor: '#F5F5F3',
        alpha: true,
        viewport: {
            debugRender: false,
            padLeft: '5%',
            padRight: '5%',
            padTop: '5%',
            padBottom: '5%',
        },
        success: (p) => {
            // Получаем список анимаций из json
            const anims = p.skeleton.data.animations.map(a => a.name);
            character.animations = anims;

            // Если анимация не задана — выбираем случайную
            const chosen = animationName && anims.includes(animationName)
                ? animationName
                : anims[Math.floor(Math.random() * anims.length)];

            // Запускаем в луп
            p.animationState.setAnimation(0, chosen, true);

            // Отрисовываем кнопки анимаций
            renderAnimationButtons(character, chosen);
        },
        error: (p, msg) => {
            console.error('Spine error [' + character.id + ']:', msg);
        },
    });
}

/* === КНОПКИ ПЕРСОНАЖЕЙ === */
function renderSkinButtons(activeIndex) {
    const wrap = document.getElementById('skin-buttons');
    if (!wrap) return;
    wrap.innerHTML = '';

    CHARACTERS.forEach((char, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'spine-btn' + (index === activeIndex ? ' spine-btn--active' : '');
        btn.setAttribute('aria-label', char.name);
        btn.title = char.name;

        const img = document.createElement('img');
        img.src = char.icon;
        img.alt = char.name;
        img.loading = 'lazy';
        img.onerror = () => {
            // Если иконки нет — показываем первую букву имени
            btn.innerHTML = '';
            btn.textContent = char.name[0];
        };
        btn.appendChild(img);

        btn.addEventListener('click', () => {
            loadSpine(char, null);   // null = случайная анимация внутри success
            renderSkinButtons(index);
        });

        wrap.appendChild(btn);
    });
}

/* === КНОПКИ АНИМАЦИЙ === */
function renderAnimationButtons(character, activeAnimation) {
    const wrap = document.getElementById('animation-buttons');
    if (!wrap) return;
    wrap.innerHTML = '';

    if (!character.animations.length) {
        wrap.innerHTML = '<span class="spine-controls__empty">Нет анимаций</span>';
        return;
    }

    character.animations.forEach((anim) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'spine-btn spine-btn--text'
            + (anim === activeAnimation ? ' spine-btn--active' : '');
        btn.textContent = anim;

        btn.addEventListener('click', () => {
            if (player && player.animationState) {
                player.animationState.setAnimation(0, anim, true);
            }
            renderAnimationButtons(character, anim);
        });

        wrap.appendChild(btn);
    });
}

/* === ЗАПУСК === */
document.addEventListener('DOMContentLoaded', () => {
    if (!CHARACTERS.length) {
        console.warn('Spine: список персонажей пуст');
        return;
    }

    // Случайный персонаж при загрузке страницы
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    const character = CHARACTERS[randomIndex];

    // Загружаем с null → внутри success выберется случайная анимация
    loadSpine(character, null);
    renderSkinButtons(randomIndex);
});