import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from '@/hooks/useForm';
import { validateSearchAdForm } from '@/lib/validation/searchAd';
import searchAdApi from '@/lib/api/searchAdApi';
import type { SearchAd } from '@/types/searchAd';
import { Features } from '@/lib/constants';

export interface SearchAdFormData extends Record<string, unknown> {
	title: string;
	description: string;
	propertyTypes: string[];
	propertyState: string[];
	projectType: string;
	cities: string;
	maxDistance?: number;
	openToOtherAreas: boolean;
	budgetMax: number;
	budgetIdeal?: number;
	financingType: string;
	isSaleInProgress: boolean;
	hasBankApproval: boolean;
	minSurface?: number;
	minRooms?: number;
	minBedrooms?: number;
	hasExterior: boolean;
	hasParking: boolean;
	acceptedFloors?: string;
	desiredState: string[];
	mustHaves: string[];
	niceToHaves: string[];
	dealBreakers: string[];
	status: 'active' | 'paused' | 'fulfilled' | 'sold' | 'rented' | 'archived';
	badges: string[];
	clientInfo?: SearchAd['clientInfo'];
}

const INITIAL_FORM_VALUES: SearchAdFormData = {
	title: '',
	description: '',
	propertyTypes: [],
	propertyState: [],
	projectType: '',
	cities: '',
	maxDistance: undefined,
	openToOtherAreas: false,
	budgetMax: 0,
	budgetIdeal: undefined,
	financingType: '',
	isSaleInProgress: false,
	hasBankApproval: false,
	minSurface: undefined,
	minRooms: undefined,
	minBedrooms: undefined,
	hasExterior: false,
	hasParking: false,
	acceptedFloors: undefined,
	desiredState: [],
	mustHaves: [],
	niceToHaves: [],
	dealBreakers: [],
	status: 'active',
	badges: [],
	clientInfo: {},
};

const transformFormDataToAdData = (
	data: SearchAdFormData,
	userId: string,
	userType: 'agent' | 'apporteur',
) => {
	// Build base data
	const transformed: Record<string, unknown> = {
		...data,
		authorId: userId,
		status: data.status,
		authorType: userType,
		propertyTypes: data.propertyTypes as (
			| 'house'
			| 'apartment'
			| 'land'
			| 'building'
			| 'commercial'
		)[],
		priorities: {
			mustHaves: data.mustHaves,
			niceToHaves: data.niceToHaves,
			dealBreakers: data.dealBreakers,
		},
		badges: data.badges,
		clientInfo: data.clientInfo,
	};

	// Only add location if cities are provided
	if (data.cities && data.cities.trim()) {
		transformed.location = {
			cities: data.cities.split(',').map((city) => city.trim()),
			maxDistance: data.maxDistance,
			openToOtherAreas: data.openToOtherAreas,
		};
	}

	// Only add budget if budgetMax is provided
	if (data.budgetMax && data.budgetMax > 0) {
		transformed.budget = {
			max: data.budgetMax,
			ideal: data.budgetIdeal,
			financingType: data.financingType,
			isSaleInProgress: data.isSaleInProgress,
			hasBankApproval: data.hasBankApproval,
		};
	}

	return transformed;
};

export const useSearchAdForm = (mode: 'create' | 'edit', editId?: string) => {
	const router = useRouter();
	const { user } = useAuth();

	const {
		values,
		isSubmitting,
		setFieldValue,
		handleSubmit: formHandleSubmit,
		setValues,
		errors,
		setErrors,
	} = useForm<SearchAdFormData>({
		initialValues: INITIAL_FORM_VALUES,
		onSubmit: async (data) => {
			if (!user) {
				throw new Error(
					mode === 'create'
						? 'Vous devez être connecté pour créer une annonce.'
						: 'Vous devez être connecté pour modifier une annonce.',
				);
			}

			const adData = transformFormDataToAdData(
				data,
				user._id,
				user.userType as 'agent' | 'apporteur',
			);

			if (mode === 'create') {
				await searchAdApi.createSearchAd(
					adData as Parameters<typeof searchAdApi.createSearchAd>[0],
				);
				router.push(Features.Dashboard.DASHBOARD_ROUTES.BASE);
			} else if (mode === 'edit' && editId) {
				await searchAdApi.updateSearchAd(
					editId,
					adData as Parameters<typeof searchAdApi.updateSearchAd>[1],
				);
				router.push(Features.Dashboard.DASHBOARD_ROUTES.BASE);
			}
		},
	});

	// Wrap handleSubmit to add validation
	const handleSubmit = async (e?: React.FormEvent) => {
		if (e) {
			e.preventDefault();
		}

		// Validate before submitting
		const validation = validateSearchAdForm(values);
		if (!validation.success) {
			if (validation.errors) {
				setErrors(validation.errors);
			}
			return; // Don't submit if validation fails
		}

		// Clear any previous errors and submit
		setErrors({});
		await formHandleSubmit(e);
	};

	const handleArrayChange = (
		value: string,
		checked: boolean,
		field: keyof Pick<
			SearchAdFormData,
			| 'propertyTypes'
			| 'propertyState'
			| 'desiredState'
			| 'mustHaves'
			| 'niceToHaves'
			| 'dealBreakers'
			| 'badges'
		>,
	) => {
		const currentArray = values[field] as string[];
		const newArray = checked
			? [...currentArray, value]
			: currentArray.filter((item) => item !== value);
		setFieldValue(field, newArray);
	};

	return {
		values,
		isSubmitting,
		setFieldValue,
		setValues,
		handleSubmit,
		handleArrayChange,
		errors,
	};
};
