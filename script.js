/**
 * Smart Nano-Filtration Cyber-Physical System (NF-CPS)
 * Interactive Presentation & Telemetry Simulator Script
 * 
 * Architectural Guarantees:
 * - 100% compatible with GitHub Pages static hosting.
 * - KaTeX mathematical and chemical rendering for formulas ($Ca^{2+}$, etc.).
 * - Pure layout isolation: No JavaScript overrides CSS Scroll Snap or @media print rules.
 * - All interactive controls are strictly excluded from printed PDF output.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. KaTeX Mathematical & Chemical Formula Auto-Rendering
  // ------------------------------------------------------------------------
  function initKaTeX() {
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        throwOnError: false
      });
    } else {
      // Fallback: If CDN was slightly delayed, retry once
      setTimeout(() => {
        if (typeof renderMathInElement === 'function') {
          renderMathInElement(document.body, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
            throwOnError: false
          });
        }
      }, 300);
    }
  }
  initKaTeX();

  // ------------------------------------------------------------------------
  // 2. Prism Syntax Highlighting
  // ------------------------------------------------------------------------
  if (typeof Prism !== 'undefined') {
    Prism.highlightAll();
  }

  // ------------------------------------------------------------------------
  // 3. Print / PDF Export Trigger
  // ------------------------------------------------------------------------
  const btnPrintPdf = document.getElementById('btnPrintPdf');
  if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
      window.print();
    });
  }

  // ------------------------------------------------------------------------
  // 4. Interactive Slide Navigation Dock & Intersection Observer
  // ------------------------------------------------------------------------
  const slides = document.querySelectorAll('.slide');
  const navDots = document.querySelectorAll('.nav-dot-btn');

  // Smooth scroll jump on dot click
  navDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const slideIndex = e.currentTarget.getAttribute('data-slide');
      const targetSlide = document.getElementById(`slide-${slideIndex}`);
      if (targetSlide) {
        targetSlide.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Track active slide with IntersectionObserver
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const slideId = entry.target.id;
        const slideNumber = slideId.replace('slide-', '');
        
        navDots.forEach(dot => {
          if (dot.getAttribute('data-slide') === slideNumber) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    });
  }, {
    root: document.querySelector('.presentation-container'),
    threshold: 0.55
  });

  slides.forEach(slide => slideObserver.observe(slide));

  // ------------------------------------------------------------------------
  // 5. Keyboard Navigation (Arrows, PageUp, PageDown)
  // ------------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    // Only navigate if no text input / modal is focused
    if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

    const container = document.querySelector('.presentation-container');
    if (!container) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      container.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
    }
  });

  // Floating Prev / Next Buttons
  const btnPrevSlide = document.getElementById('btnPrevSlide');
  const btnNextSlide = document.getElementById('btnNextSlide');
  const container = document.querySelector('.presentation-container');

  if (btnPrevSlide && container) {
    btnPrevSlide.addEventListener('click', () => {
      container.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
    });
  }

  if (btnNextSlide && container) {
    btnNextSlide.addEventListener('click', () => {
      container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    });
  }

  // ------------------------------------------------------------------------
  // 6. Interactive Code Snippet Copying
  // ------------------------------------------------------------------------
  const copyButtons = document.querySelectorAll('.btn-copy-code');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const codeContainer = e.currentTarget.closest('.code-container');
      const codeElement = codeContainer ? codeContainer.querySelector('code') : null;
      if (!codeElement) return;

      try {
        await navigator.clipboard.writeText(codeElement.innerText);
        const originalText = e.currentTarget.textContent;
        e.currentTarget.textContent = '✓ Copied';
        e.currentTarget.classList.add('copied');
        setTimeout(() => {
          e.currentTarget.textContent = originalText;
          e.currentTarget.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.warn('Clipboard write failed:', err);
      }
    });
  });

  // ------------------------------------------------------------------------
  // 7. Interactive Cyber-Physical Telemetry & Energy Simulator (Slide 9)
  // ------------------------------------------------------------------------
  const sliderTds = document.getElementById('simSliderTds');
  const sliderPwm = document.getElementById('simSliderPwm');
  const valTds = document.getElementById('simValTds');
  const valPwm = document.getElementById('simValPwm');

  const readoutPressure = document.getElementById('simReadoutPressure');
  const readoutPower = document.getElementById('simReadoutPower');
  const readoutFlow = document.getElementById('simReadoutFlow');
  const readoutEnergyPerL = document.getElementById('simReadoutEnergyPerL');
  const readoutSaving = document.getElementById('simReadoutSaving');

  function updateTelemetrySimulator() {
    if (!sliderTds || !sliderPwm) return;

    const tdsPpm = parseFloat(sliderTds.value); // 800 - 2500 ppm
    const pwmPercent = parseFloat(sliderPwm.value); // 50% - 100%

    // Physical calculations:
    // Pressure increases with PWM and osmotic resistance from TDS
    const basePressure = 28.0 + (pwmPercent / 100.0) * 16.0; // 36 - 44 PSI
    const osmoticCorrection = (tdsPpm - 800.0) * 0.003; 
    const finalPressure = Math.min(50.0, Math.max(30.0, basePressure + osmoticCorrection));

    // Hydraulic permeate flow rate (L/min)
    const permeateFlow = (finalPressure / 40.0) * 0.42 * (pwmPercent / 100.0);

    // Motor Current (mA) from INA219 model
    const current_mA = 380.0 + (finalPressure * 14.5); // ~850 - 1100 mA
    const powerWatts = (24.0 * current_mA) / 1000.0; // P = V * I

    // Specific Energy Consumption (Wh / Liter)
    const litersPerHour = permeateFlow * 60.0;
    const energyPerLiter = (litersPerHour > 0) ? (powerWatts / litersPerHour) : 1.6;

    // Traditional RO baseline at equivalent TDS (~5.2 Wh/L)
    const roBaseline = 5.2;
    const savingPercent = Math.max(50, Math.min(75, Math.round(((roBaseline - energyPerLiter) / roBaseline) * 100.0)));

    // Update UI elements
    if (valTds) valTds.textContent = `${tdsPpm} ppm`;
    if (valPwm) valPwm.textContent = `${pwmPercent}%`;

    if (readoutPressure) readoutPressure.textContent = finalPressure.toFixed(1);
    if (readoutPower) readoutPower.textContent = powerWatts.toFixed(1);
    if (readoutFlow) readoutFlow.textContent = permeateFlow.toFixed(2);
    if (readoutEnergyPerL) readoutEnergyPerL.textContent = energyPerLiter.toFixed(2);
    if (readoutSaving) readoutSaving.textContent = `${savingPercent}%`;
  }

  if (sliderTds && sliderPwm) {
    sliderTds.addEventListener('input', updateTelemetrySimulator);
    sliderPwm.addEventListener('input', updateTelemetrySimulator);
    updateTelemetrySimulator(); // Initial calibration
  }

  // ------------------------------------------------------------------------
  // 8. Image Lightbox Modal for BOM & Architecture Inspection
  // ------------------------------------------------------------------------
  const imageModal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImageDisplay');
  const inspectableImages = document.querySelectorAll('.bom-img-thumb, .arch-image-card img');

  if (imageModal && modalImg) {
    inspectableImages.forEach(img => {
      img.addEventListener('click', (e) => {
        modalImg.src = e.currentTarget.src;
        modalImg.alt = e.currentTarget.alt || 'Enlarged Image';
        imageModal.classList.add('open');
      });
    });

    imageModal.addEventListener('click', () => {
      imageModal.classList.remove('open');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && imageModal.classList.contains('open')) {
        imageModal.classList.remove('open');
      }
    });
  }
});
