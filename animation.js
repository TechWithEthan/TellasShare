// Flip: add .flip-out, swap text, then add .flip-in
el.classList.add('flip-out');
setTimeout(() => {
  el.textContent = newValue;
  el.classList.replace('flip-out', 'flip-in');
}, 180);

// Tick bounce: briefly add .tick class each second
unit.classList.add('tick');
setTimeout(() => unit.classList.remove('tick'), 400);