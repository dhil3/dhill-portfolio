/**
 * Dhill - Digital Marketing Portfolio
 * Interactive Functionality & Modern UX Enhancements
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initServicesFilter();
  initScopeBuilder();
  initWorkflowInteractive();
  initCaseStudyModal();
  initBackToTop();
});

/* ==========================================================================
   1. Theme Management (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem('dhill_theme');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dhill_theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      themeToggleBtn.innerHTML = theme === 'dark' 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  };

  const initialTheme = savedTheme || (prefersDark.matches ? 'dark' : 'dark');
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
}

/* ==========================================================================
   2. Navigation & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile drawer when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // Active section spy on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  });
}

/* ==========================================================================
   3. Core Services Matrix Filtering & Search
   ========================================================================== */
function initServicesFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const serviceCards = document.querySelectorAll('.service-card');
  const searchInput = document.getElementById('serviceSearchInput');

  function filterServices() {
    const activeCategory = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const searchQuery = (searchInput?.value || '').toLowerCase().trim();

    serviceCards.forEach(card => {
      const cardCategory = card.dataset.category;
      const cardText = card.textContent.toLowerCase();

      const matchesCat = (activeCategory === 'all' || cardCategory.includes(activeCategory));
      const matchesSearch = (!searchQuery || cardText.includes(searchQuery));

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterServices();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterServices);
  }
}

/* ==========================================================================
   4. Interactive Project Scope Builder & Inquiry Generator
   ========================================================================== */
function initScopeBuilder() {
  const scopeCheckboxes = document.querySelectorAll('.scope-checkbox');
  const serviceCards = document.querySelectorAll('.service-card');
  const selectedBriefContainer = document.getElementById('briefItemsContainer');
  const selectedCountBadge = document.getElementById('selectedCountBadge');
  const businessInput = document.getElementById('clientBusinessName');
  const painPointsInput = document.getElementById('clientPainPoints');
  const websiteInput = document.getElementById('clientWebsite');
  const copyBriefBtn = document.getElementById('copyBriefBtn');
  const whatsappInquiryBtn = document.getElementById('whatsappInquiryBtn');
  const emailInquiryBtn = document.getElementById('emailInquiryBtn');

  // Sync service card "+ Select" buttons with checkboxes
  serviceCards.forEach(card => {
    const selectBtn = card.querySelector('.select-service-btn');
    const serviceName = card.dataset.serviceName;

    if (selectBtn && serviceName) {
      selectBtn.addEventListener('click', () => {
        const checkbox = Array.from(scopeCheckboxes).find(cb => cb.value === serviceName);
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.closest('.scope-checkbox-label')?.classList.toggle('checked', checkbox.checked);
          updateScopeSummary();
          updateCardBtnState(card, checkbox.checked);
        }
      });
    }
  });

  // Checkbox change event
  scopeCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.scope-checkbox-label')?.classList.toggle('checked', cb.checked);
      // Sync corresponding card button
      const card = Array.from(serviceCards).find(c => c.dataset.serviceName === cb.value);
      if (card) {
        updateCardBtnState(card, cb.checked);
      }
      updateScopeSummary();
    });
  });

  function updateCardBtnState(card, isSelected) {
    const btn = card.querySelector('.select-service-btn');
    if (!btn) return;
    if (isSelected) {
      btn.classList.add('selected');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Selected`;
    } else {
      btn.classList.remove('selected');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Select for Inquiry`;
    }
  }

  function updateScopeSummary() {
    const selected = Array.from(scopeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    
    if (selectedCountBadge) {
      selectedCountBadge.textContent = selected.length;
    }

    if (!selectedBriefContainer) return;

    if (selected.length === 0) {
      selectedBriefContainer.innerHTML = `<div style="font-size:0.85rem; color:var(--text-dim); text-align:center; padding:1rem 0;">No services selected yet. Choose services above or tick boxes to customize your digital presence plan.</div>`;
      return;
    }

    selectedBriefContainer.innerHTML = selected.map(svc => `
      <div class="brief-item-pill">
        <span>${svc}</span>
        <button type="button" data-service="${svc}" title="Remove" aria-label="Remove ${svc}">&times;</button>
      </div>
    `).join('');

    // Attach remove handlers
    selectedBriefContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const svcName = btn.dataset.service;
        const targetCb = Array.from(scopeCheckboxes).find(cb => cb.value === svcName);
        if (targetCb) {
          targetCb.checked = false;
          targetCb.closest('.scope-checkbox-label')?.classList.remove('checked');
          const card = Array.from(serviceCards).find(c => c.dataset.serviceName === svcName);
          if (card) updateCardBtnState(card, false);
          updateScopeSummary();
        }
      });
    });
  }

  // Format brief text
  function generateBriefText() {
    const selected = Array.from(scopeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const business = businessInput?.value.trim() || 'My Business';
    const website = websiteInput?.value.trim() || 'Not provided yet';
    const painPoints = painPointsInput?.value.trim() || 'Looking to establish and strengthen our digital presence.';

    return `*DIGITAL MARKETING PROJECT INQUIRY*
----------------------------------------
*Business Name:* ${business}
*Website / Current Profile:* ${website}

*Selected Focus Areas & Services:*
${selected.length > 0 ? selected.map(s => `• ${s}`).join('\n') : '• General Digital Marketing Audit & Strategy'}

*Current Challenges & Goals:*
${painPoints}

----------------------------------------
Sent via Dhill Digital Marketing Portfolio Scope Builder`;
  }

  // Copy Brief Button
  if (copyBriefBtn) {
    copyBriefBtn.addEventListener('click', () => {
      const briefText = generateBriefText();
      navigator.clipboard.writeText(briefText).then(() => {
        showToast('Project brief copied to clipboard! You can paste and send it directly.');
      }).catch(() => {
        showToast('Could not copy automatically. Please select text manually.');
      });
    });
  }

  // WhatsApp Button
  if (whatsappInquiryBtn) {
    whatsappInquiryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const briefText = generateBriefText();
      const encoded = encodeURIComponent(briefText);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    });
  }

  // Email Button
  if (emailInquiryBtn) {
    emailInquiryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const briefText = generateBriefText();
      const business = businessInput?.value.trim() || 'New Client';
      const mailtoUrl = `mailto:hello@dhillmarketing.com?subject=${encodeURIComponent(`Digital Marketing Inquiry - ${business}`)}&body=${encodeURIComponent(briefText)}`;
      window.location.href = mailtoUrl;
    });
  }

  // Initialize summary
  updateScopeSummary();
}

/* ==========================================================================
   5. Interactive 6-Step Workflow Slider / Switcher
   ========================================================================== */
const workflowData = [
  {
    step: '01',
    title: 'Audit & Discover',
    tag: 'Foundation Assessment',
    description: 'Understand the business, its services, existing digital assets, target audience, competitors, and objectives.',
    whatWeDo: 'Deep dive into current Google Maps listings, website structure, social channels, and local competitor positioning.',
    keyDeliverables: 'Digital presence audit report, competitor benchmark, identified visibility gaps, and priority action list.',
    clientInput: 'Access to current accounts (if existing), list of core services, service areas, and primary target customer profile.',
    expectedOutcome: 'Clear clarity on where the business stands today and exactly what foundational gaps need immediate fixing.'
  },
  {
    step: '02',
    title: 'Establish the Foundation',
    tag: 'Profile Setup & Verification',
    description: 'Create or optimise relevant business profiles, social media accounts, brand information, and contact pathways.',
    whatWeDo: 'Claim/verify Google Business Profile, configure accurate categories/hours, establish branded social handles, and build direct contact channels.',
    keyDeliverables: 'Fully optimized Google Business Profile, branded Meta/Instagram business pages, consistent NAP (Name, Address, Phone) citations.',
    clientInput: 'Business registration verification, high-resolution logo files, official contact numbers, and store/office photos.',
    expectedOutcome: 'A verified, professional, and trustworthy baseline across search and social channels.'
  },
  {
    step: '03',
    title: 'Plan the Strategy',
    tag: 'Content & Campaign Architecture',
    description: 'Define content pillars, communication priorities, campaign themes, and publishing schedules.',
    whatWeDo: 'Map out content themes (educational, promotional, engagement, trust-building), audience triggers, and monthly publishing cadences.',
    keyDeliverables: 'Monthly content calendar, visual brand guidelines for social media, caption templates, and hashtag/keyword matrix.',
    clientInput: 'Upcoming business promotions, seasonal specials, key FAQs frequently asked by real clients.',
    expectedOutcome: 'A predictable, structured schedule replacing chaotic ad-hoc posting with deliberate brand building.'
  },
  {
    step: '04',
    title: 'Create & Publish',
    tag: 'Creative Production & Execution',
    description: 'Develop creative assets, captions, videos, and promotional content, then publish approved content according to the agreed schedule.',
    whatWeDo: 'Design high-converting post creatives, carousels, short-form reels/videos, compelling headlines, and clear calls-to-action.',
    keyDeliverables: 'Scheduled social media posts, Google Business Profile update posts, promotional banners, and engaging captions.',
    clientInput: 'Timely review and approval of the scheduled batch.',
    expectedOutcome: 'Regular, visually engaging content published on time, keeping your business top-of-mind.'
  },
  {
    step: '05',
    title: 'Engage & Monitor',
    tag: 'Community & Reputation Management',
    description: 'Maintain agreed audience interactions, monitor account activity, and review relevant business and marketing insights.',
    whatWeDo: 'Monitor Google Business reviews and draft professional responses; track comments, direct inquiries, and community engagement.',
    keyDeliverables: 'Professional review replies, active audience response management, and fast escalation of customer leads.',
    clientInput: 'Guidance on specific technical customer queries or sensitive pricing questions.',
    expectedOutcome: 'Elevated customer trust, improved local ranking signals through active reviews, and prompt lead handling.'
  },
  {
    step: '06',
    title: 'Analyse & Improve',
    tag: 'Data-Driven Optimization',
    description: 'Evaluate available performance data, identify content opportunities, and refine the next marketing cycle.',
    whatWeDo: 'Examine Google Search/Maps discovery metrics, social impressions, link clicks, call clicks, and engagement patterns.',
    keyDeliverables: 'Monthly performance report, content win/loss analysis, and prioritized strategic adjustments for the following month.',
    clientInput: 'Real-world business feedback (e.g. foot traffic, walk-in inquiries, closed sales).',
    expectedOutcome: 'Continuous compounding ROI where every new marketing cycle is smarter and more efficient than the last.'
  }
];

function initWorkflowInteractive() {
  const stepCards = document.querySelectorAll('.workflow-step-card');
  const detailPanel = document.getElementById('workflowDetailPanel');

  if (!stepCards.length || !detailPanel) return;

  function renderStepDetail(index) {
    const data = workflowData[index];
    if (!data) return;

    detailPanel.innerHTML = `
      <div class="workflow-detail-header">
        <span class="workflow-detail-badge">PHASE ${data.step} — ${data.tag}</span>
        <h3 class="workflow-detail-title">${data.title}</h3>
        <p style="font-size: 1.05rem; color: var(--text-muted); line-height: 1.65; margin-top: 0.5rem;">
          ${data.description}
        </p>
      </div>
      <div class="workflow-detail-columns">
        <div class="wf-col-box">
          <h4>Execution Scope</h4>
          <p>${data.whatWeDo}</p>
        </div>
        <div class="wf-col-box">
          <h4>Key Deliverables</h4>
          <p>${data.keyDeliverables}</p>
        </div>
        <div class="wf-col-box">
          <h4>Client Collaboration</h4>
          <p>${data.clientInput}</p>
        </div>
        <div class="wf-col-box">
          <h4>Expected Business Impact</h4>
          <p>${data.expectedOutcome}</p>
        </div>
      </div>
    `;

    stepCards.forEach((c, idx) => {
      c.classList.toggle('active', idx === index);
    });
  }

  stepCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      renderStepDetail(idx);
    });
  });

  // Default to step 0
  renderStepDetail(0);
}

/* ==========================================================================
   6. Case Study Modals (Spark Advertising & Idea Enterprises)
   ========================================================================== */
const caseStudies = {
  spark: {
    title: 'Spark Advertising',
    category: 'Digital Presence Development & Marketing',
    image: 'assets/images/spark_advertising.jpg',
    objective: "Establish and strengthen Spark Advertising's digital presence, making its services easier to discover, understand, and engage with online.",
    scopeList: [
      'Google Business Profile setup, optimisation, and maintenance.',
      'Creation and setup of relevant social media business accounts.',
      'Social media profile branding and information optimisation.',
      'Content strategy, planning, and calendar development.',
      'Social media post design and content creation.',
      'Caption writing, content publishing, and scheduling.',
      'Brand communication and service promotion.',
      'Audience engagement and community management.',
      'Digital marketing planning and performance monitoring.'
    ],
    summaryNote: 'Building a consistent digital identity, improving the presentation of business services online, and creating a solid foundation for audience engagement and future business enquiries.'
  },
  idea: {
    title: 'Idea Enterprises',
    category: 'Online Brand Development & Social Media Management',
    image: 'assets/images/idea_enterprises.jpg',
    objective: 'Establish and maintain a professional digital presence for Idea Enterprises, aligned with its business identity, services, and target audience.',
    scopeList: [
      'Digital presence assessment and planning.',
      'Google Business Profile creation or optimisation, as required.',
      'Setup and management of appropriate social media accounts.',
      'Business profile descriptions, contact information, and branding.',
      'Content planning and social media calendar management.',
      'Creative post development and caption writing.',
      'Regular content publishing and scheduling.',
      'Service awareness and promotional content.',
      'Audience communication and engagement.',
      'Performance tracking and continuous content improvement.'
    ],
    summaryNote: 'Develop a structured online presence that helps potential customers understand the business, discover its offerings, and find the appropriate way to make contact.'
  }
};

function initCaseStudyModal() {
  const modalBackdrop = document.getElementById('caseStudyModal');
  const modalContent = document.getElementById('modalCaseStudyContent');
  const closeBtn = document.getElementById('modalCloseBtn');
  const triggerBtns = document.querySelectorAll('.open-case-study-btn');

  if (!modalBackdrop || !modalContent) return;

  function openModal(projectKey) {
    const study = caseStudies[projectKey];
    if (!study) return;

    modalContent.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <span class="section-tag" style="margin-bottom: 0.5rem;"><span class="dot"></span> Case Study Deep Dive</span>
        <h2 style="font-size: 2rem; margin-bottom: 0.25rem;">${study.title}</h2>
        <p style="color: var(--primary-light); font-weight: 600;">${study.category}</p>
      </div>

      <img src="${study.image}" alt="${study.title} Case Study Visual" style="border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.75rem;">

      <div class="project-objective-box" style="margin-bottom: 1.75rem;">
        <strong>Core Project Objective:</strong>
        ${study.objective}
      </div>

      <h3 style="font-size: 1.15rem; margin-bottom: 1rem;">Complete Scope of Work & Responsibilities</h3>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.75rem;">
        ${study.scopeList.map(item => `
          <li style="display:flex; align-items:flex-start; gap:0.65rem; font-size:0.92rem; color:var(--text-muted); line-height:1.45;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" style="flex-shrink:0; margin-top:0.15rem;"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${item}</span>
          </li>
        `).join('')}
      </ul>

      <div style="background: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: 0.88rem; color: var(--text-muted); line-height: 1.5;">
        <strong style="color:var(--text-main); display:block; margin-bottom:0.25rem;">Project Delivery Philosophy:</strong>
        ${study.summaryNote}
      </div>
    `;

    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.project;
      openModal(key);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   7. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const backBtn = document.getElementById('backToTopBtn');
  if (!backBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   8. Toast Notification Utility
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
