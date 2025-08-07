// app/api/your-cron/route.ts

export async function GET() {
  console.log("✅ Cron job працює!");

  // Тут буде твоя логіка — наприклад, оновлення бази або запит до зовнішнього API

  return new Response(JSON.stringify({ success: true, message: "Cron ran successfully" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
