"use client";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Define Zod schema with additional fields
const RegisterSchema = z.object({
  email: z.string().email("Format d'e-mail invalide"),
  firstName: z
    .string()
    .min(2, "Au moins 2 caractères requis")
    .max(50, "Max 50 caractères autorisés")
    .regex(/^[a-zA-Z]+$/, "Seuls les caractères alphabétiques sont autorisés"),
  lastName: z
    .string()
    .min(2, "Au moins 2 caractères requis")
    .max(50, "Max 50 caractères autorisés")
    .regex(/^[a-zA-Z]+$/, "Seuls les caractères alphabétiques sont autorisés"),
  phone: z
    .string()
    .regex(/^(0|\+33)[1-9]\d{8}$/, "Format de téléphone invalide"),
  city: z.string().min(2, "Le nom de la ville est trop court"),
  address: z.string().min(5, "L'adresse est trop courte"),
  postalCode: z.string().regex(/^\d{5}$/, "Format de code postal invalide"),
  country: z.string().min(2, "Le nom du pays est trop court"),
  password: z
    .string()
    .min(8, "Le mot de passe doit comporter au moins 8 caractères"),
});

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    address: "",
    postalCode: "",
    country: "",
    parrain: "",
    NomDeCompany: "",
    SIRET: "",
    IBAN: "",
    VAT: "",
    password: "",
    email: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string[]>>
  >({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value});
  };

  const handleRegister = async () => {
    const validation = RegisterSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof typeof formData, string[]>> = {};
      validation.error.errors.forEach((err) => {
        const fieldName = err.path[0] as keyof typeof formData;
        fieldErrors[fieldName] = fieldErrors[fieldName]
          ? [...fieldErrors[fieldName], err.message]
          : [err.message];
      });
      setErrors(fieldErrors);
      toast.error("Le formulaire n'est pas valide");
      return;
    }

    setErrors({});
    setLoader(true);

    try {
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/auth/sign-up`,
        formData
      );
      toast.success("Le lien de vérification par e-mail a été envoyé !");
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        city: "",
        address: "",
        postalCode: "",
        country: "",
        parrain: "",
        NomDeCompany: "",
        SIRET: "",
        IBAN: "",
        VAT: "",
        password: "",
        email: "",
      });
      router.replace(
        `${process.env.NEXT_PUBLIC_URL}/auth/verify-code/${result?.data.id}`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className=" min-h-screen flex items-center justify-center bg-slate-200">
      {/* right section */}
      <div className="mx-4 hidden lg:flex flex-col items-center justify-center">
        <div>
          <h2 className="text-xl mb-5 text-center font-semibold">
            Vos voyages sur mesure
          </h2>
          <h3 className="text-5xl text-center font-bold">
            Votre clé pour des voyages inoubliables{" "}
          </h3>
        </div>
        {/* <div className="mt-16">
          <h3 className="text-gray-400">Do you have account?</h3>
          <div className="flex gap-2 items-center">
            <Link className="font-bold" href="/auth/sign-in">
              Login
            </Link>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path d="M11.293 4.707 17.586 11H4v2h13.586l-6.293 6.293 1.414 1.414L21.414 12l-8.707-8.707-1.414 1.414z" />
            </svg>
          </div>
        </div> */}
      </div>
      <div className="mx-5 mt-24 my-10 bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Enregistrez vous
        </h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 ">
            {/* First Name Field */}
            <div className="mb-4">
              <label
                htmlFor="firstName"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Prénom*
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.firstName ? "border-red-500" : ""
                }`}
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Entrez le prénom"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs italic">
                  {errors.firstName.join(", ")}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div className="mb-4">
              <label
                htmlFor="lastName"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Nom de famille*
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.lastName ? "border-red-500" : ""
                }`}
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Entrez le nom de famille"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs italic">
                  {errors.lastName.join(", ")}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Téléphone*
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.phone ? "border-red-500" : ""
                }`}
                id="phone"
                type="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Entrez le numéro de téléphone"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs italic">
                  {errors.phone.join(", ")}
                </p>
              )}
            </div>

            {/* City Field */}
            <div className="mb-4">
              <label
                htmlFor="city"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Ville*
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.city ? "border-red-500" : ""
                }`}
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Entrez la ville"
              />
              {errors.city && (
                <p className="text-red-500 text-xs italic">
                  {errors.city.join(", ")}
                </p>
              )}
            </div>

            {/* Address Field */}
            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Adresse*
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.address ? "border-red-500" : ""
                }`}
                id="address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Entrez l'adresse"
              />
              {errors.address && (
                <p className="text-red-500 text-xs italic">
                  {errors.address.join(", ")}
                </p>
              )}
            </div>

            {/* Postal Code Field */}
            <div className="mb-4">
              <label
                htmlFor="postalCode"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Code Postal*
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.postalCode ? "border-red-500" : ""
                }`}
                id="postalCode"
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Entrez le code postal"
              />
              {errors.postalCode && (
                <p className="text-red-500 text-xs italic">
                  {errors.postalCode.join(", ")}
                </p>
              )}
            </div>

            {/* Country Field */}
            <div className="mb-4">
              <label
                htmlFor="country"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Pays*
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.country ? "border-red-500" : ""
                }`}
                id="country"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Entrez le pays"
              />
              {errors.country && (
                <p className="text-red-500 text-xs italic">
                  {errors.country.join(", ")}
                </p>
              )}
            </div>

            {/* Parrain Field */}
            <div className="mb-4">
              <label
                htmlFor="text"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Parrain
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline 
                 `}
                id="parrain"
                type="text"
                name="parrain"
                value={formData.parrain}
                onChange={handleChange}
                placeholder="Entrez Parrain"
              />
            </div>

            {/* Nom de société */}
            <div className="mb-4">
              <label
                htmlFor="NomDeCompany"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Nom de société
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline 
                `}
                id="NomDeCompany"
                type="text"
                name="NomDeCompany"
                value={formData.NomDeCompany}
                onChange={handleChange}
                placeholder="Nom de société"
              />
            </div>

            {/* SIRET (Business Identification Number) */}
            <div className="mb-4">
              <label
                htmlFor="SIRET"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                SIRET
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
                id="SIRET"
                type="text"
                name="SIRET"
                value={formData.SIRET}
                onChange={handleChange}
                placeholder="Entrez le SIRET (Business Identification Number)"
              />
              {errors.country && (
                <p className="text-red-500 text-xs italic">
                  {errors.country.join(", ")}
                </p>
              )}
            </div>

            {/*IBAN (International Bank Account Number) */}
            <div className="mb-4">
              <label
                htmlFor="IBAN"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                IBAN
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
                id="IBAN"
                type="text"
                name="IBAN"
                value={formData.IBAN}
                onChange={handleChange}
                placeholder="Entrez le IBAN (International Bank Account Number)"
              />
              {errors.country && (
                <p className="text-red-500 text-xs italic">
                  {errors.country.join(", ")}
                </p>
              )}
            </div>

            {/*VAT Number*/}
            <div className="mb-4">
              <label
                htmlFor="VAT"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                VAT Number
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
                id="VAT"
                type="text"
                name="VAT"
                value={formData.VAT}
                onChange={handleChange}
                placeholder="Entrez le VAT Number"
              />
              {errors.country && (
                <p className="text-red-500 text-xs italic">
                  {errors.country.join(", ")}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Email*
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.email ? "border-red-500" : ""
                }`}
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Entrez l'e-mail"
              />
              {errors.email && (
                <p className="text-red-500 text-xs italic">
                  {errors.email.join(", ")}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Mot de passe*
              </label>
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  errors.password ? "border-red-500" : ""
                }`}
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Entrez le mot de passe"
              />
              {errors.password && (
                <p className="text-red-500 text-xs italic">
                  {errors.password.join(", ")}
                </p>
              )}
            </div>
          </div>
          <div>
            <button
              className="w-full bg-[#784F33] hover:bg-[#E0C49D] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleRegister}
            >
              {loader ? "Chargement..." : "Enregistrez vous"}
            </button>
            <div className="my-4 grid grid-cols-3 items-center text-black">
              <hr className="border-black" />
              <p className="text-center text-sm">OU</p>
              <hr className="border-black" />
            </div>
            <Link href="/auth/sign-in" passHref>
              <button className="w-full bg-[#784F33] hover:bg-[#E0C49D] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Connectez-vous ici
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
