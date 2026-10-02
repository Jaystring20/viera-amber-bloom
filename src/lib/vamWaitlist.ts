import { supabase } from "@/lib/supabase";

export type VamWaitlistSource = "vam_page" | "home";

/**
 * Add someone to the VAM masterclass waitlist (table `vam_waitlist`, see
 * supabase/migrations/09). Shared by the /vam page and the home page's VAM
 * chapter so both feed one list.
 *
 * An email already on the list counts as success: the visitor's goal (being
 * on the list) is met, and the table keeps one row per email.
 */
export async function joinVamWaitlist(entry: { email: string; name?: string; source: VamWaitlistSource }): Promise<boolean> {
  const email = entry.email.trim().toLowerCase();
  const name = entry.name?.trim() || null;
  if (!email) return false;

  const { error } = await supabase.from("vam_waitlist").insert({ email, name, source: entry.source });
  if (error && error.code !== "23505") return false; // 23505 = already on the list

  if (!error) {
    supabase.functions.invoke("notify-admin", {
      body: { type: "vam_waitlist", data: { name: name ?? "", email, source: entry.source } },
    }).catch(() => {});
  }
  return true;
}
