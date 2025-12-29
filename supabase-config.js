/* ============================================
   Supabase Configuration & Functions
   ============================================
   
   SETUP INSTRUCTIONS:
   1. Go to https://supabase.com and create a free account
   2. Create a new project
   3. Go to Project Settings > API
   4. Copy your Project URL and anon/public API key
   5. Replace the placeholder values below
   
   DATABASE SETUP:
   Run these SQL commands in SQL Editor:
   
   -- Contacts table
   CREATE TABLE contacts (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       name TEXT NOT NULL,
       email TEXT NOT NULL,
       phone TEXT,
       subject TEXT,
       message TEXT NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );
   
   -- Bookings table
   CREATE TABLE bookings (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       event_title TEXT NOT NULL,
       event_date DATE NOT NULL,
       event_time TIME NOT NULL,
       address TEXT NOT NULL,
       home_name TEXT,
       gate_code TEXT,
       wifi_username TEXT,
       wifi_password TEXT,
       home_photo_url TEXT,
       family_members TEXT NOT NULL,
       compliments_names TEXT,
       pandit_details TEXT,
       highlights TEXT,
       special_needs TEXT,
       status TEXT DEFAULT 'pending',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   -- Reviews table
   CREATE TABLE reviews (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       name TEXT NOT NULL,
       location TEXT,
       review_text TEXT NOT NULL,
       rating INTEGER DEFAULT 5,
       photo_url TEXT,
       image_url_1 TEXT,
       image_url_2 TEXT,
       image_url_3 TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );
   
   STORAGE SETUP:
   1. Go to Storage in Supabase dashboard
   2. Create buckets: 'home-photos', 'gallery-images', 'gallery-videos', 'review-photos'
   3. Set them to public or configure policies as needed
   
   NOTE: The 'review-photos' bucket is used for both profile photos and event images in reviews.
   
   ============================================ */

// Supabase Configuration
// Your Supabase credentials
const SUPABASE_URL = 'https://lgitomdfzujzbarbwzyw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaXRvbWRmenVqemJhcmJ3enl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDA1NTQsImV4cCI6MjA4MTYxNjU1NH0.jv88iH025_w33eN58l4y69XQrzHQL9O8ZnrkmqOMwW8';

// Initialize Supabase client (if credentials are provided)
let supabase = null;

function initSupabase() {
    console.log('--- 🔍 Supabase Debug Start ---');
    console.log('Project URL:', SUPABASE_URL);

    // Warn if key looks suspicious (Supabase keys are usually JWTs starting with eyJ)
    if (!SUPABASE_ANON_KEY.startsWith('eyJ')) {
        console.warn('⚠️ WARNING: The API Key provided does not look like a standard Supabase JWT (usually starts with "eyJ"). Authentication may fail.');
    }

    if (SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' &&
        SUPABASE_URL !== '' &&
        SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
        SUPABASE_ANON_KEY !== '') {

        // Check if Supabase JS is loaded
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            try {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                // Export to window for console debugging
                window.supabaseClient = supabase;
                console.log('✅ Supabase initialized successfully');

                // Load gallery after initialization so uploaded images appear on the homepage
                if (typeof window.loadGalleryFromSupabase === 'function') {
                    try {
                        window.loadGalleryFromSupabase();
                    } catch (err) {
                        console.warn('Could not load gallery from Supabase on init:', err);
                    }
                }

                // Validate gallery system is working
                validateGallerySystem();
            } catch (err) {
                console.error('❌ Error during createClient:', err);
            }
        } else {
            console.error('❌ Supabase library not found in window object. Check <script> tag in HTML.');
        }
    } else {
        console.warn('⚠️ Supabase credentials missing or placeholder. Using demo mode.');
    }
    console.log('--- 🔍 Supabase Debug End ---');
}

/* ============================================
   Contact Form - Save to Supabase
   ============================================ */
async function saveContactToSupabase(data) {
    if (!supabase) {
        console.log('Supabase not configured. Contact data:', data);
        return null;
    }

    try {
        console.log('Sending data to "contacts" table...', data);
        const { data: result, error } = await supabase
            .from('contacts')
            .insert([{
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                subject: data.subject || null,
                message: data.message
            }])
            .select();

        if (error) {
            console.error('❌ Supabase Insert Error (contacts):', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            throw error;
        }

        console.log('✅ Contact saved successfully:', result);
        return result;
    } catch (error) {
        console.error('❌ Fatal error in saveContactToSupabase:', error);
        return null;
    }
}

/* ============================================
   Booking Form - Save to Supabase
   ============================================ */
async function saveBookingToSupabase(data) {
    if (!supabase) {
        console.log('Supabase not configured. Booking data:', data);
        return null;
    }

    try {
        console.log('Sending data to "bookings" table...', data);
        const { data: result, error } = await supabase
            .from('bookings')
            .insert([{
                event_title: data.eventTitle,
                event_date: data.eventDate,
                event_time: data.eventTime,
                address: data.address,
                home_name: data.homeName || null,
                gate_code: data.gateCode || null,
                wifi_username: data.wifiUsername || null,
                wifi_password: data.wifiPassword || null,
                home_photo_url: data.homePhotoUrl || null,
                family_members: data.familyMembers,
                compliments_names: data.complimentsNames || null,
                pandit_details: data.panditDetails || null,
                highlights: data.highlights || null,
                special_needs: data.specialNeeds || null
            }])
            .select();

        if (error) {
            console.error('❌ Supabase Insert Error (bookings):', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            throw error;
        }

        console.log('✅ Booking saved successfully:', result);
        return result;
    } catch (error) {
        console.error('❌ Fatal error in saveBookingToSupabase:', error);
        return null;
    }
}

/* ============================================
   File Upload to Supabase Storage
   ============================================ */
async function uploadFileToSupabase(file, bucket = 'home-photos', customFileName = null) {
    if (!supabase) {
        console.log('Supabase not configured. Cannot upload file.');
        return null;
    }

    try {
        // Generate filename
        let filePath;
        if (customFileName) {
            // Use custom filename (with category prefix from admin)
            filePath = `${customFileName}`;
        } else {
            // Default filename generation
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            filePath = `uploads/${fileName}`;
        }

        console.log(`📤 Uploading to ${bucket}/${filePath}`);

        // Upload file
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        console.log('✅ File uploaded:', urlData.publicUrl);
        return urlData.publicUrl;
    } catch (error) {
        console.error('❌ Error uploading file:', error);
        throw error;
    }
}

/* ============================================
   Load Gallery from Supabase Storage
   ============================================ */
// Prevent duplicate gallery loads
let isLoadingGallery = false;

// Global gallery data storage (for category filtering)
window.galleryData = {
    wedding: [],
    engagement: [],
    anniversary: [],
    housewarming: [],
    birthday: [],
    family: [],
    travel: [],
    corporate: []
};

// Validate gallery system setup
function validateGallerySystem() {
    const required = [
        'loadGalleryFromSupabase',
        'displayGalleryCategory',
        'attachGalleryTabHandlers'
    ];
    
    const missing = required.filter(fn => typeof window[fn] !== 'function');
    
    if (missing.length > 0) {
        console.error('❌ Gallery system incomplete. Missing functions:', missing);
    } else {
        console.log('✅ Gallery system validated successfully');
    }
}

// Cleanup any duplicate URLs in localStorage gallery data
function cleanupDuplicateGalleryUrls() {
    const stored = localStorage.getItem('website_content');
    if (!stored) return;

    try {
        const content = JSON.parse(stored);
        if (content.gallery) {
            let cleaned = false;
            ['wedding', 'housewarming', 'birthday', 'corporate'].forEach(cat => {
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

async function loadGalleryFromSupabase() {
    // PREVENT DOUBLE LOADING - Exit if already loading
    if (isLoadingGallery) {
        console.log('⏳ Gallery already loading, skipping duplicate request...');
        return;
    }

    isLoadingGallery = true;
    console.log('🔒 Setting loading flag to prevent concurrent requests');

    try {
        // Clean up any duplicates first
        cleanupDuplicateGalleryUrls();

        // Always reset gallery data first to prevent duplicates
        window.galleryData = {
            wedding: [],
            engagement: [],
            anniversary: [],
            housewarming: [],
            birthday: [],
            family: [],
            travel: [],
            corporate: []
        };

        if (!supabase) {
            console.log('⚠️ Supabase not configured. Loading from localStorage fallback.');
            loadGalleryFromLocalStorage();
            return;
        }

        const seenUrls = new Set();
        let added = 0;

        console.log('🔄 Fetching gallery images from Supabase storage (SINGLE REQUEST)...');

        // Fetch all images from Supabase using pagination
        let allImages = [];
        let page = 1;
        const pageSize = 100;
        let keepGoing = true;

        while (keepGoing) {
            const { data: images, error: imgError } = await supabase.storage
                .from('gallery-images')
                .list('', { limit: pageSize, offset: (page - 1) * pageSize });

            if (imgError) {
                console.error('❌ Supabase storage fetch error:', imgError);
                console.error('Error details:', JSON.stringify(imgError));
                break;
            }

            if (images && images.length > 0) {
                // Filter out .emptyFolderPlaceholder and other non-image files
                const validImages = images.filter(img =>
                    img.name &&
                    !img.name.startsWith('.') &&
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(img.name)
                );
                allImages = allImages.concat(validImages);

                console.log(`📄 Loaded page ${page} with ${validImages.length} valid images`);

                if (images.length < pageSize) {
                    keepGoing = false;
                } else {
                    page++;
                }
            } else {
                keepGoing = false;
            }
        }

        console.log(`📸 Found ${allImages.length} image files in Supabase storage`);

        // Sort by timestamp in filename (most recent first)
        allImages.sort((a, b) => {
            const getTs = (name) => {
                const match = name.match(/_(\d{10,})_/);
                return match ? parseInt(match[1], 10) : 0;
            };
            return getTs(b.name) - getTs(a.name);
        });

        // Process each image and categorize
        for (const image of allImages) {
            const nameLower = image.name.toLowerCase();

            // Determine category by prefix (admin uploads use category_ prefix)
            let category = null;
            const categories = ['wedding', 'engagement', 'anniversary', 'housewarming', 'birthday', 'family', 'travel', 'corporate'];

            for (const cat of categories) {
                if (nameLower.startsWith(cat + '_') || nameLower.startsWith(cat + '-')) {
                    category = cat;
                    break;
                }
            }

            // Fallback: Check if category name appears anywhere in filename
            if (!category) {
                const patterns = {
                    wedding: ['wedding'],
                    engagement: ['engagement', 'engaged', 'proposal'],
                    anniversary: ['anniversary', 'anniv'],
                    housewarming: ['housewarming', 'house_warming', 'house-warming', 'warming'],
                    birthday: ['birthday', 'birth_day', 'birth-day'],
                    family: ['family', 'reunion'],
                    travel: ['travel', 'trip', 'vacation', 'holiday'],
                    corporate: ['corporate', 'conference', 'seminar', 'office']
                };

                for (const [cat, patternList] of Object.entries(patterns)) {
                    if (patternList.some(p => nameLower.includes(p))) {
                        category = cat;
                        break;
                    }
                }
            }

            // IMPORTANT: Only show images with proper category prefixes (admin uploaded)
            // Skip uncategorized files to keep gallery clean
            if (!category) {
                console.warn('⚠️ Skipping uncategorized file (not admin-uploaded):', image.name);
                continue;
            }

            // Get public URL for the image
            const { data: urlData } = supabase.storage
                .from('gallery-images')
                .getPublicUrl(image.name);

            const url = urlData.publicUrl?.trim();

            // Only add if URL is valid and not already seen
            if (url && !seenUrls.has(url)) {
                window.galleryData[category].push({
                    url,
                    alt: `${category} image`
                });
                seenUrls.add(url);
                added++;
            } else if (url && seenUrls.has(url)) {
                console.warn(`⏭️ DUPLICATE DETECTED: ${image.name} - URL already in set`);
            }
        }

        console.log(`📊 Gallery loaded from Supabase (${added} images):`);
        console.log(`   Wedding: ${window.galleryData.wedding.length} images`);
        console.log(`   Engagement: ${window.galleryData.engagement.length} images`);
        console.log(`   Anniversary: ${window.galleryData.anniversary.length} images`);
        console.log(`   Housewarming: ${window.galleryData.housewarming.length} images`);
        console.log(`   Birthday: ${window.galleryData.birthday.length} images`);
        console.log(`   Family: ${window.galleryData.family.length} images`);
        console.log(`   Travel: ${window.galleryData.travel.length} images`);
        console.log(`   Corporate: ${window.galleryData.corporate.length} images`);

        // ONLY merge localStorage if Supabase had results
        // This prevents duplicate loading of cached images
        if (added > 0) {
            console.log('✅ Supabase loaded images successfully, checking for any NEW images in localStorage...');
            mergeLocalStorageGallery(seenUrls);
        } else {
            console.log('⚠️ No images from Supabase, loading fallback from localStorage only');
            loadGalleryFromLocalStorage();
            return;
        }

        // Calculate total images
        const totalImages = window.galleryData.wedding.length + 
                           window.galleryData.engagement.length +
                           window.galleryData.anniversary.length +
                           window.galleryData.housewarming.length + 
                           window.galleryData.birthday.length +
                           window.galleryData.family.length +
                           window.galleryData.travel.length +
                           window.galleryData.corporate.length;

        console.log(`📊 FINAL Gallery Summary:`);
        console.log(`   Wedding: ${window.galleryData.wedding.length} images`);
        console.log(`   Engagement: ${window.galleryData.engagement.length} images`);
        console.log(`   Anniversary: ${window.galleryData.anniversary.length} images`);
        console.log(`   Housewarming: ${window.galleryData.housewarming.length} images`);
        console.log(`   Birthday: ${window.galleryData.birthday.length} images`);
        console.log(`   Family: ${window.galleryData.family.length} images`);
        console.log(`   Travel: ${window.galleryData.travel.length} images`);
        console.log(`   Corporate: ${window.galleryData.corporate.length} images`);
        console.log(`   TOTAL: ${totalImages} images (NO DUPLICATES)`);

        // Display wedding category by default
        displayGalleryCategory('wedding');
        attachGalleryTabHandlers();
        console.log('✅ Gallery loaded successfully! ZERO DUPLICATES');

    } catch (error) {
        console.error('❌ Error loading gallery from Supabase:', error);
        // Fallback to localStorage on error
        loadGalleryFromLocalStorage();
    } finally {
        // ALWAYS clear the loading flag when done
        isLoadingGallery = false;
        console.log('🔓 Loading flag cleared - ready for next request');
    }
}

// Merge localStorage gallery with Supabase gallery (to show ONLY new images not in Supabase)
function mergeLocalStorageGallery(seenUrls) {
    const stored = localStorage.getItem('website_content');
    if (!stored) return;

    try {
        const content = JSON.parse(stored);
        if (content.gallery) {
            const categories = ['wedding', 'engagement', 'anniversary', 'housewarming', 'birthday', 'family', 'travel', 'corporate'];
            let addedFromLocal = 0;
            
            categories.forEach((cat) => {
                if (content.gallery[cat]) {
                    const urls = content.gallery[cat]
                        .split(',')
                        .map(u => u.trim())
                        .filter(u => u && u.length > 0);

                    urls.forEach((url) => {
                        // Only add if not already seen (deduplication)
                        if (!seenUrls.has(url)) {
                            window.galleryData[cat].push({ url, alt: `${cat} image` });
                            seenUrls.add(url);
                            addedFromLocal++;
                            console.log(`✅ Added from localStorage: ${cat} - ${url.substring(0, 40)}...`);
                        } else {
                            console.log('⏭️ Skipped duplicate from localStorage:', url.substring(0, 50) + '...');
                        }
                    });
                }
            });
            console.log(`✅ Merged localStorage gallery with Supabase images (added ${addedFromLocal} from cache)`);
        }
    } catch (err) {
        console.warn('Could not merge localStorage gallery:', err);
    }
}

// Load gallery from localStorage fallback
// Used when Supabase is not configured or returns 0 images
function loadGalleryFromLocalStorage() {
    console.log('📂 Loading gallery from localStorage (fallback mode)...');

    const stored = localStorage.getItem('website_content');
    if (!stored) {
        console.warn('⚠️ No gallery data in localStorage');
        // Display first category (will show placeholder)
        displayGalleryCategory('wedding');
        attachGalleryTabHandlers();
        return;
    }

    try {
        const content = JSON.parse(stored);
        const seenUrls = new Set();
        let added = 0;

        if (content.gallery) {
            const categories = ['wedding', 'engagement', 'anniversary', 'housewarming', 'birthday', 'family', 'travel', 'corporate'];
            categories.forEach((cat) => {
                if (content.gallery[cat]) {
                    const urls = content.gallery[cat]
                        .split(',')
                        .map(u => u.trim())
                        .filter(u => u && u.length > 0);

                    console.log(`📋 Processing ${cat} category: ${urls.length} URLs from localStorage`);

                    urls.forEach((url) => {
                        // Only add if not already seen (deduplication)
                        if (!seenUrls.has(url)) {
                            window.galleryData[cat].push({ url, alt: `${cat} image` });
                            seenUrls.add(url);
                            added++;
                        }
                    });
                }
            });

            console.log(`📊 Gallery loaded from localStorage:`);
            console.log(`   Wedding: ${window.galleryData.wedding.length} images`);
            console.log(`   Engagement: ${window.galleryData.engagement.length} images`);
            console.log(`   Anniversary: ${window.galleryData.anniversary.length} images`);
            console.log(`   Housewarming: ${window.galleryData.housewarming.length} images`);
            console.log(`   Birthday: ${window.galleryData.birthday.length} images`);
            console.log(`   Family: ${window.galleryData.family.length} images`);
            console.log(`   Travel: ${window.galleryData.travel.length} images`);
            console.log(`   Corporate: ${window.galleryData.corporate.length} images`);
        }

        // Display first category by default
        displayGalleryCategory('wedding');
        // Attach tab handlers
        attachGalleryTabHandlers();

        if (added > 0) {
            console.log('✅ Gallery loaded from localStorage. Total:', added, 'images');
        } else {
            console.log('⚠️ No images found in localStorage gallery data');
        }
    } catch (err) {
        console.error('❌ Error parsing localStorage gallery data:', err);
        displayGalleryCategory('wedding');
        attachGalleryTabHandlers();
    }
}

// Display gallery for selected category
function displayGalleryCategory(category) {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    let images = window.galleryData[category] || [];

    // Deduplicate images by URL before displaying
    const seenUrlsInDisplay = new Set();
    images = images.filter((img) => {
        if (seenUrlsInDisplay.has(img.url)) {
            console.log('🧹 Removing duplicate image:', img.url);
            return false;
        }
        seenUrlsInDisplay.add(img.url);
        return true;
    });

    // Update the data store with deduplicated images
    window.galleryData[category] = images;

    console.log(`📋 Displaying ${category} gallery: ${images.length} images (after dedup)`);

    // Clear grid
    galleryGrid.innerHTML = '';

    if (images.length === 0) {
        galleryGrid.innerHTML = `
            <div class="gallery-placeholder" style="grid-column: 1 / -1; padding: 60px; text-align: center;">
                <i class="fas fa-images" style="font-size: 4rem; color: var(--accent-pink); opacity: 0.6;"></i>
                <p style="margin-top: 20px; color: var(--text-muted);">
                    No images in this category yet.<br>
                    Go to <strong>Admin → Web Content → Gallery</strong> to upload images.
                </p>
            </div>
        `;
        return;
    }

    // Render images for selected category
    images.forEach((img) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `<img src="${img.url}" alt="${img.alt}" loading="lazy">`;
        galleryGrid.appendChild(galleryItem);
    });
}

// Attach click handlers to category tabs
function attachGalleryTabHandlers() {
    const tabs = document.querySelectorAll('.gallery-tab');
    if (tabs.length === 0) {
        console.warn('No gallery tabs found on page');
        return;
    }

    tabs.forEach(tab => {
        // Remove previous listeners to avoid duplicates
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);

        newTab.addEventListener('click', function (e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            const imageCount = window.galleryData[category]?.length || 0;
            console.log(`🔄 Switching to ${category} gallery (${imageCount} images)`);

            // Update active tab
            const allTabs = document.querySelectorAll('.gallery-tab');
            allTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Display category with validation
            if (window.galleryData[category]) {
                displayGalleryCategory(category);
            } else {
                console.warn(`⚠️ No data found for category: ${category}`);
            }
        });
    });
    console.log('✅ Gallery tab handlers attached');
}

/* ============================================
   Reviews - Fetch, Add, Delete
   ============================================ */
async function fetchReviews() {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        // Check for specific Supabase 404 (table not found in API)
        if (error.code === '404' || error.status === 404 || error.message?.includes('404')) {
            console.warn("⚠️ TIP: Go to Supabase > Project Settings > API > 'Reload Schema Cache' to fix the 404 error.");
        }
        return [];
    }
}

async function addReview(reviewData) {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([reviewData])
            .select();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding review:', JSON.stringify(error, null, 2));
        throw error;
    }
}

async function deleteReview(id) {
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting review:', error);
        return false;
    }
}

/* ============================================
   Initialize on DOM Ready
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {
    initSupabase();
});

// Export functions for external use
window.saveContactToSupabase = saveContactToSupabase;
window.saveBookingToSupabase = saveBookingToSupabase;
window.uploadFileToSupabase = uploadFileToSupabase;
window.loadGalleryFromSupabase = loadGalleryFromSupabase;
window.fetchReviews = fetchReviews;
window.addReview = addReview;
window.deleteReview = deleteReview;
