"use client";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("E-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const { setUser } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authService.login(data);
      if (res.data?.user) {
        setUser(res.data.user);
        toast.success("Bienvenue !");
        router.push(redirect);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Identifiants invalides";
      toast.error(errorMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* En-tête */}
      <div className="mb-10">
        <h2
          className="text-3xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-foreground)",
          }}
        >
          Bon retour 👋
        </h2>
        <p
          style={{ color: "var(--color-foreground-muted)", fontSize: "0.9rem" }}
        >
          Connectez-vous pour accéder à votre espace
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.813rem",
                fontWeight: 500,
                color: "var(--color-foreground)",
                marginBottom: "0.5rem",
              }}
            >
              Adresse e-mail
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={15}
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-foreground-muted)",
                }}
              />
              <input
                type="email"
                placeholder="vous@exemple.com"
                autoComplete="email"
                style={{
                  width: "100%",
                  height: "2.75rem",
                  paddingLeft: "2.5rem",
                  paddingRight: "1rem",
                  borderRadius: "0.75rem",
                  border: errors.email
                    ? "1px solid #F43F5E"
                    : "1px solid var(--color-border-light)",
                  background: "var(--color-surface)",
                  color: "var(--color-foreground)",
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#5DB83A";
                  e.target.style.boxShadow = "0 0 0 3px rgb(93 184 58 / 0.12)";
                }}
                {...register("email", {
                  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = errors.email
                      ? "#F43F5E"
                      : "var(--color-border-light)";
                    e.target.style.boxShadow = "none";
                  },
                })}
              />
            </div>
            {errors.email && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#F43F5E",
                  marginTop: "0.375rem",
                }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.813rem",
                  fontWeight: 500,
                  color: "var(--color-foreground)",
                }}
              >
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: "0.75rem",
                  color: "#5DB83A",
                  textDecoration: "none",
                }}
              >
                Oublié ?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-foreground-muted)",
                }}
              />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  height: "2.75rem",
                  paddingLeft: "2.5rem",
                  paddingRight: "2.75rem",
                  borderRadius: "0.75rem",
                  border: errors.password
                    ? "1px solid #F43F5E"
                    : "1px solid var(--color-border-light)",
                  background: "var(--color-surface)",
                  color: "var(--color-foreground)",
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#5DB83A";
                  e.target.style.boxShadow = "0 0 0 3px rgb(93 184 58 / 0.12)";
                }}
                {...register("password", {
                  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                    e.target.style.borderColor = errors.password
                      ? "#F43F5E"
                      : "var(--color-border-light)";
                    e.target.style.boxShadow = "none";
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: "absolute",
                  right: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-foreground-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#F43F5E",
                  marginTop: "0.375rem",
                }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              height: "2.875rem",
              borderRadius: "0.75rem",
              border: "none",
              background: isSubmitting
                ? "rgb(93 184 58 / 0.6)"
                : "linear-gradient(135deg, #5DB83A 0%, #0EA5E9 100%)",
              color: "#fff",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "opacity 0.2s, transform 0.15s",
              boxShadow:
                "0 0 20px rgb(93 184 58 / 0.25), 0 0 60px rgb(14 165 233 / 0.1)",
              marginTop: "0.25rem",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting)
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            {isSubmitting ? (
              <span
                style={{
                  width: "1rem",
                  height: "1rem",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  animation: "spin-slow 0.7s linear infinite",
                  display: "inline-block",
                }}
              />
            ) : (
              <>
                Se connecter
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          margin: "1.75rem 0",
        }}
      >
        <div
          style={{ flex: 1, height: "1px", background: "var(--color-border)" }}
        />
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--color-foreground-muted)",
          }}
        >
          Pas encore de compte ?
        </span>
        <div
          style={{ flex: 1, height: "1px", background: "var(--color-border)" }}
        />
      </div>

      <Link
        href="/register"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "2.75rem",
          borderRadius: "0.75rem",
          border: "1px solid var(--color-border-light)",
          background: "var(--color-surface)",
          color: "var(--color-foreground)",
          fontSize: "0.875rem",
          fontWeight: 500,
          textDecoration: "none",
          transition: "border-color 0.2s, background 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor =
            "rgb(93 184 58 / 0.4)";
          (e.currentTarget as HTMLAnchorElement).style.background =
            "var(--color-surface-raised)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor =
            "var(--color-border-light)";
          (e.currentTarget as HTMLAnchorElement).style.background =
            "var(--color-surface)";
        }}
      >
        Créer un compte
      </Link>
    </motion.div>
  );
}
