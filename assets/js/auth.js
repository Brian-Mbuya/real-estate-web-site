// Centralized Authentication, Personalization & Professional Contact Engine
// Reality Kisumu Hub

const SUPPORT_PHONE = '+254746632821';
const DISPLAY_PHONE = '+254 746 632 821';

// Calculate accurate greeting based on current local time
function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
        return 'Good afternoon';
    } else {
        return 'Good evening';
    }
}

// Get current user profile (from localStorage or default)
function getCurrentUser() {
    try {
        const stored = localStorage.getItem('hub_user');
        if (stored) return JSON.parse(stored);
    } catch(e) {}
    return {
        fullName: 'Alex',
        email: 'alex@kisumuhub.com',
        avatar: 'images/u.jpg',
        isLoggedIn: true
    };
}

// Save logged in user profile
function setCurrentUser(userObj) {
    localStorage.setItem('hub_user', JSON.stringify({
        ...userObj,
        isLoggedIn: true
    }));
    updatePersonalizedUI();
}

// Logout user
function logoutUser() {
    localStorage.removeItem('hub_user');
    window.location.href = 'index.html';
}

// Update dynamic greeting and navbar profile elements across pages
function updatePersonalizedUI() {
    const user = getCurrentUser();
    const greetingText = getTimeBasedGreeting();

    // 1. Update Greeting Headers
    const greetingEls = document.querySelectorAll('.feed-greeting-title, .user-greeting-title');
    greetingEls.forEach(el => {
        el.innerHTML = `${greetingText}, <strong>${user.fullName.split(' ')[0]}</strong>`;
    });

    // 2. Update Navbars with polished dropdown
    const navAuthAreas = document.querySelectorAll('.app-navbar .d-flex.align-items-center.gap-2, .app-navbar .d-flex.align-items-center.gap-3');
    navAuthAreas.forEach(area => {
        if (user.isLoggedIn && user.fullName) {
            area.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center gap-2 border-0 shadow-sm" type="button" data-bs-toggle="dropdown" style="background:var(--blue-soft);color:var(--text-dark);transition:all 0.2s ease">
                        <img src="${user.avatar || 'images/u.jpg'}" alt="${user.fullName}" class="rounded-circle" style="width:28px;height:28px;object-fit:cover;border:1.5px solid var(--blue-primary)">
                        <span class="fw-bold fs-6 me-1">${user.fullName.split(' ')[0]}</span>
                        <i class="bi bi-chevron-down small text-muted"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end rounded-4 shadow-lg border-0 mt-2 p-2" style="min-width:210px">
                        <li>
                            <a class="dropdown-item rounded-3 py-2 fw-semibold d-flex align-items-center gap-2" href="liked.html">
                                <i class="bi bi-heart-fill text-danger fs-6"></i>
                                <span>Saved Favorites</span>
                            </a>
                        </li>
                        <li>
                            <button type="button" class="dropdown-item rounded-3 py-2 fw-semibold d-flex align-items-center gap-2" onclick="openContactModal()">
                                <i class="bi bi-headset text-primary fs-6"></i>
                                <span>Contact Support</span>
                            </button>
                        </li>
                        <li><hr class="dropdown-divider my-1"></li>
                        <li>
                            <button type="button" class="dropdown-item rounded-3 py-2 fw-semibold text-danger d-flex align-items-center gap-2" onclick="logoutUser()">
                                <i class="bi bi-box-arrow-right fs-6"></i>
                                <span>Sign Out</span>
                            </button>
                        </li>
                    </ul>
                </div>
            `;
        }
    });

    // 3. Bind footer links to open modals
    document.querySelectorAll('.landing-footer-links a, .footer-links-row a').forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        if (text.includes('contact')) {
            link.href = 'javascript:void(0)';
            link.onclick = (e) => { e.preventDefault(); openContactModal(); };
        } else if (text.includes('about')) {
            link.href = 'javascript:void(0)';
            link.onclick = (e) => { e.preventDefault(); openAboutModal(); };
        } else if (text.includes('privacy')) {
            link.href = 'javascript:void(0)';
            link.onclick = (e) => { e.preventDefault(); openPrivacyModal(); };
        }
    });
}

// Pre-filled WhatsApp link
function getWhatsAppLink(propertyTitle, customPhone) {
    const phone = (customPhone || SUPPORT_PHONE).replace(/[^0-9]/g, '');
    const text = propertyTitle 
        ? `Hi! I am inquiring about: ${propertyTitle}. Could you provide more details?`
        : `Hi Reality Kisumu Hub Support! I need assistance with properties.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Phone call link
function getPhoneCallLink(customPhone) {
    const phone = customPhone || SUPPORT_PHONE;
    return `tel:${phone}`;
}

// -------------------------------------------------------------
// Interactive Professional Modals (Contact, About, Privacy)
// -------------------------------------------------------------

function openContactModal() {
    let modalEl = document.getElementById('globalContactModal');
    if (!modalEl) {
        const div = document.createElement('div');
        div.id = 'globalContactModal';
        div.className = 'modal fade';
        div.setAttribute('tabindex', '-1');
        div.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content rounded-4 border-0 shadow-lg" style="overflow:hidden">
                    <div class="modal-header border-0 pb-0 pt-4 px-4">
                        <div class="d-flex align-items-center gap-3">
                            <div class="p-3 rounded-circle" style="background:var(--blue-soft)">
                                <i class="bi bi-headset fs-3" style="color:var(--blue-primary)"></i>
                            </div>
                            <div>
                                <h5 class="modal-title fw-bold text-dark mb-0">Contact & Support</h5>
                                <p class="text-muted small mb-0">We're available 24/7 to help you find your dream property</p>
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="d-grid gap-3 mb-4">
                            <a href="${getWhatsAppLink()}" target="_blank" class="btn btn-lg rounded-pill fw-bold py-3 text-white d-flex align-items-center justify-content-center gap-2 shadow-sm" style="background:#25D366">
                                <i class="bi bi-whatsapp fs-5"></i> Chat on WhatsApp (${DISPLAY_PHONE})
                            </a>
                            <a href="${getPhoneCallLink()}" class="btn btn-lg rounded-pill fw-bold py-3 d-flex align-items-center justify-content-center gap-2" style="background:var(--blue-soft);color:var(--blue-primary);border:1px solid var(--blue-soft-border)">
                                <i class="bi bi-telephone-fill fs-5"></i> Call Support (${DISPLAY_PHONE})
                            </a>
                            <a href="mailto:mboyabrian994@gmail.com" class="btn btn-outline-secondary btn-lg rounded-pill fw-bold py-3 d-flex align-items-center justify-content-center gap-2">
                                <i class="bi bi-envelope-fill fs-5"></i> Email Support (mboyabrian994@gmail.com)
                            </a>
                        </div>
                        <div class="p-3 rounded-4 bg-light border text-center small text-muted">
                            <div class="fw-bold text-dark mb-1"><i class="bi bi-geo-alt-fill text-danger me-1"></i> Office Location</div>
                            Reality Kisumu Hub HQ, Riat Hills, Kisumu, Kenya<br>
                            <span class="text-secondary fw-semibold">Operating Hours: Mon - Sat (8:00 AM - 8:00 PM)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div);
        modalEl = div;
    }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function openAboutModal() {
    let modalEl = document.getElementById('globalAboutModal');
    if (!modalEl) {
        const div = document.createElement('div');
        div.id = 'globalAboutModal';
        div.className = 'modal fade';
        div.setAttribute('tabindex', '-1');
        div.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content rounded-4 border-0 shadow-lg">
                    <div class="modal-header border-0 pb-0 pt-4 px-4">
                        <div class="d-flex align-items-center gap-3">
                            <div class="p-3 rounded-circle" style="background:var(--blue-soft)">
                                <i class="bi bi-building fs-3" style="color:var(--blue-primary)"></i>
                            </div>
                            <div>
                                <h5 class="modal-title fw-bold text-dark mb-0">About Reality Kisumu Hub</h5>
                                <p class="text-muted small mb-0">Kisumu's Premier Digital Real Estate Platform</p>
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 text-muted">
                        <p><strong>Reality Kisumu Hub</strong> is dedicated to seamlessly connecting property seekers with verified luxury villas, city apartments, waterfront homes, and prime land plots in Kisumu and beyond.</p>
                        <p class="mb-0">Featuring intelligent preference ranking, instant agent messaging via WhatsApp, and real-time database synchronization, we redefine property exploration for modern buyers.</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div);
        modalEl = div;
    }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function openPrivacyModal() {
    let modalEl = document.getElementById('globalPrivacyModal');
    if (!modalEl) {
        const div = document.createElement('div');
        div.id = 'globalPrivacyModal';
        div.className = 'modal fade';
        div.setAttribute('tabindex', '-1');
        div.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content rounded-4 border-0 shadow-lg">
                    <div class="modal-header border-0 pb-0 pt-4 px-4">
                        <div class="d-flex align-items-center gap-3">
                            <div class="p-3 rounded-circle" style="background:var(--blue-soft)">
                                <i class="bi bi-shield-check fs-3" style="color:var(--blue-primary)"></i>
                            </div>
                            <div>
                                <h5 class="modal-title fw-bold text-dark mb-0">Privacy & Data Policy</h5>
                                <p class="text-muted small mb-0">Your trust and data security are our top priority</p>
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4 text-muted">
                        <p>At <strong>Reality Kisumu Hub</strong>, your personal data is protected under strict Row Level Security (RLS) standards.</p>
                        <ul class="mb-0">
                            <li>We never share or sell your phone number or email to third parties.</li>
                            <li>Saved properties and account preferences are securely encrypted.</li>
                            <li>Inquiries are sent directly to verified listing agents via secure channels.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div);
        modalEl = div;
    }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

document.addEventListener('DOMContentLoaded', updatePersonalizedUI);

window.AuthHub = {
    getCurrentUser,
    setCurrentUser,
    logoutUser,
    getTimeBasedGreeting,
    getWhatsAppLink,
    getPhoneCallLink,
    openContactModal,
    openAboutModal,
    openPrivacyModal,
    SUPPORT_PHONE,
    DISPLAY_PHONE
};
