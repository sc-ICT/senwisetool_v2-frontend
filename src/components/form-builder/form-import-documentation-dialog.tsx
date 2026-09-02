/* eslint-disable react/no-unescaped-entities */
"use client";

import {
  AlertTriangle,
  ArrowDown,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  FileSpreadsheet,
  GitBranch,
  Info,
  Link2,
  ListChecks,
  Rows3,
  Table2,
  X,
} from "lucide-react";
import { useState } from "react";

interface FormImportDocumentationDialogProps {
  onClose: () => void;
}

type DocumentationSection =
  | "overview"
  | "structure"
  | "json"
  | "question"
  | "options"
  | "references"
  | "dependencies"
  | "example"
  | "errors";

const sections: {
  id: DocumentationSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "overview",
    label: "Présentation",
    icon: <BookOpen size={16} />,
  },
  {
    id: "structure",
    label: "Structure Excel",
    icon: <Table2 size={16} />,
  },
  {
    id: "json",
    label: "Configuration JSON",
    icon: <Code2 size={16} />,
  },
  {
    id: "question",
    label: "Question",
    icon: <ListChecks size={16} />,
  },
  {
    id: "options",
    label: "Options",
    icon: <Rows3 size={16} />,
  },
  {
    id: "references",
    label: "Références col(...)",
    icon: <Link2 size={16} />,
  },
  {
    id: "dependencies",
    label: "Dépendances",
    icon: <GitBranch size={16} />,
  },
  {
    id: "example",
    label: "Exemple complet",
    icon: <FileSpreadsheet size={16} />,
  },
  {
    id: "errors",
    label: "Erreurs à éviter",
    icon: <AlertTriangle size={16} />,
  },
];

export function FormImportDocumentationDialog({
  onClose,
}: FormImportDocumentationDialogProps) {
  const [activeSection, setActiveSection] =
    useState<DocumentationSection>("overview");

  const goTo = (section: DocumentationSection) => {
    setActiveSection(section);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        // height: "100%", // Remplit les 20% du parent
        zIndex: 300,
        background: "var(--color-background)",
        display: "flex",
        flexDirection: "column",
        // overflowY: "auto", // Ajoute un scroll vertical si le contenu dépasse
      }}
    >
      {/* HEADER */}

      <header
        style={{
          height: "64px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "0.625rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(93, 184, 58, 0.1)",
              color: "#5DB83A",
            }}
          >
            <BookOpen size={20} />
          </div>

          <div>
            <div
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
              }}
            >
              Documentation — Import Excel
            </div>

            <div
              style={{
                marginTop: "0.15rem",
                fontSize: "0.6875rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              Construire et importer un formulaire depuis un classeur Excel
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la documentation"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-raised)",
            color: "var(--color-foreground-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
      </header>

      {/* BODY */}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
        }}
      >
        {/* SIDEBAR */}

        <aside
          style={{
            width: "250px",
            flexShrink: 0,
            borderRight: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            padding: "1rem 0.75rem",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "0.5rem 0.625rem 0.75rem",
              fontSize: "0.625rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--color-foreground-muted)",
            }}
          >
            Guide d'utilisation
          </div>

          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.2rem",
            }}
          >
            {sections.map((section) => {
              const active = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.625rem 0.7rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: active
                      ? "rgba(93, 184, 58, 0.1)"
                      : "transparent",
                    color: active ? "#5DB83A" : "var(--color-foreground)",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  {section.icon}

                  <span
                    style={{
                      flex: 1,
                    }}
                  >
                    {section.label}
                  </span>

                  {active && <ChevronRight size={14} />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* CONTENT */}

        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1050px",
              margin: "0 auto",
              padding: "2.5rem clamp(1.25rem, 4vw, 4rem) 5rem",
            }}
          >
            {activeSection === "overview" && <OverviewSection goTo={goTo} />}

            {activeSection === "structure" && <StructureSection goTo={goTo} />}

            {activeSection === "json" && <JsonSection goTo={goTo} />}

            {activeSection === "question" && <QuestionSection goTo={goTo} />}

            {activeSection === "options" && <OptionsSection goTo={goTo} />}

            {activeSection === "references" && (
              <ReferencesSection goTo={goTo} />
            )}

            {activeSection === "dependencies" && (
              <DependenciesSection goTo={goTo} />
            )}

            {activeSection === "example" && <ExampleSection goTo={goTo} />}

            {activeSection === "errors" && <ErrorsSection goTo={goTo} />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTS COMMUNS
============================================================ */

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          marginBottom: "0.45rem",
          color: "#5DB83A",
          fontSize: "0.6875rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {eyebrow}
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          maxWidth: "760px",
          margin: "0.75rem 0 0",
          fontSize: "0.875rem",
          lineHeight: 1.7,
          color: "var(--color-foreground-muted)",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function NextButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: "2rem",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        height: "38px",
        padding: "0 0.875rem",
        borderRadius: "0.5rem",
        border: "1px solid rgba(93, 184, 58, 0.25)",
        background: "rgba(93, 184, 58, 0.08)",
        color: "#5DB83A",
        fontSize: "0.75rem",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
      <ArrowDown size={14} />
    </button>
  );
}

function InfoBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        padding: "1rem",
        marginTop: "1.25rem",
        borderRadius: "0.75rem",
        border: "1px solid rgba(93, 184, 58, 0.2)",
        background: "rgba(93, 184, 58, 0.06)",
      }}
    >
      <Info
        size={17}
        color="#5DB83A"
        style={{
          flexShrink: 0,
          marginTop: "2px",
        }}
      />

      <div>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            marginBottom: "0.3rem",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            lineHeight: 1.65,
            color: "var(--color-foreground-muted)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre
      style={{
        margin: "1rem 0",
        padding: "1rem",
        overflowX: "auto",
        borderRadius: "0.625rem",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface-raised)",
        fontSize: "0.7rem",
        lineHeight: 1.7,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      <code>{children}</code>
    </pre>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.875rem",
        marginTop: "1.25rem",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "rgba(93, 184, 58, 0.1)",
          color: "#5DB83A",
          fontSize: "0.6875rem",
          fontWeight: 800,
        }}
      >
        {number}
      </div>

      <div>
        <div
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            marginBottom: "0.3rem",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            lineHeight: 1.7,
            color: "var(--color-foreground-muted)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Badge({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: "22px",
        padding: "0 0.45rem",
        borderRadius: "999px",
        background: required
          ? "rgba(239, 68, 68, 0.08)"
          : "rgba(100, 116, 139, 0.1)",
        color: required ? "#EF4444" : "var(--color-foreground-muted)",
        fontSize: "0.5625rem",
        fontWeight: 800,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

/* ============================================================
   1. PRÉSENTATION
============================================================ */

function OverviewSection({
  goTo,
}: {
  goTo: (section: DocumentationSection) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="01 · Comprendre"
        title="Importer un formulaire depuis Excel"
        description="L'import Excel permet de construire automatiquement une grande partie de la structure d'un formulaire à partir d'un ou plusieurs onglets Excel."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {[
          [
            "01",
            "Préparer",
            "Construisez votre classeur selon la structure attendue.",
          ],
          [
            "02",
            "Analyser",
            "Le système lit et vérifie l'ensemble du fichier.",
          ],
          [
            "03",
            "Construire",
            "Les ressources sont créées ou réutilisées dans le formulaire courant.",
          ],
          [
            "04",
            "Relier",
            "Les sections, questions et dépendances sont raccordées.",
          ],
        ].map(([number, title, text]) => (
          <div
            key={number}
            style={{
              padding: "1rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <div
              style={{
                color: "#5DB83A",
                fontSize: "0.625rem",
                fontWeight: 800,
              }}
            >
              {number}
            </div>

            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              {title}
            </div>

            <div
              style={{
                marginTop: "0.35rem",
                fontSize: "0.6875rem",
                lineHeight: 1.6,
                color: "var(--color-foreground-muted)",
              }}
            >
              {text}
            </div>
          </div>
        ))}
      </div>

      <InfoBox title="Règle fondamentale">
        Le fichier est d'abord analysé et validé. Une référence incorrecte ou
        une donnée nécessaire absente doit être corrigée avant l'exécution de
        l'import.
      </InfoBox>

      <h2 style={h2Style}>Le principe en une image</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "1rem",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          background: "var(--color-surface-raised)",
          border: "1px solid var(--color-border)",
        }}
      >
        {[
          "Excel",
          "Parsing",
          "Validation",
          "Plan",
          "Création",
          "Formulaire",
        ].map((item, index) => (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                padding: "0.55rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                fontSize: "0.6875rem",
                fontWeight: 700,
              }}
            >
              {item}
            </div>

            {index < 5 && (
              <ChevronRight size={14} color="var(--color-foreground-muted)" />
            )}
          </div>
        ))}
      </div>

      <NextButton
        label="Comprendre la structure Excel"
        onClick={() => goTo("structure")}
      />
    </>
  );
}

/* ============================================================
   2. STRUCTURE EXCEL
============================================================ */

function StructureSection({
  goTo,
}: {
  goTo: (section: DocumentationSection) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="02 · Excel"
        title="Structure d'une feuille"
        description="Chaque feuille représente un ensemble cohérent de données et peut contenir plusieurs questions ainsi que des colonnes techniques utilisées par les références."
      />

      <div
        style={{
          overflowX: "auto",
          borderRadius: "0.75rem",
          border: "1px solid var(--color-border)",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "700px",
            borderCollapse: "collapse",
            fontSize: "0.6875rem",
          }}
        >
          <thead>
            <tr>
              {[
                "Ligne",
                "Nom planteur",
                "Code planteur",
                "Coopérative",
                "Code coop",
              ].map((value) => (
                <th key={value} style={thStyle}>
                  {value}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={tdStyle}>
                <strong>1</strong>
              </td>

              <td style={tdStyle}>Nom planteur</td>

              <td style={tdStyle}>Code planteur</td>

              <td style={tdStyle}>Coopérative</td>

              <td style={tdStyle}>Code coop</td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <strong>2</strong>
              </td>

              <td style={tdStyle}>
                <Badge required>JSON</Badge>
              </td>

              <td style={tdStyle}>
                <span
                  style={{
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  vide
                </span>
              </td>

              <td style={tdStyle}>
                <Badge required>JSON</Badge>
              </td>

              <td style={tdStyle}>
                <span
                  style={{
                    color: "var(--color-foreground-muted)",
                  }}
                >
                  vide
                </span>
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <strong>3+</strong>
              </td>

              <td style={tdStyle}>Jean</td>

              <td style={tdStyle}>PL001</td>

              <td style={tdStyle}>Coop A</td>

              <td style={tdStyle}>COOP001</td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <strong>4+</strong>
              </td>

              <td style={tdStyle}>Paul</td>

              <td style={tdStyle}>PL002</td>

              <td style={tdStyle}>Coop B</td>

              <td style={tdStyle}>COOP002</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.75rem",
          marginTop: "1rem",
        }}
      >
        <InfoBox title="Ligne 1 — En-têtes">
          Chaque cellule donne le nom de la colonne. Ces noms peuvent ensuite
          être utilisés dans les références <code>col(...)</code>.
        </InfoBox>

        <InfoBox title="Ligne 2 — Configuration">
          Une deuxième cellule remplie signifie que la colonne est une question.
          Elle doit contenir une configuration JSON valide.
        </InfoBox>
      </div>

      <InfoBox title="Colonne technique">
        Une colonne comme <strong>Code planteur</strong>
        peut parfaitement exister sans être une question. Dans ce cas, sa ligne
        2 reste vide. Elle pourra néanmoins être utilisée par
        <code>col(Code planteur)</code>.
      </InfoBox>

      <h2 style={h2Style}>Plusieurs feuilles</h2>

      <p style={paragraphStyle}>
        Un même fichier peut contenir plusieurs feuilles. Chaque feuille doit
        respecter les mêmes règles. Chaque feuille peut servir à représenter une
        partie cohérente du formulaire.
      </p>

      <CodeBlock>
        {`Feuille "Planteurs"
    ↓
questions liées aux planteurs

Feuille "Plantations"
    ↓
questions liées aux plantations

Feuille "Coopératives"
    ↓
questions liées aux coopératives`}
      </CodeBlock>

      <NextButton
        label="Voir la configuration JSON"
        onClick={() => goTo("json")}
      />
    </>
  );
}

/* ============================================================
   3. JSON
============================================================ */

function JsonSection({
  goTo,
}: {
  goTo: (section: DocumentationSection) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="03 · Configuration"
        title="La deuxième ligne contient du JSON"
        description="Le JSON de la deuxième ligne décrit ce que le système doit créer, réutiliser et configurer."
      />

      <CodeBlock>
        {`{
  "question": {
    "code": "COOPERATIVE",
    "name": "Coopérative",
    "description": "Coopérative du planteur",

    "version": {
      "question_type": "SINGLE_CHOICE",
      "label": "Sélectionnez une coopérative"
    }
  },

  "section": {
    "name": "Identification"
  },

  "form_question": {
    "config": {}
  },

  "dependencies": []
}`}
      </CodeBlock>

      <InfoBox title="Pourquoi cette structure ?">
        Chaque niveau correspond à une responsabilité différente : la définition
        de la question, son emplacement dans le formulaire, sa configuration
        dans le formulaire courant et ses dépendances.
      </InfoBox>

      <h2 style={h2Style}>Les blocs principaux</h2>

      <div
        style={{
          display: "grid",
          gap: "0.625rem",
          marginTop: "1rem",
        }}
      >
        {[
          ["question", "Définition de la question dans la banque."],
          ["question.version", "Type, libellé et paramètres de version."],
          [
            "section",
            "Section du formulaire dans laquelle la question doit être placée.",
          ],
          [
            "form_question",
            "Configuration de la question une fois ajoutée au formulaire courant.",
          ],
          ["dependencies", "Relations de dépendance avec d'autres questions."],
        ].map(([name, description]) => (
          <div
            key={name}
            style={{
              display: "flex",
              gap: "1rem",
              padding: "0.8rem",
              border: "1px solid var(--color-border)",
              borderRadius: "0.625rem",
              background: "var(--color-surface)",
            }}
          >
            <code
              style={{
                minWidth: "170px",
                fontSize: "0.6875rem",
                fontWeight: 700,
              }}
            >
              {name}
            </code>

            <span
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              {description}
            </span>
          </div>
        ))}
      </div>

      <NextButton
        label="Configurer une question"
        onClick={() => goTo("question")}
      />
    </>
  );
}

/* ============================================================
   4. QUESTION
============================================================ */

function QuestionSection({
  goTo,
}: {
  goTo: (section: DocumentationSection) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="04 · Question"
        title="Configurer une question"
        description="Chaque colonne-question doit décrire suffisamment la question pour que le système puisse l'identifier, la créer ou la réutiliser et créer sa version."
      />

      <h2 style={h2Style}>Paramètres principaux</h2>

      <div
        style={{
          overflowX: "auto",
          marginTop: "1rem",
          border: "1px solid var(--color-border)",
          borderRadius: "0.75rem",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "650px",
            borderCollapse: "collapse",
            fontSize: "0.6875rem",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Paramètre</th>
              <th style={thStyle}>Obligatoire</th>
              <th style={thStyle}>Description</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={tdStyle}>
                <code>code</code>
              </td>
              <td style={tdStyle}>
                <Badge required>obligatoire</Badge>
              </td>
              <td style={tdStyle}>Identifiant logique de la question.</td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <code>name</code>
              </td>
              <td style={tdStyle}>
                <Badge required>obligatoire</Badge>
              </td>
              <td style={tdStyle}>Nom de la question.</td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <code>description</code>
              </td>
              <td style={tdStyle}>
                <Badge>optionnel</Badge>
              </td>
              <td style={tdStyle}>Description ou aide associée.</td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <code>version</code>
              </td>
              <td style={tdStyle}>
                <Badge required>obligatoire</Badge>
              </td>
              <td style={tdStyle}>
                Configuration de la version de la question.
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <code>group</code>
              </td>
              <td style={tdStyle}>
                <Badge>optionnel</Badge>
              </td>
              <td style={tdStyle}>Groupe auquel rattacher la question.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 style={h2Style}>Type de question</h2>

      <p style={paragraphStyle}>
        Le champ <code>question.version.question_type</code>
        doit correspondre à un type reconnu par l'application.
      </p>

      <CodeBlock>
        {`{
  "question": {
    "code": "NOM_PLANTEUR",
    "name": "Nom du planteur",

    "version": {
      "question_type": "TEXT",
      "label": "Nom complet du planteur"
    }
  }
}`}
      </CodeBlock>

      <InfoBox title="Important">
        Le type doit être écrit exactement comme la valeur attendue par le
        backend. Évitez les variantes comme
        <code>single_choice</code> si l'application attend
        <code>SINGLE_CHOICE</code>.
      </InfoBox>

      <NextButton label="Voir les options" onClick={() => goTo("options")} />
    </>
  );
}

/* ============================================================
   5. OPTIONS
============================================================ */

function OptionsSection({
  goTo,
}: {
  goTo: (section: DocumentationSection) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="05 · Options"
        title="Les lignes 3 et suivantes"
        description="Les lignes qui suivent la configuration JSON servent notamment à fournir les données complémentaires nécessaires aux questions à choix."
      />

      <h2 style={h2Style}>Exemple SINGLE_CHOICE</h2>

      <div
        style={{
          overflowX: "auto",
          marginTop: "1rem",
          border: "1px solid var(--color-border)",
          borderRadius: "0.75rem",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "500px",
            borderCollapse: "collapse",
            fontSize: "0.6875rem",
          }}
        >
          <tbody>
            <tr>
              <td style={tdStyle}>Coopérative</td>
            </tr>

            <tr>
              <td style={tdStyle}>
                <code>
                  {
                    '{"question":{"code":"COOP","name":"Coopérative","version":{"question_type":"SINGLE_CHOICE","label":"Coopérative"}}}'
                  }
                </code>
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>Coop A</td>
            </tr>

            <tr>
              <td style={tdStyle}>Coop B</td>
            </tr>

            <tr>
              <td style={tdStyle}>Coop C</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={paragraphStyle}>
        Les valeurs des lignes de données peuvent alors servir de données
        complémentaires à la question.
      </p>

      <h2 style={h2Style}>Questions sans options</h2>

      <p style={paragraphStyle}>
        Une question comme <code>TEXT</code>,<code>NUMBER</code> ou une question
        similaire qui ne nécessite pas de liste d'options peut avoir ses lignes
        de données vides.
      </p>

      <CodeBlock>
        {`Nom planteur
{
  "question": {
    "code": "NOM_PLANTEUR",
    "name": "Nom du planteur",
    "version": {
      "question_type": "TEXT",
      "label": "Nom du planteur"
    }
  }
}



`}
      </CodeBlock>

      <InfoBox title="Ne confondez pas données et configuration">
        La ligne 2 décrit la question. Les lignes suivantes fournissent les
        données complémentaires. Elles ne remplacent jamais la configuration
        JSON.
      </InfoBox>

      <NextButton
        label="Comprendre col(...)"
        onClick={() => goTo("references")}
      />
    </>
  );
}

/* ============================================================
   6. RÉFÉRENCES
============================================================ */

function ReferencesSection({
  goTo,
}: {
  goTo: (section: DocumentationSection) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="06 · Références"
        title="Utiliser col(...)"
        description="La notation col(Nom de colonne) permet de dire au système : ne prends pas une valeur fixe, prends la valeur de cette colonne sur la même ligne."
      />

      <CodeBlock>
        {`"name": "col(Nom planteur)"

"description": "Planteur : col(Nom planteur)"

"code": "col(Code planteur)"`}
      </CodeBlock>

      <h2 style={h2Style}>Valeur directe vs référence</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "0.75rem",
          marginTop: "1rem",
        }}
      >
        <div
          style={{
            padding: "1rem",
            border: "1px solid var(--color-border)",
            borderRadius: "0.75rem",
          }}
        >
          <Badge>Valeur directe</Badge>

          <CodeBlock>{`"name": "Planteur"`}</CodeBlock>

          <p style={paragraphStyle}>
            La valeur <strong>Planteur</strong> est utilisée telle quelle.
          </p>
        </div>

        <div
          style={{
            padding: "1rem",
            border: "1px solid var(--color-border)",
            borderRadius: "0.75rem",
          }}
        >
          <Badge>Référence</Badge>

          <CodeBlock>{`"name": "col(Nom planteur)"`}</CodeBlock>

          <p style={paragraphStyle}>
            La valeur est récupérée dans la colonne
            <strong> Nom planteur</strong> sur la ligne courante.
          </p>
        </div>
      </div>

      <h2 style={h2Style}>Exemple ligne par ligne</h2>

      <CodeBlock>
        {`Nom planteur       Code planteur       Libellé
Jean               PL001               col(Nom planteur)
Paul               PL002               col(Nom planteur)
Pierre             PL003               col(Nom planteur)`}
      </CodeBlock>

      <p style={paragraphStyle}>
        Pour la première ligne, <code>col(Nom planteur)</code> devient{" "}
        <strong>Jean</strong>. Pour la deuxième, il devient{" "}
        <strong>Paul</strong>, etc.
      </p>

      <InfoBox title="Vérification obligatoire">
        Si une configuration utilise
        <code>col(Nom planteur)</code>, la colonne
        <strong> Nom planteur</strong> doit exister et la cellule correspondante
        doit contenir une valeur lorsque cette valeur est requise.
      </InfoBox>

      <NextButton
        label="Comprendre les dépendances"
        onClick={() => goTo("dependencies")}
      />
    </>
  );
}

/* ============================================================
   7. DÉPENDANCES
============================================================ */

function DependenciesSection({
  goTo,
}: {
  goTo: (section: DocumentationSection) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="07 · Dépendances"
        title="Configurer les dépendances"
        description="Une dépendance permet de faire dépendre une question d'une autre question du formulaire."
      />

      <CodeBlock>
        {`{
  "question": {
    "code": "PLANTEUR",
    "name": "Planteur",

    "version": {
      "question_type": "DROPDOWN",
      "label": "Sélectionnez le planteur"
    }
  },

  "dependencies": [
    {
      "source_question_code": "COOPERATIVE",
      "type": "FILTER"
    }
  ]
}`}
      </CodeBlock>

      <h2 style={h2Style}>Exemple métier</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginTop: "1rem",
          maxWidth: "600px",
        }}
      >
        {[
          ["COOPERATIVE", "Sélection de la coopérative"],
          ["PLANTEUR", "Liste des planteurs de la coopérative"],
          ["PLANTATION", "Liste des plantations du planteur"],
        ].map(([code, description], index) => (
          <div
            key={code}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "160px",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                fontSize: "0.6875rem",
                fontWeight: 700,
              }}
            >
              {code}
            </div>

            <ChevronRight size={16} color="#5DB83A" />

            <div
              style={{
                flex: 1,
                fontSize: "0.6875rem",
                color: "var(--color-foreground-muted)",
              }}
            >
              {description}
            </div>

            {index < 2 && (
              <ArrowDown size={14} color="var(--color-foreground-muted)" />
            )}
          </div>
        ))}
      </div>

      <InfoBox title="Ordre de traitement">
        Les questions référencées doivent pouvoir être identifiées avant que la
        dépendance soit créée. C'est pourquoi les dépendances sont traitées
        après la création/récupération des questions concernées.
      </InfoBox>

      <h2 style={h2Style}>Ce qui doit être vérifié</h2>

      <ul style={listStyle}>
        <li>La question source existe dans le fichier.</li>

        <li>La question cible existe dans le fichier.</li>

        <li>Les paramètres de dépendance sont valides.</li>

        <li>
          Les références <code>col(...)</code> utilisées par la dépendance sont
          disponibles.
        </li>

        <li>
          Toutes les validations sont terminées avant l'exécution de l'import.
        </li>
      </ul>

      <NextButton
        label="Voir un exemple complet"
        onClick={() => goTo("example")}
      />
    </>
  );
}

/* ============================================================
   8. EXEMPLE COMPLET
============================================================ */

function ExampleSection({
  goTo,
}: {
  goTo: (section: DocumentationSection) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="08 · Exemple"
        title="Exemple complet : planteurs, coopératives et plantations"
        description="Voici une structure simplifiée montrant comment combiner colonnes techniques, questions, options, références et dépendances."
      />

      <h2 style={h2Style}>Feuille : Plantations</h2>

      <CodeBlock>
        {`| Planteur | Code planteur | Coopérative | Code coop | Plantation |
|----------|---------------|-------------|-----------|------------|
|          |               |             |           |            |
| Jean     | PL001         | Coop A      | COOP001   | Plantation 1 |
| Paul     | PL002         | Coop A      | COOP001   | Plantation 2 |
| Pierre   | PL003         | Coop B      | COOP002   | Plantation 3 |`}
      </CodeBlock>

      <p style={paragraphStyle}>
        Dans cet exemple, toutes les colonnes peuvent exister dans Excel, mais
        seules les colonnes dont la deuxième ligne contient du JSON sont
        considérées comme des questions.
      </p>

      <h2 style={h2Style}>Configuration de la question</h2>

      <CodeBlock>
        {`{
  "question": {
    "code": "PLANTEUR",
    "name": "Planteur",

    "version": {
      "question_type": "DROPDOWN",
      "label": "Sélectionnez le planteur"
    }
  },

  "section": {
    "name": "Plantations"
  },

  "form_question": {
    "config": {}
  },

  "dependencies": [
    {
      "source_question_code": "COOPERATIVE",
      "type": "FILTER"
    }
  ]
}`}
      </CodeBlock>

      <h2 style={h2Style}>Utilisation d'une colonne technique</h2>

      <CodeBlock>
        {`{
  "question": {
    "code": "PLANTATION",
    "name": "Plantation",

    "version": {
      "question_type": "DROPDOWN",
      "label": "Plantation de col(PLANTEUR)"
    }
  }
}`}
      </CodeBlock>

      <InfoBox title="Résultat recherché">
        L'utilisateur construit son fichier une seule fois. Le système peut
        ensuite reconstruire la structure du formulaire en respectant l'ordre
        des ressources et en réutilisant celles qui existent déjà.
      </InfoBox>

      <NextButton
        label="Voir les erreurs à éviter"
        onClick={() => goTo("errors")}
      />
    </>
  );
}

/* ============================================================
   9. ERREURS
============================================================ */

function ErrorsSection({
  goTo,
}: {
  goTo: (section: DocumentationSection) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="09 · Sécurité"
        title="Erreurs à éviter"
        description="Quelques règles simples permettent d'éviter la majorité des erreurs lors de la préparation du fichier."
      />

      <div
        style={{
          display: "grid",
          gap: "0.625rem",
        }}
      >
        {[
          [
            "JSON invalide",
            "La deuxième ligne d'une colonne-question doit contenir un JSON valide.",
          ],
          [
            "Code absent",
            "Chaque question doit avoir un code permettant de l'identifier.",
          ],
          [
            "Type incorrect",
            "Le type de question doit correspondre exactement à un type reconnu.",
          ],
          [
            "col(...) inexistant",
            "La colonne référencée doit réellement exister dans la feuille.",
          ],
          [
            "Cellule vide",
            "Une donnée nécessaire référencée par col(...) ne doit pas être vide.",
          ],
          [
            "Dépendance inconnue",
            "Une dépendance ne doit pas pointer vers une question inexistante.",
          ],
          [
            "Configuration ligne 2 absente",
            "Une colonne destinée à être une question doit avoir sa configuration en ligne 2.",
          ],
          [
            "Mélange données/configuration",
            "Ne mettez pas les données métier dans la cellule JSON de la ligne 2.",
          ],
        ].map(([title, description]) => (
          <div
            key={title}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "0.85rem",
              border: "1px solid var(--color-border)",
              borderRadius: "0.625rem",
              background: "var(--color-surface)",
            }}
          >
            <AlertTriangle
              size={16}
              color="#EF4444"
              style={{
                flexShrink: 0,
                marginTop: "1px",
              }}
            />

            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {title}
              </div>

              <div
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.6875rem",
                  lineHeight: 1.6,
                  color: "var(--color-foreground-muted)",
                }}
              >
                {description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <InfoBox title="La bonne méthode">
        Préparez le fichier → vérifiez les noms de colonnes → vérifiez les JSON
        → vérifiez les références
        <code>col(...)</code> → vérifiez les dépendances → lancez la validation
        → corrigez toutes les erreurs → lancez finalement l'import.
      </InfoBox>

      <div
        style={{
          marginTop: "2rem",
          padding: "1.25rem",
          borderRadius: "0.75rem",
          background: "rgba(93, 184, 58, 0.08)",
          border: "1px solid rgba(93, 184, 58, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.8125rem",
            fontWeight: 700,
          }}
        >
          <Check size={17} color="#5DB83A" />
          Votre fichier est prêt ?
        </div>

        <div
          style={{
            marginTop: "0.4rem",
            fontSize: "0.6875rem",
            lineHeight: 1.6,
            color: "var(--color-foreground-muted)",
          }}
        >
          Fermez cette documentation puis utilisez le bouton « Importer Excel »
          pour lancer la validation du fichier.
        </div>
      </div>

      <button
        type="button"
        onClick={() => goTo("overview")}
        style={{
          marginTop: "1.5rem",
          height: "36px",
          padding: "0 0.875rem",
          borderRadius: "0.5rem",
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          color: "var(--color-foreground)",
          fontSize: "0.75rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Revenir au début
      </button>
    </>
  );
}

/* ============================================================
   STYLES
============================================================ */

const h2Style = {
  margin: "2rem 0 0.625rem",
  fontSize: "1rem",
  fontWeight: 750,
  letterSpacing: "-0.01em",
};

const paragraphStyle = {
  margin: "0.5rem 0",
  fontSize: "0.75rem",
  lineHeight: 1.75,
  color: "var(--color-foreground-muted)",
};

const listStyle = {
  margin: "0.75rem 0 0",
  paddingLeft: "1.25rem",
  fontSize: "0.75rem",
  lineHeight: 1.9,
  color: "var(--color-foreground-muted)",
};

const thStyle = {
  padding: "0.7rem",
  textAlign: "left" as const,
  fontWeight: 700,
  background: "var(--color-surface-raised)",
  borderBottom: "1px solid var(--color-border)",
};

const tdStyle = {
  padding: "0.7rem",
  borderBottom: "1px solid var(--color-border)",
  verticalAlign: "top" as const,
};
