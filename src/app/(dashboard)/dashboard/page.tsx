"use client";

import { Header } from "@/components/layout/header";
// import { agentService } from "@/services/agent.service";
// import { deploymentService } from "@/services/deployment.service";
// import { formService } from "@/services/form.service";
import { useAuthStore } from "@/stores/auth.store";
// import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, Plus, Rocket, Users } from "lucide-react";
import Link from "next/link";

// ─── Carte de stat ────────────────────────────────────────────────────────────

// function StatCard({
//   label,
//   value,
//   icon: Icon,
//   color,
//   delay = 0,
// }: {
//   label: string;
//   value: number | string;
//   icon: React.ElementType;
//   color: string;
//   delay?: number;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay, duration: 0.4 }}
//       style={{
//         background: "var(--color-surface)",
//         border: "1px solid var(--color-border)",
//         borderRadius: "1rem",
//         padding: "1.25rem",
//         display: "flex",
//         flexDirection: "column",
//         gap: "0.875rem",
//         transition: "border-color 0.2s, box-shadow 0.2s",
//         cursor: "default",
//       }}
//       whileHover={{
//         borderColor: `${color}40`,
//         boxShadow: `0 8px 32px ${color}15`,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <span
//           style={{
//             fontSize: "0.8125rem",
//             color: "var(--color-foreground-muted)",
//             fontWeight: 500,
//           }}
//         >
//           {label}
//         </span>
//         <div
//           style={{
//             width: "36px",
//             height: "36px",
//             borderRadius: "0.625rem",
//             background: `${color}15`,
//             border: `1px solid ${color}25`,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <Icon size={17} color={color} />
//         </div>
//       </div>
//       <div
//         style={{
//           fontFamily: "var(--font-display)",
//           fontSize: "2rem",
//           fontWeight: 700,
//           color: "var(--color-foreground)",
//           lineHeight: 1,
//         }}
//       >
//         {value}
//       </div>
//     </motion.div>
//   );
// }

// ─── Badge statut formulaire ──────────────────────────────────────────────────

// function FormStatusBadge({ status }: { status: string }) {
//   const config: Record<string, { label: string; color: string; bg: string }> = {
//     DRAFT: {
//       label: "Brouillon",
//       color: "var(--color-foreground-muted)",
//       bg: "var(--color-surface-raised)",
//     },
//     PUBLISHED: {
//       label: "Publié",
//       color: "#5DB83A",
//       bg: "rgb(93 184 58 / 0.12)",
//     },
//     ARCHIVED: {
//       label: "Archivé",
//       color: "#F59E0B",
//       bg: "rgb(245 158 11 / 0.12)",
//     },
//   };
//   const c = config[status] ?? config.DRAFT;
//   return (
//     <span
//       style={{
//         fontSize: "0.7rem",
//         fontWeight: 600,
//         color: c.color,
//         background: c.bg,
//         padding: "0.2rem 0.625rem",
//         borderRadius: "99px",
//         textTransform: "uppercase",
//         letterSpacing: "0.04em",
//       }}
//     >
//       {c.label}
//     </span>
//   );
// }

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();

  // const { data: formsData } = useQuery({
  //   queryKey: ["forms"],
  //   queryFn: () => formService.list(),
  // });

  // const { data: agentsData } = useQuery({
  //   queryKey: ["agents"],
  //   queryFn: () => agentService.list(),
  // });

  // const { data: requestsData } = useQuery({
  //   queryKey: ["pending-requests"],
  //   queryFn: () => deploymentService.listPendingRequests(),
  // });

  // const forms = formsData?.data ?? [];
  // const agents = agentsData?.data ?? [];
  // const pendingRequests = requestsData?.data ?? [];

  // const publishedForms = forms.filter((f) => f.status === "PUBLISHED").length;
  // const draftForms = forms.filter((f) => f.status === "DRAFT").length;
  // const recentForms = [...forms]
  //   .sort(
  //     (a, b) =>
  //       new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  //   )
  //   .slice(0, 5);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <>
      <Header
        title="Dashboard"
        description={`${greeting}, ${user?.name?.split(" ")[0] ?? "Admin"} 👋`}
        actions={
          <Link
            href="/dashboard/forms/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 0.875rem",
              borderRadius: "0.625rem",
              background: "linear-gradient(135deg, #5DB83A, #0EA5E9)",
              color: "#fff",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 0 16px rgb(93 184 58 / 0.25)",
              transition: "opacity 0.15s",
            }}
          >
            <Plus size={14} />
            Nouveau formulaire
          </Link>
        }
      />

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* ── Alerte demandes en attente ── */}
        {/* {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.875rem 1.25rem",
              borderRadius: "0.875rem",
              background: "rgb(245 158 11 / 0.08)",
              border: "1px solid rgb(245 158 11 / 0.25)",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <AlertCircle size={18} color="#F59E0B" />
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-foreground)",
                }}
              >
                <strong>{pendingRequests.length}</strong> demande(s) d'accès en
                attente de validation
              </span>
            </div>
            <Link
              href="/dashboard/deployments"
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#F59E0B",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              Voir <ArrowUpRight size={14} />
            </Link>
          </motion.div>
        )} */}

        {/* ── Stats ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* <StatCard
            label="Formulaires"
            value={forms.length}
            icon={FileText}
            color="#5DB83A"
            delay={0}
          />
          <StatCard
            label="Publiés"
            value={publishedForms}
            icon={CheckCircle2}
            color="#0EA5E9"
            delay={0.05}
          />
          <StatCard
            label="Agents"
            value={agents.length}
            icon={Users}
            color="#A78BFA"
            delay={0.1}
          />
          <StatCard
            label="Brouillons"
            value={draftForms}
            icon={Clock}
            color="#F59E0B"
            delay={0.15}
          /> */}
        </div>

        {/* ── Contenu principal ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "1rem",
          }}
        >
          {/* Formulaires récents */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {/* En-tête */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.125rem 1.25rem",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                }}
              >
                Formulaires récents
              </h2>
              <Link
                href="/dashboard/forms"
                style={{
                  fontSize: "0.75rem",
                  color: "#5DB83A",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontWeight: 500,
                }}
              >
                Voir tout <ArrowUpRight size={13} />
              </Link>
            </div>

            {/* Liste */}
            {/* {recentForms.length === 0 ? (
              <div
                style={{
                  padding: "3rem 1.25rem",
                  textAlign: "center",
                  color: "var(--color-foreground-muted)",
                  fontSize: "0.875rem",
                }}
              >
                <FileText
                  size={32}
                  style={{ margin: "0 auto 0.75rem", opacity: 0.3 }}
                />
                <p>Aucun formulaire pour l'instant</p>
                <Link
                  href="/dashboard/forms/new"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    marginTop: "0.875rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.625rem",
                    background: "linear-gradient(135deg, #5DB83A, #0EA5E9)",
                    color: "#fff",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <Plus size={13} />
                  Créer mon premier formulaire
                </Link>
              </div>
            ) : (
              <div>
                {recentForms.map((form, i) => (
                  <Link
                    key={form.id}
                    href={`/dashboard/forms/${form.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.875rem 1.25rem",
                      borderBottom:
                        i < recentForms.length - 1
                          ? "1px solid var(--color-border)"
                          : "none",
                      textDecoration: "none",
                      transition: "background 0.15s",
                      gap: "1rem",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "var(--color-surface-raised)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "transparent";
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "var(--color-foreground)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {form.title}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.7rem",
                            color: "var(--color-foreground-subtle)",
                          }}
                        >
                          {form.code}
                        </span>
                        <span
                          style={{
                            width: "3px",
                            height: "3px",
                            borderRadius: "50%",
                            background: "var(--color-foreground-subtle)",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--color-foreground-muted)",
                          }}
                        >
                          {form.section_count} section(s)
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        flexShrink: 0,
                      }}
                    >
                      <FormStatusBadge status={form.status} />
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--color-foreground-muted)",
                        }}
                      >
                        {formatRelativeDate(form.updated_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )} */}
          </motion.div>

          {/* Panneau droit */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Accès rapides */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                padding: "1.125rem",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--color-foreground)",
                  marginBottom: "0.875rem",
                }}
              >
                Accès rapides
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {[
                  {
                    href: "/dashboard/forms/new",
                    icon: Plus,
                    label: "Nouveau formulaire",
                    color: "#5DB83A",
                  },
                  {
                    href: "/dashboard/agents",
                    icon: Users,
                    label: "Gérer les agents",
                    color: "#A78BFA",
                  },
                  {
                    href: "/dashboard/deployments",
                    icon: Rocket,
                    label: "Déployer un formulaire",
                    color: "#0EA5E9",
                  },
                  {
                    href: "/dashboard/submissions",
                    icon: BarChart3,
                    label: "Voir les données",
                    color: "#F59E0B",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "0.75rem",
                      textDecoration: "none",
                      color: "var(--color-foreground)",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      transition: "background 0.15s",
                      border: "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.background = "var(--color-surface-raised)";
                      el.style.borderColor = "var(--color-border)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.background = "transparent";
                      el.style.borderColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "0.5rem",
                        background: `${item.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <item.icon size={14} color={item.color} />
                    </div>
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Agents récents */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                padding: "1.125rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.875rem",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "var(--color-foreground)",
                  }}
                >
                  Agents
                </h2>
                <Link
                  href="/dashboard/agents"
                  style={{
                    fontSize: "0.75rem",
                    color: "#5DB83A",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Gérer →
                </Link>
              </div>

              {/* {agents.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-foreground-muted)",
                    textAlign: "center",
                    padding: "1rem 0",
                  }}
                >
                  Aucun agent enregistré
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {agents.lice(0, 4).map((agent) => (
                    <div
                      key={agent.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #5DB83A30, #0EA5E930)",
                          border: "1px solid rgb(93 184 58 / 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          color: "#5DB83A",
                          flexShrink: 0,
                        }}
                      >
                        {agent.agent_name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            fontWeight: 500,
                            color: "var(--color-foreground)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {agent.agent_name}
                        </p>
                        <p
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--color-foreground-muted)",
                          }}
                        >
                          {agent.assignment_count} assignation(s)
                        </p>
                      </div>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background:
                            agent.status === "ACTIVE" ? "#5DB83A" : "#F43F5E",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  ))}
                  {agents.length > 4 && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-foreground-muted)",
                        textAlign: "center",
                        marginTop: "0.25rem",
                      }}
                    >
                      +{agents.length - 4} autre(s)
                    </p>s
                  )}
                </div>
              )} */}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
