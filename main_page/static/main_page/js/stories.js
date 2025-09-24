
/* ================== STORIES ================== */

// 1) Данные историй: массив медиа (image/video)


// 2) Элементы
const smodal   = document.getElementById('storiesModal');
const sframe   = smodal.querySelector('.stories-frame');
const mediaBox = document.getElementById('storiesMedia');
const progress = document.getElementById('storiesProgress');
const sPrev    = document.getElementById('storiesPrev');
const sNext    = document.getElementById('storiesNext');
const sClose   = document.getElementById('storiesClose');

let currentStoryId = null;
let currentIndex   = 0;
let timerId        = null;
let startTs        = 0;
let segBars        = [];

// 3) Открытие
function openStory(id, start=0){
  currentStoryId = id;
  currentIndex   = start;
  buildProgress(STORIES[id].length);
  smodal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  showCurrent();
  bindCloseKeys();
}

// 4) Закрытие
function closeStory(){
  stopTimer();
  destroyMedia();
  smodal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  unbindCloseKeys();
}

// 5) Навигация
function nextStoryItem(){
  const arr = STORIES[currentStoryId];
  if (currentIndex < arr.length - 1){
    currentIndex++;
    showCurrent();
  } else {
    // закончилась текущая история — закрываем
    closeStory();
  }
}
function prevStoryItem(){
  if (currentIndex > 0){
    currentIndex--;
    showCurrent();
  } else {
    // влево на 0 — просто мигнем прогресс
    setBar(currentIndex, 0);
  }
}

// 6) Построение прогресса
function buildProgress(n){
  progress.innerHTML='';
  segBars = [];
  for (let i=0;i<n;i++){
    const seg = document.createElement('div'); seg.className='seg';
    const bar = document.createElement('div'); bar.className='bar';
    seg.appendChild(bar); progress.appendChild(seg);
    segBars.push(bar);
  }
}
function setBar(i, percent){
  segBars.forEach((b, idx)=>{
    if (idx < i) b.style.width = '100%';
    else if (idx > i) b.style.width = '0%';
    else b.style.width = Math.max(0, Math.min(100, percent)) + '%';
  });
}

// 7) Показ текущего media
function showCurrent(){
  stopTimer();
  destroyMedia();
  const item = STORIES[currentStoryId][currentIndex];

  if (item.type === 'video'){
    const v = document.createElement('video');
    v.muted = true; v.setAttribute('muted',''); v.setAttribute('playsinline','');
    v.setAttribute('webkit-playsinline',''); 
    // v.preload='auto';
    if (item.poster) v.poster = item.poster;
    v.src = item.src;
    mediaBox.appendChild(v);

    // когда видео можно играть — стартуем и ставим прогресс по времени
    v.addEventListener('canplay', ()=>{
      try { v.currentTime = 0; const p = v.play(); if (p && p.catch) p.catch(()=>{}); } catch(e){}
      startVideoProgress(v);
    }, { once:true });
    v.addEventListener('ended', nextStoryItem, { once:true });

  } else { // image
    const img = document.createElement('img');
    img.src = item.src;
    mediaBox.appendChild(img);
    startImageProgress(item.duration || 5000);
  }
}

// 8) Таймеры/прогресс
function startVideoProgress(video){
  startTs = performance.now();
  const tick = ()=>{
    const t  = video.currentTime;
    const d  = Math.max(video.duration || 1, 0.1);
    const pr = (t / d) * 100;
    setBar(currentIndex, pr);
    if (!video.paused && !video.ended) timerId = requestAnimationFrame(tick);
  };
  timerId = requestAnimationFrame(tick);
}
function startImageProgress(ms){
  startTs = performance.now();
  const run = (now)=>{
    const pr = ((now - startTs) / ms) * 100;
    if (pr >= 100){ setBar(currentIndex, 100); nextStoryItem(); return; }
    setBar(currentIndex, pr);
    timerId = requestAnimationFrame(run);
  };
  timerId = requestAnimationFrame(run);
}
function stopTimer(){
  if (timerId){ cancelAnimationFrame(timerId); timerId = null; }
}
function destroyMedia(){
  mediaBox.innerHTML='';
}

// 9) Управление
sPrev.addEventListener('click', prevStoryItem);
sNext.addEventListener('click', nextStoryItem);
sClose.addEventListener('click', closeStory);
smodal.querySelector('.stories-backdrop').addEventListener('click', closeStory);

// Esc и стрелки
function onKey(e){
  if (e.key === 'Escape') closeStory();
  if (e.key === 'ArrowRight') nextStoryItem();
  if (e.key === 'ArrowLeft')  prevStoryItem();
}
function bindCloseKeys(){ document.addEventListener('keydown', onKey); }
function unbindCloseKeys(){ document.removeEventListener('keydown', onKey); }

// 10) Открытие по клику на кружок
document.querySelectorAll('.story[data-story]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const id = btn.getAttribute('data-story');
    if (STORIES[id]?.length) openStory(id, 0);
  });
});



