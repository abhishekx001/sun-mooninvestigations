const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminClient = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function testUpload() {
  console.log("Testing upload with service role key...")
  
  // Create dummy file
  fs.writeFileSync('dummy.txt', 'Hello world')
  const fileBuffer = fs.readFileSync('dummy.txt')
  
  const { data, error } = await adminClient.storage
    .from('case-documents')
    .upload('test_upload.txt', fileBuffer, {
      upsert: true
    })
    
  if (error) {
    console.error("Upload Failed:", error.message)
  } else {
    console.log("Upload Success:", data)
  }
}

testUpload()
