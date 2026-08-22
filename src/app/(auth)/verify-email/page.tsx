"use client";

import { authService } from "@/services/auth.service";
import { motion } from "framer-motion";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    !token ? "error" : "loading",
  );

  useEffect(() => {
    if (!token) return;

    // if (!token) {
    //   setStatus("error");
    //   return;
    // }

    authService
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader size={40} className="text-primary animate-spin" />
            <p className="text-muted-foreground">Vérification en cours…</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle size={32} className="text-success" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                E-mail vérifié !
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Votre compte est maintenant actif.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 font-medium h-10 px-4 text-sm rounded-xl bg-gradient-brand text-white shadow-glow-primary hover:opacity-90 transition-all duration-200 mt-2"
            >
              Se connecter
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-destructive/15 flex items-center justify-center">
              <XCircle size={32} className="text-destructive" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Lien invalide
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ce lien est expiré ou invalide.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 font-medium h-10 px-4 text-sm rounded-xl bg-card text-foreground border border-border hover:bg-muted transition-all duration-200"
            >
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
