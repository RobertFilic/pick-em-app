const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Get the data from the JSON file
//const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/eurobasket2025.json'), 'utf-8'));
//const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/FIBAAfroBasket2025.json'), 'utf-8'));
//const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/FIBAAmeriCup2025.json'), 'utf-8'));
//const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/FIBAAsiaCup2025.json'), 'utf-8'));
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/FakeData082025.json'), 'utf-8'));



// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// IMPORTANT: Use the Service Role Key for admin-level access in scripts
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Starting the seeding process...');

  // 1. Seed the competition
  console.log('Seeding competition...');
  const { data: competitionData, error: competitionError } = await supabase
    .from('competitions')
    .insert(data.competition)
    .select()
    .single();

  if (competitionError) {
    console.error('Error seeding competition:', competitionError.message);
    return;
  }
  const competitionId = competitionData.id;
  console.log(`Competition "${competitionData.name}" seeded with ID: ${competitionId}`);

  // 2. Seed the teams
  console.log('Seeding teams...');
  const { error: teamsError } = await supabase
    .from('teams')
    .upsert(data.teams, { onConflict: 'name' });

  if (teamsError) {
    console.error('Error seeding teams:', teamsError.message);
    return;
  }
  console.log(`${data.teams.length} teams seeded successfully.`);

  // 3. Fetch all teams to create a name-to-ID map
  const { data: allTeams, error: fetchTeamsError } = await supabase.from('teams').select('id, name');
  if (fetchTeamsError) {
    console.error('Error fetching teams for mapping:', fetchTeamsError.message);
    return;
  }
  const teamMap = allTeams.reduce((acc, team) => {
    acc[team.name] = team.id;
    return acc;
  }, {});
  console.log('Created team name-to-ID map.');

  // 4. Seed the team groupings
  console.log('Seeding team groupings...');
  const competitionTeamsData = data.team_groupings.map(grouping => ({
    competition_id: competitionId,
    team_id: teamMap[grouping.team],
    group: grouping.group,
  }));

  const { error: competitionTeamsError } = await supabase
    .from('competition_teams')
    .insert(competitionTeamsData);

  if (competitionTeamsError) {
    console.error('Error seeding competition_teams:', competitionTeamsError.message);
    return;
  }
  console.log(`${data.team_groupings.length} team groupings seeded.`);

  // 5. Seed the games
  console.log('Seeding games...');
  const gamesData = data.games.map(game => ({
    competition_id: competitionId,
    team_a_id: teamMap[game.team_a],
    team_b_id: teamMap[game.team_b],
    game_date: game.game_date,
    stage: game.stage,
  }));

  const { error: gamesError } = await supabase.from('games').insert(gamesData);

  if (gamesError) {
    console.error('Error seeding games:', gamesError.message);
    return;
  }
  console.log(`${data.games.length} games seeded successfully.`);
  
  console.log('Seeding process completed successfully!');
}

main().catch(e => console.error(e));