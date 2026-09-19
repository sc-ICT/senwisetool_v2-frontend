import type { QuestionType } from "@/types/question-bank";

/* ============================================================
 * RESOURCE USAGE
 * ========================================================== */

export type ProjectResourceUsage =
  | "GENERAL"
  | "QUESTION"
  | "SELECTION"
  | "LOOKUP"
  | "CALCULATION";

/* ============================================================
 * QUESTION RESPONSE MODE
 * ========================================================== */

/**
 * DEFERRED
 *
 * Le modèle ne définit pas le type de réponse.
 * Le concepteur choisira le type lors de la construction
 * du formulaire.
 *
 * FIXED
 *
 * Toutes les questions provenant de cette ressource utilisent
 * le même type de réponse.
 *
 * ALLOWED
 *
 * Le modèle définit plusieurs types de réponse autorisés.
 * Le concepteur du formulaire pourra choisir parmi eux.
 */
export type ProjectQuestionResponseMode = "DEFERRED" | "FIXED" | "ALLOWED";

/* ============================================================
 * QUESTION RESPONSE OPTION
 * ========================================================== */

export interface ProjectQuestionResponseOption {
  /**
   * Valeur technique enregistrée.
   *
   * Exemple :
   * CONFORM
   */
  value: string;

  /**
   * Libellé présenté à l'utilisateur.
   *
   * Exemple :
   * Conforme
   */
  label: string;

  /**
   * Position d'affichage.
   */
  position: number;

  /**
   * Cette réponse peut-elle être sélectionnée ?
   */
  is_active: boolean;

  /**
   * Configuration statistique optionnelle.
   *
   * Exemple :
   *
   * {
   *   "category": "CONFORM"
   * }
   */
  statistics?: Record<string, unknown>;
}

/* ============================================================
 * QUESTION RESPONSE CONFIGURATION
 * ========================================================== */

export type ProjectQuestionResponseOptionsSource = "MANUAL" | "RESOURCE";

export interface ProjectQuestionResponseResourceOptions {
  /** Ressource dont les enregistrements alimentent les options. */
  resource_id: number;

  /** Champ utilisé comme valeur technique. */
  value_field_key: string;

  /** Champ affiché comme libellé. */
  label_field_key: string;
}

export interface ProjectQuestionResponseConfiguration {
  /**
   * DEFERRED
   * FIXED
   * ALLOWED
   */
  mode: ProjectQuestionResponseMode;

  /**
   * Types de réponses autorisés.
   *
   * DEFERRED :
   *   []
   *
   * FIXED :
   *   ["SINGLE_CHOICE"]
   *
   * ALLOWED :
   *   ["SINGLE_CHOICE", "TEXT", "PHOTO"]
   */
  types: QuestionType[];

  /**
   * Origine des options lorsqu'un type de réponse utilise des choix.
   */
  options_source: ProjectQuestionResponseOptionsSource;

  /**
   * Configuration de la ressource utilisée comme source d'options.
   */
  resource_options?: ProjectQuestionResponseResourceOptions | null;

  /**
   * Options saisies manuellement.
   */
  options: ProjectQuestionResponseOption[];

  /**
   * Indique si le concepteur peut modifier les options
   * prédéfinies lors de la construction du formulaire.
   */
  allow_option_customization: boolean;

  /**
   * Indique si le concepteur peut remplacer le type
   * de réponse défini par le modèle.
   */
  allow_type_override: boolean;
}

/* ============================================================
 * QUESTION HIERARCHY
 * ========================================================== */

/**
 * Une étape de hiérarchie utilisée pour structurer
 * les questions à partir des relations entre ressources.
 *
 * Exemple :
 *
 * REQUIREMENT
 *    │
 *    └── section_requirement
 *             │
 *             └── chapter
 */
export interface ProjectResourceQuestionHierarchyLevel {
  /**
   * Relation utilisée pour atteindre le niveau suivant.
   */
  relation_id: number;

  /**
   * Ressource atteinte.
   */
  resource_id: number;

  /**
   * Clé de la ressource.
   */
  resource_key?: string;

  /**
   * Nom de la ressource.
   */
  resource_name?: string;

  /**
   * Champ source de la relation.
   */
  source_field_key: string;

  /**
   * Champ cible de la relation.
   */
  target_field_key: string;

  /**
   * Libellé affiché dans la structure.
   *
   * Exemple :
   * Chapitre
   * Section
   */
  label?: string | null;

  /**
   * Position dans la hiérarchie.
   *
   * 0 = premier niveau
   * 1 = deuxième niveau
   * etc.
   */
  position: number;
}

/* ============================================================
 * QUESTION STATISTICS
 * ========================================================== */

export type ProjectQuestionStatisticsMeasure = "COUNT" | "PERCENTAGE";

export type ProjectQuestionStatisticsPercentageDenominator =
  | "ALL_QUESTIONS"
  | "ANSWERED_QUESTIONS"
  | "EXCLUDE_VALUES";

export interface ProjectQuestionStatisticsCategory {
  /**
   * Identifiant de la catégorie statistique.
   *
   * Exemple :
   * conform
   */
  key: string;

  /**
   * Libellé.
   *
   * Exemple :
   * Conforme
   */
  label: string;

  /**
   * Valeurs de réponse appartenant à cette catégorie.
   *
   * Exemple :
   *
   * ["CONFORM"]
   */
  response_values: string[];

  /**
   * Permet d'exclure cette catégorie du dénominateur
   * des pourcentages lorsqu'on utilise
   * EXCLUDE_VALUES.
   */
  excluded_from_percentage: boolean;

  /**
   * Position d'affichage.
   */
  position: number;

  /**
   * Active / inactive.
   */
  is_active: boolean;
}

export interface ProjectQuestionStatisticsConfiguration {
  /**
   * Active ou non les statistiques.
   */
  enabled: boolean;

  /**
   * Les statistiques doivent-elles être mises à jour
   * en temps réel pendant la saisie ?
   */
  realtime: boolean;

  /**
   * Afficher les statistiques au niveau global.
   */
  global: boolean;

  /**
   * Positions des niveaux hiérarchiques à analyser.
   *
   * Exemple :
   *
   * [0, 1]
   *
   * signifie :
   * niveau 0 = chapitre
   * niveau 1 = section
   */
  hierarchy_levels: number[];

  /**
   * Mesures calculées.
   */
  measures: ProjectQuestionStatisticsMeasure[];

  /**
   * Règle utilisée pour calculer les pourcentages.
   */
  percentage_denominator: ProjectQuestionStatisticsPercentageDenominator;

  /**
   * Valeurs à exclure du dénominateur lorsque
   * percentage_denominator = EXCLUDE_VALUES.
   */
  excluded_response_values: string[];

  /**
   * Catégories statistiques.
   *
   * Exemple :
   *
   * Conforme
   * Non conforme
   * Non applicable
   */
  categories: ProjectQuestionStatisticsCategory[];
}

/* ============================================================
 * QUESTION DISPLAY CONFIGURATION
 * ========================================================== */

export interface ProjectResourceQuestionDisplayConfiguration {
  /**
   * Champ contenant le texte de la question.
   */
  question_field_key: string;

  /**
   * Champ optionnel contenant le code / identifiant.
   */
  question_key_field_key?: string | null;

  /**
   * Champ optionnel servant de titre court.
   *
   * Utile sur mobile lorsque le texte de la question
   * est long.
   */
  title_field_key?: string | null;

  /**
   * Hiérarchie utilisée pour organiser les questions.
   */
  hierarchy: ProjectResourceQuestionHierarchyLevel[];

  /**
   * Grouper les questions par hiérarchie.
   */
  group_by_hierarchy: boolean;

  /**
   * Afficher le code de la question.
   */
  show_question_key: boolean;
}

/* ============================================================
 * COMPLETE QUESTION CONFIGURATION
 * ========================================================== */

export interface ProjectResourceQuestionConfiguration {
  /**
   * Structure de représentation.
   */
  display: ProjectResourceQuestionDisplayConfiguration;

  /**
   * Configuration des réponses.
   */
  response: ProjectQuestionResponseConfiguration;

  /**
   * Configuration des statistiques.
   */
  statistics: ProjectQuestionStatisticsConfiguration;
}

/* ============================================================
 * RESOURCE BINDING
 * ========================================================== */

export interface ProjectResourceBinding {
  resource_id: number;

  resource_key?: string;

  usage: ProjectResourceUsage;

  required: boolean;

  /**
   * Configuration spécifique à l'utilisation
   * de la ressource.
   */
  configuration?: Record<string, unknown>;
}

/* ============================================================
 * PROJECT TEMPLATE RULE
 * ========================================================== */

export interface ProjectTemplateRule {
  key: string;

  type: string;

  configuration: Record<string, unknown>;
}

/* ============================================================
 * PROJECT TEMPLATE METRIC
 * ========================================================== */

export interface ProjectTemplateMetric {
  key: string;

  label: string;

  source: string;

  aggregation: string;

  scope: string;

  configuration?: Record<string, unknown>;
}

/* ============================================================
 * PROJECT TEMPLATE CONFIGURATION
 * ========================================================== */

export interface PluginProjectTemplateConfiguration {
  [key: string]: unknown;
}

/* ============================================================
 * PROJECT TEMPLATE
 * ========================================================== */

export interface PluginProjectTemplate {
  id: number;

  plugin_id: number;

  key: string;

  name: string;

  description: string | null;

  project_type: string;

  /**
   * null = projet indépendant.
   */
  program_id: number | null;

  icon: string | null;

  position: number;

  is_active: boolean;

  allow_user_use: boolean;

  allow_user_customization: boolean;

  configuration: PluginProjectTemplateConfiguration;

  rules: ProjectTemplateRule[];

  resource_bindings: ProjectResourceBinding[];

  metrics: ProjectTemplateMetric[];
}

/* ============================================================
 * CREATE
 * ========================================================== */

export interface PluginProjectTemplateCreate {
  key: string;

  name: string;

  description?: string | null;

  project_type: string;

  program_id?: number | null;

  icon?: string | null;

  position?: number;

  allow_user_use?: boolean;

  allow_user_customization?: boolean;

  configuration?: PluginProjectTemplateConfiguration;

  rules?: ProjectTemplateRule[];

  resource_bindings?: ProjectResourceBinding[];

  metrics?: ProjectTemplateMetric[];
}

/* ============================================================
 * UPDATE
 * ========================================================== */

export interface PluginProjectTemplateUpdate {
  key?: string;

  name?: string;

  description?: string | null;

  project_type?: string;

  program_id?: number | null;

  icon?: string | null;

  position?: number;

  is_active?: boolean;

  allow_user_use?: boolean;

  allow_user_customization?: boolean;

  configuration?: PluginProjectTemplateConfiguration;

  rules?: ProjectTemplateRule[];

  resource_bindings?: ProjectResourceBinding[];

  metrics?: ProjectTemplateMetric[];
}

/* ============================================================
 * LIST
 * ========================================================== */

export interface PluginProjectTemplateListResponse {
  items: PluginProjectTemplate[];

  count: number;
}
