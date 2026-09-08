/**
 * WhatsApp Webhook Handler - Test Version
 * ═════════════════════════════════════════════════════════════════
 */

Deno.serve(async (req: Request) => {
  console.log("TEST: Function called!");
  console.log(`Method: ${req.method}`);

  if (req.method === "GET") {
    const url = new URL(req.url);
    const token = url.searchParams.get("hub.verify_token") || "";
    const challenge = url.searchParams.get("hub.challenge") || "";

    console.log(`Token: ${token}`);

    if (token === "pad_kolo_webhook_2026_secure") {
      console.log("✅ Verification SUCCESS");
      return new Response(challenge, { status: 200 });
    }

    console.log("❌ Verification FAILED");
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "POST") {
    console.log("POST received");
    return new Response(
      JSON.stringify({ message: "ok" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response("Method not allowed", { status: 405 });
});
