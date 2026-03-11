export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return new Response("No file url", { status: 400 });
    }

    const res = await fetch(fileUrl);

    if (!res.ok) {
      return new Response("Failed to fetch file", { status: 500 });
    }

    const data = await res.arrayBuffer();

    // get filename from url
    const name = fileUrl.split("/").pop() || "music.mp3";

    return new Response(data, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${name}"`,
      },
    });
  } catch (err) {
    return new Response("Error downloading file", { status: 500 });
  }
}