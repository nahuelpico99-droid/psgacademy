/* ══════════════════════════════════════
   PSG Academy Uruguay — main.js
   Modal de videos · Nav · Animaciones ·
   Sponsors · Formulario · Microinteracciones
   ══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────
     NAV: fondo al scrollear + barra de progreso
     ───────────────────────────────────── */
  const nav = document.getElementById('nav');
  const navProgress = document.getElementById('navProgress');
  const backTop = document.getElementById('backTop');

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    navProgress.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
    backTop.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─────────────────────────────────────
     NAV: menú móvil (hamburguesa)
     ───────────────────────────────────── */
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  const closeMenu = () => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
  };

  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  navLinks.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) closeMenu();
  });

  /* ─────────────────────────────────────
     NAV: link activo según la sección visible
     ───────────────────────────────────── */
  const sections = [...document.querySelectorAll('section[id], header[id]')];
  const linkFor = id => document.querySelector(`.nav-link[href="#${id}"]`);

  const sectionSpy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = linkFor(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-link.active').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => sectionSpy.observe(s));

  /* ─────────────────────────────────────
     SCROLL REVEAL: entrada suave de elementos
     ───────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (reducedMotion) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObs.observe(el));
  }

  /* ─────────────────────────────────────
     STATS: contadores animados
     ───────────────────────────────────── */
  const counters = document.querySelectorAll('.count');
  const animateCount = el => {
    const target = parseInt(el.dataset.count, 10);
    if (reducedMotion || target <= 1) { el.textContent = target; return; }
    const dur = 1400;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => countObs.observe(c));

  /* ─────────────────────────────────────
     SPONSORS: duplicar la pista para loop infinito
     (editá SOLO la lista original en el HTML)
     ───────────────────────────────────── */
  const track = document.getElementById('sponsorsTrack');
  if (track && !reducedMotion) {
    track.innerHTML += track.innerHTML; // segunda copia para el -50% del keyframe
    track.querySelectorAll('.sponsor').forEach((li, i) => {
      if (i >= track.children.length / 2) li.setAttribute('aria-hidden', 'true');
    });
  }

  /* ─────────────────────────────────────
     MODAL DE VIDEO (YouTube embebido)
     Cualquier elemento con [data-video-id] lo abre.

     Nota técnica: el atributo referrerpolicy y el parámetro
     playsinline evitan el "Error 153" del reproductor de
     YouTube (ocurre cuando el navegador no envía el header
     Referer al iframe). El sitio debe servirse por http/https
     (hosting o servidor local); abierto como archivo suelto
     (file://) YouTube bloquea cualquier embed.
     ───────────────────────────────────── */
  const modal = document.getElementById('videoModal');
  const modalFrame = document.getElementById('videoModalFrame');
  const modalTitle = document.getElementById('videoModalTitle');
  let lastFocused = null;

  const openVideo = (id, title) => {
    lastFocused = document.activeElement;
    modalTitle.textContent = title || 'PSG Academy';

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&playsinline=1&rel=0`;
    iframe.title = title || 'Video PSG Academy';
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
    iframe.setAttribute('allowfullscreen', '');
    modalFrame.replaceChildren(iframe);

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.classList.add('modal-open');
    modal.querySelector('.video-modal-close').focus();
  };

  const closeVideo = () => {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      modal.hidden = true;
      modalFrame.replaceChildren(); // quita el iframe → detiene la reproducción
      if (lastFocused) lastFocused.focus();
    }, reducedMotion ? 0 : 320);
  };

  document.querySelectorAll('[data-video-id]').forEach(el => {
    el.addEventListener('click', () => openVideo(el.dataset.videoId, el.dataset.videoTitle));
  });
  modal.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeVideo));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeVideo();
    // foco contenido dentro del modal
    if (e.key === 'Tab' && !modal.hidden) {
      const focusables = modal.querySelectorAll('button, iframe, [href]');
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ─────────────────────────────────────
     FORMULARIO DE CONTACTO: validación visual
     ───────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('formSubmit');
  const successMsg = document.getElementById('formSuccess');

  const messages = {
    nombre:  'Ingresá tu nombre (mínimo 2 caracteres).',
    email:   'Ingresá un email válido, ej.: nombre@email.com.',
    asunto:  'Indicá brevemente el motivo de tu consulta.',
    mensaje: 'Escribí tu consulta (mínimo 10 caracteres).',
  };

  const validateField = input => {
    const field = input.closest('.form-field');
    const error = field.querySelector('.form-error');
    const ok = input.checkValidity() && input.value.trim().length >= (parseInt(input.minLength, 10) > 0 ? input.minLength : 1);
    field.classList.toggle('invalid', !ok);
    field.classList.toggle('valid', ok);
    error.textContent = ok ? '' : messages[input.name] || 'Revisá este campo.';
    return ok;
  };

  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('blur', () => { if (input.value.trim()) validateField(input); });
    input.addEventListener('input', () => {
      const field = input.closest('.form-field');
      if (field.classList.contains('invalid')) validateField(input); // re-valida en vivo solo si ya falló
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll('input, textarea')];
    const allOk = inputs.map(validateField).every(Boolean);

    if (!allOk) {
      form.querySelector('.form-field.invalid input, .form-field.invalid textarea')?.focus();
      return;
    }

    // Estado de carga (reemplazar este bloque por un fetch() real al backend / servicio de email)
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      successMsg.hidden = false;
      form.reset();
      inputs.forEach(i => i.closest('.form-field').classList.remove('valid', 'invalid'));
      setTimeout(() => { successMsg.hidden = true; }, 8000);
    }, 1100);
  });

  /* ─────────────────────────────────────
     VOLVER ARRIBA
     ───────────────────────────────────── */
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  onScroll(); // estado inicial
});
