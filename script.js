document.addEventListener('DOMContentLoaded', () => {
    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // 1. Сначала закрываем меню
                if (typeof closeMobileMenu === 'function') {
                    closeMobileMenu();
                } else {
                    // Fallback: закрываем вручную если функция не найдена
                    const navLinks = document.querySelector('.nav-links');
                    const btn = document.querySelector('.mobile-menu-btn');
                    const overlay = document.querySelector('.nav-overlay');
                    if (navLinks) navLinks.classList.remove('open');
                    if (btn) btn.classList.remove('open');
                    if (overlay) overlay.classList.remove('open');
                    document.body.style.overflow = '';
                }

                // 2. Ждём пока меню закроется (400мс), затем скроллим
                setTimeout(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }, 400);
            }
        });
    });


    // Intersection Observer for Fade-in Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Animate Sections
    const sections = document.querySelectorAll('.glass-panel, .level-card, .hero-content');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(section);
    });

    // Fallback: Ensure everything is visible after 1 second just in case
    setTimeout(() => {
        sections.forEach(section => {
            if (section.style.opacity === '0') {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    }, 1000);

    // Hover Tilt Effect for Level Cards (Optional Polish)
    const cards = document.querySelectorAll('.level-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
    // Modal open/close handlers
    const modalTriggers = document.querySelectorAll('.level-card[data-modal], .teremok-zone[data-modal]');
    modalTriggers.forEach(card => {
        const modalId = card.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
            card.addEventListener('click', () => {
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        }
    });

    const modalCloses = document.querySelectorAll('.modal-close, .modal-overlay');
    modalCloses.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-backdrop');
            if (modal) {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });

    // Countdown Timer
    const countdownText = document.getElementById('eventCountdownText');
    const countdownFill = document.getElementById('eventCountdownFill');

    if (countdownText && countdownFill) {
        const targetDate = new Date('2025-12-18T10:00:00').getTime();
        const startDate = new Date('2025-11-01T00:00:00').getTime(); // Assumed campaign start
        const totalDuration = targetDate - startDate;

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                countdownText.innerText = "Регистрация закрыта";
                countdownFill.style.width = "100%";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            countdownText.innerText = `${days} дн. ${hours} ч. ${minutes} мин.`;

            // Calculate progress bar width (inverse logic: fills up as time passes)
            const timePassed = now - startDate;
            let percentage = (timePassed / totalDuration) * 100;
            percentage = Math.max(0, Math.min(100, percentage));

            countdownFill.style.width = `${percentage}%`;
        }

        updateCountdown();
        setInterval(updateCountdown, 60000); // Update every minute
    }
    // Lead Form Submission
    const leadForm = document.getElementById('leadForm');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Here you would typically send the form data to a server
            console.log("Form submitted");

            closeLeadModal();

            // Open Test Modal
            const testModal = document.getElementById('testModal');
            if (testModal) {
                testModal.classList.add('open');
                document.body.style.overflow = 'hidden';

                // Start the test (function from test.js)
                if (typeof startTeremokTest === 'function') {
                    startTeremokTest();
                }
            }
        });
    }
});

// Mobile Menu Functions are defined in app.js

// Global Modal Functions for Buttons
function openLeadModal(type) {
    const modal = document.getElementById('leadModal');
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // You could handle 'type' here to customize the modal if needed
        // e.g., select a specific option in the dropdown
    }
}

function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function openPrivacyModal() {
    // Placeholder for privacy modal if it exists, or redirect
    window.location.href = 'privacy-policy.html';
}

function closeTestModal() {
    const modal = document.getElementById('testModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}
