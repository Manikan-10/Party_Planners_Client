# Gallery Manifest System (New Architecture)

## Overview
We have upgraded the gallery system to use a **Manifest-based Architecture**. Previously, the website listed all files in the Supabase Storage bucket, which caused issues with duplicate images (ghost files) and lack of strict control.

The new system uses a `system_state.json` file stored in Supabase as the **Single Source of Truth**.

### Key Benefits
1.  **Zero Duplicates**: Only images explicitly listed in the JSON manifest are displayed.
2.  **Strict Admin Control**: If you delete an image in the Admin Panel, it is removed from the Manifest, effectively hiding it from the website immediately, even if the file remains in the bucket.
3.  **Faster Loading**: Reading one JSON file is faster than determining categories from hundreds of filenames.
4.  **Offline Support**: The system syncs the Manifest to `localStorage`, so the gallery works even if Supabase is temporarily unreachable (after first load).

## How It Works

1.  **Admin Panel (Write)**
    *   When you **Add** or **Remove** an image in the Admin Panel, the system updates your local view.
    *   It then automatically saves the new state to `system_state.json` in Supabase Storage.
    *   This ensures the "Server State" always matches the "Admin State".

2.  **Public Website (Read)**
    *   The website attempts to load `system_state.json` from Supabase.
    *   **Success**: It displays exactly what the Admin configured. It also updates the user's `localStorage` cache.
    *   **Failure**: It falls back to `localStorage` (cached version).

## Migration / Setup
**Important**: The `system_state.json` file might not exist yet if you haven't used the Admin Panel since the update.

**To initialize the system:**
1.  Open the **Admin Panel** (`admin.html`).
2.  Go to **Web Content -> Gallery**.
3.  Upload a new image OR delete an unwanted image.
    *   *Alternative*: If you don't want to change anything, you can upload a dummy image and then delete it.
4.  This action triggers `saveSystemState()`, which creates the `system_state.json` file.
5.  Check the Console (F12) for the message: `✅ System state saved successfully!`.

## Verification
1.  **Open Admin Panel**: Ensure your gallery looks correct (no duplicates).
2.  **Make a Change**: Upload a test image to "Wedding".
3.  **Open Incognito Window**: Visit the public website.
4.  **Verify**: The test image should appear in "Wedding".
5.  **Delete Image**: In Admin, delete the test image.
6.  **Verify**: Refresh the public website. The image should be gone.

## Troubleshooting
*   **Gallery is Empty**: Ensure you have visited the Admin Panel and triggered a save/sync at least once.
*   **Console Errors**: Check F12 console.
    *   `⚠️ Could not load system state`: Normal for first run before Admin sync.
    *   `❌ Error saving system state`: Check your internet connection or Supabase credentials.

## Technical Details
*   **File**: `supabase-config.js`
*   **New Functions**:
    *   `saveSystemState(content)`: Uploads JSON.
    *   `loadSystemState()`: Downloads JSON.
    *   `loadGalleryFromSupabase()`: Updated to use Manifest.
*   **Admin Integration**: `admin.js` now calls `saveSystemState` inside `saveGalleryToStorage`.
