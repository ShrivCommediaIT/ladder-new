import { redirect } from "next/navigation";

export default function PlayerListRedirectPage({ params }) {
  const decodedId = decodeURIComponent(params.ladderId);
  redirect(`/register-user?.ladder_id=${decodedId}`);
}
