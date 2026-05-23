import { createAdminClient } from "@/lib/supabase/admin";
import { formatSupabaseError } from "@/lib/supabase/format-error";
import {
    isCompleteSeriesForm,
    toSeriesInsertRow,
    toSeriesUpdateRow,
    type SeriesFormData,
    type SeriesStatus,
} from "@/lib/series";
import {
    fallbackStatusIfNeeded,
    isSeriesStatusConstraintError,
} from "@/lib/series-status-db";

export async function getSeriesOwnedByUser(seriesId: string, clerkUserId: string) {
    const supabase = createAdminClient();
    return supabase
        .from("series")
        .select("id, status")
        .eq("id", seriesId)
        .eq("clerk_user_id", clerkUserId)
        .maybeSingle();
}

export async function updateSeriesStatus(
    seriesId: string,
    clerkUserId: string,
    status: SeriesStatus
) {
    const supabase = createAdminClient();
    const existing = await getSeriesOwnedByUser(seriesId, clerkUserId);

    if (existing.error) {
        return { error: formatSupabaseError(existing.error) };
    }
    if (!existing.data) {
        return { error: "Series not found" };
    }

    let appliedStatus = status;
    let { error } = await supabase
        .from("series")
        .update({ status: appliedStatus })
        .eq("id", seriesId)
        .eq("clerk_user_id", clerkUserId);

    if (error && isSeriesStatusConstraintError(error) && status === "active") {
        appliedStatus = fallbackStatusIfNeeded(status);
        ({ error } = await supabase
            .from("series")
            .update({ status: appliedStatus })
            .eq("id", seriesId)
            .eq("clerk_user_id", clerkUserId));
    }

    if (error) {
        return { error: formatSupabaseError(error) };
    }

    return { error: null, status: appliedStatus };
}

export async function insertSeriesForUser(
    clerkUserId: string,
    form: SeriesFormData & {
        niche: string;
        language: string;
        voice: string;
        videoStyle: string;
        captionStyle: string;
        videoDuration: string;
        publishTime: string;
    }
) {
    const supabase = createAdminClient();
    let row = toSeriesInsertRow(clerkUserId, form);

    let { data, error } = await supabase
        .from("series")
        .insert(row)
        .select("id")
        .single();

    if (error && isSeriesStatusConstraintError(error) && row.status === "active") {
        row = { ...row, status: fallbackStatusIfNeeded("active") };
        ({ data, error } = await supabase
            .from("series")
            .insert(row)
            .select("id")
            .single());
    }

    if (error) {
        return { error: formatSupabaseError(error), id: null };
    }

    return { error: null, id: data.id as string };
}

export async function deleteSeriesOwnedByUser(
    seriesId: string,
    clerkUserId: string
) {
    const supabase = createAdminClient();
    const existing = await getSeriesOwnedByUser(seriesId, clerkUserId);

    if (existing.error) {
        return { error: formatSupabaseError(existing.error) };
    }
    if (!existing.data) {
        return { error: "Series not found" };
    }

    const { error } = await supabase
        .from("series")
        .delete()
        .eq("id", seriesId)
        .eq("clerk_user_id", clerkUserId);

    if (error) {
        return { error: formatSupabaseError(error) };
    }

    return { error: null };
}

export async function updateSeriesFromForm(
    seriesId: string,
    clerkUserId: string,
    form: SeriesFormData
) {
    if (!isCompleteSeriesForm(form)) {
        return { error: "Missing or invalid series fields" };
    }

    const supabase = createAdminClient();
    const existing = await getSeriesOwnedByUser(seriesId, clerkUserId);

    if (existing.error) {
        return { error: formatSupabaseError(existing.error) };
    }
    if (!existing.data) {
        return { error: "Series not found" };
    }

    const { error } = await supabase
        .from("series")
        .update(toSeriesUpdateRow(form))
        .eq("id", seriesId)
        .eq("clerk_user_id", clerkUserId);

    if (error) {
        return { error: formatSupabaseError(error) };
    }

    return { error: null, id: seriesId };
}
