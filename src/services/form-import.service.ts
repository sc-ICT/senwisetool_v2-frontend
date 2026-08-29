import { api } from "@/lib/api";
import type { FormImportResult } from "@/types/form-import";

export const formImportService = {
  async validate(projectId: number, file: File) {
    const formData = new FormData();

    formData.append("file", file);

    return api.upload<FormImportResult>(
      `/projects/${projectId}/form-import/validate`,
      formData,
    );
  },

  async execute(projectId: number, file: File) {
    const formData = new FormData();

    formData.append("file", file);

    return api.upload<FormImportResult>(
      `/projects/${projectId}/form-import/execute`,
      formData,
    );
  },
};
