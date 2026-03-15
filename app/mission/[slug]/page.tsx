import { MissionPage } from "@/components/mission-page";

function extractDay(slug: string) {
  const match = slug.match(/^day-(\d+)$/);
  return match ? Number(match[1]) : NaN;
}

export default async function MissionRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await params;
  return <MissionPage day={extractDay(resolved.slug)} />;
}
