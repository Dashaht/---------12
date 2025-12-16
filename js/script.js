// Получаем элементы из DOM
const titleInput = document.getElementById('artifact-title');
const categoryInput = document.getElementById('artifact-category');
const imageInput = document.getElementById('artifact-image');
const descriptionInput = document.getElementById('artifact-description');
const addBtn = document.getElementById('add-btn');
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('search-input');
const artifactCounter = document.getElementById('artifact-counter');
const favoriteCounter = document.getElementById('favorite-counter');
const categoryCounter = document.getElementById('category-counter');
const lastUpdate = document.getElementById('last-update');
const themeToggle = document.getElementById('theme-toggle');
const errorBanner = document.getElementById('error-banner');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error-btn');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');
const modalDescription = document.getElementById('modal-description');
const modalDate = document.getElementById('modal-date');
const modalFavoriteStatus = document.getElementById('modal-favorite-status');

// Новые элементы для таблицы
const viewCardsBtn = document.getElementById('view-cards-btn');
const viewTableBtn = document.getElementById('view-table-btn');
const tableContainer = document.getElementById('table-container');
const artifactsTable = document.getElementById('artifacts-table');
const tableBody = artifactsTable.querySelector('tbody');
const sortDateBtn = document.getElementById('sort-date-btn');
const clearSelectionBtn = document.getElementById('clear-selection-btn');
const selectedRowsCounter = document.getElementById('selected-rows-counter');
const emptyTableMessage = document.querySelector('.empty-table-message');

// Глобальные переменные
let cards = [];
let categories = new Set(['Все']);
let favoriteCount = 0;
let totalArtifacts = 0;
let selectedCategory = 'all';
let selectedRows = new Set();
let isDateSorted = false;

// ==================== ФУНКЦИИ ДЛЯ ТАБЛИЦЫ ====================

/**
 * Обновляет таблицу данными из массива cards
 */
function updateTable() {
    // Очищаем таблицу
    tableBody.innerHTML = '';
    
    if (cards.length === 0) {
        emptyTableMessage.style.display = 'block';
        return;
    }
    
    emptyTableMessage.style.display = 'none';
    
    // Заполняем таблицу данными
    cards.forEach(card => {
        const row = document.createElement('tr');
        row.dataset.id = card.id;
        
        // Добавляем класс, если артефакт в избранном
        if (card.isFavorite) {
            row.classList.add('favorite-row');
        }
        
        // Добавляем обработчик для выделения строки
        row.addEventListener('click', (e) => {
            if (!e.target.classList.contains('action-btn')) {
                toggleRowSelection(row);
            }
        });
        
        // Ячейка ID
        const idCell = document.createElement('td');
        idCell.textContent = card.id;
        
        // Ячейка названия
        const titleCell = document.createElement('td');
        titleCell.textContent = card.title;
        
        // Ячейка категории
        const categoryCell = document.createElement('td');
        categoryCell.textContent = card.category;
        
        // Ячейка даты
        const dateCell = document.createElement('td');
        dateCell.textContent = card.date;
        
        // Ячейка избранного
        const favoriteCell = document.createElement('td');
        favoriteCell.classList.add('favorite-cell');
        favoriteCell.textContent = card.isFavorite ? '★' : '☆';
        
        // Ячейка действий
        const actionCell = document.createElement('td');
        actionCell.classList.add('action-cell');
        
        // Кнопка просмотра
        const viewBtn = document.createElement('button');
        viewBtn.classList.add('action-btn', 'action-view');
        viewBtn.textContent = 'Просмотр';
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(card);
        });
        
        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('action-btn', 'action-delete');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteArtifact(card.id);
        });
        
        actionCell.appendChild(viewBtn);
        actionCell.appendChild(deleteBtn);
        
        // Собираем строку
        row.appendChild(idCell);
        row.appendChild(titleCell);
        row.appendChild(categoryCell);
        row.appendChild(dateCell);
        row.appendChild(favoriteCell);
        row.appendChild(actionCell);
        
        tableBody.appendChild(row);
    });
    
    updateSelectedRowsCounter();
}

/**
 * Переключает выделение строки таблицы
 */
function toggleRowSelection(row) {
    row.classList.toggle('selected');
    
    const artifactId = parseInt(row.dataset.id);
    if (row.classList.contains('selected')) {
        selectedRows.add(artifactId);
    } else {
        selectedRows.delete(artifactId);
    }
    
    updateSelectedRowsCounter();
}

/**
 * Обновляет счетчик выбранных строк
 */
function updateSelectedRowsCounter() {
    selectedRowsCounter.textContent = selectedRows.size;
}

/**
 * Снимает выделение со всех строк
 */
function clearRowSelection() {
    document.querySelectorAll('.artifacts-table tbody tr.selected').forEach(row => {
        row.classList.remove('selected');
    });
    selectedRows.clear();
    updateSelectedRowsCounter();
}

/**
 * Сортирует таблицу по дате
 */
function sortTableByDate() {
    if (isDateSorted) {
        // Сортировка по убыванию (новые сверху)
        cards.sort((a, b) => new Date(b.date.split('.').reverse().join('-')) - new Date(a.date.split('.').reverse().join('-')));
        sortDateBtn.textContent = 'Сортировать по дате (↓)';
    } else {
        // Сортировка по возрастанию (старые сверху)
        cards.sort((a, b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));
        sortDateBtn.textContent = 'Сортировать по дате (↑)';
    }
    
    isDateSorted = !isDateSorted;
    updateTable();
}

/**
 * Удаляет артефакт по ID
 */
function deleteArtifact(id) {
    // Находим индекс артефакта в массиве
    const index = cards.findIndex(c => c.id === id);
    if (index === -1) return;
    
    const artifact = cards[index];
    
    // Удаляем из массива
    cards.splice(index, 1);
    totalArtifacts--;
    
    // Обновляем счетчик избранных
    if (artifact.isFavorite) {
        favoriteCount--;
    }
    
    // Удаляем карточку из DOM, если она существует
    const cardElement = document.querySelector(`.card[data-id="${id}"]`);
    if (cardElement) {
        cardElement.remove();
    }
    
    // Обновляем таблицу
    updateTable();
    
    // Обновляем категории
    updateCategoriesList();
    
    // Проверяем, не пуста ли галерея
    if (gallery.querySelectorAll('.card').length === 0) {
        const emptyMessage = gallery.querySelector('.empty-gallery-message');
        if (!emptyMessage) {
            const message = document.createElement('p');
            message.classList.add('empty-gallery-message');
            message.textContent = 'Галерея пуста. Добавьте первый артефакт!';
            gallery.appendChild(message);
        }
    }
    
    updateCounters();
}

// ==================== ФУНКЦИИ ДЛЯ ГАЛЕРЕИ ====================

/**
 * Обновляет счетчики
 */
function updateCounters() {
    artifactCounter.textContent = `Артефактов: ${totalArtifacts}`;
    favoriteCounter.textContent = `Избранных: ${favoriteCount}`;
    categoryCounter.textContent = categories.size - 1; // Минус "Все"
    
    // Обновляем время последнего обновления
    const now = new Date();
    lastUpdate.textContent = now.toLocaleTimeString('ru-RU');
    
    // Обновляем таблицу
    updateTable();
}

/**
 * Показывает сообщение об ошибке
 */
function showError(message) {
    errorMessage.textContent = message;
    errorBanner.classList.remove('hidden');
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        hideError();
    }, 5000);
}

/**
 * Скрывает сообщение об ошибке
 */
function hideError() {
    errorBanner.classList.add('hidden');
}

/**
 * Создает карточку артефакта
 */
function createArtifactCard(artifact) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = artifact.id;
    card.dataset.category = artifact.category;
    
    // Если артефакт в избранном, добавляем класс
    if (artifact.isFavorite) {
        card.classList.add('favorite');
    }
    
    // Дата добавления
    const dateBadge = document.createElement('div');
    dateBadge.classList.add('card-date');
    dateBadge.textContent = artifact.date;
    card.appendChild(dateBadge);
    
    // Изображение
    const cardImage = document.createElement('img');
    cardImage.classList.add('card-image');
    cardImage.src = artifact.imageUrl;
    cardImage.alt = artifact.title;
    cardImage.onerror = function() {
        this.src = 'https://via.placeholder.com/400x300?text=Изображение+не+найдено';
    };
    
    // Контент карточки
    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    
    const cardTitle = document.createElement('h3');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = artifact.title;
    
    const cardCategory = document.createElement('span');
    cardCategory.classList.add('card-category');
    cardCategory.textContent = artifact.category;
    
    const cardDescription = document.createElement('p');
    cardDescription.classList.add('card-description');
    cardDescription.textContent = artifact.description || 'Описание отсутствует';
    
    const cardActions = document.createElement('div');
    cardActions.classList.add('card-actions');
    
    // Кнопка "Избранное"
    const favoriteBtn = document.createElement('button');
    favoriteBtn.classList.add('btn', 'btn-favorite');
    favoriteBtn.innerHTML = artifact.isFavorite ? '★ В избранном' : '☆ В избранное';
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Используем if для переключения состояния
        if (card.classList.contains('favorite')) {
            // Убираем из избранного
            card.classList.remove('favorite');
            favoriteBtn.innerHTML = '☆ В избранное';
            artifact.isFavorite = false;
            favoriteCount--;
        } else {
            // Добавляем в избранное
            card.classList.add('favorite');
            favoriteBtn.innerHTML = '★ В избранном';
            artifact.isFavorite = true;
            favoriteCount++;
        }
        
        updateCounters();
    });
    
    // Кнопка "Удалить"
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-delete');
    deleteBtn.innerHTML = '🗑️ Удалить';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteArtifact(artifact.id);
    });
    
    // Собираем карточку
    cardActions.appendChild(favoriteBtn);
    cardActions.appendChild(deleteBtn);
    
    cardContent.appendChild(cardTitle);
    cardContent.appendChild(cardCategory);
    cardContent.appendChild(cardDescription);
    cardContent.appendChild(cardActions);
    
    card.appendChild(cardImage);
    card.appendChild(cardContent);
    
    // Добавляем события для карточки
    card.addEventListener('mouseover', () => {
        card.classList.add('highlighted');
    });
    
    card.addEventListener('mouseout', () => {
        card.classList.remove('highlighted');
    });
    
    // Открытие модального окна при клике на карточку
    card.addEventListener('click', () => {
        openModal(artifact);
    });
    
    return card;
}

/**
 * Создает вкладку категории
 */
function createCategoryTab(category) {
    const tabsContainer = document.querySelector('.category-tabs');
    
    // Проверяем, существует ли уже такая вкладка
    const existingTab = tabsContainer.querySelector(`[data-category="${category}"]`);
    if (existingTab) return;
    
    // Создаем новую вкладку
    const tab = document.createElement('button');
    tab.classList.add('tab');
    tab.textContent = category;
    tab.dataset.category = category;
    
    // Добавляем обработчик клика
    tab.addEventListener('click', () => {
        // Убираем активный класс у всех вкладок
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        // Добавляем активный класс текущей вкладке
        tab.classList.add('active');
        // Устанавливаем выбранную категорию
        selectedCategory = category;
        // Применяем фильтрацию
        filterCards();
    });
    
    // Добавляем вкладку перед кнопкой "Все" (она всегда первая)
    const allTab = tabsContainer.querySelector('[data-category="all"]');
    tabsContainer.insertBefore(tab, allTab.nextSibling);
}

/**
 * Обновляет список категорий
 */
function updateCategories(category) {
    if (category && !categories.has(category)) {
        categories.add(category);
        createCategoryTab(category);
        updateCounters();
    }
}

/**
 * Обновляет список категорий на основе существующих артефактов
 */
function updateCategoriesList() {
    const allCategories = new Set(['Все']);
    cards.forEach(card => {
        allCategories.add(card.category);
    });
    
    // Обновляем глобальный список категорий
    categories = allCategories;
    
    // Обновляем вкладки
    const tabsContainer = document.querySelector('.category-tabs');
    const currentTabs = Array.from(tabsContainer.querySelectorAll('.tab:not([data-category="all"])'))
        .map(tab => tab.dataset.category);
    
    // Удаляем вкладки категорий, которых больше нет
    currentTabs.forEach(category => {
        if (!allCategories.has(category) && category !== 'all') {
            const tabToRemove = tabsContainer.querySelector(`[data-category="${category}"]`);
            if (tabToRemove) {
                tabToRemove.remove();
            }
        }
    });
    
    // Добавляем новые категории
    allCategories.forEach(category => {
        if (category !== 'Все' && !currentTabs.includes(category)) {
            createCategoryTab(category);
        }
    });
}

/**
 * Фильтрует карточки по поисковому запросу и категории
 */
function filterCards() {
    const searchValue = searchInput.value.toLowerCase().trim();
    
    // Получаем все карточки из DOM
    const allCards = document.querySelectorAll('.card');
    
    allCards.forEach(card => {
        const category = card.dataset.category;
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        
        // Проверка по поисковому запросу
        const searchMatch = searchValue === '' || 
                           category.toLowerCase().includes(searchValue) || 
                           title.includes(searchValue);
        
        // Проверка по выбранной категории
        const categoryMatch = selectedCategory === 'all' || 
                             category === selectedCategory;
        
        // Показываем карточку только если она соответствует обоим условиям
        if (searchMatch && categoryMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Добавляет новый артефакт
 */
function addArtifact() {
    const title = titleInput.value.trim();
    const category = categoryInput.value.trim();
    const imageUrl = imageInput.value.trim();
    const description = descriptionInput.value.trim();
    
    // Проверяем обязательные поля с использованием if
    if (!title || !category || !imageUrl) {
        showError('Пожалуйста, заполните все обязательные поля (отмечены *)!');
        return;
    }
    
    // Проверяем валидность URL
    try {
        new URL(imageUrl);
    } catch {
        showError('Пожалуйста, введите корректный URL изображения!');
        return;
    }
    
    // Создаем объект артефакта
    const artifact = {
        id: Date.now(),
        title,
        category,
        imageUrl,
        description: description || 'Описание отсутствует',
        date: new Date().toLocaleDateString('ru-RU'),
        isFavorite: false
    };
    
    // Создаем карточку
    const card = createArtifactCard(artifact);
    
    // Добавляем карточку в галерею
    gallery.appendChild(card);
    
    // Сохраняем артефакт в массиве
    cards.push(artifact);
    
    // Обновляем категории
    updateCategories(category);
    
    // Увеличиваем счетчики
    totalArtifacts++;
    updateCounters();
    
    // Очищаем поля ввода
    titleInput.value = '';
    categoryInput.value = '';
    imageInput.value = '';
    descriptionInput.value = '';
    
    // Убираем сообщение о пустой галерее
    const emptyMessage = gallery.querySelector('.empty-gallery-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Применяем фильтрацию
    filterCards();
    
    // Устанавливаем фокус
    titleInput.focus();
}

// ==================== ФУНКЦИИ МОДАЛЬНОГО ОКНА ====================

/**
 * Открывает модальное окно с информацией об артефакте
 */
function openModal(cardData) {
    modalImage.src = cardData.imageUrl;
    modalImage.alt = cardData.title;
    modalTitle.textContent = cardData.title;
    modalCategory.textContent = cardData.category;
    modalDescription.textContent = cardData.description || 'Описание отсутствует';
    modalDate.textContent = cardData.date;
    modalFavoriteStatus.textContent = cardData.isFavorite ? '★ В избранном' : '☆ Не в избранном';
    
    modal.classList.add('show');
}

/**
 * Закрывает модальное окно
 */
function closeModal() {
    modal.classList.remove('show');
}

// ==================== ФУНКЦИИ ТЕМЫ ====================

/**
 * Переключает тему между светлой и темной
 */
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    // Обновляем текст кнопки
    if (document.body.classList.contains('dark-theme')) {
        themeToggle.innerHTML = '☀️ Дневной режим';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '🌙 Ночной режим';
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Загружает тему из localStorage
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '☀️ Дневной режим';
    }
}

// ==================== ФУНКЦИИ ПЕРЕКЛЮЧЕНИЯ ВИДА ====================

/**
 * Переключает вид между карточками и таблицей
 */
function switchView(viewType) {
    if (viewType === 'cards') {
        gallery.classList.add('active-view');
        tableContainer.classList.remove('active-view');
        viewCardsBtn.classList.add('active');
        viewTableBtn.classList.remove('active');
    } else {
        gallery.classList.remove('active-view');
        tableContainer.classList.add('active-view');
        viewCardsBtn.classList.remove('active');
        viewTableBtn.classList.add('active');
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

/**
 * Инициализация при загрузке страницы
 */
function init() {
    console.log('Инициализация галереи артефактов...');
    
    // Загружаем тему
    loadTheme();
    
    // Настраиваем обработчики событий
    addBtn.addEventListener('click', addArtifact);
    searchInput.addEventListener('input', filterCards);
    themeToggle.addEventListener('click', toggleTheme);
    closeErrorBtn.addEventListener('click', hideError);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Настраиваем обработчики для таблицы
    viewCardsBtn.addEventListener('click', () => switchView('cards'));
    viewTableBtn.addEventListener('click', () => switchView('table'));
    sortDateBtn.addEventListener('click', sortTableByDate);
    clearSelectionBtn.addEventListener('click', clearRowSelection);
    
    // Закрытие модального окна при клике на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Закрытие модального окна по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
    
    // Добавление по Ctrl+Enter
    [titleInput, categoryInput, imageInput, descriptionInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                addArtifact();
            }
        });
    });
    
    // Обработчик для вкладки "Все"
    const allTab = document.querySelector('.tab[data-category="all"]');
    if (allTab) {
        allTab.addEventListener('click', () => {
            // Убираем активный класс у всех вкладок
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Добавляем активный класс вкладке "Все"
            allTab.classList.add('active');
            // Устанавливаем выбранную категорию
            selectedCategory = 'all';
            // Применяем фильтрацию
            filterCards();
        });
    }
    
    // Добавляем примеры артефактов
    const examples = [
        {
            id: 1,
            title: 'Звездная ночь',
            category: 'Живопись',
            imageUrl: 'assets/images/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
            description: 'Знаменитая картина Винсента Ван Гога, написанная в 1889 году.',
            date: '02.12.2025',
            isFavorite: true
        },
        {
            id: 2,
            title: 'Горный пейзаж',
            category: 'Фотография',
            imageUrl: 'assets/images/gornyiy-peiyzag-kartina-maslom-70x50.jpg',
            description: 'Фотография горного хребта на закате.',
            date: '02.12.2025',
            isFavorite: false
        },
        {
            id: 3,
            title: 'Античная ваза',
            category: 'Археология',
            imageUrl: 'assets/images/images.jpg',
            description: 'Древнегреческая керамическая ваза V века до н.э.',
            date: '02.12.2025',
            isFavorite: true
        },
        {
            id: 4,
            title: 'Цифровая абстракция',
            category: 'Дизайн',
            imageUrl: 'assets/images/sef.jpg',
            description: 'Современная цифровая абстрактная композиция.',
            date: '02.12.2025',
            isFavorite: false
        },
        // Дополнительные примеры для таблицы
        {
            id: 5,
            title: 'Скульптура Давида',
            category: 'Скульптура',
            imageUrl: 'assets/images/David_by_Michelangelo_Fir_JBU013.jpg',
            description: 'Мраморная статуя работы Микеланджело, созданная в 1501-1504 годах.',
            date: '01.12.2025',
            isFavorite: true
        },
        {
            id: 6,
            title: 'Мона Лиза',
            category: 'Живопись',
            imageUrl: 'assets/images/imagesmona.jpg',
            description: 'Портрет Лизы дель Джокондо кисти Леонардо да Винчи.',
            date: '30.11.2025',
            isFavorite: false
        },
        {
            id: 7,
            title: 'Розеттский камень',
            category: 'Археология',
            imageUrl: 'assets/images/Rosetta_Stone_-_front_face_-_corrected_image.jpg',
            description: 'Древнеегипетская стела с текстом на трех языках, ключ к расшифровке иероглифов.',
            date: '29.11.2025',
            isFavorite: true
        },
        {
            id: 8,
            title: 'Фотография Земли из космоса',
            category: 'Фотография',
            imageUrl: 'assets/images/The_Earth_seen_from_Apollo_17.jpg',
            description: 'Знаменитая фотография Земли, сделанная экипажем Аполлона-17 в 1972 году.',
            date: '28.11.2025',
            isFavorite: false
        }
    ];
    
    // Добавляем примеры в галерею
    examples.forEach(artifact => {
        const card = createArtifactCard(artifact);
        gallery.appendChild(card);
        cards.push(artifact);
        
        // Обновляем счетчики
        if (artifact.isFavorite) {
            favoriteCount++;
        }
    });
    
    totalArtifacts = examples.length;
    
    // Обновляем категории
    examples.forEach(artifact => {
        updateCategories(artifact.category);
    });
    
    // Убираем сообщение о пустой галерее
    const emptyMessage = gallery.querySelector('.empty-gallery-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Обновляем таблицу
    updateTable();
    
    // Обновляем счетчики
    updateCounters();

    console.log('✅ Галерея инициализирована');
    console.log('✅ Таблица создана (8+ строк, 6 столбцов)');
    console.log('✅ Все функции работают');
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', init);