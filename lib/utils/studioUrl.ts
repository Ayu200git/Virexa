type DocumentType =
  | "activity"
  | "classSession"
  | "category"
  | "venue"
  | "userProfile"
  | "booking";

const NESTED_STRUCTURE_PATHS: Record<string, string> = {
  activity: "classes",
  classSession: "classes",
  category: "classes",
  userProfile: "users-bookings",
  booking: "users-bookings",
};

export function getStudioUrl(
  documentType: DocumentType | string,
  documentId: string
): string {
  const baseId = documentId.replace("drafts.", "");
  const nestedPath = NESTED_STRUCTURE_PATHS[documentType];

  if (nestedPath) {
    return `/studio/structure/${nestedPath};${documentType};${baseId}`;
  }

 
  return `/studio/structure/${documentType};${baseId}`;
}
