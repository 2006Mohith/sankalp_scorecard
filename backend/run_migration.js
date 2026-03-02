import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from './models/Team.js';
import Player from './models/Player.js';
import Sport from './models/Sport.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sankalp_scoreboard';

/**
 * MIGRATION SCRIPT
 * This script ensures all Players and Teams have the correct nested associations.
 * Run this ONCE to clean up legacy data if needed: `node run_migration.js`
 */
async function runMigration() {
    try {
        console.log('🔗 Connecting to DB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected successfully.\n');

        // 1. Validate All Teams
        console.log('🔍 Checking Teams...');
        const teams = await Team.find();
        let invalidTeams = 0;

        for (const team of teams) {
            const sport = await Sport.findById(team.sport_id);
            if (!sport) {
                console.warn(`⚠️ Warning: Team "${team.name}" belongs to an abandoned sportId: ${team.sport_id}`);
                invalidTeams++;
            }
        }
        console.log(`✅ Checked ${teams.length} teams. Found ${invalidTeams} invalid relationships.\n`);

        // 2. Validate All Players (if any exist)
        console.log('🔍 Checking Players...');
        const players = await Player.find();
        let updatedPlayers = 0;
        let invalidPlayers = 0;

        for (const player of players) {
            const team = await Team.findById(player.team_id);
            if (!team) {
                console.warn(`⚠️ Warning: Player "${player.name}" belongs to an abandoned teamId: ${player.team_id}`);
                invalidPlayers++;
                continue;
            }

            // Sync the player strictly to the team's sport layer protecting cross-sport assignments
            if (player.sport_id?.toString() !== team.sport_id.toString()) {
                console.log(`🔄 Migrating Player "${player.name}": Syncing sport_id to match Team "${team.name}"`);
                player.sport_id = team.sport_id;
                await player.save();
                updatedPlayers++;
            }
        }

        console.log(`✅ Checked ${players.length} players. Migrated ${updatedPlayers} records.`);
        if (invalidPlayers > 0) console.warn(`⚠️ Found ${invalidPlayers} dangling players with no team.`);

        console.log('\n🚀 MIGRATION COMPLETE!');
        process.exit(0);
    } catch (err) {
        console.error('❌ MIGRATION FAILED:', err);
        process.exit(1);
    }
}

runMigration();
