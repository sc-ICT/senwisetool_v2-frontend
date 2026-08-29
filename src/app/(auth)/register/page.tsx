"use client";

import { authService } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z
  .object({
    name: z.string().min(2, "Minimum 2 caractères"),
    email: z.string().email("E-mail invalide"),
    password: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

function Field({
  label,
  icon,
  error,
  type = "text",
  placeholder,
  registration,
  rightElement,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  type?: string;
  placeholder: string;
  registration: object;
  rightElement?: React.ReactNode;
}) {
  return (
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
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: "0.875rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-foreground-muted)",
            display: "flex",
          }}
        >
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: "2.75rem",
            paddingLeft: "2.5rem",
            paddingRight: rightElement ? "2.75rem" : "1rem",
            borderRadius: "0.75rem",
            border: error
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
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? "#F43F5E"
              : "var(--color-border-light)";
            e.target.style.boxShadow = "none";
          }}
          {...registration}
        />
        {rightElement && (
          <div
            style={{
              position: "absolute",
              right: "0.875rem",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "#F43F5E",
            marginTop: "0.375rem",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success("Compte créé ! Vérifiez votre e-mail.", { duration: 6000 });
      router.push("/login");
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
      <div className="mb-8">
        <h2
          className="text-3xl font-bold mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-foreground)",
          }}
        >
          Créer un compte
        </h2>
        <p
          style={{ color: "var(--color-foreground-muted)", fontSize: "0.9rem" }}
        >
          Commencez à déployer vos formulaires en quelques minutes
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Field
            label="Nom complet"
            icon={<User size={15} />}
            placeholder="Jean Dupont"
            error={errors.name?.message}
            registration={register("name")}
          />

          <Field
            label="Adresse e-mail"
            icon={<Mail size={15} />}
            type="email"
            placeholder="vous@exemple.com"
            error={errors.email?.message}
            registration={register("email")}
          />

          <Field
            label="Mot de passe"
            icon={<Lock size={15} />}
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            error={errors.password?.message}
            registration={register("password")}
            rightElement={
              <EyeBtn show={showPwd} toggle={() => setShowPwd(!showPwd)} />
            }
          />

          <Field
            label="Confirmer le mot de passe"
            icon={<Lock size={15} />}
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            error={errors.confirm?.message}
            registration={register("confirm")}
            rightElement={
              <EyeBtn
                show={showConfirm}
                toggle={() => setShowConfirm(!showConfirm)}
              />
            }
          />

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
              boxShadow:
                "0 0 20px rgb(93 184 58 / 0.25), 0 0 60px rgb(14 165 233 / 0.1)",
              marginTop: "0.25rem",
              transition: "opacity 0.2s",
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
                Créer mon compte
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            fontSize: "0.875rem",
            color: "var(--color-foreground-muted)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
        >
          <ArrowLeft size={14} />
          Retour à la connexion
        </Link>
      </div>
    </motion.div>
  );
}

const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
  <button
    type="button"
    onClick={toggle}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--color-foreground-muted)",
      display: "flex",
      alignItems: "center",
      padding: 0,
    }}
  >
    {show ? <EyeOff size={15} /> : <Eye size={15} />}
  </button>
);
