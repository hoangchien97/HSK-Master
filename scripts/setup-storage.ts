/**
 * Setup Supabase Storage buckets
 * Run: npx tsx scripts/setup-storage.ts
 * 
 * This script creates the required storage buckets in Supabase.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be a valid service role JWT.
 * 
 * If you can't run this script, create the buckets manually in
 * Supabase Dashboard > Storage:
 *   1. "avatars" - Public bucket for user avatars
 *   2. "documents" - Public bucket for assignment/submission attachments
 */

import 'dotenv/config'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const BUCKETS = [
  { id: "avatars", name: "avatars", public: true },
  { id: "documents", name: "documents", public: true },
]

async function createBucket(bucket: { id: string; name: string; public: boolean }) {
  // Check if bucket exists
  const checkRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${bucket.id}`, {
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
  })

  if (checkRes.ok) {
    console.log(`✅ Bucket "${bucket.id}" already exists`)
    return
  }

  // Create bucket
  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: bucket.id,
      name: bucket.name,
      public: bucket.public,
      file_size_limit: 10 * 1024 * 1024, // 10MB
    }),
  })

  if (createRes.ok) {
    console.log(`✅ Created bucket "${bucket.id}"`)
  } else {
    const error = await createRes.text()
    console.error(`❌ Failed to create bucket "${bucket.id}": ${error}`)
    console.log(`   → Please create it manually in Supabase Dashboard > Storage`)
  }
}

async function main() {
  console.log("🗄️  Setting up Supabase Storage buckets...\n")

  if (!SUPABASE_URL) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env")
    process.exit(1)
  }
  if (!SUPABASE_KEY) {
    console.error("❌ Missing Supabase API key in .env")
    process.exit(1)
  }

  for (const bucket of BUCKETS) {
    await createBucket(bucket)
  }

  console.log("\n🎉 Storage setup complete!")
  console.log("\n⚠️  Note: If bucket creation failed due to RLS, you need either:")
  console.log("   1. A valid SUPABASE_SERVICE_ROLE_KEY (JWT from Supabase Dashboard > Settings > API)")
  console.log("   2. Or create buckets manually in Supabase Dashboard > Storage")
}

main().catch(console.error)
