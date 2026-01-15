/* ===================================
   Global Logistics Consultancy - Main JS
   =================================== */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // ===================================
    // Mobile Navigation Toggle
    // ===================================
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');

    // Add mobile menu button if on small screen
    if (window.innerWidth <= 768 && navMenu) {
        addMobileMenuToggle();
    }

    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768 && navMenu && !document.querySelector('.mobile-menu-toggle')) {
            addMobileMenuToggle();
        }
    });

    function addMobileMenuToggle() {
        const menuButton = document.createElement('button');
        menuButton.className = 'mobile-menu-toggle';
        menuButton.innerHTML = '☰';
        menuButton.setAttribute('aria-label', 'Toggle navigation menu');

        const logo = document.querySelector('.logo');
        if (logo && !document.querySelector('.mobile-menu-toggle')) {
            logo.parentNode.insertBefore(menuButton, navMenu);

            menuButton.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                menuButton.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
            });
        }
    }

    // ===================================
    // Dropdown Navigation
    // ===================================
    const dropdowns = document.querySelectorAll('.dropdown');
    const dropdownSubmenus = document.querySelectorAll('.dropdown-submenu');

    // Main dropdown functionality
    dropdowns.forEach(function(dropdown) {
        const toggle = dropdown.querySelector(':scope > .dropdown-toggle');
        const menu = dropdown.querySelector(':scope > .dropdown-menu');

        if (toggle && menu) {
            // Prevent default link behavior for dropdown toggles
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Close other main dropdowns
                dropdowns.forEach(function(otherDropdown) {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                    }
                });

                // Toggle current dropdown
                dropdown.classList.toggle('active');
            });
        }
    });

    // Submenu functionality
    dropdownSubmenus.forEach(function(submenu) {
        const toggle = submenu.querySelector(':scope > .dropdown-toggle');
        const nestedMenu = submenu.querySelector('.dropdown-menu-nested');

        if (toggle && nestedMenu) {
            // Prevent default link behavior for submenu toggles
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Close other submenus in the same parent menu
                const parentMenu = submenu.closest('.dropdown-menu');
                if (parentMenu) {
                    const siblingSubmenus = parentMenu.querySelectorAll('.dropdown-submenu');
                    siblingSubmenus.forEach(function(sibling) {
                        if (sibling !== submenu) {
                            sibling.classList.remove('active');
                        }
                    });
                }

                // Toggle current submenu
                submenu.classList.toggle('active');
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown') && !e.target.closest('.dropdown-submenu')) {
            dropdowns.forEach(function(dropdown) {
                dropdown.classList.remove('active');
            });
            dropdownSubmenus.forEach(function(submenu) {
                submenu.classList.remove('active');
            });
        }
    });

    // Close dropdowns on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdowns.forEach(function(dropdown) {
                dropdown.classList.remove('active');
            });
            dropdownSubmenus.forEach(function(submenu) {
                submenu.classList.remove('active');
            });
        }
    });

    // ===================================
    // Contact Form Handling
    // ===================================
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                company: document.getElementById('company').value,
                phone: document.getElementById('phone').value,
                service: document.getElementById('service').value,
                message: document.getElementById('message').value
            };

            // Validate form
            if (!formData.name || !formData.email || !formData.message) {
                showFormMessage('Please fill in all required fields.', 'error');
                return;
            }

            if (!isValidEmail(formData.email)) {
                showFormMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate form submission (in production, this would send to a server)
            submitForm(formData);
        });
    }

    function submitForm(formData) {
        // Disable submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        // Simulate API call
        setTimeout(function() {
            // In production, you would send this data to your server
            console.log('Form data:', formData);

            // Show success message
            showFormMessage('Thank you for your message! We will get back to you within 24 hours.', 'success');

            // Reset form
            contactForm.reset();

            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }, 1500);
    }

    function showFormMessage(message, type) {
        if (!formMessage) return;

        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;

        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Hide message after 5 seconds for error, keep success visible
        if (type === 'error') {
            setTimeout(function() {
                formMessage.className = 'form-message';
            }, 5000);
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ===================================
    // Smooth Scroll for Anchor Links
    // ===================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Only handle links with actual hash targets
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ===================================
    // Navbar Scroll Effect
    // ===================================
    let lastScroll = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        // Add shadow when scrolled
        if (currentScroll > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // ===================================
    // Fade-in Animation on Scroll
    // ===================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should fade in
    const fadeElements = document.querySelectorAll('.feature-card, .service-item, .team-member, .value-item, .process-step');
    fadeElements.forEach(function(el) {
        observer.observe(el);
    });

    // ===================================
    // Form Input Animation
    // ===================================
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');

    formInputs.forEach(function(input) {
        // Add focus class to parent on focus
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        // Remove focus class on blur if empty
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });

        // Keep focused class if input has value on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });

    // ===================================
    // Current Year in Footer
    // ===================================
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.textContent = footerYear.textContent.replace(/\d{4}/, currentYear);
    }

    // ===================================
    // Add loading animation
    // ===================================
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // ===================================
    // Console message
    // ===================================
    console.log('%cGlobalLogistics Website', 'color: #1e3a8a; font-size: 20px; font-weight: bold;');
    console.log('%cWelcome! This site is built with vanilla HTML, CSS, and JavaScript.', 'color: #6b7280; font-size: 12px;');
});

// ===================================
// Utility Functions
// ===================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
