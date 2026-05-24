import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ggwbzxntgifzsbtpzosv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnd2J6eG50Z2lmenNidHB6b3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTU0NDc1NywiZXhwIjoyMDk1MTIwNzU3fQ.GC94YulvTSTUBc-IzsuoxRyEmSwJJiYeZKDwUdZlzZM'

export const supabase = createClient(supabaseUrl, supabaseKey)