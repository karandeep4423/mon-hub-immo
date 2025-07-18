"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { z } from "zod";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  // Define Zod schema for email
  const emailSchema = z.string().email("Please enter a valid email address");

  const validateEmail = () => {
    try {
      emailSchema.parse(email);
      setErrors({ email: undefined }); // Clear error if email is valid
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ email: error.errors[0].message });
      }
      return false;
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email before submitting
    if (!validateEmail()) return;

    setLoader(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/auth/forgot-password`,
        { email }
      );
      toast.success(response.data.message);
      setEmail("");
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } finally {
      setLoader(false); // Reset loader in both success and error cases
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Mot de passe oublié
        </h2>
        <form onSubmit={handleForgotPassword}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validateEmail} // Validate on blur
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic mt-2">{errors.email}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            {loader ? (
              <button
                className="w-full cursor-not-allowed bg-[#784F33] hover:bg-[#E0C49D] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled
              >
                loading...
              </button>
            ) : (
              <button
                className="w-full bg-[#784F33]  hover:bg-[#E0C49D] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Mot de passe oublié
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
