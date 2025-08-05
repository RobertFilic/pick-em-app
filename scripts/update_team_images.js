/*
================================================================================
File: scripts/update_team_images.js (New File)
================================================================================
This script updates the logo_url for existing teams in your database based on
the data in a JSON file.
*/

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase URL or Service Key is missing. Make sure it's in your .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Specify the JSON file you want to use for the update
const dataFilePath = path.resolve(__dirname, '../data/FIBAAsiaCup2025.json');
const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

async function updateTeamImages() {
  const teamsToUpdate = data.teams;

  if (!teamsToUpdate || teamsToUpdate.length === 0) {
    console.log("No teams found in the JSON file to update.");
    return;
  }

  console.log(`Found ${teamsToUpdate.length} teams to update...`);

  for (const team of teamsToUpdate) {
    if (!team.name || !team.logo_url) {
      console.warn(`Skipping team with missing name or logo_url:`, team);
      continue;
    }

    console.log(`Updating logo for: ${team.name}`);

    const { error } = await supabase
      .from('teams')
      .update({ logo_url: team.logo_url })
      .eq('name', team.name);

    if (error) {
      console.error(`Error updating ${team.name}:`, error.message);
    } else {
      console.log(`  ✅ Successfully updated ${team.name}`);
    }
  }

  console.log("\nImage update process complete.");
}

updateTeamImages().catch(console.error);
