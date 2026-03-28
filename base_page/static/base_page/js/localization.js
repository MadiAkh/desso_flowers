(function () {
  const STORAGE_LANG_KEY = "desso-language";
  const STORAGE_CITY_KEY = "desso-city";
  const DEFAULT_LANG = "ru";
  const DEFAULT_CITY = "Алматы";

  const translations = {
    ru: {
      "header.favorites": "Избранное",
      "header.account": "Личный кабинет",
      "header.cart": "Корзина",
      "header.catalog": "Каталог",
      "header.catalogCollections": "Коллекции DÉSSO",
      "header.shops": "Магазины",
      "header.contacts": "Контакты",
      "header.shopAddresses": "Адреса магазинов",
      "header.support": "Служба поддержки",
      "stories.section": "Сториз",
      "stories.modal": "Истории",
      "stories.prev": "Назад",
      "stories.next": "Дальше",
      "stories.close": "Закрыть",
      "floating.consult": "Связаться с консультантом",
      "footer.tagline": "Источник гормонов счастья. Цветы и подарки 24/7.",
      "footer.navigation": "Навигация",
      "footer.catalog": "Каталог",
      "footer.delivery": "Доставка",
      "footer.contacts": "Контакты",
      "footer.company": "Компания",
      "footer.about": "О нас",
      "footer.jobs": "Вакансии",
      "footer.reviews": "Отзывы",
      "footer.social": "Соцсети",
      "main.new": "Новинки DÉSSO",
      "main.hits": "Хиты продаж",
      "main.sold": "Продано:",
      "main.bannerFallback": "Акция",
      "main.rubric": "Рубрика",
      "main.video": "Видео",
      "catalog.allBouquets": "Все букеты",
      "catalog.filter": "Фильтр",
      "catalog.filters": "Фильтры",
      "catalog.price": "Цена (₸)",
      "catalog.apply": "Применить",
      "catalog.reset": "Сбросить фильтр",
      "catalog.cancel": "Отменить",
      "catalog.more": "Показать ещё",
      "catalog.empty": "Товары пока не добавлены.",
      "catalog.strawberries": "Вся клубника",
      "catalog.strawberryEmpty": "Клубника пока не добавлена.",
      "catalog.out": "Нет в наличии",
      "profile.title": "Личный кабинет",
      "profile.myData": "Мои данные",
      "profile.cart": "Корзина",
      "profile.orders": "История заказов",
      "profile.favorites": "Избранное",
      "profile.logout": "Выйти",
      "profile.personalData": "Личные данные",
      "profile.fullName": "ФИО",
      "profile.phone": "Телефон",
      "profile.city": "Город",
      "profile.gender": "Пол",
      "profile.birthDate": "Дата рождения",
      "profile.notSpecified": "Не указано",
      "profile.genderMale": "Мужской",
      "profile.genderFemale": "Женский",
      "profile.birthDateEmpty": "Не указана",
      "profile.edit": "Отредактировать данные",
      "profile.firstName": "Имя",
      "profile.lastName": "Фамилия",
      "profile.avatar": "Аватар",
      "profile.cancel": "Отменить",
      "profile.save": "Сохранить изменения",
      "profile.total": "Итого:",
      "profile.checkout": "Оформить заказ",
      "profile.emptyCartTitle": "Ваша корзина пуста",
      "profile.goCatalog": "Перейти в каталог",
      "profile.noOrders": "У вас пока нет заказов.",
      "profile.inCart": "В корзине ✓",
      "profile.addToCart": "Добавить в корзину",
      "profile.removeFavorite": "Удалить из избранного",
      "profile.noFavorites": "Нет избранных товаров.",
      "profile.sum": "Сумма:",
      "profile.order": "Заказ №",
      "auth.registerTab": "Регистрация",
      "auth.loginTab": "Вход",
      "auth.register": "Зарегистрироваться",
      "auth.password": "Пароль",
      "auth.passwordConfirm": "Подтверждение пароля",
      "auth.login": "Войти",
      "auth.loginError": "Ошибка входа",
      "checkout.title": "Оформление заказа",
      "checkout.contacts": "Контактные данные",
      "checkout.yourName": "Ваше имя",
      "checkout.namePlaceholder": "Как к вам обращаться?",
      "checkout.phone": "Телефон",
      "checkout.otherRecipient": "Получатель — другой человек",
      "checkout.recipientName": "Имя получателя",
      "checkout.recipientPhone": "Телефон получателя",
      "checkout.delivery": "Доставка",
      "checkout.courier": "Курьером",
      "checkout.pickup": "Самовывоз",
      "checkout.city": "Город",
      "checkout.address": "Адрес",
      "checkout.addressPlaceholder": "Улица, дом",
      "checkout.apartment": "Квартира / Офис",
      "checkout.apartmentPlaceholder": "№",
      "checkout.floor": "Подъезд / Этаж",
      "checkout.floorPlaceholder": "Не обязательно",
      "checkout.date": "Дата",
      "checkout.time": "Время",
      "checkout.asap": "Как можно скорее",
      "checkout.postcard": "Текст открытки (бесплатно)",
      "checkout.postcardPlaceholder": "Напишем от руки красивым почерком...",
      "checkout.payment": "Оплата",
      "checkout.card": "Картой онлайн",
      "checkout.cash": "Наличными",
      "checkout.yourOrder": "Ваш заказ",
      "checkout.items": "Товары",
      "checkout.deliveryCost": "Доставка",
      "checkout.total": "Итого к оплате",
      "checkout.submit": "Оплатить заказ",
      "checkout.policy": "Нажимая кнопку, вы соглашаетесь с",
      "checkout.offer": "условиями оферты",
      "common.qtyUnit": "шт.",
      "common.almaty": "Алматы",
      "common.astana": "Астана",
    },
    kz: {
      "header.favorites": "Таңдаулылар",
      "header.account": "Жеке кабинет",
      "header.cart": "Себет",
      "header.catalog": "Каталог",
      "header.catalogCollections": "DÉSSO топтамалары",
      "header.shops": "Дүкендер",
      "header.contacts": "Байланыс",
      "header.shopAddresses": "Дүкен мекенжайлары",
      "header.support": "Қолдау қызметі",
      "stories.section": "Сториз",
      "stories.modal": "Хикаялар",
      "stories.prev": "Артқа",
      "stories.next": "Келесі",
      "stories.close": "Жабу",
      "floating.consult": "Кеңесшімен байланысу",
      "footer.tagline": "Бақыт гормондарының көзі. Гүлдер мен сыйлықтар 24/7.",
      "footer.navigation": "Навигация",
      "footer.catalog": "Каталог",
      "footer.delivery": "Жеткізу",
      "footer.contacts": "Байланыс",
      "footer.company": "Компания",
      "footer.about": "Біз туралы",
      "footer.jobs": "Бос орындар",
      "footer.reviews": "Пікірлер",
      "footer.social": "Әлеуметтік желілер",
      "main.new": "DÉSSO жаңалықтары",
      "main.hits": "Сатылым көшбасшылары",
      "main.sold": "Сатылды:",
      "main.bannerFallback": "Акция",
      "main.rubric": "Айдар",
      "main.video": "Бейне",
      "catalog.allBouquets": "Барлық букеттер",
      "catalog.filter": "Сүзгі",
      "catalog.filters": "Сүзгілер",
      "catalog.price": "Бағасы (₸)",
      "catalog.apply": "Қолдану",
      "catalog.reset": "Сүзгіні тазалау",
      "catalog.cancel": "Болдырмау",
      "catalog.more": "Тағы көрсету",
      "catalog.empty": "Тауарлар әлі қосылмаған.",
      "catalog.strawberries": "Барлық құлпынай",
      "catalog.strawberryEmpty": "Құлпынай әлі қосылмаған.",
      "catalog.out": "Қоймада жоқ",
      "profile.title": "Жеке кабинет",
      "profile.myData": "Менің деректерім",
      "profile.cart": "Себет",
      "profile.orders": "Тапсырыстар тарихы",
      "profile.favorites": "Таңдаулылар",
      "profile.logout": "Шығу",
      "profile.personalData": "Жеке деректер",
      "profile.fullName": "Аты-жөні",
      "profile.phone": "Телефон",
      "profile.city": "Қала",
      "profile.gender": "Жынысы",
      "profile.birthDate": "Туған күні",
      "profile.notSpecified": "Көрсетілмеген",
      "profile.genderMale": "Ер",
      "profile.genderFemale": "Әйел",
      "profile.birthDateEmpty": "Көрсетілмеген",
      "profile.edit": "Деректерді өңдеу",
      "profile.firstName": "Аты",
      "profile.lastName": "Тегі",
      "profile.avatar": "Аватар",
      "profile.cancel": "Болдырмау",
      "profile.save": "Өзгерістерді сақтау",
      "profile.total": "Барлығы:",
      "profile.checkout": "Тапсырыс рәсімдеу",
      "profile.emptyCartTitle": "Себетіңіз бос",
      "profile.goCatalog": "Каталогқа өту",
      "profile.noOrders": "Әзірге тапсырыстарыңыз жоқ.",
      "profile.inCart": "Себетте ✓",
      "profile.addToCart": "Себетке қосу",
      "profile.removeFavorite": "Таңдаулылардан өшіру",
      "profile.noFavorites": "Таңдаулы тауарлар жоқ.",
      "profile.sum": "Сома:",
      "profile.order": "Тапсырыс №",
      "auth.registerTab": "Тіркелу",
      "auth.loginTab": "Кіру",
      "auth.register": "Тіркелу",
      "auth.password": "Құпиясөз",
      "auth.passwordConfirm": "Құпиясөзді растау",
      "auth.login": "Кіру",
      "auth.loginError": "Кіру қатесі",
      "checkout.title": "Тапсырысты рәсімдеу",
      "checkout.contacts": "Байланыс деректері",
      "checkout.yourName": "Атыңыз",
      "checkout.namePlaceholder": "Сізге қалай жүгінеміз?",
      "checkout.phone": "Телефон",
      "checkout.otherRecipient": "Алушы — басқа адам",
      "checkout.recipientName": "Алушының аты",
      "checkout.recipientPhone": "Алушының телефоны",
      "checkout.delivery": "Жеткізу",
      "checkout.courier": "Курьермен",
      "checkout.pickup": "Өзі алып кету",
      "checkout.city": "Қала",
      "checkout.address": "Мекенжай",
      "checkout.addressPlaceholder": "Көше, үй",
      "checkout.apartment": "Пәтер / Кеңсе",
      "checkout.apartmentPlaceholder": "№",
      "checkout.floor": "Кіреберіс / Қабат",
      "checkout.floorPlaceholder": "Міндетті емес",
      "checkout.date": "Күні",
      "checkout.time": "Уақыты",
      "checkout.asap": "Мүмкіндігінше тез",
      "checkout.postcard": "Ашықхат мәтіні (тегін)",
      "checkout.postcardPlaceholder": "Қолмен әдемі жазып береміз...",
      "checkout.payment": "Төлем",
      "checkout.card": "Онлайн картамен",
      "checkout.cash": "Қолма-қол",
      "checkout.yourOrder": "Сіздің тапсырысыңыз",
      "checkout.items": "Тауарлар",
      "checkout.deliveryCost": "Жеткізу",
      "checkout.total": "Төлемге барлығы",
      "checkout.submit": "Тапсырысты төлеу",
      "checkout.policy": "Түймені басу арқылы сіз",
      "checkout.offer": "оферта шарттарымен",
      "common.qtyUnit": "дана",
      "common.almaty": "Алматы",
      "common.astana": "Астана",
    },
  };

  const cityNames = {
    "Алматы": { ru: "Алматы", kz: "Алматы" },
    "Астана": { ru: "Астана", kz: "Астана" },
    "Шымкент": { ru: "Шымкент", kz: "Шымкент" },
    "Караганда": { ru: "Караганда", kz: "Қарағанды" },
    "Семей": { ru: "Семей", kz: "Семей" },
    "Атырау": { ru: "Атырау", kz: "Атырау" },
    "Каскелен": { ru: "Каскелен", kz: "Қаскелең" },
    "Тараз": { ru: "Тараз", kz: "Тараз" },
    "Актау": { ru: "Актау", kz: "Ақтау" },
    "Талдыкорган": { ru: "Талдыкорган", kz: "Талдықорған" },
  };

  function t(key, lang = getCurrentLanguage()) {
    return translations[lang]?.[key] || translations.ru[key] || key;
  }

  function getCurrentLanguage() {
    const stored = localStorage.getItem(STORAGE_LANG_KEY);
    return stored === "kz" ? "kz" : DEFAULT_LANG;
  }

  function getStoredCity() {
    return localStorage.getItem(STORAGE_CITY_KEY) || DEFAULT_CITY;
  }

  function formatCity(city, lang = getCurrentLanguage()) {
    return cityNames[city]?.[lang] || city;
  }

  function applyTranslations(lang) {
    document.documentElement.lang = lang === "kz" ? "kk" : "ru";

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n, lang);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder, lang));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel, lang));
    });

    document.querySelectorAll("[data-city-label]").forEach((node) => {
      const city = node.dataset.cityLabel;
      node.textContent = formatCity(city, lang);
    });

    const currentLang = document.getElementById("currentLang");
    if (currentLang) {
      currentLang.textContent = lang.toUpperCase();
    }

    applyCity(getStoredCity(), lang);
    document.dispatchEvent(new CustomEvent("desso:languagechange", { detail: { language: lang } }));
  }

  function applyCity(city, lang = getCurrentLanguage()) {
    const currentCity = document.getElementById("currentCity");
    if (currentCity) {
      currentCity.textContent = formatCity(city, lang);
    }
  }

  function setLanguage(lang) {
    const nextLang = lang === "kz" ? "kz" : DEFAULT_LANG;
    localStorage.setItem(STORAGE_LANG_KEY, nextLang);
    applyTranslations(nextLang);
  }

  function setCity(city) {
    if (!city) return;
    localStorage.setItem(STORAGE_CITY_KEY, city);
    applyCity(city);
  }

  function normalizeDetectedCity(name) {
    if (!name) return null;
    const normalized = name.toLowerCase();
    return Object.keys(cityNames).find((city) => normalized.includes(city.toLowerCase())) || null;
  }

  async function detectCity() {
    if (!navigator.geolocation || localStorage.getItem(STORAGE_CITY_KEY)) {
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 3600000,
        });
      });

      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ru`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      const address = payload.address || {};
      const detected = normalizeDetectedCity(
        address.city || address.town || address.state || address.county || payload.name
      );

      if (detected) {
        setCity(detected);
      }
    } catch (error) {
      // Silent fallback to stored/default city.
    }
  }

  function setupDropdowns() {
    document.querySelectorAll("[data-lang-value]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        setLanguage(link.dataset.langValue);
      });
    });

    document.querySelectorAll("[data-city-value]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        setCity(link.dataset.cityValue);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.DessoUI = {
      t,
      getLanguage: getCurrentLanguage,
      setLanguage,
      getCity: getStoredCity,
      setCity,
      formatCity,
    };

    setupDropdowns();
    applyTranslations(getCurrentLanguage());
    detectCity();
  });
})();
