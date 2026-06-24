export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return new Response("No file url", { status: 400 });
    }

    // Parse and validate URL to prevent SSRF
    let parsedUrl;
    try {
      parsedUrl = new URL(fileUrl);
    } catch {
      return new Response("Invalid URL", { status: 400 });
    }

    // Whitelist of allowed domains
    const ALLOWED_HOSTS = [
      "ne-games.com",
      "www.ne-games.com",
    ];

    const isAllowed = ALLOWED_HOSTS.some(
      (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
    );

    if (!isAllowed) {
      return new Response("Domain not allowed", { status: 403 });
    }

    // Only allow http and https
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return new Response("Protocol not allowed", { status: 403 });
    }

    // Block internal/private IPs
    const hostname = parsedUrl.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("172.16.") ||
      hostname.startsWith("172.17.") ||
      hostname.startsWith("172.18.") ||
      hostname.startsWith("172.19.") ||
      hostname.startsWith("172.2") ||
      hostname.startsWith("172.30.") ||
      hostname.startsWith("172.31.") ||
      hostname.startsWith("169.254.")
    ) {
      return new Response("Internal addresses not allowed", { status: 403 });
    }

    const res = await fetch(fileUrl, { redirect: "error" });

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