import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/server/admin-route";
import { logAdminAction } from "@/lib/server/db/admin";
import { uploadAdminImageFile } from "@/services/storageService";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return withAdminRoute(
    req,
    "admin-upload-image",
    async (admin) => {
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (/body|size|limit|10mb|form/i.test(msg)) {
          return NextResponse.json({ error: "body_too_large" }, { status: 413 });
        }
        return NextResponse.json({ error: "invalid_form" }, { status: 400 });
      }

      const file = formData.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "file_required" }, { status: 400 });
      }

      const mime = file.type || "image/jpeg";
      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        const result = await uploadAdminImageFile(buffer, mime, {
          keyPrefix: "hot-topics/covers",
        });

        await logAdminAction(
          admin.id,
          "upload_image",
          "hot_topic_cover",
          result.key,
          null,
          { url: result.cdnUrl, size: buffer.length },
          "admin_panel"
        );

        const persistUrl = result.storageUrl.startsWith("/")
          ? result.storageUrl
          : result.cdnUrl;

        return NextResponse.json({
          ok: true,
          url: persistUrl,
          path: result.storageUrl,
          key: result.key,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "upload_failed";
        const status =
          msg === "unsupported_type" ? 415 : msg === "body_too_large" ? 413 : 500;
        return NextResponse.json({ error: msg }, { status });
      }
    },
    { ipLimit: 20 }
  );
}
