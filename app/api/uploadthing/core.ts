import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "1GB" },
    blob: { maxFileSize: "10MB" } // Pour les PDFs et autres fichiers
  })
  .onUploadComplete(async({ file }) => {
  })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;