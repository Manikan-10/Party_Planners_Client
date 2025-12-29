# 🚀 Complete Database Setup for New Project

Since you switched to a new Supabase project (`bjtlmaasxhuvfmiefmjk`), you need to recreate all the tables and storage buckets.

## Step 1: Run SQL Commands (Create Tables)

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open your project (`bjtlmaasxhuvfmiefmjk`).
3.  Click on the **SQL Editor** icon (`>_`) in the left sidebar.
4.  Click **+ New Query**.
5.  **Copy and Paste ALL the code below** and click **Run**:

```sql
-- 1. Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
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

-- 3. Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    review_text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Enable Security (Row Level Security)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 5. Create Access Policies (Allow Public Access for simplicity)
-- Contacts
CREATE POLICY "Allow public insert contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Allow public delete contacts" ON contacts FOR DELETE USING (true);

-- Bookings
CREATE POLICY "Allow public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public delete bookings" ON bookings FOR DELETE USING (true);

-- Reviews
CREATE POLICY "Allow public insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow public delete reviews" ON reviews FOR DELETE USING (true);
```

## Step 2: Create Storage Buckets

You need to create 4 buckets for file uploads.

1.  Go to **Storage** (folder icon) in the left sidebar.
2.  Create the following buckets. **IMPORTANT: Make sure "Public bucket" is ON for all of them.**

*   `home-photos`
*   `gallery-images`
*   `gallery-videos`
*   `review-photos`

## Step 3: Reload Schema Cache

1.  Go to **Settings** > **API**.
2.  Click **"Reload schema cache"**.

Once you do this, your new project will be fully set up!
