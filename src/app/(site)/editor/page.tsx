import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { catalog } from "@/lib/catalog";
import { pageMetadata } from "@/lib/page-titles";
export const metadata = pageMetadata("editor", true);
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const id = (await searchParams).template ?? catalog[0].id;
  if (!catalog.some((t) => t.id === id)) notFound();
  return <Editor key={id} templateId={id} />;
}
