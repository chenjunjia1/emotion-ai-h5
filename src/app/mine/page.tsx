import { redirect } from "next/navigation";

export default function LegacyMinePage() {
  redirect("/profile");
}
