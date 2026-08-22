"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success("Si cet e-mail existe, un lien a été envoyé.", {
        duration: 6000,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Identifiants invalides";
      toast.error(errorMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="h-12 w-12 rounded-2xl gradient-brand flex items-center justify-center mb-4 shadow-glow-primary">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Mot de passe oublié
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          Entrez votre e-mail pour recevoir un lien de réinitialisation
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Adresse e-mail"
            type="email"
            placeholder="vous@exemple.com"
            icon={<Mail size={16} />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Envoyer le lien
          </Button>
        </form>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Retour à la connexion
        </Link>
      </div>
    </motion.div>
  );
}
