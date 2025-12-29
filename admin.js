/**
 * Admin Dashboard Logic - Party Planners Global
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const loginOverlay = document.getElementById('login-overlay');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginError = document.getElementById('login-error');

    // --- Password Visibility Toggle ---
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('admin-pass');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            // Toggle the type attribute
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle the icon
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Simple Admin Credentials (As requested by user)
    const ADMIN_ID = "admin";
    const ADMIN_PASS = "party123";

    // --- Login Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('admin-id').value;
            const pass = document.getElementById('admin-pass').value;

            if (id === ADMIN_ID && pass === ADMIN_PASS) {
                // Success
                loginOverlay.style.display = 'none';
                adminDashboard.style.display = 'block';
                localStorage.setItem('admin_logged_in', 'true');

                // --- FIX: Clear the form inputs immediately ---
                document.getElementById('admin-id').value = '';
                document.getElementById('admin-pass').value = '';
                loginError.style.display = 'none';

                loadDashboardData();
                showAdminToast("Logged in successfully!");
            } else {
                loginError.style.display = 'block';
                showAdminToast("Invalid Admin ID or Password", true);
            }
        });
    }

    // Check session
    if (localStorage.getItem('admin_logged_in') === 'true') {
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'block';
        loadDashboardData();
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('admin_logged_in');
            window.location.reload();
        });
    }

    // --- Tab Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // --- Refresh Button Handlers ---
    const refreshContactsBtn = document.getElementById('refresh-contacts');
    const refreshBookingsBtn = document.getElementById('refresh-bookings');

    if (refreshContactsBtn) {
        refreshContactsBtn.addEventListener('click', () => {
            fetchContacts(false); // Show notifications
        });
    }

    if (refreshBookingsBtn) {
        refreshBookingsBtn.addEventListener('click', () => {
            fetchBookings(false); // Show notifications
        });
    }

    // --- Data Fetching Logic ---
    async function loadDashboardData(silent = true) {
        console.log("Fetching dashboard data...");
        await Promise.all([
            fetchContacts(silent),
            fetchBookings(silent),
            fetchReviews(silent)
        ]);
    }

    async function fetchContacts(silent = false) {
        if (!window.supabaseClient) {
            if (!silent) showAdminToast("Supabase not initialized", true);
            return;
        }

        if (!silent) showAdminToast("Refreshing contacts...");
        try {
            const { data, error } = await window.supabaseClient
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            renderContacts(data);
            if (!silent) showAdminToast("Contacts updated!");
        } catch (err) {
            console.error("Error fetching contacts:", err);
            if (!silent) showAdminToast("Failed to load contacts", true);
        }
    }

    async function fetchBookings(silent = false) {
        if (!window.supabaseClient) {
            if (!silent) showAdminToast("Supabase not initialized", true);
            return;
        }

        if (!silent) showAdminToast("Refreshing bookings...");
        try {
            const { data, error } = await window.supabaseClient
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            renderBookings(data);
            if (!silent) showAdminToast("Bookings updated!");
        } catch (err) {
            console.error("Error fetching bookings:", err);
            if (!silent) showAdminToast("Failed to load bookings", true);
        }
    }

    async function fetchReviews(silent = false) {
        if (!window.fetchReviews) {
            console.warn("fetchReviews function not found. Check supabase-config.js");
            return;
        }

        if (!silent) showAdminToast("Refreshing reviews...");
        try {
            const data = await window.fetchReviews();
            renderReviews(data);
            if (!silent) showAdminToast("Reviews updated!");
        } catch (err) {
            console.error("Error fetching reviews:", err);
            if (!silent) showAdminToast("Failed to load reviews", true);
        }
    }

    // --- Rendering Logic ---
    function renderContacts(contacts) {
        const tbody = document.getElementById('contacts-body');
        if (!tbody) return;

        if (contacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No inquiries found.</td></tr>';
            return;
        }

        tbody.innerHTML = contacts.map(c => `
        <tr>
            <td>${new Date(c.created_at).toLocaleString()}</td>
            <td>${escapeHtml(c.name)}</td>
            <td><a href="mailto:${c.email}">${escapeHtml(c.email)}</a></td>
            <td>${escapeHtml(c.phone || 'N/A')}</td>
            <td>${escapeHtml(c.subject || 'N/A')}</td>
            <td>${escapeHtml(c.message)}</td>
            <td>
                <button class="delete-btn" onclick="deleteContact('${c.id}')" title="Delete this inquiry">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    }

    function renderBookings(bookings) {
        const tbody = document.getElementById('bookings-body');
        if (!tbody) return;

        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No bookings found.</td></tr>';
            return;
        }

        tbody.innerHTML = bookings.map(b => `
        <tr>
            <td>${new Date(b.created_at).toLocaleString()}</td>
            <td>${escapeHtml(b.event_purpose || 'N/A')}</td>
            <td>${escapeHtml(b.event_type)}</td>
            <td>${escapeHtml(b.event_date)} at ${escapeHtml(b.event_time)}</td>
            <td>
                <strong>Address:</strong> ${escapeHtml(b.address)}<br>
                <strong>Event Title:</strong> ${escapeHtml(b.event_title_name || b.home_name || 'N/A')}<br>
                <strong>Gate:</strong> ${escapeHtml(b.gate_code || 'N/A')}
            </td>
            <td>
                <strong>Family:</strong> ${escapeHtml(b.family_members)}<br>
                <strong>Organizer:</strong> ${escapeHtml(b.organizer_name || b.pandit_details || 'N/A')}
            </td>
            <td>${escapeHtml(b.special_needs || 'None')}</td>
            <td>
                ${b.home_photo_url ? `<img src="${b.home_photo_url}" class="booking-photo" onclick="window.open('${b.home_photo_url}', '_blank')" title="View Full Image">` : 'No Photo'}
            </td>
            <td>
                <button class="delete-btn" onclick="deleteBooking('${b.id}')" title="Delete this booking">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    }

    function renderReviews(reviews) {
        const tbody = document.getElementById('reviews-body');
        if (!tbody) return;

        if (!reviews || reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No reviews found.</td></tr>';
            return;
        }

        tbody.innerHTML = reviews.map(r => {
            // Count event images
            const eventImages = [r.image_url_1, r.image_url_2, r.image_url_3].filter(url => url);
            const imagesHtml = eventImages.length > 0
                ? `<div style="display: flex; gap: 5px;">${eventImages.map(url => `<img src="${url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; cursor: pointer;" onclick="window.open('${url}', '_blank')">`).join('')}</div>`
                : 'No images';

            return `
        <tr>
            <td>${new Date(r.created_at).toLocaleDateString()}</td>
            <td>${escapeHtml(r.name)}</td>
            <td>${escapeHtml(r.location || 'N/A')}</td>
            <td>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
            <td style="max-width: 250px; white-space: normal;">${escapeHtml(r.review_text)}</td>
            <td>${imagesHtml}</td>
            <td>
                <button class="delete-btn" onclick="deleteReviewHandler('${r.id}')" title="Delete this review">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
        }).join('');
    }

    // --- Delete Logic ---
    async function deleteContact(id) {
        if (!confirm('Are you sure you want to delete this contact inquiry?')) return;
        if (!window.supabaseClient) {
            showAdminToast("Supabase not initialized", true);
            return;
        }

        showAdminToast("Deleting contact...");
        try {
            const { error } = await window.supabaseClient
                .from('contacts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            showAdminToast("Contact deleted successfully!");
            fetchContacts(true); // Refresh contacts silently
        } catch (err) {
            console.error("Error deleting contact:", err);
            showAdminToast("Failed to delete contact", true);
        }
    }

    async function deleteBooking(id) {
        if (!confirm('Are you sure you want to delete this booking?')) return;
        if (!window.supabaseClient) {
            showAdminToast("Supabase not initialized", true);
            return;
        }

        showAdminToast("Deleting booking...");
        try {
            const { error } = await window.supabaseClient
                .from('bookings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            showAdminToast("Booking deleted successfully!");
            fetchBookings(true); // Refresh bookings silently
        } catch (err) {
            console.error("Error deleting booking:", err);
            showAdminToast("Failed to delete booking", true);
        }
    }

    async function deleteReviewHandler(id) {
        if (!confirm('Are you sure you want to delete this review?')) return;

        showAdminToast("Deleting review...");
        try {
            const success = await window.deleteReview(id);
            if (success) {
                showAdminToast("Review deleted successfully!");
                fetchReviews(true);
            } else {
                throw new Error("Delete failed");
            }
        } catch (err) {
            console.error("Error deleting review:", err);
            showAdminToast("Failed to delete review", true);
        }
    }

    // Expose delete functions globally for onclick handlers
    window.deleteContact = deleteContact;
    window.deleteBooking = deleteBooking;
    window.deleteReviewHandler = deleteReviewHandler;

    // Refresh Buttons
    document.getElementById('refresh-contacts')?.addEventListener('click', () => fetchContacts());
    document.getElementById('refresh-bookings')?.addEventListener('click', () => fetchBookings());
    document.getElementById('refresh-reviews')?.addEventListener('click', () => fetchReviews());

    // Add Review Form Handler
    const addReviewForm = document.getElementById('add-review-form');
    const reviewImagesInput = document.getElementById('review-images');
    const reviewImagesPreview = document.getElementById('review-images-preview');

    // Preview event images
    if (reviewImagesInput) {
        reviewImagesInput.addEventListener('change', function() {
            reviewImagesPreview.innerHTML = '';
            const files = Array.from(this.files).slice(0, 3); // Max 3 images
            
            files.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const div = document.createElement('div');
                    div.className = 'gallery-preview-item';
                    div.innerHTML = `<img src="${e.target.result}" alt="Preview ${index + 1}">`;
                    reviewImagesPreview.appendChild(div);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    if (addReviewForm) {
        addReviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('review-name').value;
            const location = document.getElementById('review-location').value;
            const rating = document.getElementById('review-rating').value;
            const text = document.getElementById('review-text').value;
            const photoInput = document.getElementById('review-photo');
            const imagesInput = document.getElementById('review-images');

            showAdminToast("Adding review...");

            try {
                let photoUrl = null;
                if (photoInput.files.length > 0) {
                    photoUrl = await window.uploadFileToSupabase(photoInput.files[0], 'review-photos');
                }

                // Upload up to 3 event images
                const imageUrls = [null, null, null];
                if (imagesInput.files.length > 0) {
                    const files = Array.from(imagesInput.files).slice(0, 3);
                    for (let i = 0; i < files.length; i++) {
                        imageUrls[i] = await window.uploadFileToSupabase(files[i], 'review-photos');
                    }
                }

                const reviewData = {
                    name: name,
                    location: location,
                    rating: parseInt(rating),
                    review_text: text,
                    photo_url: photoUrl,
                    image_url_1: imageUrls[0],
                    image_url_2: imageUrls[1],
                    image_url_3: imageUrls[2]
                };

                await window.addReview(reviewData);

                showAdminToast("Review added successfully!");
                addReviewForm.reset();
                reviewImagesPreview.innerHTML = '';
                fetchReviews(true);
            } catch (err) {
                console.error("Error adding review:", err);
                showAdminToast("Failed to add review", true);
            }
        });
    }

    // Helper: Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return "";
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Helper: Show Toast
    function showAdminToast(message, isError = false) {
        const toast = document.getElementById('admin-toast');
        const text = document.getElementById('toast-text');
        if (!toast || !text) return;

        text.textContent = message;
        toast.style.background = isError ? 'rgba(255, 77, 77, 0.9)' : 'rgba(45, 27, 78, 0.9)';
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ============================================
    // WEB CONTENT MANAGEMENT FUNCTIONALITY
    // ============================================

    // Default website content
    const defaultContent = {
        hero: {
            badge: 'Premium Event Services',
            title: 'Party Planners',
            subtitle: 'Global',
            tagline: 'We Capture Moments',
            description: 'Transform your special occasions into timeless memories. We specialize in photography, videography, and event promotions that tell your unique story.'
        },
        about: {
            lead: 'Party Planners Global is an Event Promoter and Entertainment company where we organize events and create them digitally through Video and Photos.',
            text1: 'We love to travel the world and share our experiences with you. We love documenting our journey and travels through our videos. We also share our experiences in Travel, Videography, Food, Adventure, Health, Fitness, Reviews, and things of interest in life.',
            text2: 'We hope you guys will enjoy watching the wonderful experiences that we capture. Our team of dedicated professionals ensures every moment is preserved with the highest quality and artistic vision.',
            image: 'gallery/about_us.png'
        },
        services: [
            { title: 'Photography', desc: 'Professional photography for all occasions - weddings, parties, corporate events, and more. Every shot tells a story.' },
            { title: 'Videography', desc: 'Cinematic video production that captures the essence of your events with stunning visuals and professional editing.' },
            { title: 'Event Promotions', desc: 'Strategic event promotion and marketing to ensure maximum reach and engagement for your special occasions.' },
            { title: 'Promo Video Creation', desc: 'Creative promotional videos that showcase your brand, event, or product with compelling storytelling.' },
            { title: 'Photo Editing', desc: 'Professional photo retouching and editing services to enhance your images to perfection.' },
            { title: 'Film Making', desc: 'Full-scale film production from concept to delivery, including documentaries, short films, and more.' },
            { title: 'Business Branding', desc: 'Elevate your business identity with our comprehensive branding services including logo design, website development, and social media presence.' }
        ],
        contact: {
            phone: '+1 98 96 90 1234',
            email: 'PartyPlannersGlobal@gmail.com',
            instagram: '@GlobalPartyPlanners',
            instagramUrl: 'https://www.instagram.com/GlobalPartyPlanners',
            youtube: 'https://www.youtube.com/c/Madras2Mumbai'
        },
        gallery: {
            wedding: 'gallery/wedding_1.jpg, gallery/wedding_2.jpg, gallery/wedding_3.jpg, gallery/wedding_4.jpg',
            housewarming: 'gallery/house_warming_1.jpg, gallery/house_warming_2.jpg, gallery/house_warming_3.jpg, gallery/house_warming_4.jpg, gallery/house_warming_5.jpg',
            birthday: '',
            corporate: ''
        }
    };

    // --- Sub-tab Navigation ---
    const subtabBtns = document.querySelectorAll('.subtab-btn');
    const subtabContents = document.querySelectorAll('.subtab-content');

    subtabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const subtabId = btn.getAttribute('data-subtab');

            subtabBtns.forEach(b => b.classList.remove('active'));
            subtabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${subtabId}-subtab`).classList.add('active');
        });
    });

    // --- Load Content from localStorage ---
    function loadWebsiteContent() {
        const storedContent = localStorage.getItem('website_content');
        const content = storedContent ? JSON.parse(storedContent) : defaultContent;

        // Load Hero Section
        if (content.hero) {
            const heroBadge = document.getElementById('hero-badge');
            const heroTitle = document.getElementById('hero-title');
            const heroSubtitle = document.getElementById('hero-subtitle');
            const heroTagline = document.getElementById('hero-tagline');
            const heroDesc = document.getElementById('hero-description');

            if (heroBadge) heroBadge.value = content.hero.badge || '';
            if (heroTitle) heroTitle.value = content.hero.title || '';
            if (heroSubtitle) heroSubtitle.value = content.hero.subtitle || '';
            if (heroTagline) heroTagline.value = content.hero.tagline || '';
            if (heroDesc) heroDesc.value = content.hero.description || '';
        }

        // Load About Section
        if (content.about) {
            const aboutLead = document.getElementById('about-lead');
            const aboutText1 = document.getElementById('about-text1');
            const aboutText2 = document.getElementById('about-text2');
            const aboutImage = document.getElementById('about-image');
            const aboutPreviewImg = document.getElementById('about-preview-img');
            const aboutPreview = document.getElementById('about-upload-preview');
            const aboutPlaceholder = document.getElementById('about-upload-placeholder');

            if (aboutLead) aboutLead.value = content.about.lead || '';
            if (aboutText1) aboutText1.value = content.about.text1 || '';
            if (aboutText2) aboutText2.value = content.about.text2 || '';
            if (aboutImage) aboutImage.value = content.about.image || '';

            // Reset image preview
            if (aboutPreview && aboutPlaceholder) {
                aboutPreview.style.display = 'none';
                aboutPlaceholder.style.display = 'flex';
                if (aboutPreviewImg) aboutPreviewImg.src = '';
            }
        }

        // Load Services
        if (content.services) {
            content.services.forEach((service, i) => {
                const titleEl = document.getElementById(`service${i + 1}-title`);
                const descEl = document.getElementById(`service${i + 1}-desc`);
                if (titleEl) titleEl.value = service.title || '';
                if (descEl) descEl.value = service.desc || '';
            });
        }

        // Load Contact
        if (content.contact) {
            const contactPhone = document.getElementById('contact-phone');
            const contactEmail = document.getElementById('contact-email-admin');
            const contactInstagram = document.getElementById('contact-instagram');
            const contactInstagramUrl = document.getElementById('contact-instagram-url');
            const contactYoutube = document.getElementById('contact-youtube');

            if (contactPhone) contactPhone.value = content.contact.phone || '';
            if (contactEmail) contactEmail.value = content.contact.email || '';
            if (contactInstagram) contactInstagram.value = content.contact.instagram || '';
            if (contactInstagramUrl) contactInstagramUrl.value = content.contact.instagramUrl || '';
            if (contactYoutube) contactYoutube.value = content.contact.youtube || '';
        }

        // Load Gallery
        if (content.gallery) {
            const galleryWedding = document.getElementById('gallery-wedding');
            const galleryHousewarming = document.getElementById('gallery-housewarming');
            const galleryBirthday = document.getElementById('gallery-birthday');
            const galleryCorporate = document.getElementById('gallery-corporate');
            if (galleryWedding) galleryWedding.value = content.gallery.wedding || '';
            if (galleryHousewarming) galleryHousewarming.value = content.gallery.housewarming || '';
            if (galleryBirthday) galleryBirthday.value = content.gallery.birthday || '';
            if (galleryCorporate) galleryCorporate.value = content.gallery.corporate || '';
        }
    }

    // --- Save Content to localStorage ---
    function saveWebsiteContent(section, data) {
        const storedContent = localStorage.getItem('website_content');
        const content = storedContent ? JSON.parse(storedContent) : { ...defaultContent };
        content[section] = data;
        localStorage.setItem('website_content', JSON.stringify(content));
        showAdminToast(`${section.charAt(0).toUpperCase() + section.slice(1)} section saved successfully!`);
    }

    // --- Hero Form Handler ---
    document.getElementById('hero-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            badge: document.getElementById('hero-badge').value,
            title: document.getElementById('hero-title').value,
            subtitle: document.getElementById('hero-subtitle').value,
            tagline: document.getElementById('hero-tagline').value,
            description: document.getElementById('hero-description').value
        };
        saveWebsiteContent('hero', data);
    });

    // --- About Form Handler ---
    document.getElementById('about-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            lead: document.getElementById('about-lead').value,
            text1: document.getElementById('about-text1').value,
            text2: document.getElementById('about-text2').value,
            image: document.getElementById('about-image').value
        };
        saveWebsiteContent('about', data);
    });

    // --- Services Form Handler ---
    document.getElementById('services-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const services = [];
        for (let i = 1; i <= 7; i++) {
            services.push({
                title: document.getElementById(`service${i}-title`).value,
                desc: document.getElementById(`service${i}-desc`).value
            });
        }
        saveWebsiteContent('services', services);
    });

    // --- Contact Form Handler ---
    document.getElementById('contact-form-admin')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            phone: document.getElementById('contact-phone').value,
            email: document.getElementById('contact-email-admin').value,
            instagram: document.getElementById('contact-instagram').value,
            instagramUrl: document.getElementById('contact-instagram-url').value,
            youtube: document.getElementById('contact-youtube').value
        };
        saveWebsiteContent('contact', data);
    });

    // ============================================
    // IMAGE UPLOAD FUNCTIONALITY
    // ============================================

    // --- About Image Upload ---
    const aboutUploadArea = document.getElementById('about-image-upload');
    const aboutFileInput = document.getElementById('about-image-file');
    const aboutPlaceholder = document.getElementById('about-upload-placeholder');
    const aboutPreview = document.getElementById('about-upload-preview');
    const aboutPreviewImg = document.getElementById('about-preview-img');
    const aboutRemoveBtn = document.getElementById('about-remove-btn');
    const aboutImageHidden = document.getElementById('about-image');

    if (aboutUploadArea && aboutFileInput) {
        // Click to upload
        aboutUploadArea.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-upload')) {
                aboutFileInput.click();
            }
        });

        // Drag and drop
        aboutUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            aboutUploadArea.classList.add('dragover');
        });

        aboutUploadArea.addEventListener('dragleave', () => {
            aboutUploadArea.classList.remove('dragover');
        });

        aboutUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            aboutUploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleAboutImageUpload(e.dataTransfer.files[0]);
            }
        });

        // File input change
        aboutFileInput.addEventListener('change', () => {
            if (aboutFileInput.files.length > 0) {
                handleAboutImageUpload(aboutFileInput.files[0]);
            }
        });

        // Remove button
        aboutRemoveBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            aboutPreview.style.display = 'none';
            aboutPlaceholder.style.display = 'flex';
            aboutPreviewImg.src = '';
            aboutImageHidden.value = 'gallery/about_us.png';
            aboutFileInput.value = '';
        });
    }

    async function handleAboutImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            showAdminToast('Please select an image file', true);
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            showAdminToast('Image must be less than 15MB', true);
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
            aboutPreviewImg.src = e.target.result;
            aboutPlaceholder.style.display = 'none';
            aboutPreview.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);

        // Upload to Supabase
        if (typeof uploadFileToSupabase === 'function') {
            try {
                showAdminToast('Uploading image...');
                const url = await uploadFileToSupabase(file, 'gallery-images');
                if (url) {
                    aboutImageHidden.value = url;
                    showAdminToast('Image uploaded successfully!');
                    aboutUploadArea.classList.add('upload-success');
                    setTimeout(() => aboutUploadArea.classList.remove('upload-success'), 500);
                }
            } catch (error) {
                console.error('Upload error:', error);
                showAdminToast('Upload failed. Image saved locally only.', true);
            }
        }
    }

    // --- Gallery Upload Handlers ---
    const galleryCategories = ['wedding', 'engagement', 'anniversary', 'housewarming', 'birthday', 'family', 'travel', 'corporate'];
    const galleryImages = { wedding: [], engagement: [], anniversary: [], housewarming: [], birthday: [], family: [], travel: [], corporate: [] };

    // Load existing gallery images from localStorage on page init
    function loadExistingGalleryData() {
        const stored = localStorage.getItem('website_content');
        if (stored) {
            try {
                const content = JSON.parse(stored);
                if (content.gallery) {
                    galleryCategories.forEach(cat => {
                        if (content.gallery[cat]) {
                            const urls = content.gallery[cat]
                                .split(',')
                                .map(u => u.trim())
                                .filter(u => u && u.length > 0);
                            galleryImages[cat] = urls;
                            console.log(`✅ Loaded ${urls.length} existing ${cat} images from localStorage`);
                        }
                    });
                }
            } catch (err) {
                console.warn('Could not load existing gallery data:', err);
            }
        }
    }

    // Initialize with existing data
    loadExistingGalleryData();

    // Initialize gallery drop zones
    galleryCategories.forEach(category => {
        const dropZone = document.querySelector(`.gallery-drop-zone[data-category="${category}"]`);
        const fileInput = document.querySelector(`.gallery-file-input[data-category="${category}"]`);
        const previewGrid = document.getElementById(`${category}-preview`);

        if (dropZone && fileInput) {
            // Click to upload
            dropZone.addEventListener('click', () => fileInput.click());

            // Drag and drop
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    handleGalleryUpload(category, e.dataTransfer.files);
                }
            });

            // File input change
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    handleGalleryUpload(category, fileInput.files);
                    fileInput.value = '';
                }
            });
        }
    });

    async function handleGalleryUpload(category, files) {
        const previewGrid = document.getElementById(`${category}-preview`);
        const progressDiv = document.getElementById(`${category}-progress`);

        const filesArray = Array.from(files);
        const existingUrls = new Set(galleryImages[category]);
        let uploadedCount = 0;
        let duplicateCount = 0;

        for (const file of filesArray) {
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 20 * 1024 * 1024) {
                showAdminToast(`${file.name} is too large (max 20MB)`, true);
                continue;
            }

            // Check for duplicate based on file name and size
            const fileIdentifier = `${file.name}_${file.size}`;
            const existingItems = Array.from(previewGrid.querySelectorAll('.gallery-preview-item'));
            const isDuplicate = existingItems.some(item => item.dataset.fileId === fileIdentifier);

            if (isDuplicate) {
                duplicateCount++;
                continue;
            }

            // Create preview immediately
            const previewItem = document.createElement('div');
            previewItem.className = 'gallery-preview-item';
            previewItem.dataset.fileId = fileIdentifier;

            const img = document.createElement('img');
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.readAsDataURL(file);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';

            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewGrid.appendChild(previewItem);

            // Upload to Supabase with category in filename
            if (typeof uploadFileToSupabase === 'function') {
                try {
                    // Create filename with category prefix
                    const fileExt = file.name.split('.').pop();
                    const categoryPrefix = category;
                    const timestamp = Date.now();
                    const randomStr = Math.random().toString(36).substring(7);
                    const customFileName = `${categoryPrefix}_${timestamp}_${randomStr}.${fileExt}`;

                    const url = await uploadFileToSupabase(file, 'gallery-images', customFileName);
                    if (url) {
                        // Check URL-level duplicate
                        if (!existingUrls.has(url)) {
                            galleryImages[category].push(url);
                            existingUrls.add(url);
                            previewItem.dataset.url = url;
                            uploadedCount++;

                            // Save to localStorage
                            saveGalleryToStorage();
                        } else {
                            previewItem.remove();
                            duplicateCount++;
                        }
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    previewItem.style.opacity = '0.5';
                    previewItem.title = 'Upload failed';
                }
            }

            // Remove button handler
            removeBtn.addEventListener('click', () => {
                const url = previewItem.dataset.url;
                if (url) {
                    galleryImages[category] = galleryImages[category].filter(u => u !== url);
                    saveGalleryToStorage();
                }
                previewItem.remove();
            });
        }

        // Show appropriate notification
        if (uploadedCount > 0 && duplicateCount > 0) {
            showAdminToast(`${uploadedCount} new image(s) uploaded, ${duplicateCount} duplicate(s) skipped`);
        } else if (uploadedCount > 0) {
            showAdminToast(`${uploadedCount} image(s) uploaded to ${category}!`);
        } else if (duplicateCount > 0) {
            showAdminToast(`All ${duplicateCount} image(s) were duplicates`, true);
        }
    }

    async function saveGalleryToStorage() {
        const storedContent = localStorage.getItem('website_content');
        const content = storedContent ? JSON.parse(storedContent) : { ...defaultContent };

        // Deduplicate URLs before saving using Set - SAVE ALL 8 CATEGORIES
        content.gallery = {
            wedding: [...new Set(galleryImages.wedding)].join(', '),
            engagement: [...new Set(galleryImages.engagement)].join(', '),
            anniversary: [...new Set(galleryImages.anniversary)].join(', '),
            housewarming: [...new Set(galleryImages.housewarming)].join(', '),
            birthday: [...new Set(galleryImages.birthday)].join(', '),
            family: [...new Set(galleryImages.family)].join(', '),
            travel: [...new Set(galleryImages.travel)].join(', '),
            corporate: [...new Set(galleryImages.corporate)].join(', ')
        };

        // 1. Save to LocalStorage
        localStorage.setItem('website_content', JSON.stringify(content));

        // 2. Sync to Supabase Manifest (The Truth)
        if (typeof window.saveSystemState === 'function') {
            await window.saveSystemState(content);
        } else {
            console.warn('saveSystemState not available');
        }

        // 3. Trigger gallery update (Reloads from Manifest)
        triggerGalleryUpdate();
    }

    function triggerGalleryUpdate() {
        // Reload gallery from Supabase/localStorage on this page
        if (typeof window.loadGalleryFromSupabase === 'function') {
            window.loadGalleryFromSupabase();
        }

        // Dispatch custom event for other tabs/windows
        window.dispatchEvent(new Event('galleryUpdated'));

        // Also trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'website_content',
            newValue: localStorage.getItem('website_content'),
            url: window.location.href
        }));
    }

    // Load existing gallery images on page load
    function loadGalleryPreviews() {
        const storedContent = localStorage.getItem('website_content');
        const content = storedContent ? JSON.parse(storedContent) : defaultContent;

        if (!content.gallery) return;

        galleryCategories.forEach(category => {
            const urls = content.gallery[category];
            if (urls) {
                const urlArray = urls.split(',').map(u => u.trim()).filter(u => u);
                galleryImages[category] = urlArray;

                const previewGrid = document.getElementById(`${category}-preview`);
                if (previewGrid) {
                    urlArray.forEach(url => {
                        const previewItem = document.createElement('div');
                        previewItem.className = 'gallery-preview-item';
                        previewItem.dataset.url = url;

                        const img = document.createElement('img');
                        img.src = url;
                        img.onerror = () => { img.src = 'gallery/placeholder.jpg'; };

                        const removeBtn = document.createElement('button');
                        removeBtn.className = 'remove-btn';
                        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                        removeBtn.addEventListener('click', () => {
                            galleryImages[category] = galleryImages[category].filter(u => u !== url);
                            saveGalleryToStorage();
                            previewItem.remove();
                        });

                        previewItem.appendChild(img);
                        previewItem.appendChild(removeBtn);
                        previewGrid.appendChild(previewItem);
                    });
                }
            }
        });
    }

    // --- Reset to Default ---
    document.getElementById('reset-content')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all content to default? This cannot be undone.')) {
            localStorage.removeItem('website_content');
            loadWebsiteContent();
            // Clear gallery previews
            galleryCategories.forEach(cat => {
                galleryImages[cat] = [];
                document.getElementById(`${cat}-preview`)?.replaceChildren();
            });
            showAdminToast('Content reset to default!');
        }
    });

    // --- Refresh Gallery from Supabase ---
    document.getElementById('refresh-gallery-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('refresh-gallery-btn');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

        try {
            // Force clear the gallery data and reload
            if (typeof window.loadGalleryFromSupabase === 'function') {
                await window.loadGalleryFromSupabase();
                showAdminToast('Gallery refreshed from Supabase successfully!');
            } else {
                showAdminToast('Gallery refresh failed', true);
            }
        } catch (error) {
            console.error('Error refreshing gallery:', error);
            showAdminToast('Error refreshing gallery', true);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    });

    // Cleanup any duplicate URLs in localStorage gallery data
    function cleanupDuplicateGalleryUrls() {
        const stored = localStorage.getItem('website_content');
        if (!stored) return;

        try {
            const content = JSON.parse(stored);
            if (content.gallery) {
                let cleaned = false;
                ['wedding', 'engagement', 'anniversary', 'housewarming', 'birthday', 'family', 'travel', 'corporate'].forEach(cat => {
                    if (content.gallery[cat]) {
                        const urls = content.gallery[cat].split(',').map(u => u.trim()).filter(u => u);
                        const uniqueUrls = [...new Set(urls)];
                        if (urls.length !== uniqueUrls.length) {
                            cleaned = true;
                            console.log(`🧹 Cleaned ${urls.length - uniqueUrls.length} duplicate(s) from ${cat} gallery`);
                        }
                        content.gallery[cat] = uniqueUrls.join(', ');
                    }
                });
                if (cleaned) {
                    localStorage.setItem('website_content', JSON.stringify(content));
                    console.log('✅ Gallery duplicates cleaned from localStorage');
                }
            }
        } catch (err) {
            console.warn('Error cleaning up gallery duplicates:', err);
        }
    }

    // Load content on page load
    cleanupDuplicateGalleryUrls(); // Clean duplicates first
    loadWebsiteContent();
    loadGalleryPreviews();
});
