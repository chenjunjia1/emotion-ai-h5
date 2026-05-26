import { redirect } from "next/navigation";

/** 已合并至「今日热点」 */
export default function AdminXhsNotesRedirectPage() {
  redirect("/admin/today-hot-topics");
}
