import { serveDir } from "@std/http/file-server";

const PORT = parseInt(Deno.env.get("PORT") || "7777");

Deno.serve({ port: PORT }, (req: Request) => {
    return serveDir(req, {
        fsRoot: "public",
        showDirListing: false,
        showIndex: true,
    });
});

console.log(`Hello World server running on http://localhost:${PORT}`);
