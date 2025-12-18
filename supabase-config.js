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
   
   STORAGE SETUP:
   1. Go to Storage in Supabase dashboard
   2. Create buckets: 'home-photos', 'gallery-images', 'gallery-videos'
   3. Set them to public or configure policies as needed
   
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

                // Load gallery after initialization (Disabled as per user request to keep manual UI)
                // loadGalleryFromSupabase();
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
async function uploadFileToSupabase(file, bucket = 'home-photos') {
    if (!supabase) {
        console.log('Supabase not configured. Cannot upload file.');
        return null;
    }

    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

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

        console.log('File uploaded:', urlData.publicUrl);
        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

/* ============================================
   Load Gallery from Supabase Storage
   ============================================ */
async function loadGalleryFromSupabase() {
    if (!supabase) {
        console.log('Supabase not configured. Using placeholder gallery.');
        return;
    }

    try {
        // Load images from gallery-images bucket
        const { data: images, error: imgError } = await supabase.storage
            .from('gallery-images')
            .list('', { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });

        // Load videos from gallery-videos bucket
        const { data: videos, error: vidError } = await supabase.storage
            .from('gallery-videos')
            .list('', { limit: 5, sortBy: { column: 'created_at', order: 'desc' } });

        if (imgError || vidError) {
            console.log('Gallery buckets may not exist yet');
            return;
        }

        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;

        // Clear placeholder content if we have real content
        if ((images && images.length > 0) || (videos && videos.length > 0)) {
            galleryGrid.innerHTML = '';
        }

        // Add images to gallery
        if (images && images.length > 0) {
            images.forEach((image, index) => {
                const { data: urlData } = supabase.storage
                    .from('gallery-images')
                    .getPublicUrl(image.name);

                const galleryItem = document.createElement('div');
                galleryItem.className = index === 0 ? 'gallery-item large' : 'gallery-item';
                galleryItem.innerHTML = `<img src="${urlData.publicUrl}" alt="Gallery Image" loading="lazy">`;
                galleryGrid.appendChild(galleryItem);
            });
        }

        // Add videos to gallery
        if (videos && videos.length > 0) {
            videos.forEach((video) => {
                const { data: urlData } = supabase.storage
                    .from('gallery-videos')
                    .getPublicUrl(video.name);

                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item large';
                galleryItem.innerHTML = `
                    <video src="${urlData.publicUrl}" controls preload="metadata">
                        Your browser does not support the video tag.
                    </video>
                `;
                galleryGrid.appendChild(galleryItem);
            });
        }

        console.log('Gallery loaded from Supabase');
    } catch (error) {
        console.error('Error loading gallery:', error);
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
