// Single source of truth for how customers reach Viera Amber.
//
// The number was previously written as a bare literal in four separate
// files, so changing it meant finding all four and getting every one right.

/**
 * WhatsApp number in the international form wa.me requires: country code,
 * no plus, no spaces, no leading zero.
 *
 * Local form:         0814 342 5141
 * International form: +234 814 342 5141
 * wa.me form:         2348143425141
 */
export const WHATSAPP_NUMBER = "2348143425141";

/** Display form, for when the number is shown rather than linked. */
export const WHATSAPP_DISPLAY = "+234 814 342 5141";

/** Build a wa.me link with a pre-filled message. */
export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}/?text=${encodeURIComponent(message)}`;
