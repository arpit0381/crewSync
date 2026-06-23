const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zqfdvkywcmsghiyzsopf.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZmR2a3l3Y21zZ2hpeXpzb3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg3MTgwNywiZXhwIjoyMDk3NDQ3ODA3fQ.3DiFMFSS9gqz28KBaNeYwWFKZ1P8-CXSeFzKHzzD1KY';

const supabase = createClient(supabaseUrl, serviceKey);

async function addCategories() {
  const categories = [
    { name: "Technical", type: "technical" },
    { name: "Non-Technical", type: "department" },
    { name: "Cultural", type: "club" },
    { name: "Guest Lecture", type: "academic" }
  ];

  for (const cat of categories) {
    const { data, error } = await supabase.from('categories').insert([cat]);
    if (error) {
      if (error.code === '23505') {
        console.log(`Category ${cat.name} already exists.`);
      } else {
        console.error(`Failed to insert ${cat.name}:`, error.message);
      }
    } else {
      console.log(`Inserted ${cat.name}`);
    }
  }
}

addCategories();
