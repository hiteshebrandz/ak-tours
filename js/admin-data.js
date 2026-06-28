(function (global) {
  const STORAGE_KEY = 'ankitTours_testimonials';
  const SESSION_KEY = 'ankitTours_adminSession';
  const ADMIN_USER = 'tkhusboo912@gmail.com';
  const ADMIN_PASS = 'tkhusboo912@gmail.com';

  const DEFAULT_TESTIMONIALS = [
    {
      id: 't_default_1',
      text: 'Excellent service and punctual driver. Booked for airport transfer and they were waiting right on time. Highly recommended!',
      name: 'Rahul Sharma',
      role: 'Airport Transfer',
      stars: 5
    },
    {
      id: 't_default_2',
      text: 'Comfortable vehicle and professional experience. Took Innova Crysta for family trip to Mahabaleshwar. Will book again!',
      name: 'Priya Mehta',
      role: 'Outstation Trip',
      stars: 5
    },
    {
      id: 't_default_3',
      text: 'Best cab service for family trips. Sanjay ji is very cooperative and pricing is very reasonable. Thank you Ankit Tours!',
      name: 'Amit Patel',
      role: 'Family Vacation',
      stars: 5
    },
    {
      id: 't_default_4',
      text: 'Used their service for corporate travel. Professional drivers, clean cars, and always on schedule. Perfect for business needs.',
      name: 'Sneha Desai',
      role: 'Corporate Travel',
      stars: 5
    }
  ];

  function getTestimonials() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      /* ignore */
    }
    return DEFAULT_TESTIMONIALS.slice();
  }

  function getJsonPath() {
    const path = global.location.pathname.replace(/\\/g, '/');
    if (path.includes('/admin/') || path.includes('/login/')) {
      return '../data/testimonials.json';
    }
    return 'data/testimonials.json';
  }

  function fetchTestimonialsFromFile() {
    return fetch(getJsonPath(), { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load testimonials');
        return res.json();
      })
      .then(function (data) {
        if (Array.isArray(data) && data.length > 0) return data;
        return DEFAULT_TESTIMONIALS.slice();
      })
      .catch(function () {
        return getTestimonials();
      });
  }

  function exportTestimonialsJson() {
    const data = getTestimonials();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'testimonials.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function saveTestimonials(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function login(username, password) {
    const user = (username || '').trim().toLowerCase();
    if (user === ADMIN_USER.toLowerCase() && password === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  function requireAuth(loginPath) {
    if (!isLoggedIn()) {
      window.location.href = loginPath || '../login/';
      return false;
    }
    return true;
  }

  function generateId() {
    return 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  function getInitial(name) {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderStars(count) {
    const stars = Math.min(5, Math.max(1, parseInt(count, 10) || 5));
    let html = '';
    for (let i = 0; i < 5; i++) {
      html += i < stars
        ? '<i class="fas fa-star"></i>'
        : '<i class="far fa-star"></i>';
    }
    return html;
  }

  function buildTestimonialSlide(item, index) {
    const activeClass = index === 0 ? ' active' : '';
    const quote = escapeHtml(item.text);
    const name = escapeHtml(item.name);
    const role = escapeHtml(item.role);
    const initial = escapeHtml(getInitial(item.name));
    const stars = renderStars(item.stars);

    return (
      '<div class="testimonial-slide' + activeClass + '">' +
        '<div class="testimonial-card glass">' +
          '<div class="testimonial-quote"><i class="fas fa-quote-left"></i></div>' +
          '<div class="testimonial-stars" aria-label="' + (item.stars || 5) + ' out of 5 stars">' + stars + '</div>' +
          '<p class="testimonial-text">"' + quote + '"</p>' +
          '<div class="testimonial-author">' +
            '<div class="author-avatar">' + initial + '</div>' +
            '<div><h4>' + name + '</h4><span>' + role + '</span></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderTestimonialTrack(trackEl, testimonials) {
    if (!trackEl || !testimonials || testimonials.length === 0) return;
    trackEl.innerHTML = testimonials.map(buildTestimonialSlide).join('');
  }

  function addTestimonial(data) {
    const list = getTestimonials();
    list.push({
      id: generateId(),
      text: (data.text || '').trim(),
      name: (data.name || '').trim(),
      role: (data.role || '').trim(),
      stars: parseInt(data.stars, 10) || 5
    });
    saveTestimonials(list);
    return list;
  }

  function updateTestimonial(id, data) {
    const list = getTestimonials();
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return list;
    list[index] = {
      ...list[index],
      text: (data.text || '').trim(),
      name: (data.name || '').trim(),
      role: (data.role || '').trim(),
      stars: parseInt(data.stars, 10) || 5
    };
    saveTestimonials(list);
    return list;
  }

  function deleteTestimonial(id) {
    const list = getTestimonials().filter(t => t.id !== id);
    saveTestimonials(list);
    return list;
  }

  function getTestimonialById(id) {
    return getTestimonials().find(t => t.id === id) || null;
  }

  function getTestimonialsForSite(serverItems) {
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      /* ignore */
    }
    if (Array.isArray(serverItems) && serverItems.length > 0) return serverItems;
    return DEFAULT_TESTIMONIALS.slice();
  }

  function initAdminData() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      return fetchTestimonialsFromFile().then(function (data) {
        saveTestimonials(data);
        return data;
      });
    }
    return Promise.resolve(getTestimonials());
  }

  global.AnkitAdmin = {
    STORAGE_KEY,
    DEFAULT_TESTIMONIALS,
    getTestimonials,
    saveTestimonials,
    getTestimonialsForSite,
    fetchTestimonialsFromFile,
    exportTestimonialsJson,
    initAdminData,
    login,
    logout,
    isLoggedIn,
    requireAuth,
    generateId,
    getInitial,
    renderStars,
    buildTestimonialSlide,
    renderTestimonialTrack,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getTestimonialById
  };
})(window);
