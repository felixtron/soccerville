"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Credenciales incorrectas");
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/soccerville-w.svg"
            alt="Soccerville"
            width={100}
            height={100}
            className="h-20 w-20 object-contain"
            priority
          />
        </div>

        <h1 className="font-display text-3xl text-white text-center uppercase tracking-tight mb-2">
          Panel Admin
        </h1>
        <p className="text-white/40 text-sm text-center mb-8">
          Ingresa con tus credenciales
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="admin@soccerville.mx"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-white/50 uppercase tracking-wider mb-1.5">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-white/20 text-xs text-center mt-8">
          Soccerville &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
