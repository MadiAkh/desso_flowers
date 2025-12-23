// HERO custom slider
const slider = document.getElementById('heroSlider');
const slides = [...slider.children];
const dotsWrap = document.getElementById('heroDots');
const hero = document.getElementById('hero');

let index = 0;
const total = slides.length;
let timer = null;

// точки
for (let i = 0; i < total; i++) {
  const b = document.createElement('button');
  b.onclick = () => go(i);
  dotsWrap.appendChild(b);
}

function clearVideoHandlers() {
  slides.forEach(s => {
    const v = s.querySelector('video');
    if (v) { v.onended = null; try { v.pause(); } catch(e){} }
  });
}

function bindActiveVideo() {
  const v = slides[index].querySelector('video');
  if (v) {
    try { v.currentTime = 0; v.play(); } catch(e){}
    v.onended = () => next();            // после конца → следующий
    clearInterval(timer); timer = null;  // таймер не нужен, крутим по ended
  } else {
    restart(6000); // на случай слайда без видео
  }
}

function go(n){
  index = (n + total) % total;
  slider.style.transform = `translateX(-${index*100}%)`;
  [...dotsWrap.children].forEach((d,i)=>d.classList.toggle('active', i===index));
  clearVideoHandlers();
  bindActiveVideo();
}

const next = () => go(index + 1);
const prev = () => go(index - 1);

document.getElementById('heroNext').onclick = next;
document.getElementById('heroPrev').onclick = prev;

function restart(ms = 6000){ clearInterval(timer); timer = setInterval(next, ms); }

// Пауза таймера при наведении (если слайд без видео)
hero.addEventListener('mouseenter', () => clearInterval(timer));
hero.addEventListener('mouseleave', () => {
  const v = slides[index].querySelector('video');
  if (!v) restart(6000);
});

go(0);



