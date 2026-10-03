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

  const insert = () => supabase.from("vam_waitlist").insert({ email, name, source: entry.source });
  let { error } = await insert();
  // No HTTP answer at all (dropped connection): the row may well have been
  // saved with only the reply lost — this happened on 2026-10-03, so the
  // visitor saw an error while the database had their sign-up. Try once
  // more; if the first attempt did land, the retry comes back as 23505
  // "already on the list", which counts as success below.
  const retried = !!error && !error.code;
  if (retried) ({ error } = await insert());
  if (error && error.code !== "23505") { // 23505 = already on the list
    console.error("VAM waitlist sign-up failed:", error);
    return false;
  }

  // Alert the team for a new sign-up, including one whose reply was lost
  // (first attempt saved, retry answered "already on the list").
  if (!error || retried) {
    supabase.functions.invoke("notify-admin", {
      body: { type: "vam_waitlist", data: { name: name ?? "", email, source: entry.source } },
    }).catch(() => {});
  }
  return true;
}
