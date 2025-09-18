// Unified API for both collaboration workflows
export { overallStatusApi } from './overallStatusApi';
export { progressTrackingApi } from './progressTrackingApi';

// Re-export types for convenience
export type {
	OverallCollaborationStatus,
	OverallStatusUpdate,
} from '@/components/collaboration/overall-status/types';

export type {
	ProgressStep,
	ProgressUpdate,
	ProgressStepData,
} from '@/components/collaboration/progress-tracking/types';

export type {
	Collaboration,
	CollaborationActivity,
	ProposeCollaborationRequest,
	AddCollaborationNoteRequest,
} from '@/components/collaboration/shared/types';
