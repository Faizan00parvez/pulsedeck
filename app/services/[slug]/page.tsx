import { SERVICES } from "../../../lib/services";
import ServiceDetail from "./ServiceDetail";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServiceDetail slug={slug} />;
}
