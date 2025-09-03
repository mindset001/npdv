// DOM Elements
const domElements = {
    modal: document.getElementById('payment-modal'),
    closeBtn: document.querySelector('.close'),
    paymentFormContainer: document.querySelector('.payment-form-container'),
    paymentFormModal: document.getElementById('payment-form'),
    mobileMenuBtn: document.querySelector('.mobile-menu-toggle'),
    mobileNav: document.querySelector('.mobile-nav'),
    mobileDropdownToggles: document.querySelectorAll('.mobile-dropdown-toggle'),
    mainNav: document.querySelector('.main-nav ul'),
    dropdownToggles: document.querySelectorAll('.dropdown-toggle'),
    enrollButtons: document.querySelectorAll('.enroll-button'),
    contactForm: document.querySelector('.contact-form'),
    subscribeForm: document.querySelector('.footer-subscribe'),
    teamSlider: document.querySelector('.team-members'),
    header: document.querySelector('.main-header'),
    searchInput: document.querySelector('.search-input'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    galleryItems: document.querySelectorAll('.gallery-item'),
    courseFilters: document.querySelectorAll('.course-filter'),
    courseCards: document.querySelectorAll('.course-card'),
    testimonialSlider: document.querySelector('.testimonials-slider'),
    faqItems: document.querySelectorAll('.faq-item'),
    countdownTimers: document.querySelectorAll('.countdown-timer'),
    imageGallery: document.querySelector('.image-gallery'),
    chatButton: document.querySelector('.chat-button'),
    chatWidget: document.querySelector('.chat-widget'),
    notificationBell: document.querySelector('.notification-bell'),
    darkModeToggle: document.querySelector('.dark-mode-toggle')
};

// Payment Processing
const PaymentHandler = {
    init() {
        if (domElements.paymentFormContainer) {
            this.setupPaymentForm();
        }
        if (domElements.paymentFormModal) {
            this.setupPaymentModal();
        }
    },

    setupPaymentForm() {
        const cardNumber = document.getElementById('card-number');
        const expiry = document.getElementById('expiry');
        const cvv = document.getElementById('cvv');
        const payButton = document.querySelector('.pay-button');

        // Card number formatting
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value.substring(0, 19);
            });
        }

        // Expiry date formatting
        if (expiry) {
            expiry.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + ' / ' + value.substring(2);
                }
                e.target.value = value.substring(0, 7);
            });
        }

        // CVV validation
        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
            });
        }

        // Payment submission
        if (payButton) {
            payButton.addEventListener('click', this.handlePayment.bind(this));
        }
    },

    setupPaymentModal() {
        if (domElements.modal && domElements.closeBtn) {
            domElements.closeBtn.addEventListener('click', () => {
                domElements.modal.style.display = 'none';
            });

window.addEventListener('click', (e) => {
                if (e.target === domElements.modal) {
                    domElements.modal.style.display = 'none';
    }
});
        }
    },

    handlePayment(e) {
        e.preventDefault();
        const form = e.target.closest('form') || domElements.paymentFormContainer;
        
        if (FormValidator.validateForm(form)) {
            const button = e.target;
            UIHandler.showLoadingState(button, 'Processing...');

            // Simulate payment processing
            setTimeout(() => {
                alert('Payment processed successfully!');
                UIHandler.resetLoadingState(button, 'Pay');
                form.reset();
            }, 2000);
        }
    }
};

// Form Validator Utility
const FormValidator = {
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidPhone(phone) {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    },

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    },

    validateField(field) {
        const errorElement = field.nextElementSibling;
        let isValid = true;
        let errorMessage = '';

        switch (field.id) {
            case 'name':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Name is required';
                } else if (field.value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;
            case 'email':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Email is required';
                } else if (!this.isValidEmail(field.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Phone number is required';
                } else if (!this.isValidPhone(field.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
            case 'message':
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Message is required';
                } else if (field.value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters';
                }
                break;
            case 'subject':
                if (!field.value || field.value === '') {
                    isValid = false;
                    errorMessage = 'Please select a subject';
                }
                break;
        }

        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = isValid ? 'none' : 'block';
        }

        field.classList.toggle('error', !isValid);
        field.setAttribute('aria-invalid', !isValid);
        return isValid;
    }
};

// UI Handler for form interactions
const UIHandler = {
    init() {
        this.setupContactForm();
        this.setupNewsletterSubscription();
        this.setupFormValidation();
    },

    showLoadingState(button, loadingText) {
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <span class="flex items-center justify-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                ${loadingText}
            </span>
        `;
        button.dataset.originalContent = originalContent;
    },

    resetLoadingState(button, defaultText) {
        button.disabled = false;
        button.innerHTML = button.dataset.originalContent || defaultText;
    },

    setupContactForm() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (FormValidator.validateForm(form)) {
                    const submitButton = form.querySelector('button[type="submit"]');
                    this.showLoadingState(submitButton, 'Sending...');

                    try {
                        const formData = new FormData(form);
                        const response = await fetch('submit_form.php', {
                            method: 'POST',
                            body: formData
                        });

                        const data = await response.json();
                        
                        if (data.status === 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: 'Your message has been sent successfully.',
                                confirmButtonColor: '#F57C00'
                            });
                            form.reset();
                        } else {
                            throw new Error(data.message || 'Failed to send message');
                        }
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: error.message || 'Failed to send message. Please try again.',
                            confirmButtonColor: '#F57C00'
                        });
                    } finally {
                        this.resetLoadingState(submitButton, 'Send Message');
                    }
                }
            });
        }
    },

    setupNewsletterSubscription() {
        const forms = document.querySelectorAll('form[data-type="newsletter"]');
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = form.querySelector('input[type="email"]').value;
                
                if (FormValidator.isValidEmail(email)) {
                    const button = form.querySelector('button[type="submit"]');
                    this.showLoadingState(button, 'Subscribing...');

                    try {
                        // Simulate API call
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'Subscribed!',
                            text: 'Thank you for subscribing to our newsletter.',
                            confirmButtonColor: '#F57C00'
                        });
                        
                        form.reset();
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to subscribe. Please try again.',
                            confirmButtonColor: '#F57C00'
                        });
                    } finally {
                        this.resetLoadingState(button, 'Subscribe');
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid Email',
                        text: 'Please enter a valid email address.',
                        confirmButtonColor: '#F57C00'
                    });
                }
            });
        });
    },

    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                // Real-time validation
                input.addEventListener('input', () => FormValidator.validateField(input));
                input.addEventListener('blur', () => FormValidator.validateField(input));

                // Character counter for textareas
                if (input.tagName === 'TEXTAREA' && input.maxLength) {
                    const counter = document.createElement('div');
                    counter.className = 'text-sm text-gray-500 mt-1';
                    counter.innerHTML = `<span>0</span>/${input.maxLength} characters`;
                    input.parentNode.appendChild(counter);

                    input.addEventListener('input', () => {
                        const length = input.value.length;
                        counter.querySelector('span').textContent = length;
                        counter.className = `text-sm mt-1 ${
                            length > input.maxLength * 0.9 ? 'text-red-500' :
                            length > input.maxLength * 0.7 ? 'text-orange-500' :
                            'text-gray-500'
                        }`;
                    });
                }
            });
        });
    }
};

// Mobile Navigation Handler
const MobileNavHandler = {
    init() {
        // Check if mobile navigation should be hidden on current page
        this.checkMobileNavVisibility();
        
        // Only proceed with setup if mobile nav should be visible
        if (!this.shouldHideMobileNav()) {
            this.setupMobileMenu();
            this.setupTouchHandling();
            this.handlePageTransitions();
            this.setupScrollBehavior();
            this.setupKeyboardHandling();
        }
    },

    shouldHideMobileNav() {
        const currentPath = window.location.pathname;
        // Normalize the path to handle both root and specific file cases
        const normalizedPath = currentPath === '/' ? '/index.html' : currentPath;
        const pagesWithoutMobileNav = ['/index.html', '/case-studies.html'];
        
        // Check if the current page should have mobile nav hidden
        return pagesWithoutMobileNav.some(page => normalizedPath.endsWith(page));
    },

    checkMobileNavVisibility() {
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav) {
            if (this.shouldHideMobileNav()) {
                mobileNav.style.display = 'none';
                // Also remove any padding we might have added to the body
                document.body.style.paddingBottom = '0';
            } else {
                mobileNav.style.display = 'flex';
                // Restore padding if needed
                const safeAreaBottom = window.innerHeight - window.visualViewport.height;
                document.body.style.paddingBottom = `calc(4rem + ${safeAreaBottom}px)`;
            }
        }
    },

    setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        const navOverlay = document.querySelector('.nav-overlay');
        const body = document.body;

        if (mobileMenuBtn && mobileNav) {
            // Handle both click and touch events
            const toggleMenu = () => {
                mobileNav.classList.toggle('active');
                navOverlay.classList.toggle('active');
                body.classList.toggle('menu-open');
            };

            // Add event listeners for both click and touch
            mobileMenuBtn.addEventListener('click', toggleMenu);
            mobileMenuBtn.addEventListener('touchend', (e) => {
                e.preventDefault(); // Prevent double-firing on mobile
                toggleMenu();
            });

            // Close menu when clicking overlay
            const closeMenu = () => {
                mobileNav.classList.remove('active');
                navOverlay.classList.remove('active');
                body.classList.remove('menu-open');
            };

            navOverlay.addEventListener('click', closeMenu);
            navOverlay.addEventListener('touchend', (e) => {
                e.preventDefault();
                closeMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    closeMenu();
                }
            });

            // Handle orientation change
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    if (window.innerWidth >= 1024) {
                        closeMenu();
                    }
                }, 100);
            });
        }
    },

    setupTouchHandling() {
        const mobileNav = document.querySelector('.mobile-nav');
        if (!mobileNav) return;

        let touchStartY = 0;
        let touchEndY = 0;
        let touchStartTime = 0;
        const minSwipeDistance = 50;
        const maxSwipeTime = 300;

        // Handle touch start
        mobileNav.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: true });

        // Handle touch move
        mobileNav.addEventListener('touchmove', (e) => {
            touchEndY = e.touches[0].clientY;
        }, { passive: true });

        // Handle touch end
        mobileNav.addEventListener('touchend', () => {
            const touchEndTime = Date.now();
            const swipeDistance = touchEndY - touchStartY;
            const swipeTime = touchEndTime - touchStartTime;

            if (swipeTime <= maxSwipeTime && Math.abs(swipeDistance) > minSwipeDistance) {
                if (swipeDistance > 0) {
                    // Swipe down - hide navigation
                    mobileNav.classList.add('hidden');
                } else {
                    // Swipe up - show navigation
                    mobileNav.classList.remove('hidden');
                }
            }
        }, { passive: true });

        // Add touch feedback
        const mobileNavItems = mobileNav.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(item => {
            item.addEventListener('touchstart', () => {
                item.style.transform = 'scale(0.95)';
            }, { passive: true });

            item.addEventListener('touchend', () => {
                item.style.transform = 'scale(1)';
            }, { passive: true });
        });
    },

    handlePageTransitions() {
        // Reset mobile menu state when navigating to a new page
        window.addEventListener('beforeunload', () => {
            const mobileNav = document.querySelector('.mobile-nav');
            const navOverlay = document.querySelector('.nav-overlay');
            const body = document.body;
            
            if (mobileNav) mobileNav.classList.remove('active', 'hidden');
            if (navOverlay) navOverlay.classList.remove('active');
            body.classList.remove('menu-open');
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                const mobileNav = document.querySelector('.mobile-nav');
                const navOverlay = document.querySelector('.nav-overlay');
                const body = document.body;
                
                if (mobileNav) mobileNav.classList.remove('active', 'hidden');
                if (navOverlay) navOverlay.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    },

    setupScrollBehavior() {
        const mobileNav = document.querySelector('.mobile-nav');
        if (!mobileNav) return;

        let lastScrollTop = 0;
        let ticking = false;
        const scrollThreshold = 10;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const isScrollingUp = currentScrollTop < lastScrollTop;
                    const scrollDistance = Math.abs(currentScrollTop - lastScrollTop);

                    if (scrollDistance > scrollThreshold) {
                        if (isScrollingUp) {
                            mobileNav.classList.remove('hidden');
                        } else {
                            mobileNav.classList.add('hidden');
                        }
                    }

                    lastScrollTop = currentScrollTop;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    },

    setupKeyboardHandling() {
        const mobileNav = document.querySelector('.mobile-nav');
        if (!mobileNav) return;

        // Handle keyboard events
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // Add padding to body when keyboard is shown
                document.body.style.paddingBottom = 'calc(4rem + env(safe-area-inset-bottom) + 300px)';
            }
        });

        document.addEventListener('focusout', () => {
            // Reset padding when keyboard is hidden
            document.body.style.paddingBottom = 'calc(4rem + env(safe-area-inset-bottom))';
        });
    }
};

// Initialize UI Handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UIHandler.init();
});

// Initialize mobile navigation
MobileNavHandler.init();

// Handle resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        MobileNavHandler.checkMobileNavVisibility();
    }, 250);
}, { passive: true }); 