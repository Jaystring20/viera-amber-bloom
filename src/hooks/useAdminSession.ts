import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Admin = a Supabase login whose email is in va_admins, the same list the
// database's write rules check.
/** true / false once checked; null while the session lookup is in flight. */
export function useAdminSession() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAuthed(false); return; }
      const { data: row } = await supabase.from("va_admins").select("email").eq("email", session.user.email).maybeSingle();
      setAuthed(!!row);
    });
  }, []);
  return [authed, setAuthed] as const;
}
