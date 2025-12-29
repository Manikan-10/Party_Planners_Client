/* ============================================
   Party Planners Global - JavaScript
   ============================================ */

// Scroll to top on page load/reload
window.addEventListener('load', function () {
    // Force scroll to top on reload
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initNavigation();
    initSmoothScroll();
    initScrollAnimations();
    initContactForm();
    initBookingForm();
    initFileUpload();
    initScrollSpy();
    initFormValidation();
    initFormCache(); // Add form caching
    initDynamicContent(); // Load admin-editable content
    loadReviewsFromSupabase(); // Load reviews from Supabase
    // Load gallery from Supabase so admin uploads show on the homepage
    if (typeof window.loadGalleryFromSupabase === 'function') {
        window.loadGalleryFromSupabase();
    }

    // Update gallery when admin uploads - custom event from same window
    window.addEventListener('galleryUpdated', () => {
        console.log('📸 Gallery update detected (custom event)');
        if (typeof window.loadGalleryFromSupabase === 'function') {
            window.loadGalleryFromSupabase();
        }
    });

    // Also respond to localStorage changes from other tabs (e.g., admin saved content)
    window.addEventListener('storage', (e) => {
        if (e.key === 'website_content') {
            console.log('📸 Gallery update detected (storage event)');
            if (typeof window.loadGalleryFromSupabase === 'function') {
                window.loadGalleryFromSupabase();
            }
        }
    });
});

/* ============================================
   Navigation
   ============================================ */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        // Toggle icon
        const icon = navToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            const icon = navToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            const icon = navToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

/* ============================================
   Smooth Scroll
   ============================================ */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   Scroll Spy - Active Navigation Link
   ============================================ */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Initial call
}

/* ============================================
   Enhanced Scroll Animations (Professional)
   ============================================ */
function initScrollAnimations() {
    // Add animation classes to elements
    const serviceCards = document.querySelectorAll('.service-card');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const contactCards = document.querySelectorAll('.contact-card');
    const sectionHeaders = document.querySelectorAll('.section-header');
    const aboutContent = document.querySelector('.about-content');
    const aboutImage = document.querySelector('.about-image');
    const statItems = document.querySelectorAll('.stat-item');
    const bookingFormWrapper = document.querySelector('.booking-form-wrapper');
    const contactFormWrapper = document.querySelector('.contact-form-wrapper');

    // Add animation classes with staggered delays
    serviceCards.forEach((card, index) => {
        card.classList.add('animate-on-scroll', `stagger-${(index % 6) + 1}`);
    });

    galleryItems.forEach((item, index) => {
        item.classList.add('animate-scale', `stagger-${(index % 6) + 1}`);
    });

    contactCards.forEach((card, index) => {
        card.classList.add('animate-slide-left', `stagger-${(index % 3) + 1}`);
    });

    sectionHeaders.forEach(header => {
        header.classList.add('animate-on-scroll');
    });

    if (aboutContent) aboutContent.classList.add('animate-slide-left');
    if (aboutImage) aboutImage.classList.add('animate-slide-right');
    if (bookingFormWrapper) bookingFormWrapper.classList.add('animate-on-scroll');
    if (contactFormWrapper) contactFormWrapper.classList.add('animate-slide-right');

    // Create IntersectionObserver for scroll animations (repeating)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
            } else {
                // Remove animation class when out of view for repeat effect
                entry.target.classList.remove('animate-visible');
            }
        });
    }, {
        threshold: 0.01,
        rootMargin: '0px 0px -60px 0px'
    });

    // Observe all animated elements
    const animatedElements = document.querySelectorAll(
        '.animate-on-scroll, .animate-slide-left, .animate-slide-right, .animate-scale'
    );
    animatedElements.forEach(el => observer.observe(el));

    // Hero section reveal animation
    initHeroAnimation();

    // Stats counter animation
    initStatsAnimation(statItems);

    // Scroll progress indicator
    initScrollProgress();
}

/* ============================================
   Hero Animation
   ============================================ */
function initHeroAnimation() {
    const hero = document.querySelector('.hero');
    if (hero) {
        // Trigger hero animation after page load
        setTimeout(() => {
            hero.classList.add('hero-loaded');
        }, 100);
    }
}

/* ============================================
   Stats Counter Animation
   ============================================ */
function initStatsAnimation(statItems) {
    if (!statItems.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');

                // Animate counter numbers
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber) {
                    animateCounter(statNumber);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statItems.forEach(item => observer.observe(item));
}

function animateCounter(element) {
    const text = element.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;

    const target = parseInt(match[0]);
    const suffix = text.replace(match[0], '');
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

/* ============================================
   Scroll Progress Indicator
   ============================================ */
function initScrollProgress() {
    // Create scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.width = '0%';
    document.body.appendChild(progressBar);

    // Update progress on scroll
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
}

/* ============================================
   Contact Form
   ============================================ */
function initContactForm() {
    const form = document.getElementById('contact-form');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Validate
            if (!validateForm(data, ['name', 'email', 'message'])) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            if (!validateEmail(data.email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }

            // Simulate form submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Perform API call
            setTimeout(async () => {
                console.log('Contact Form Data:', data);
                let success = true;

                // Save to Supabase
                if (typeof saveContactToSupabase === 'function') {
                    try {
                        const result = await saveContactToSupabase(data);
                        if (!result) {
                            success = false;
                        }
                    } catch (error) {
                        console.error('Failed to save contact:', error);
                        success = false;
                    }
                }

                if (success) {
                    showToast('Message sent successfully! We\'ll get back to you soon.');
                    form.reset();
                } else {
                    showToast('Failed to send message. Please try again.', 'error');
                }

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 500);
        });
    }
}

/* ============================================
   Booking Form
   ============================================ */
function initBookingForm() {
    const form = document.getElementById('booking-form');

    if (form) {
        // Set minimum date to today
        const dateInput = document.getElementById('event-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Required fields validation
            const requiredFields = ['eventTitle', 'eventDate', 'eventTime', 'address', 'familyMembers'];
            if (!validateForm(data, requiredFields)) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            // Get file if uploaded
            const fileInput = document.getElementById('home-photo');
            const file = fileInput.files[0];

            // Simulate form submission
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            // Perform API call
            setTimeout(async () => {
                console.log('Booking Form Data:', data);
                let success = true;

                // If file and Supabase configured, upload file
                if (file && typeof uploadFileToSupabase === 'function') {
                    try {
                        const fileUrl = await uploadFileToSupabase(file, 'home-photos');
                        data.homePhotoUrl = fileUrl;
                        console.log('File uploaded:', fileUrl);
                    } catch (error) {
                        console.error('File upload error:', error);
                        // We'll continue even if photo fails, or you can set success = false
                    }
                }

                // If Supabase is configured, save booking
                if (typeof saveBookingToSupabase === 'function') {
                    try {
                        const result = await saveBookingToSupabase(data);
                        if (!result) success = false;
                    } catch (err) {
                        success = false;
                    }
                }

                if (success) {
                    showToast('Booking request submitted! We\'ll contact you within 24 hours.');
                    form.reset();
                    resetFileUpload(false);
                } else {
                    showToast('Failed to submit booking. Please try again.', 'error');
                }

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 500);
        });
    }
}

/* ============================================
   File Upload
   ============================================ */
function initFileUpload() {
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('home-photo');
    const filePreview = document.getElementById('file-preview');
    const previewImage = document.getElementById('preview-image');
    const removeFileBtn = document.getElementById('remove-file');
    const uploadContent = document.getElementById('upload-content');

    if (!fileUploadArea || !fileInput) return;

    // Hide file input visually but keep it functional
    fileInput.style.display = 'none';

    // Click to upload - but not if clicking remove button
    fileUploadArea.addEventListener('click', function (e) {
        // Don't trigger upload if clicking on remove button or preview
        if (e.target.closest('.remove-file') || e.target.closest('.file-preview')) {
            return;
        }
        fileInput.click();
    });

    // Drag and drop
    fileUploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'var(--accent-pink)';
        fileUploadArea.style.background = 'rgba(255, 20, 147, 0.1)';
    });

    fileUploadArea.addEventListener('dragleave', function (e) {
        e.preventDefault();
        fileUploadArea.style.borderColor = '';
        fileUploadArea.style.background = '';
    });

    fileUploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        fileUploadArea.style.borderColor = '';
        fileUploadArea.style.background = '';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            handleFileSelect(this.files[0]);
        }
    });

    // Remove file button - attach directly
    if (removeFileBtn) {
        removeFileBtn.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            resetFileUpload();
            return false;
        };
    }

    function handleFileSelect(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            fileInput.value = '';
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            showToast('File size must be less than 10MB', 'error');
            fileInput.value = '';
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            if (uploadContent) uploadContent.style.display = 'none';
            if (filePreview) filePreview.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    }
}

function resetFileUpload(showNotification = true) {
    const fileInput = document.getElementById('home-photo');
    const filePreview = document.getElementById('file-preview');
    const uploadContent = document.getElementById('upload-content');
    const previewImage = document.getElementById('preview-image');

    // Clear the file input
    if (fileInput) {
        fileInput.value = '';
        // For older browsers
        fileInput.type = '';
        fileInput.type = 'file';
    }

    // Clear preview image
    if (previewImage) {
        previewImage.src = '';
    }

    // Show upload content, hide preview
    if (filePreview) filePreview.style.display = 'none';
    if (uploadContent) uploadContent.style.display = 'flex';

    // Only show toast when user manually removes photo
    if (showNotification) {
        showToast('Photo removed');
    }
}

/* ============================================
   Form Validation
   ============================================ */
function initFormValidation() {
    // Phone number validation - only allow digits, spaces, +, -, ()
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function () {
            // Remove any non-phone characters
            this.value = this.value.replace(/[^0-9+\-() ]/g, '');
        });

        input.addEventListener('blur', function () {
            // Validate phone format on blur
            const phonePattern = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
            if (this.value && !phonePattern.test(this.value.replace(/\s/g, ''))) {
                this.classList.add('input-error');
                showToast('Please enter a valid phone number', 'error');
            } else {
                this.classList.remove('input-error');
            }
        });
    });

    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function () {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailPattern.test(this.value)) {
                this.classList.add('input-error');
                showToast('Please enter a valid email address', 'error');
            } else {
                this.classList.remove('input-error');
            }
        });
    });

    // Date validation - no past dates for event booking
    const dateInput = document.getElementById('event-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);

        dateInput.addEventListener('change', function () {
            if (this.value < today) {
                this.classList.add('input-error');
                showToast('Event date cannot be in the past', 'error');
                this.value = '';
            } else {
                this.classList.remove('input-error');
            }
        });
    }

    // Gate code - alphanumeric only
    const gateCodeInput = document.getElementById('gate-code');
    if (gateCodeInput) {
        gateCodeInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^a-zA-Z0-9#*]/g, '');
        });
    }
}

/* ============================================
   Validation Helpers
   ============================================ */
function validateForm(data, requiredFields) {
    return requiredFields.every(field => {
        const value = data[field];
        return value && value.toString().trim() !== '';
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/* ============================================
   Toast Notification
   ============================================ */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('i');

    toastMessage.textContent = message;

    // Set icon based on type
    toastIcon.className = type === 'error'
        ? 'fas fa-exclamation-circle'
        : 'fas fa-check-circle';

    // Set background based on type
    toast.style.background = type === 'error'
        ? 'linear-gradient(135deg, #ff4757, #ff6b6b)'
        : 'linear-gradient(135deg, var(--accent-pink), var(--accent-coral))';

    // Show toast
    toast.classList.add('show');

    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

/* ============================================
   Gallery Lightbox (Optional Enhancement)
   ============================================ */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', function () {
            // If there's actual content to show
            const img = this.querySelector('img');
            const video = this.querySelector('video');

            if (img || video) {
                // Create lightbox
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';
                lightbox.innerHTML = `
                    <div class="lightbox-content">
                        <button class="lightbox-close"><i class="fas fa-times"></i></button>
                        ${img ? `<img src="${img.src}" alt="${img.alt}">` : ''}
                        ${video ? `<video src="${video.src}" controls autoplay></video>` : ''}
                    </div>
                `;

                document.body.appendChild(lightbox);

                // Close on click
                lightbox.addEventListener('click', function (e) {
                    if (e.target === lightbox || e.target.closest('.lightbox-close')) {
                        lightbox.remove();
                    }
                });
            }
        });
    });
}

/* ============================================
   Parallax Effect (Optional Enhancement)
   ============================================ */
function initParallax() {
    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const heroBg = document.querySelector('.hero-bg');

        if (heroBg) {
            heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });
}

/* ============================================
   Form Data Caching (localStorage)
   ============================================ */
function initFormCache() {
    const contactForm = document.getElementById('contact-form');
    const bookingForm = document.getElementById('booking-form');

    // Cache keys
    const CONTACT_CACHE_KEY = 'party_planners_contact_form';
    const BOOKING_CACHE_KEY = 'party_planners_booking_form';

    // Initialize contact form caching
    if (contactForm) {
        loadFormData(contactForm, CONTACT_CACHE_KEY);
        setupFormCaching(contactForm, CONTACT_CACHE_KEY);

        // Clear cache on successful submission
        contactForm.addEventListener('submit', function () {
            setTimeout(() => clearFormCache(CONTACT_CACHE_KEY), 2000);
        });
    }

    // Initialize booking form caching
    if (bookingForm) {
        loadFormData(bookingForm, BOOKING_CACHE_KEY);
        setupFormCaching(bookingForm, BOOKING_CACHE_KEY);

        // Clear cache on successful submission
        bookingForm.addEventListener('submit', function () {
            setTimeout(() => clearFormCache(BOOKING_CACHE_KEY), 2500);
        });
    }

    // Save form data before page unloads (when page goes to sleep)
    window.addEventListener('beforeunload', function () {
        if (contactForm) saveFormData(contactForm, CONTACT_CACHE_KEY);
        if (bookingForm) saveFormData(bookingForm, BOOKING_CACHE_KEY);
    });

    // Also save when page visibility changes (tab switches, phone sleep)
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            if (contactForm) saveFormData(contactForm, CONTACT_CACHE_KEY);
            if (bookingForm) saveFormData(bookingForm, BOOKING_CACHE_KEY);
        }
    });
}

function setupFormCaching(form, cacheKey) {
    // Get all input elements
    const inputs = form.querySelectorAll('input, textarea, select');

    // Save on every input change with debouncing
    let saveTimeout;
    inputs.forEach(input => {
        // Skip file inputs
        if (input.type === 'file') return;

        input.addEventListener('input', function () {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveFormData(form, cacheKey);
            }, 500); // Debounce: save 500ms after user stops typing
        });

        input.addEventListener('change', function () {
            saveFormData(form, cacheKey);
        });
    });
}

function saveFormData(form, cacheKey) {
    try {
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            // Skip file inputs
            if (value instanceof File) return;
            data[key] = value;
        });

        // Only save if there's actual data
        if (Object.keys(data).length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        }
    } catch (error) {
        console.warn('Could not save form data:', error);
    }
}

function loadFormData(form, cacheKey) {
    try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return;

        const { data, timestamp } = JSON.parse(cached);

        // Check if cache is less than 24 hours old
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - timestamp > maxAge) {
            clearFormCache(cacheKey);
            return;
        }

        // Restore form data
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && input.type !== 'file') {
                input.value = data[key];
            }
        });

        console.log('Form data restored from cache');
    } catch (error) {
        console.warn('Could not load form data:', error);
    }
}

/**
 * Initialize Gallery Slideshows
 * Automatically cycles through images in gallery items with the .slideshow class
 */
function initGallerySlideshows() {
    const slideshows = document.querySelectorAll('.gallery-item.slideshow');

    slideshows.forEach(slideshow => {
        const items = slideshow.querySelectorAll('img, .gallery-placeholder');
        const interval = parseInt(slideshow.dataset.interval) || 3000;
        let currentIndex = 0;

        if (items.length <= 1) return;

        setInterval(() => {
            // Remove active class from current item
            items[currentIndex].classList.remove('active');

            // Move to next index
            currentIndex = (currentIndex + 1) % items.length;

            // Add active class to new item
            items[currentIndex].classList.add('active');
        }, interval);
    });
}

function clearFormCache(cacheKey) {
    try {
        localStorage.removeItem(cacheKey);
    } catch (error) {
        console.warn('Could not clear form cache:', error);
    }
}

// Initialize optional enhancements
document.addEventListener('DOMContentLoaded', function () {
    initGalleryLightbox();
    initGallerySlideshows();
    // initParallax(); // Uncomment if parallax effect is desired
});

/* ============================================
   Dynamic Content Loading (Admin CMS)
   ============================================ */
function initDynamicContent() {
    try {
        const storedContent = localStorage.getItem('website_content');
        if (!storedContent) return; // No custom content, use defaults

        const content = JSON.parse(storedContent);

        // Apply Hero Section
        if (content.hero) {
            const heroBadge = document.querySelector('.hero-badge');
            const heroTitle = document.querySelector('.hero-title .gradient-text');
            const heroSubtitle = document.querySelector('.hero-title .hero-subtitle');
            const heroTagline = document.querySelector('.hero-tagline');
            const heroDescription = document.querySelector('.hero-description');

            if (heroBadge && content.hero.badge) {
                heroBadge.innerHTML = `<i class="fas fa-star"></i> ${content.hero.badge}`;
            }
            if (heroTitle && content.hero.title) heroTitle.textContent = content.hero.title;
            if (heroSubtitle && content.hero.subtitle) heroSubtitle.textContent = content.hero.subtitle;
            if (heroTagline && content.hero.tagline) heroTagline.textContent = content.hero.tagline;
            if (heroDescription && content.hero.description) heroDescription.textContent = content.hero.description;
        }

        // Apply About Section
        if (content.about) {
            const aboutLead = document.querySelector('.about-lead');
            const aboutTexts = document.querySelectorAll('.about-text');
            const aboutImg = document.querySelector('.about-img');

            if (aboutLead && content.about.lead) aboutLead.textContent = content.about.lead;
            if (aboutTexts[0] && content.about.text1) aboutTexts[0].textContent = content.about.text1;
            if (aboutTexts[1] && content.about.text2) aboutTexts[1].textContent = content.about.text2;
            if (aboutImg && content.about.image) aboutImg.src = content.about.image;
        }

        // Apply Services Section
        if (content.services && Array.isArray(content.services)) {
            const serviceCards = document.querySelectorAll('.service-card');
            content.services.forEach((service, index) => {
                if (serviceCards[index]) {
                    const titleEl = serviceCards[index].querySelector('.service-title');
                    const descEl = serviceCards[index].querySelector('.service-description');
                    if (titleEl && service.title) titleEl.textContent = service.title;
                    if (descEl && service.desc) descEl.textContent = service.desc;
                }
            });
        }

        // Apply Contact Section
        if (content.contact) {
            // Update phone links
            const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
            if (content.contact.phone) {
                const phoneClean = content.contact.phone.replace(/\s/g, '');
                phoneLinks.forEach(link => {
                    link.href = `tel:${phoneClean}`;
                    if (link.closest('.contact-card-content') || link.closest('.footer-contact')) {
                        link.textContent = content.contact.phone;
                    }
                });
            }

            // Update email links
            const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
            if (content.contact.email) {
                emailLinks.forEach(link => {
                    link.href = `mailto:${content.contact.email}`;
                    if (link.closest('.contact-card-content') || link.closest('.footer-contact')) {
                        link.textContent = content.contact.email;
                    }
                });
            }

            // Update Instagram links
            const instagramLinks = document.querySelectorAll('a[href*="instagram.com"]');
            if (content.contact.instagramUrl) {
                instagramLinks.forEach(link => {
                    link.href = content.contact.instagramUrl;
                    if (link.closest('.contact-card-content') || link.closest('.footer-contact')) {
                        const textNode = link.querySelector('span') || link;
                        if (content.contact.instagram && !link.querySelector('i:only-child')) {
                            // Update display text but not icon-only links
                            if (link.closest('.contact-card-content')) {
                                link.textContent = content.contact.instagram;
                            }
                        }
                    }
                });
            }

            // Update YouTube links  
            const youtubeLinks = document.querySelectorAll('a[href*="youtube.com"]');
            if (content.contact.youtube) {
                youtubeLinks.forEach(link => {
                    link.href = content.contact.youtube;
                });
            }
        }

        // ===== GALLERY SECTION =====
        // Note: Gallery is now managed exclusively by loadGalleryFromSupabase() in supabase-config.js
        // to prevent duplicate images. Admin-uploaded images from Supabase storage are the only source.
        // The old localStorage-based gallery loading has been disabled.

        console.log('Dynamic content loaded successfully');
    } catch (error) {
        console.warn('Could not load dynamic content:', error);
    }
}

/* ============================================
   Load Reviews from Supabase
   ============================================ */
async function loadReviewsFromSupabase() {
    const testimonialsGrid = document.getElementById('testimonials-grid');
    if (!testimonialsGrid) return;

    // Wait for Supabase to initialize
    if (!window.supabaseClient && !window.fetchReviews) {
        setTimeout(loadReviewsFromSupabase, 500);
        return;
    }

    try {
        const reviews = await window.fetchReviews();

        if (!reviews || reviews.length === 0) {
            testimonialsGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">No reviews yet. Be the first to review us!</p>';
            return;
        }

        testimonialsGrid.innerHTML = reviews.map(r => {
            // Get event images
            const eventImages = [r.image_url_1, r.image_url_2, r.image_url_3].filter(url => url);
            
            return `
            <div class="testimonial-card">
                <div class="testimonial-header">
                    ${r.photo_url
                ? `<img src="${r.photo_url}" alt="${r.name}" class="testimonial-avatar">`
                : `<div class="testimonial-avatar-placeholder">${r.name.charAt(0)}</div>`
            }
                    <div class="testimonial-info">
                        <h4>${r.name}</h4>
                        ${r.location ? `<p class="testimonial-location"><i class="fas fa-map-marker-alt"></i> ${r.location}</p>` : ''}
                        <div class="testimonial-rating">
                            ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                        </div>
                    </div>
                </div>
                <div class="testimonial-text">
                    "${r.review_text}"
                </div>
                ${eventImages.length > 0 ? `
                <div class="testimonial-images">
                    ${eventImages.map(url => `
                        <div class="testimonial-image-item">
                            <img src="${url}" alt="Event photo" onclick="window.open('${url}', '_blank')">
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                <div class="testimonial-date">
                    <i class="far fa-clock"></i> ${formatReviewDate(r.created_at)}
                </div>
            </div>
        `;
        }).join('');

        // Initialize scroll navigation
        initTestimonialsScroll();

    } catch (error) {
        console.error('Error loading reviews:', error);
        testimonialsGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">Failed to load reviews.</p>';
    }
}

// Initialize testimonials horizontal scroll navigation
function initTestimonialsScroll() {
    const scrollContainer = document.getElementById('testimonials-grid');
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');

    if (!scrollContainer || !leftBtn || !rightBtn) return;

    const scrollAmount = 400; // Pixels to scroll on each click

    leftBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    rightBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Show/hide buttons based on scroll position
    function updateButtons() {
        const isAtStart = scrollContainer.scrollLeft <= 10;
        const isAtEnd = scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 10;

        leftBtn.style.opacity = isAtStart ? '0.3' : '1';
        leftBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
        
        rightBtn.style.opacity = isAtEnd ? '0.3' : '1';
        rightBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
    }

    scrollContainer.addEventListener('scroll', updateButtons);
    updateButtons(); // Initial check

    // Add keyboard navigation
    scrollContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
            scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });
}

// Helper function to format review date
function formatReviewDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
}
