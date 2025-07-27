export async function uploadToImgBB(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("image", file);

  const apiKey = "YOUR_IMGBB_API_KEY"; // 🔐 ВСТАВ СВІЙ КЛЮЧ

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.success ? data.data.url : null;
}
