import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { VideosPageContent } from "../_components/videos-page-content";

function VideosLoading() {
    return (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading videos…
        </div>
    );
}

export default async function VideosPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <Suspense fallback={<VideosLoading />}>
            <VideosPageContent />
        </Suspense>
    );
}
