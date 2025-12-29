# ⚠️ IMPORTANT: Database Setup Required

The "Reviews" feature requires a new table in your Supabase database and a new storage bucket for photos. The errors you are seeing (404 Not Found) are because these do not exist yet.

Please follow these steps to fix the errors:

## Step 1: Create the Reviews Table

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open your project.
3.  Click on the **SQL Editor** icon (looks like a terminal `>_`) in the left sidebar.
4.  Click **+ New Query**.
5.  Copy and paste the following SQL code:

```sql
-- Create the reviews table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    review_text TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (optional but recommended, allows public read)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow everyone to read reviews
CREATE POLICY "Public reviews are viewable by everyone" 
ON reviews FOR SELECT 
USING (true);

-- Create a policy to allow authenticated users (or anon if you prefer) to insert reviews
-- Since we are using the anon key in the admin panel, we need to allow insert
CREATE POLICY "Enable insert for authenticated users only" 
ON reviews FOR INSERT 
WITH CHECK (true);

-- Create a policy to allow delete
CREATE POLICY "Enable delete for users" 
ON reviews FOR DELETE 
USING (true);
```

6.  Click **Run** (bottom right).
7.  You should see "Success" in the results.

## Step 2: Create the Storage Bucket

1.  Click on the **Storage** icon (looks like a folder) in the left sidebar.
2.  Click **+ New Bucket**.
3.  Name the bucket: `review-photos`
4.  **IMPORTANT**: Toggle "Public bucket" to **ON**.
5.  Click **Save**.

## Step 3: Refresh Your Admin Page

1.  Go back to your website's Admin page (`/admin.html`).
2.  Refresh the page.
3.  The errors should be gone, and you can now add reviews.
