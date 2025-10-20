import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from project root
dotenv.config();

/**
 * Migration Script: Rename collaboration fields for generic post support
 *
 * This script migrates existing collaborations from property-specific fields
 * to generic post fields that support both properties and search ads:
 * - propertyId -> postId
 * - propertyOwnerId -> postOwnerId
 * - Add postType field (default: 'property')
 */

interface OldCollaboration {
	_id: mongoose.Types.ObjectId;
	propertyId: mongoose.Types.ObjectId;
	propertyOwnerId: mongoose.Types.ObjectId;
	postType?: string;
	postId?: mongoose.Types.ObjectId;
	postOwnerId?: mongoose.Types.ObjectId;
}

async function migrateCollaborations() {
	try {
		console.log('🚀 Starting collaboration migration...\n');

		// Connect to MongoDB
		const mongoUri =
			process.env.MONGODB_URL || 'mongodb://localhost:27017/mon-hub-immo';
		console.log(
			`📡 Connecting to: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`,
		);

		await mongoose.connect(mongoUri);
		console.log('✅ Connected to MongoDB\n');

		const db = mongoose.connection.db;
		if (!db) {
			throw new Error('Database connection not established');
		}

		const collaborationsCollection =
			db.collection<OldCollaboration>('collaborations');

		// Count total documents
		const totalCount = await collaborationsCollection.countDocuments({});
		console.log(`📊 Found ${totalCount} collaboration(s) to migrate\n`);

		if (totalCount === 0) {
			console.log(
				'✅ No collaborations to migrate. Database is ready for new schema!',
			);
			await mongoose.disconnect();
			return;
		}

		// Find collaborations that need migration (have old field names)
		const toMigrate = await collaborationsCollection.countDocuments({
			propertyId: { $exists: true },
		});

		console.log(`🔄 Migrating ${toMigrate} collaboration(s)...\n`);

		if (toMigrate === 0) {
			console.log('✅ All collaborations are already migrated!');
			await mongoose.disconnect();
			return;
		}

		// Perform the migration using bulk operations for efficiency
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const bulkOps: any[] = [];

		const cursor = collaborationsCollection.find({
			propertyId: { $exists: true },
		});

		let count = 0;
		while (await cursor.hasNext()) {
			const doc = await cursor.next();
			if (!doc) continue;

			count++;

			// Add update operation to bulk
			bulkOps.push({
				updateOne: {
					filter: { _id: doc._id },
					update: {
						$set: {
							postId: doc.propertyId,
							postOwnerId: doc.propertyOwnerId,
							postType: 'Property',
						},
						$unset: {
							propertyId: '',
							propertyOwnerId: '',
						},
					},
				},
			});

			// Execute bulk operation every 1000 documents
			if (bulkOps.length >= 1000) {
				await collaborationsCollection.bulkWrite(bulkOps);
				console.log(`   ✓ Migrated ${count} collaborations...`);
				bulkOps.length = 0; // Clear array
			}
		}

		// Execute remaining operations
		if (bulkOps.length > 0) {
			await collaborationsCollection.bulkWrite(bulkOps);
			console.log(`   ✓ Migrated ${count} collaborations...`);
		}

		console.log('\n✅ Phase 1: Field migration completed!\n');

		// Phase 2: Fix postType casing (searchAd -> SearchAd, property -> Property)
		console.log('🔄 Phase 2: Updating postType values to PascalCase...\n');

		const lowercasePostTypes =
			await collaborationsCollection.countDocuments({
				postType: { $in: ['property', 'searchAd'] },
			});

		if (lowercasePostTypes > 0) {
			console.log(
				`   Found ${lowercasePostTypes} collaboration(s) with lowercase postType`,
			);

			// Update property -> Property
			const propertyResult = await collaborationsCollection.updateMany(
				{ postType: 'property' },
				{ $set: { postType: 'Property' } },
			);
			console.log(
				`   ✓ Updated ${propertyResult.modifiedCount} 'property' -> 'Property'`,
			);

			// Update searchAd -> SearchAd
			const searchAdResult = await collaborationsCollection.updateMany(
				{ postType: 'searchAd' },
				{ $set: { postType: 'SearchAd' } },
			);
			console.log(
				`   ✓ Updated ${searchAdResult.modifiedCount} 'searchAd' -> 'SearchAd'`,
			);
		} else {
			console.log('   ✓ All postType values already in correct case');
		}

		console.log('\n✅ Phase 2: postType casing update completed!\n');

		// Verify migration
		const remaining = await collaborationsCollection.countDocuments({
			propertyId: { $exists: true },
		});

		const migrated = await collaborationsCollection.countDocuments({
			postId: { $exists: true },
			postType: { $in: ['Property', 'SearchAd'] },
		});

		console.log('📊 Migration Summary:');
		console.log(`   - Total collaborations: ${totalCount}`);
		console.log(`   - Successfully migrated: ${migrated}`);
		console.log(`   - Remaining to migrate: ${remaining}`);

		if (remaining > 0) {
			console.warn(
				`\n⚠️  Warning: ${remaining} collaboration(s) still have old field names`,
			);
		} else {
			console.log('\n🎉 All collaborations successfully migrated!');
		}

		// Close connection
		await mongoose.disconnect();
		console.log('\n✅ Database connection closed');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		await mongoose.disconnect();
		process.exit(1);
	}
}

// Run migration if executed directly
if (require.main === module) {
	migrateCollaborations()
		.then(() => {
			console.log('\n✨ Migration script completed');
			process.exit(0);
		})
		.catch((error) => {
			console.error('❌ Migration script failed:', error);
			process.exit(1);
		});
}

export { migrateCollaborations };
