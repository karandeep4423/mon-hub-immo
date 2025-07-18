"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
// import { signIn } from "next-auth/react";
import * as z from "zod";
import Link from "next/link";
// import { useSession } from "next-auth/react";

// Define Zod schema for validation
const SignInSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const SignIn: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  // const { status } = useSession();

  // Handle form submission
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Validate form data with Zod
    const result = SignInSchema.safeParse({ email, password });

    if (!result.success) {
      // Extract validation errors and display them
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err:any) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Veuillez fournir des entrées valides.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // If validation succeeds, reset errors
    setErrors({});
    if (status === "loading") {
      setLoader(true);
    }
    // Attempt to sign in with validated data
    const data = result.data;
    // const signInResult = await signIn("credentials", {
    //   redirect: false,
    //   email: data.email,
    //   password: data.password,
    // });

    // if (signInResult?.error) {
    //   toast.error(signInResult?.error);
    // }
    // setLoader(false);

    // if (signInResult?.url) {
    //   router.replace("/dashboard");
    // }
  };

  return (
    <div className="min-h-screen max-w-screen-xl m-auto mt-10 flex items-center justify-center">
      {/* right section */}
      <div className="mx-4 lg:flex hidden flex-col items-center justify-center">
        <div>
          <h2 className="text-xl mb-5 text-center font-semibold">Vos voyages sur mesure</h2>
          <h3 className="text-5xl text-center font-bold">
            Votre clé pour des voyages inoubliables{" "}
          </h3>
        </div>
        {/* <div className="mt-16">
          <h3 className="text-gray-400">Don&apos;t have account?</h3>
          <div className="flex gap-2 items-center">
            <Link className="font-bold" href="/auth/sign-up">
              Create account
            </Link>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path d="M11.293 4.707 17.586 11H4v2h13.586l-6.293 6.293 1.414 1.414L21.414 12l-8.707-8.707-1.414 1.414z" />
            </svg>
          </div>
        </div> */}
      </div>
      <div className="max-w-md w-full mx-5 p-6 space-y-6 bg-slate-200 shadow-md rounded-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
        Se connecter
        </h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 w-full border-gray-300 rounded-md"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border-gray-300 rounded-md"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
          <div className="flex items-center justify-between mb-6">
            <Link
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="/auth/forgot-password"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          {loader === true ? (
            <button
              className="bg-[#784F33]  cursor-not-allowed hover:bg-[#E0C49D] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="button"
            >
              <span>Loading...</span>
            </button>
          ) : (
            <button
              type="submit"
              className="w-full p-2 bg-[#784F33]  text-white rounded-md hover:bg-[#E0C49D] focus:outline-none focus:ring focus:border-indigo-500"
            >
              Se connecter
            </button>
          )}
          <div className=" my-4 grid grid-cols-3 items-center text-black">
            <hr className="border-black" />
            <p className="text-center text-sm">OU</p>
            <hr className="border-black" />
          </div>
          <button
            className="bg-[#784F33]  hover:bg-[#E0C49D] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="button"
          >
            <Link href="/auth/sign-up">Enregistrez vous</Link>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
