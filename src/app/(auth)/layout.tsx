import { FileText, MapPinned, WifiOff } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stats = [
    {
      value: "∞",
      label: "Types de questions",
      icon: FileText,
    },
    {
      value: "100%",
      label: "Hors-ligne",
      icon: WifiOff,
    },
    {
      value: "GPS",
      label: "Géolocalisation",
      icon: MapPinned,
    },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* ── Côté gauche : identité visuelle animée ── */}
      <div
        className="hidden lg:flex lg:w-[58%] xl:w-[60%] flex-col relative overflow-hidden"
        style={{ backgroundColor: "#060D12" }}
      >
        {/* Grille de coordonnées */}
        <div className="absolute inset-0 coord-grid opacity-60" />

        {/* Halos colorés d'ambiance */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-10%",
            left: "-5%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgb(93 184 58 / 0.12) 0%, transparent 65%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-10%",
            right: "-5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgb(14 165 233 / 0.1) 0%, transparent 65%)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />

        {/* Contenu principal gauche */}
        <div className="relative z-10 flex h-full w-full justify-center">
          <div className="flex flex-col w-full max-w-3xl py-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-20">
              <Image
                src="/logo.png"
                alt="SWT Servey"
                width={45}
                height={45}
                className="rounded-xl"
              />
              <span
                className="text-lg font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-foreground)",
                }}
              >
                SWT Servey
              </span>
            </div>

            {/* Message central */}
            <div className="flex-1 flex flex-col justify-center max-w-2xl">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 w-fit"
                style={{
                  background: "rgb(93 184 58 / 0.12)",
                  border: "1px solid rgb(93 184 58 / 0.25)",
                  color: "#7DD44E",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: "#5DB83A",
                    animation: "pulse-green 2s ease-in-out infinite",
                  }}
                />
                Plateforme de collecte terrain
              </div>

              <h1
                className="text-5xl font-bold leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-foreground)",
                }}
              >
                Collectez des données.{" "}
                <span className="brand-gradient-text">Où que vous soyez.</span>
              </h1>

              <p
                className="text-lg leading-relaxed mb-10"
                style={{ color: "var(--color-foreground-muted)" }}
              >
                Créez des formulaires intelligents, déployez-les auprès de vos
                agents terrain et visualisez les données collectées en temps
                réel — même sans connexion.
              </p>

              {/* Trois stats flottantes */}
              <div className="grid grid-cols-3 gap-4 my-8">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl p-4 shimmer"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        animation: `fadeUp 0.6s ease ${i * 0.1 + 0.3}s both`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div
                            className="text-2xl font-bold mb-1 brand-gradient-text"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {stat.value}
                          </div>

                          <div
                            className="text-xs"
                            style={{ color: "var(--color-foreground-muted)" }}
                          >
                            {stat.label}
                          </div>
                        </div>

                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{
                            background: "rgb(93 184 58 / 0.10)",
                            border: "1px solid rgb(93 184 58 / 0.18)",
                          }}
                        >
                          <Icon size={18} color="#5DB83A" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer côté gauche */}
            <p
              className="text-xs"
              style={{ color: "var(--color-foreground-subtle)" }}
            >
              © 2026 SWT Servey — Données sécurisées et chiffrées
            </p>
          </div>
        </div>

        {/* Ligne de séparation lumineuse */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, #5DB83A, #0EA5E9, transparent)",
            opacity: 0.4,
          }}
        />
      </div>

      {/* ── Côté droit : formulaire ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
        style={{ backgroundColor: "#080E15" }}
      >
        {/* Fond subtil */}
        <div className="absolute inset-0 dot-grid opacity-20" />

        {/* Halo d'ambiance centré */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgb(14 165 233 / 0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 w-full max-w-sm">
          {/* Logo (visible uniquement sur mobile) */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <Image
              src="/logo.png"
              alt="SWT Servey"
              width={32}
              height={32}
              className="rounded-xl"
            />
            <span
              className="font-semibold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-foreground)",
              }}
            >
              SWT Servey
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
