// Centralized Authentication, Personalization & Contact Helper
// Reality Kisumu Hub

const SUPPORT_PHONE = '+254746632821';

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
    // Default demo profile if none logged in
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

    // 1. Update Greeting Headers (e.g., "Good evening, Alex")
    const greetingEls = document.querySelectorAll('.feed-greeting-title, .user-greeting-title');
    greetingEls.forEach(el => {
        el.innerHTML = `${greetingText}, <strong>${user.fullName.split(' ')[0]}</strong>`;
    });

    // 2. Update Navbars
    const navAuthAreas = document.querySelectorAll('.app-navbar .d-flex.align-items-center.gap-2, .app-navbar .d-flex.align-items-center.gap-3');
    navAuthAreas.forEach(area => {
        if (user.isLoggedIn && user.fullName) {
            area.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-2 border-0" type="button" data-bs-toggle="dropdown" style="background:var(--blue-soft);color:var(--text-dark)">
                        <img src="${user.avatar || 'images/u.jpg'}" alt="${user.fullName}" class="rounded-circle" style="width:28px;height:28px;object-fit:cover;border:1.5px solid var(--blue-primary)">
                        <span class="fw-bold fs-6 me-1">${user.fullName.split(' ')[0]}</span>
                        <i class="bi bi-chevron-down small text-muted"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end rounded-4 shadow-sm border-0 mt-2 p-2">
                        <li><a class="dropdown-menu-item dropdown-item rounded-3 py-2 fw-semibold" href="liked.html"><i class="bi bi-heart me-2 text-danger"></i>Saved Favorites</a></li>
                        <li><a class="dropdown-menu-item dropdown-item rounded-3 py-2 fw-semibold" href="https://wa.me/254746632821?text=${encodeURIComponent('Hi Support, I need help with my account')}" target="_blank"><i class="bi bi-headset me-2 text-primary"></i>Support (+254746632821)</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><button class="dropdown-item rounded-3 py-2 fw-semibold text-danger" onclick="logoutUser()"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</button></li>
                    </ul>
                </div>
            `;
        }
    });
}

// Generate pre-filled WhatsApp link with support phone +254746632821
function getWhatsAppLink(propertyTitle, customPhone) {
    const phone = (customPhone || SUPPORT_PHONE).replace(/[^0-9]/g, '');
    const text = propertyTitle 
        ? `Hi! I am interested in inquiring about: ${propertyTitle}. Could you share more details?`
        : `Hi Reality Kisumu Hub Support! I would like to inquire about properties.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Generate Phone call link
function getPhoneCallLink(customPhone) {
    const phone = customPhone || SUPPORT_PHONE;
    return `tel:${phone}`;
}

document.addEventListener('DOMContentLoaded', updatePersonalizedUI);

window.AuthHub = {
    getCurrentUser,
    setCurrentUser,
    logoutUser,
    getTimeBasedGreeting,
    getWhatsAppLink,
    getPhoneCallLink,
    SUPPORT_PHONE
};
