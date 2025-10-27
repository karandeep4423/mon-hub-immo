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
) => ({
	...data,
	authorId: userId,
	status: data.status,
	authorType: userType,
	location: {
		cities: data.cities.split(',').map((city) => city.trim()),
		maxDistance: data.maxDistance,
		openToOtherAreas: data.openToOtherAreas,
	},
	propertyTypes: data.propertyTypes as (
		| 'house'
		| 'apartment'
		| 'land'
		| 'building'
		| 'commercial'
	)[],
	budget: {
		max: data.budgetMax,
		ideal: data.budgetIdeal,
		financingType: data.financingType,
		isSaleInProgress: data.isSaleInProgress,
		hasBankApproval: data.hasBankApproval,
	},
	priorities: {
		mustHaves: data.mustHaves,
		niceToHaves: data.niceToHaves,
		dealBreakers: data.dealBreakers,
	},
	badges: data.badges,
	clientInfo: data.clientInfo,
});

export const useSearchAdForm = (mode: 'create' | 'edit', editId?: string) => {
	const router = useRouter();
	const { user } = useAuth();

	const { values, isSubmitting, setFieldValue, handleSubmit, setValues } =
		useForm<SearchAdFormData>({
			initialValues: INITIAL_FORM_VALUES,
			onSubmit: async (data) => {
				if (!user) {
					throw new Error(
						mode === 'create'
							? 'Vous devez être connecté pour créer une annonce.'
							: 'Vous devez être connecté pour modifier une annonce.',
					);
				}

				const validation = validateSearchAdForm(data);
				if (!validation.success) {
					throw new Error(validation.error);
				}

				const adData = transformFormDataToAdData(
					data,
					user._id,
					user.userType as 'agent' | 'apporteur',
				);

				if (mode === 'create') {
					await searchAdApi.createSearchAd(
						adData as Parameters<
							typeof searchAdApi.createSearchAd
						>[0],
					);
					router.push(Features.SearchAds.SEARCH_AD_ROUTES.MY_ADS);
				} else if (mode === 'edit' && editId) {
					await searchAdApi.updateSearchAd(
						editId,
						adData as Parameters<
							typeof searchAdApi.updateSearchAd
						>[1],
					);
					router.push(Features.Dashboard.DASHBOARD_ROUTES.BASE);
				}
			},
		});

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
	};
};
