import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase } from '../config/database.js';
import { Group } from '../models/Group.js';

// Resolve __dirname in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '../groups.json');

interface LegacyGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdAt: string;
  notificationEmails?: string[];
}

async function migrateData() {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Check if groups.json exists
    if (!existsSync(DATA_FILE)) {
      console.log('❌ groups.json file not found. Nothing to migrate.');
      process.exit(0);
    }

    // Read existing data
    const rawData = readFileSync(DATA_FILE, 'utf-8');
    const legacyGroups: LegacyGroup[] = JSON.parse(rawData);

    if (legacyGroups.length === 0) {
      console.log('✅ No data found in groups.json. Migration not needed.');
      process.exit(0);
    }

    console.log(`📦 Found ${legacyGroups.length} groups to migrate...`);

    // Check if any groups already exist in MongoDB
    const existingCount = await Group.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Warning: Found ${existingCount} existing groups in MongoDB.`);
      console.log('   This migration will add the JSON data to the existing database.');
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const legacyGroup of legacyGroups) {
      try {
        // Check if a group with the same name already exists
        const existingGroup = await Group.findOne({ name: legacyGroup.name });
        
        if (existingGroup) {
          console.log(`⏭️  Skipping "${legacyGroup.name}" - group with same name already exists`);
          skippedCount++;
          continue;
        }

        // Create new group in MongoDB
        const newGroup = new Group({
          name: legacyGroup.name,
          description: legacyGroup.description || '',
          members: legacyGroup.members || [],
          notificationEmails: legacyGroup.notificationEmails || [],
          createdAt: new Date(legacyGroup.createdAt)
        });

        await newGroup.save();
        console.log(`✅ Migrated group: "${legacyGroup.name}"`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrating group "${legacyGroup.name}":`, error);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migratedCount} groups`);
    console.log(`   ⏭️  Skipped (duplicates): ${skippedCount} groups`);
    console.log(`   📊 Total processed: ${legacyGroups.length} groups`);

    if (migratedCount > 0) {
      console.log('\n🎉 Data migration completed successfully!');
      console.log('💡 You can now safely use the MongoDB-powered server.');
      console.log('📋 Recommendation: Backup groups.json before deleting it.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run migration
migrateData();