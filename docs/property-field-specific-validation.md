# 🏠 Property Form - Field-Specific Validation Messages

**Updated:** 2025-11-05  
**Status:** ✅ All fields now return specific French error messages

---

## 🎯 What Changed

**Before:**

```json
{
  "success": false,
  "message": "Erreur lors de la création de la propriété" // Generic ❌
}
```

**After:**

```json
{
  "success": false,
  "message": "Format de date invalide (MM/AAAA attendu)", // Specific ✅
  "fieldErrors": {
    "availableFromDate": "Format de date invalide (MM/AAAA attendu)"
  }
}
```

---

## 📋 Complete Field Validation Table

### Required Fields

| Field               | Validation       | Error Message (French)                                  |
| ------------------- | ---------------- | ------------------------------------------------------- |
| **title**           | Required         | `Le titre est requis`                                   |
|                     | Min 10 chars     | `Le titre doit contenir au moins 10 caractères`         |
|                     | Max 200 chars    | `Le titre doit contenir moins de 200 caractères`        |
| **description**     | Required         | `La description est requise`                            |
|                     | Min 50 chars     | `La description doit contenir au moins 50 caractères`   |
|                     | Max 2000 chars   | `La description doit contenir moins de 2000 caractères` |
| **price**           | Required         | `Le prix est requis`                                    |
|                     | Must be number   | `Le prix doit être un nombre valide`                    |
|                     | Min 1000€        | `Le prix minimum est de 1000€`                          |
|                     | Max 50M€         | `Le prix maximum est de 50,000,000€`                    |
| **surface**         | Required         | `La surface est requise`                                |
|                     | Must be number   | `La surface doit être un nombre valide`                 |
|                     | Min 1 m²         | `La surface minimum est de 1 m²`                        |
|                     | Max 10,000 m²    | `La surface maximum est de 10,000 m²`                   |
| **propertyType**    | Required         | `Le type de bien est requis`                            |
|                     | Invalid value    | `Type de bien invalide`                                 |
| **transactionType** | Required         | `Le type de transaction est requis`                     |
|                     | Invalid value    | `Type de transaction invalide`                          |
| **address**         | Required         | `L'adresse est requise`                                 |
|                     | Max 200 chars    | `L'adresse est trop longue`                             |
| **city**            | Required         | `La ville est requise`                                  |
|                     | Min 2 chars      | `La ville doit contenir au moins 2 caractères`          |
|                     | Max 100 chars    | `Le nom de ville est trop long`                         |
| **postalCode**      | Required         | `Le code postal est requis`                             |
|                     | Must be 5 digits | `Code postal doit contenir 5 chiffres`                  |
| **sector**          | Required         | `Le secteur est requis`                                 |
|                     | Max 100 chars    | `Le secteur est trop long`                              |
| **mainImage**       | Required         | `L'image principale est requise`                        |

---

### Optional Numeric Fields

| Field                    | Validation     | Error Message (French)                                      |
| ------------------------ | -------------- | ----------------------------------------------------------- |
| **rooms**                | Must be number | `Le nombre de pièces doit être un nombre valide`            |
|                          | Min 1          | `Nombre de pièces minimum: 1`                               |
|                          | Max 50         | `Nombre de pièces maximum: 50`                              |
| **bedrooms**             | Must be number | `Le nombre de chambres doit être un nombre valide`          |
|                          | Min 0          | `Nombre de chambres minimum: 0`                             |
|                          | Max 20         | `Nombre de chambres maximum: 20`                            |
| **bathrooms**            | Must be number | `Le nombre de salles de bain doit être un nombre valide`    |
|                          | Min 0          | `Nombre de salles de bain minimum: 0`                       |
|                          | Max 10         | `Nombre de salles de bain maximum: 10`                      |
| **floor**                | Must be number | `L'étage doit être un nombre valide`                        |
|                          | Min -5         | `Étage minimum: -5`                                         |
|                          | Max 100        | `Étage maximum: 100`                                        |
| **totalFloors**          | Must be number | `Le nombre d'étages doit être un nombre valide`             |
|                          | Min 1          | `Nombre d'étages minimum: 1`                                |
|                          | Max 200        | `Nombre d'étages maximum: 200`                              |
| **levels**               | Must be number | `Le nombre de niveaux doit être un nombre valide`           |
|                          | Min 1          | `Nombre de niveaux minimum: 1`                              |
|                          | Max 20         | `Nombre de niveaux maximum: 20`                             |
| **parkingSpaces**        | Must be number | `Le nombre de places de parking doit être un nombre valide` |
|                          | Min 0          | `Nombre de places de parking minimum: 0`                    |
|                          | Max 50         | `Nombre de places de parking maximum: 50`                   |
| **landArea**             | Must be number | `La surface du terrain doit être un nombre valide`          |
|                          | Min 1 m²       | `Surface du terrain minimum: 1 m²`                          |
|                          | Max 1M m²      | `Surface du terrain maximum: 1,000,000 m²`                  |
| **yearBuilt**            | Must be number | `L'année de construction doit être un nombre valide`        |
| **annualCondoFees**      | Must be number | `Les charges annuelles doivent être un nombre valide`       |
|                          | Min 0          | `Les charges ne peuvent pas être négatives`                 |
|                          | Max 100,000    | `Charges annuelles trop élevées`                            |
| **agencyFeesPercentage** | Must be number | `Le pourcentage doit être un nombre valide`                 |
|                          | Min 0%         | `Le pourcentage ne peut pas être négatif`                   |
|                          | Max 100%       | `Le pourcentage ne peut pas dépasser 100%`                  |

---

### Optional Text/Enum Fields

| Field                | Validation             | Error Message (French)        |
| -------------------- | ---------------------- | ----------------------------- |
| **energyRating**     | Must be A-G or special | `Classe énergétique invalide` |
| **gasEmissionClass** | Must be A-G or special | `Classe GES invalide`         |
| **condition**        | Must be valid value    | `État du bien invalide`       |
| **status**           | Must be valid value    | `Statut invalide`             |
| **propertyNature**   | Max 100 chars          | `Nature du bien trop longue`  |
| **saleType**         | Max 100 chars          | `Type de vente trop long`     |
| **tariffLink**       | Max 500 chars          | `Lien des tarifs trop long`   |
| **exterior[]**       | Must be valid type     | `Type d'extérieur invalide`   |

---

### Date Fields

| Field                 | Validation     | Error Message (French)                      |
| --------------------- | -------------- | ------------------------------------------- |
| **availableFromDate** | Format MM/AAAA | `Format de date invalide (MM/AAAA attendu)` |

**Examples:**

- ✅ Valid: `"05/2025"`
- ❌ Invalid: `"05/11"` → Error shown
- ❌ Invalid: `"2025-05"` → Error shown
- ❌ Invalid: `"May 2025"` → Error shown

---

## 🔧 Technical Implementation

### 1. Frontend Validation (Pre-submit)

```typescript
// client/components/properties/PropertyForm.tsx
const validatePropertyData = (data) => {
  const fieldErrors = {};

  if (!data.title || data.title.length < 10) {
    fieldErrors.title = "Le titre doit contenir au moins 10 caractères";
  }

  if (data.price < 1000) {
    fieldErrors.price = "Le prix minimum est de 1000€";
  }

  // ... more validations

  return { isValid: Object.keys(fieldErrors).length === 0, fieldErrors };
};
```

### 2. Backend Validation (Controller)

```typescript
// server/src/controllers/propertyController.ts
const validationResult = validatePropertyData(req.body);

if (!validationResult.success) {
  res.status(400).json({
    success: false,
    message: validationResult.errors, // Combined message
    fieldErrors: validationResult.fieldErrors, // Field-specific map
  });
  return;
}
```

### 3. Mongoose Schema Validation

```typescript
// server/src/models/Property.ts
price: {
  type: Number,
  required: [true, 'Le prix est requis'],
  min: [1000, 'Le prix minimum est de 1000€'],
  max: [50000000, 'Le prix maximum est de 50,000,000€'],
}
```

### 4. Error Response Format

```json
{
  "success": false,
  "message": "Le titre doit contenir au moins 10 caractères, Format de date invalide (MM/AAAA attendu)",
  "fieldErrors": {
    "title": "Le titre doit contenir au moins 10 caractères",
    "availableFromDate": "Format de date invalide (MM/AAAA attendu)"
  }
}
```

---

## 🎨 Frontend Display

The frontend should display errors in two ways:

### 1. **Field-Level Errors** (Under each input)

```tsx
{
  fieldErrors.title && (
    <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>
  );
}
```

### 2. **Toast Notification** (For general message)

```tsx
toast.error(error.message); // Shows combined message
```

---

## 📊 Error Scenarios

| User Action           | Backend Response                      | User Sees                                       |
| --------------------- | ------------------------------------- | ----------------------------------------------- |
| Submits empty title   | 400 + `fieldErrors.title`             | "Le titre est requis" (under field)             |
| Enters title "Test"   | 400 + `fieldErrors.title`             | "Le titre doit contenir au moins 10 caractères" |
| Enters price "500"    | 400 + `fieldErrors.price`             | "Le prix minimum est de 1000€"                  |
| Enters "abc" in price | 400 + `fieldErrors.price`             | "Le prix doit être un nombre valide"            |
| Date "05/11"          | 400 + `fieldErrors.availableFromDate` | "Format de date invalide (MM/AAAA attendu)"     |
| Multiple errors       | 400 + all `fieldErrors`               | Shows all errors at once                        |
| Valid data + DB error | 500                                   | "Erreur lors de la création de la propriété"    |

---

## ✅ Benefits

1. **🎯 Precise Feedback** - Users know exactly which field is wrong
2. **🇫🇷 Consistent Language** - All errors in French
3. **⚡ Faster Fixes** - No guessing what's wrong
4. **📱 Better UX** - Errors appear next to the problematic field
5. **🔍 Easier Debugging** - Developers see field-specific errors in logs

---

## 🚀 Testing Checklist

- [ ] Submit form with empty required fields → See specific errors
- [ ] Enter title with 5 chars → See "au moins 10 caractères"
- [ ] Enter price "abc" → See "doit être un nombre valide"
- [ ] Enter price "500" → See "minimum est de 1000€"
- [ ] Enter date "05/11" → See "Format de date invalide (MM/AAAA attendu)"
- [ ] Enter postal code "123" → See "doit contenir 5 chiffres"
- [ ] Enter valid data → Successfully creates property
- [ ] Check console logs → See field names in error objects

---

## 📝 Frontend Integration Example

```typescript
// Example usage in PropertyForm component
const handleSubmit = async (formData: PropertyFormData) => {
  try {
    await api.post("/properties", formData);
    toast.success("Bien créé avec succès");
  } catch (error) {
    const apiError = handleApiError(error);

    // Show general toast
    toast.error(apiError.message);

    // Set field-level errors
    if (apiError.fieldErrors) {
      setFieldErrors(apiError.fieldErrors);
    }
  }
};
```

---

## 🎉 Result

Users now get **clear, field-specific French error messages** for every validation issue, eliminating confusion and improving the form completion experience!
