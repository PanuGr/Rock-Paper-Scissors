// Supabase initialization
import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabase = createClient('https://kwyiywrugbqvhsxyvnac.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eWl5d3J1Z2JxdmhzeHl2bmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTU0MTcsImV4cCI6MjA2MzIzMTQxN30.PKNz6AFQQuV8veIObld_8E-rTnsPuPayMc0ZnbbS69M')


async function getResults(params) {

  const { data, error } = await supabase
    .from('scoreboard')
    .select('*')

  if
    (error) {
    console.error(error);
  }
  else {
    console.log(data);
  }
}

//getResults();

async function shareScore(params) {
  const { data,error } = await supabase
    .from('scoreboard')
    .insert(
    { id: 1, name: 'Mordor' }
  )
}
