"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";

const VerifyCodeForm: React.FC = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams<{ id: string }>();


  const handleVerify = async () => {
    if (!code) {
      toast.error("Veuillez entrer le code de vérification");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/auth/verify-code`, // Adjust the URL if necessary
        { id: params?.id, code }
      );

      if (response.data.success) {
        toast.success("Compte vérifié avec succès !");
        setCode("");
        router.replace(`${process.env.NEXT_PUBLIC_URL}/auth/sign-in`);
      } else {
        toast.error(response.data.message || "La vérification a échoué");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);

    }
  };

  return (
    <div className="py-10 min-h-screen flex items-center justify-center bg-slate-300">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Vérifier le compte</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
            Le code de vérification
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Entrez le code de vérification"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              className="w-full bg-[#784F33] hover:bg-[#E0C49D] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Vérifier le code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyCodeForm;
