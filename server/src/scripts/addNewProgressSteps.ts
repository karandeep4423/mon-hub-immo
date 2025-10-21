import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Migration script to add 5 new progress steps to existing collaborations
 * New steps: offre_en_cours, negociation_en_cours, compromis_signe, signature_notaire, affaire_conclue
 */
async function addNewProgressSteps() {
	try {
		const mongoUri = process.env.MONGODB_URL;
		if (!mongoUri) {
			throw new Error('MONGODB_URL not found in environment variables');
		}

		console.log('Connecting to MongoDB...');
		await mongoose.connect(mongoUri);
		console.log('Connected to MongoDB');

		const db = mongoose.connection.db;
		if (!db) {
			throw new Error('Database connection not established');
		}

		const collaborationsCollection = db.collection('collaborations');

		// Find all collaborations
		const collaborations = await collaborationsCollection
			.find({})
			.toArray();

		console.log(`Found ${collaborations.length} collaborations to update`);

		let updatedCount = 0;

		for (const collab of collaborations) {
			const updates: Record<string, unknown> = {};

			// Check if progressSteps exists and has only 5 steps (old version)
			if (
				collab.progressSteps &&
				Array.isArray(collab.progressSteps) &&
				collab.progressSteps.length === 5
			) {
				// Add the 5 new steps
				const newSteps = [
					{
						id: 'offre_en_cours',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'negociation_en_cours',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'compromis_signe',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'signature_notaire',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'affaire_conclue',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
				];

				updates.progressSteps = [...collab.progressSteps, ...newSteps];
			} else if (
				!collab.progressSteps ||
				collab.progressSteps.length === 0
			) {
				// Initialize all 10 steps if none exist
				updates.progressSteps = [
					{
						id: 'accord_collaboration',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'premier_contact',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'visite_programmee',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'visite_realisee',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'retour_client',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'offre_en_cours',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'negociation_en_cours',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'compromis_signe',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'signature_notaire',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
					{
						id: 'affaire_conclue',
						completed: false,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					},
				];
			}

			if (Object.keys(updates).length > 0) {
				await collaborationsCollection.updateOne(
					{ _id: collab._id },
					{ $set: updates },
				);
				updatedCount++;
				console.log(
					`Updated collaboration ${collab._id} - Added new progress steps`,
				);
			}
		}

		console.log(`\n✅ Migration completed!`);
		console.log(`Total collaborations updated: ${updatedCount}`);

		await mongoose.connection.close();
		console.log('Database connection closed');
		process.exit(0);
	} catch (error) {
		console.error('Migration failed:', error);
		await mongoose.connection.close();
		process.exit(1);
	}
}

// Run the migration
addNewProgressSteps();
