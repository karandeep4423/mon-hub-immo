# Search Ad Form Validation Feature

**Created:** 2025-10-29  
**Status:** ✅ Complete

## Overview

Added client-side validation for mandatory fields in the Search Ad creation and edit forms. Users now see clear error messages when they attempt to submit without filling required fields.

## Mandatory Fields

The following fields are now validated and required:

1. **Titre de l'annonce** (Title) - Minimum 5 characters, maximum 200 characters
2. **Description de la recherche** (Description) - Minimum 10 characters, maximum 2000 characters
3. **Type de bien recherché** (Property Type) - At least one property type must be selected

## Technical Implementation

### Architecture

Following the existing codebase patterns:

- **Zod** for validation schema
- **useForm** hook for form state and error management
- Field-level error display with red borders and error messages
- DRY principle: Single validation schema used across create/edit forms

### Files Modified

#### 1. Validation Schema (`client/lib/validation/searchAd.ts`)

**Changes:**

- Removed `.optional()` from `description` field to make it required
- Enhanced `validateSearchAdForm` to return field-specific errors in addition to general error
- Returns `errors` object mapping field names to error messages

```typescript
// Return type updated to include field-level errors
| { success: false; error: string; errors?: Record<string, string> }
```

#### 2. Form Hook (`client/hooks/useSearchAdForm.ts`)

**Changes:**

- Exposed `errors` and `setErrors` from `useForm` hook
- Created wrapper `handleSubmit` function that validates BEFORE submitting
- If validation fails, sets field errors and returns early (prevents form submission)
- If validation passes, clears errors and calls the original form submit handler
- Returns custom `handleSubmit` for use in form components

**Key implementation:**

```typescript
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
```

**This approach:**

- ✅ Prevents uncaught exceptions (no `throw` on validation failure)
- ✅ Shows field-level errors to users
- ✅ Blocks form submission when invalid
- ✅ Clears errors on successful validation

```typescript
// Now returns errors for field-level error display
return {
  values,
  isSubmitting,
  setFieldValue,
  setValues,
  handleSubmit,
  handleArrayChange,
  errors, // ← New
};
```

#### 3. Basic Info Section (`client/components/search-ads/form-sections/BasicInfoSection.tsx`)

**Changes:**

- Added `errors` prop to component interface
- Added red border styling when field has error: `border-red-500 focus:ring-red-500 focus:border-red-500`
- Display error message below each field when validation fails

**Visual feedback:**

- Title field shows error if empty or < 5 characters
- Description field shows error if empty or < 10 characters

#### 4. Property Criteria Section (`client/components/search-ads/form-sections/PropertyCriteriaSection.tsx`)

**Changes:**

- Added `errors` prop to component interface
- Added red border and background to all checkboxes when none selected: `border-red-500 bg-red-50`
- Display error message below property type checkboxes

**Visual feedback:**

- All property type checkboxes get red styling if none selected
- Error message appears under the checkbox grid

#### 5. Create Form (`client/components/search-ads/CreateSearchAdForm.tsx`)

**Changes:**

- Extract `errors` from `useSearchAdForm` hook
- Pass `errors` prop to `BasicInfoSection` and `PropertyCriteriaSection`

#### 6. Edit Form (`client/components/search-ads/EditSearchAdForm.tsx`)

**Changes:**

- Extract `errors` from `useSearchAdForm` hook
- Pass `errors` prop to `BasicInfoSection` and `PropertyCriteriaSection`

## User Experience

### Validation Trigger

- Validation runs when user clicks "Créer l'annonce" or "Enregistrer les modifications"
- If validation fails, form submission is blocked
- Error toast displays the first validation error
- Field-level errors appear on the form

### Visual Feedback

**Valid Field:**

```
[Input field with gray border]
```

**Invalid Field:**

```
[Input field with red border]
❌ Le titre doit contenir au moins 5 caractères.
```

**Property Types (Invalid):**

```
[All checkboxes with red border and pink background]
❌ Veuillez sélectionner au moins un type de bien.
```

### Error Messages (French)

| Field          | Error Condition     | Message                                                |
| -------------- | ------------------- | ------------------------------------------------------ |
| Title          | Empty or < 5 chars  | "Le titre doit contenir au moins 5 caractères."        |
| Title          | > 200 chars         | "Le titre ne peut pas dépasser 200 caractères."        |
| Description    | Empty or < 10 chars | "La description doit contenir au moins 10 caractères." |
| Description    | > 2000 chars        | "La description ne peut pas dépasser 2000 caractères." |
| Property Types | None selected       | "Veuillez sélectionner au moins un type de bien."      |

## Code Quality

### Principles Applied

✅ **KISS** (Keep It Simple, Stupid)

- Used existing `useForm` hook error handling
- Leveraged Zod validation already in codebase
- Simple conditional styling for errors

✅ **DRY** (Don't Repeat Yourself)

- Single validation schema for create/edit
- Reusable error display pattern
- Same validation logic on client and server

✅ **SOLID**

- Single Responsibility: Each component handles its own field errors
- Open/Closed: Extended form sections without modifying core logic
- Dependency Inversion: Components depend on error prop interface, not implementation

✅ **SRP** (Single Responsibility Principle)

- Validation logic in dedicated validation file
- Form state management in hook
- UI rendering in components

### Existing Patterns Used

- ✅ Error display pattern from `ui/Form.tsx`, `ui/CityAutocomplete.tsx`
- ✅ Zod validation consistent with codebase
- ✅ Form hook pattern matching existing forms
- ✅ Field-level error styling: `text-sm text-red-600`

## Testing Checklist

- [ ] Submit form with empty title → See title error
- [ ] Submit form with title < 5 chars → See title error
- [ ] Submit form with empty description → See description error
- [ ] Submit form with description < 10 chars → See description error
- [ ] Submit form with no property types selected → See property types error
- [ ] Submit form with all fields valid → Form submits successfully
- [ ] Fill invalid field after seeing error → Error disappears
- [ ] Test same validations on edit form (`/search-ads/edit/[id]`)

## Future Enhancements

Potential improvements (not implemented):

1. **Real-time validation** - Validate on blur after first submit
2. **Scroll to first error** - Automatically scroll to first invalid field
3. **Field-level validation** - Show errors as user types (after first submit)
4. **Cities validation** - Add required validation for location field
5. **Budget validation** - Ensure budget fields are filled

## Related Files

- `client/lib/validation/searchAd.ts` - Validation schema
- `client/hooks/useSearchAdForm.ts` - Form logic hook
- `client/hooks/useForm.ts` - Base form hook
- `client/components/search-ads/CreateSearchAdForm.tsx` - Create form
- `client/components/search-ads/EditSearchAdForm.tsx` - Edit form
- `client/components/search-ads/form-sections/BasicInfoSection.tsx` - Title & description
- `client/components/search-ads/form-sections/PropertyCriteriaSection.tsx` - Property types
