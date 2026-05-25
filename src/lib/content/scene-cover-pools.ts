import type { ShortVideoCoverPreset, ShortVideoCoverStyle } from "@/lib/content/short-video-covers";

export type SceneCategory =
  | "emotional"
  | "worklife"
  | "pet"
  | "food"
  | "lifestyle"
  | "study"
  | "fashion"
  | "family";

type SceneImage = {
  id: string;
  style: ShortVideoCoverStyle;
  filter: ShortVideoCoverPreset["filter"];
};

/** 每类多张场景图（列表去重用） */
export const SCENE_IMAGE_POOLS: Record<SceneCategory, SceneImage[]> = {
  emotional: [
    { id: "photo-1495474472287-4d71bcff208a", style: "emotion", filter: "warm" },
    { id: "photo-1516557179064-436f16ef9852", style: "emotion", filter: "moody" },
    { id: "photo-1514565130917-fce080956dcc", style: "emotion", filter: "moody" },
    { id: "photo-1459257911876-07ab3da8bd63", style: "emotion", filter: "warm" },
    { id: "photo-1506905925346-21bda4d32df4", style: "emotion", filter: "warm" },
    { id: "photo-1470071459604-3b5ec3a8feef", style: "emotion", filter: "moody" },
  ],
  worklife: [
    { id: "photo-1544629929-0736f52221f8", style: "vlog", filter: "sunset" },
    { id: "photo-1515169066185-1f8426eabcfd", style: "vlog", filter: "moody" },
    { id: "photo-1475274112273-480ab176faf9", style: "vlog", filter: "sunset" },
    { id: "photo-1517248135467-4c7aa77318d8", style: "vlog", filter: "moody" },
    { id: "photo-1449824913935-59a10b8d2001", style: "vlog", filter: "sunset" },
    { id: "photo-1480714378408-67cf0d13bc1b", style: "vlog", filter: "moody" },
  ],
  pet: [
    { id: "photo-1514881248723-9ea5b7e6658f", style: "pet", filter: "pet" },
    { id: "photo-1574158622682-929a128bf3a2", style: "pet", filter: "pet" },
    { id: "photo-1583511655826-05700d62f9bb", style: "pet", filter: "warm" },
    { id: "photo-1587300003388-59208fb96281", style: "pet", filter: "pet" },
    { id: "photo-1548199973-03cce0bbc87a", style: "pet", filter: "pet" },
    { id: "photo-1450778869038-719714da8d94", style: "pet", filter: "warm" },
  ],
  food: [
    { id: "photo-1555939594-58d7cb561ad1", style: "food", filter: "food" },
    { id: "photo-1565299624946-b28f40a0ca4b", style: "food", filter: "food" },
    { id: "photo-1504674900247-0877df9cc836", style: "food", filter: "food" },
    { id: "photo-1559339352-11d035aa65de", style: "food", filter: "warm" },
    { id: "photo-1546069901-ba9599a1e63c", style: "food", filter: "food" },
    { id: "photo-1482049016688-2d3e1b311543", style: "food", filter: "warm" },
  ],
  lifestyle: [
    { id: "photo-1608571423902-eed4a5b810b0", style: "life", filter: "warm" },
    { id: "photo-1615529328331-f9915cda9843", style: "life", filter: "warm" },
    { id: "photo-1556912172-9b7a6ce7a860", style: "life", filter: "life" },
    { id: "photo-1556228570-8f5452a1f27d", style: "life", filter: "warm" },
    { id: "photo-1524758631624-e2822f3049a5", style: "life", filter: "life" },
    { id: "photo-1497366216548-37526070297c", style: "life", filter: "warm" },
  ],
  study: [
    { id: "photo-1456514290212-7c4d8da6f4b7", style: "life", filter: "life" },
    { id: "photo-1484480974693-6ca0a7783d26", style: "life", filter: "life" },
    { id: "photo-1497215842964-222b430dc094", style: "life", filter: "life" },
    { id: "photo-1434030216441-b6bbdad72540", style: "life", filter: "warm" },
    { id: "photo-1516321318423-f06f85e504b3", style: "life", filter: "life" },
    { id: "photo-1522202176988-66273c2fd55f", style: "life", filter: "warm" },
  ],
  fashion: [
    { id: "photo-1469334031218-e382a71b716b", style: "fashion", filter: "warm" },
    { id: "photo-1483985988350-763728e066fa", style: "fashion", filter: "warm" },
    { id: "photo-1515886657613-9f3515b0aee7", style: "fashion", filter: "sunset" },
    { id: "photo-1496747611176-843222e1e57c", style: "fashion", filter: "warm" },
    { id: "photo-1509631179647-0177331693ae", style: "fashion", filter: "sunset" },
    { id: "photo-1529139570906-259b0f4e0a3b", style: "fashion", filter: "warm" },
  ],
  family: [
    { id: "photo-1529156069898-1dbed974c583", style: "life", filter: "warm" },
    { id: "photo-1581578731544-c64695cc6952", style: "life", filter: "warm" },
    { id: "photo-1511895426328-dc871419ed94", style: "life", filter: "warm" },
    { id: "photo-1515488042361-ee00e477a1b8", style: "life", filter: "warm" },
    { id: "photo-1511896874722-a082a9f38d4b", style: "life", filter: "warm" },
    { id: "photo-1503454537845-544730fb8703", style: "life", filter: "warm" },
  ],
};
