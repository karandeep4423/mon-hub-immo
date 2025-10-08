/**
 * Migration script to update old progress step names to new ones
 * Run this once to migrate existing collaboration data
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
	console.error(
		'❌ MONGODB_URL/MONGODB_URI is not defined in environment variables',
	);
	console.log('Available env keys:', Object.keys(process.env).slice(0, 10));
	process.exit(1);
}

// Old to new step mapping
const STEP_MIGRATION_MAP: Record<string, string> = {
	proposal: 'accord_collaboration',
	accepted: 'accord_collaboration',
	visit_planned: 'visite_programmee',
	visit_completed: 'visite_realisee',
	negotiation: 'premier_contact',
	offer_made: 'visite_programmee',
	compromise_signed: 'visite_realisee',
	final_act: 'retour_client',
};

async function migrateProgressSteps() {
	try {
		console.log('🔄 Connecting to MongoDB...');
		await mongoose.connect(MONGODB_URI as string);
		console.log('✅ Connected to MongoDB');

		const db = mongoose.connection.db;
		if (!db) {
			throw new Error('Database connection not established');
		}

		const collaborationsCollection = db.collection('collaborations');

		// Find all collaborations with old step names
		const oldCollaborations = await collaborationsCollection
			.find({
				$or: [
					{
						currentProgressStep: {
							$in: Object.keys(STEP_MIGRATION_MAP),
						},
					},
					{
						'progressSteps.id': {
							$in: Object.keys(STEP_MIGRATION_MAP),
						},
					},
				],
			})
			.toArray();

		console.log(
			`📊 Found ${oldCollaborations.length} collaborations to migrate`,
		);

		if (oldCollaborations.length === 0) {
			console.log('✅ No collaborations need migration');
			await mongoose.disconnect();
			return;
		}

		let migratedCount = 0;

		for (const collab of oldCollaborations) {
			const updates: Record<string, unknown> = {};

			// Migrate currentProgressStep if needed
			if (
				collab.currentProgressStep &&
				STEP_MIGRATION_MAP[collab.currentProgressStep]
			) {
				updates.currentProgressStep =
					STEP_MIGRATION_MAP[collab.currentProgressStep];
			}

			// Migrate progressSteps array
			if (collab.progressSteps && Array.isArray(collab.progressSteps)) {
				const newProgressSteps = [
					{
						id: 'accord_collaboration',
						title: 'Accord de collaboration',
						description: 'Accord validé par les deux agents',
						completed: false,
						current: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'premier_contact',
						title: 'Premier contact client',
						description: 'Contact initial avec le client',
						completed: false,
						current: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'visite_programmee',
						title: 'Visite programmée',
						description: 'Visite planifiée avec le client',
						completed: false,
						current: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'visite_realisee',
						title: 'Visite réalisée',
						description: 'Visite effectuée',
						completed: false,
						current: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'retour_client',
						title: 'Retour client',
						description: 'Feedback du client reçu',
						completed: false,
						current: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
				];

				updates.progressSteps = newProgressSteps;
			}

			if (Object.keys(updates).length > 0) {
				await collaborationsCollection.updateOne(
					{ _id: collab._id },
					{ $set: updates },
				);
				migratedCount++;
				console.log(`✅ Migrated collaboration ${collab._id}`);
			}
		}

		console.log(
			`\n🎉 Migration complete! Updated ${migratedCount} collaborations`,
		);
		console.log('\nNext steps:');
		console.log('1. Restart your server');
		console.log('2. Test the collaboration workflow');

		await mongoose.disconnect();
		console.log('✅ Disconnected from MongoDB');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	}
}

// Run the migration
migrateProgressSteps();
