export async function sendTgMessage(chatId: string | number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  if (!token || !chatId) return;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (!res.ok) console.error("Telegram send error:", await res.text());
}
