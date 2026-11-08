(() => {
  'use strict';
  const slider = document.getElementById('pmv-value');
  const feelings = ['很冷', '冷', '稍冷', '不冷不熱', '稍暖', '暖', '很熱'];
  function updateComfort() {
    const pmv = Number(slider.value);
    const ppd = 100 - 95 * Math.exp(-0.03353 * pmv ** 4 - 0.2179 * pmv ** 2);
    document.getElementById('pmv-number').textContent = pmv > 0 ? `＋${pmv.toFixed(1)}` : pmv.toFixed(1);
    document.getElementById('ppd-number').textContent = ppd.toFixed(1);
    document.getElementById('thermal-feeling').textContent = feelings[Math.round(pmv) + 3];
    slider.setAttribute('aria-valuetext', `PMV ${pmv.toFixed(1)}，PPD 約 ${ppd.toFixed(1)}%`);
  }
  slider.addEventListener('input', updateComfort);
  updateComfort();
  const answers = document.querySelectorAll('[data-energy-answer]');
  const feedback = document.getElementById('energy-feedback');
  answers.forEach(button => button.addEventListener('click', () => {
    const correct = button.dataset.energyAnswer === 'correct';
    answers.forEach(answer => answer.removeAttribute('data-correct'));
    button.dataset.correct = String(correct);
    feedback.classList.toggle('is-correct', correct);
    feedback.textContent = correct
      ? '答對了！冷氣設定 26°C、搭配電風扇，避免過度降溫。再依濕度、衣著與家人的感受適度調整。'
      : '再想想！冷氣開得太低又穿厚外套，會浪費能源。試著從 26°C 開始，搭配電風扇與輕便衣物。';
  }));
})();
