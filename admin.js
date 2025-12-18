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

    // --- Data Fetching Logic ---
    async function loadDashboardData() {
        console.log("Fetching dashboard data...");
        await Promise.all([
            fetchContacts(),
            fetchBookings()
        ]);
    }

    async function fetchContacts() {
        if (!window.supabaseClient) {
            showAdminToast("Supabase not initialized", true);
            return;
        }

        showAdminToast("Refreshing contacts...");
        try {
            const { data, error } = await window.supabaseClient
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            renderContacts(data);
            showAdminToast("Contacts updated!");
        } catch (err) {
            console.error("Error fetching contacts:", err);
            showAdminToast("Failed to load contacts", true);
        }
    }

    async function fetchBookings() {
        if (!window.supabaseClient) {
            showAdminToast("Supabase not initialized", true);
            return;
        }

        showAdminToast("Refreshing bookings...");
        try {
            const { data, error } = await window.supabaseClient
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            renderBookings(data);
            showAdminToast("Bookings updated!");
        } catch (err) {
            console.error("Error fetching bookings:", err);
            showAdminToast("Failed to load bookings", true);
        }
    }

    // --- Rendering Logic ---
    function renderContacts(contacts) {
        const tbody = document.getElementById('contacts-body');
        if (!tbody) return;

        if (contacts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No inquiries found.</td></tr>';
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
            </tr>
        `).join('');
    }

    function renderBookings(bookings) {
        const tbody = document.getElementById('bookings-body');
        if (!tbody) return;

        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No bookings found.</td></tr>';
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
                    <strong>Venue:</strong> ${escapeHtml(b.home_name || 'N/A')}<br>
                    <strong>Gate:</strong> ${escapeHtml(b.gate_code || 'N/A')}
                </td>
                <td>
                    <strong>Family:</strong> ${escapeHtml(b.family_members)}<br>
                    <strong>Pandit:</strong> ${escapeHtml(b.pandit_details || 'N/A')}
                </td>
                <td>${escapeHtml(b.special_needs || 'None')}</td>
                <td>
                    ${b.home_photo_url ? `<img src="${b.home_photo_url}" class="booking-photo" onclick="window.open('${b.home_photo_url}', '_blank')" title="View Full Image">` : 'No Photo'}
                </td>
            </tr>
        `).join('');
    }

    // Refresh Buttons
    document.getElementById('refresh-contacts')?.addEventListener('click', () => fetchContacts());
    document.getElementById('refresh-bookings')?.addEventListener('click', () => fetchBookings());

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
});
