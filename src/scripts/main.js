/* ==========================================================================
   KYNETIQ ACADEMY — GLOBAL SCRIPT ARCHITECTURE
   Navigation, Accessible Modals, Lightbox, Form Validation & Motion
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Lazy-load Signature 3D element only if container is present and motion is allowed
  const hero3dWrap = document.getElementById('hero-3d-canvas-wrap');
  if (hero3dWrap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    import('./three-signature.js')
      .then(({ initSignature3D }) => {
        initSignature3D('hero-3d-canvas-wrap');
      })
      .catch((err) => console.debug('3D feature skipped', err));
  }

  // 2. Scroll Progress Bar & Header Glassmorphism State
  const scrollProgress = document.getElementById('scroll-progress');
  const siteHeader = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    if (scrollProgress) {
      scrollProgress.style.width = `${progress}%`;
    }

    if (siteHeader) {
      if (window.scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // 3. Mobile Navigation Drawer
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      mobileDrawer.classList.toggle('open');
      document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });

    // Close mobile drawer when clicking any nav link
    const mobileLinks = mobileDrawer.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Keyboard accessibility: Escape closes the drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
        menuToggle.focus();
      }
    });

    // Reset drawer state on resize to tablet/desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && mobileDrawer.classList.contains('open')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    }, { passive: true });
  }

  // 4. Scroll Reveal Observer
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.15
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 5. Course Syllabus Accordion Toggle
  const moduleItems = document.querySelectorAll('.module-item');
  moduleItems.forEach(item => {
    const trigger = item.querySelector('.module-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close others for clean single-view accordion or allow multi-expand
        moduleItems.forEach(other => {
          if (other !== item) other.classList.remove('open');
        });
        item.classList.toggle('open', !isOpen);
      });
    }
  });

  // 6. Global Enquiry Modal Dialog
  const enquiryDialog = document.getElementById('enquiry-dialog');
  const openEnquiryButtons = document.querySelectorAll('[data-open-enquiry]');
  const closeEnquiryButtons = document.querySelectorAll('[data-close-enquiry]');

  if (enquiryDialog) {
    openEnquiryButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const courseContext = btn.getAttribute('data-course') || '3-Month Certified Gym Trainer Course';
        const courseInput = enquiryDialog.querySelector('input[name="program"]');
        if (courseInput) courseInput.value = courseContext;
        
        enquiryDialog.showModal();
        document.body.style.overflow = 'hidden';
      });
    });

    closeEnquiryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        enquiryDialog.close();
        document.body.style.overflow = '';
      });
    });

    enquiryDialog.addEventListener('click', (e) => {
      // Close on backdrop click
      const rect = enquiryDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        enquiryDialog.close();
        document.body.style.overflow = '';
      }
    });

    enquiryDialog.addEventListener('close', () => {
      document.body.style.overflow = '';
    });
  }

  // 7. Training Experience Lightbox Dialog
  const lightboxDialog = document.getElementById('lightbox-dialog');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.querySelector('[data-close-lightbox]');
  const galleryCards = document.querySelectorAll('[data-gallery-item]');

  if (lightboxDialog && lightboxImg) {
    galleryCards.forEach(card => {
      card.addEventListener('click', () => {
        const imgSrc = card.getAttribute('data-img-src');
        const title = card.getAttribute('data-title') || 'Practical Training';
        const tag = card.getAttribute('data-tag') || 'Gym Facility';
        
        lightboxImg.src = imgSrc;
        lightboxImg.alt = title;
        if (lightboxCaption) {
          lightboxCaption.innerHTML = `<strong>${title}</strong> — <span class="text-lime">${tag}</span>`;
        }
        lightboxDialog.showModal();
        document.body.style.overflow = 'hidden';
      });
    });

    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener('click', () => {
        lightboxDialog.close();
        document.body.style.overflow = '';
      });
    }

    lightboxDialog.addEventListener('click', (e) => {
      const rect = lightboxDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        lightboxDialog.close();
        document.body.style.overflow = '';
      }
    });

    lightboxDialog.addEventListener('close', () => {
      document.body.style.overflow = '';
    });
  }

  // 8. Demo-Safe Form Submission Handling
  const demoForms = document.querySelectorAll('form[data-demo-form]');
  demoForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const statusAlert = form.querySelector('.form-status-alert');
      
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'TRANSMITTING...';
      }

      // Simulate network response
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'ENQUIRY SUBMITTED';
        }
        if (statusAlert) {
          statusAlert.classList.add('success');
          statusAlert.innerHTML = `
            <strong>Enquiry Received (Demonstration Mode)</strong><br>
            Thank you for reaching out! In production, this form routes directly to your CRM, WhatsApp Business webhook, or Admissions email. Our advisory team will contact you shortly via your preferred channel.
          `;
        }
        form.reset();
      }, 700);
    });
  });

  // 9. WhatsApp Pre-filled Quick Chat Links
  const whatsappTriggers = document.querySelectorAll('[data-whatsapp-enquire]');
  whatsappTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const course = btn.getAttribute('data-course') || '3-Month Certified Gym Trainer Course';
      const text = encodeURIComponent(`Hello Kynetiq Academy, I would like to enquire about the ${course}. Please share upcoming batch dates and curriculum details.`);
      // Note: Editable placeholder phone for academy owner
      const phone = btn.getAttribute('data-phone') || '919876543210'; 
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
    });
  });
});
