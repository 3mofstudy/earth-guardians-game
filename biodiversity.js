(() => {
  'use strict';
  const answers = document.querySelectorAll('[data-bio-answer]');
  const feedback = document.getElementById('bio-feedback');
  answers.forEach(button => button.addEventListener('click', () => {
    const correct = button.dataset.bioAnswer === 'correct';
    answers.forEach(answer => answer.removeAttribute('data-correct'));
    button.dataset.correct = String(correct);
    feedback.classList.toggle('is-correct', correct);
    feedback.textContent = correct
      ? '答對了！不同物種與遺傳特徵能分散風險、互相補位，通常能提升森林面對乾旱或病蟲害的抵抗與恢復能力。保護棲地也很重要！'
      : '再想想！如果森林只有單一樹種，同一種病蟲害可能影響許多樹。多樣的原生物種與健康棲地，通常能讓森林更有韌性。';
  }));
})();
