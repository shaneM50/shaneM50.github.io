function setFooterYear() {
  const yearElement = document.getElementById('year');
  if (!yearElement) return;

  const currentYear = new Date().getFullYear();
  yearElement.textContent = currentYear;
}

/* --- Carousel logic (same as before, just grouped) --- */

function getCarouselElements() {
  const track = document.querySelector('.blog-track');
  const previousButton = document.querySelector('.blog-nav.prev');
  const nextButton = document.querySelector('.blog-nav.next');
  const slides = track ? Array.from(track.querySelectorAll('.blog-card')) : [];
  return { track, previousButton, nextButton, slides };
}

function getSlideWidth(slides) {
  if (!slides || slides.length === 0) return 0;
  return slides[0].getBoundingClientRect().width;
}

function createCarouselState(slides) {
  return {
    currentIndex: 0,
    totalSlides: slides.length
  };
}

function updateNavigationButtonState(state, previousButton, nextButton) {
  if (!previousButton || !nextButton) return;
  previousButton.disabled = state.currentIndex === 0;
  nextButton.disabled = state.currentIndex === state.totalSlides - 1;
}

function scrollToSlide(track, slides, state) {
  if (!track || !slides || slides.length === 0) return;
  const slideWidth = getSlideWidth(slides);
  const targetOffset = slideWidth * state.currentIndex;
  track.scrollTo({
    left: targetOffset,
    behavior: 'smooth'
  });
}

function goToSlideIndex(targetIndex, track, slides, state, previousButton, nextButton) {
  if (targetIndex < 0 || targetIndex >= state.totalSlides) return;
  state.currentIndex = targetIndex;
  scrollToSlide(track, slides, state);
  updateNavigationButtonState(state, previousButton, nextButton);
}

function handlePreviousClick(track, slides, state, previousButton, nextButton) {
  goToSlideIndex(state.currentIndex - 1, track, slides, state, previousButton, nextButton);
}

function handleNextClick(track, slides, state, previousButton, nextButton) {
  goToSlideIndex(state.currentIndex + 1, track, slides, state, previousButton, nextButton);
}

function createTouchState() {
  return {
    isTouchActive: false,
    touchStartX: 0
  };
}

function handleTouchStart(event, touchState) {
  touchState.isTouchActive = true;
  touchState.touchStartX = event.touches[0].clientX;
}

function handleTouchEnd(event, touchState, track, slides, state, previousButton, nextButton) {
  if (!touchState.isTouchActive) return;
  touchState.isTouchActive = false;
  const touchEndX = event.changedTouches[0].clientX;
  const horizontalDelta = touchEndX - touchState.touchStartX;
  const swipeThreshold = 50;

  if (horizontalDelta > swipeThreshold) {
    handlePreviousClick(track, slides, state, previousButton, nextButton);
  } else if (horizontalDelta < -swipeThreshold) {
    handleNextClick(track, slides, state, previousButton, nextButton);
  }
}

function initializeCarousel() {
  const { track, previousButton, nextButton, slides } = getCarouselElements();
  if (!track || !previousButton || !nextButton || slides.length === 0) return;

  const state = createCarouselState(slides);
  const touchState = createTouchState();

  previousButton.addEventListener('click', () => {
    handlePreviousClick(track, slides, state, previousButton, nextButton);
  });

  nextButton.addEventListener('click', () => {
    handleNextClick(track, slides, state, previousButton, nextButton);
  });

  track.addEventListener('touchstart', (event) => {
    handleTouchStart(event, touchState);
  });

  track.addEventListener('touchend', (event) => {
    handleTouchEnd(event, touchState, track, slides, state, previousButton, nextButton);
  });

  updateNavigationButtonState(state, previousButton, nextButton);
}

/* --- Localization logic --- */

const LOCALES = {
  es: window.LOCALE_ES || {},
  en: window.LOCALE_EN || {}
};

function applyLocaleToTextNodes(dictionary) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = dictionary[key];
    if (!value) return;

    // Preserve line breaks for multi-line values
    if (value.includes('\n')) {
      el.innerHTML = '';
      value.split('\n').forEach((line, index) => {
        if (index > 0) el.appendChild(document.createElement('br'));
        el.appendChild(document.createTextNode(line));
      });
    } else {
      el.textContent = value;
    }
  });
}

function applyLocaleToAltAttributes(dictionary) {
  const elements = document.querySelectorAll('[data-i18n-alt]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    const value = dictionary[key];
    if (value) {
      el.setAttribute('alt', value);
    }
  });
}

function setLanguage(lang) {
  const dictionary = LOCALES[lang];
  if (!dictionary) return;

  applyLocaleToTextNodes(dictionary);
  applyLocaleToAltAttributes(dictionary);

  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach((btn) => {
    const btnLang = btn.getAttribute('data-lang');
    btn.classList.toggle('active', btnLang === lang);
  });

  document.documentElement.lang = lang;
  localStorage.setItem('preferredLanguage', lang);
}

function initializeLanguageToggle() {
  const langButtons = document.querySelectorAll('.lang-btn');
  if (!langButtons.length) return;

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
    });
  });

  const saved = localStorage.getItem('preferredLanguage');
  const initialLang = saved === 'es' ? 'es' : 'en';
  setLanguage(initialLang);

}

/* --- Page init --- */

function initializePage() {
  setFooterYear();
  initializeCarousel();
  initializeLanguageToggle();
}

initializePage();
