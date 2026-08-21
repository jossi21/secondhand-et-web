export async function uploadListingImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads/image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to upload image";
    try {
      const data = await response.json();
      if (data?.message) {
        message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
      }
    } catch {
      // ignore parse failure, use default message
    }
    throw new Error(message);
  }

  const data: { url: string } = await response.json();
  return data.url;
}
