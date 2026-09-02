import { api } from "@/lib/api";
import type { FormImportResult } from "@/types/form-import";

export const formImportService = {
  async validate(formId: number, file: File) {
    const formData = new FormData();

    formData.append("file", file);

    return api.upload<FormImportResult>(
      `/forms/${formId}/form-import/validate`,
      formData,
    );
  },

  async execute(formId: number, file: File) {
    const formData = new FormData();

    formData.append("file", file);

    return api.upload<FormImportResult>(
      `/forms/${formId}/form-import/execute`,
      formData,
    );
  },
};
