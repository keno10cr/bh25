/** Typical published guest notes: villa ~82 chars, homepage ~114 chars. */
export const COMMENT_MIN_LENGTH = 60;
export const COMMENT_MAX_LENGTH = 280;

export function isGuestCommentForm(formType) {
  return formType === "guestExperience" || formType === "villaComment";
}

export function commentLength(text) {
  return String(text || "").trim().length;
}

export function getCommentLengthCode(text) {
  const length = commentLength(text);
  if (length < COMMENT_MIN_LENGTH) return "tooShort";
  if (length > COMMENT_MAX_LENGTH) return "tooLong";
  return null;
}
