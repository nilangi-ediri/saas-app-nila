'use server';

import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "../supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();

    if (!author) {
        throw new Error('Unauthorized');
    }

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .insert({ ...formData, author })
        .select();

    if (error || !data || !data[0]) {
        console.error('Supabase error:', error);
        throw new Error(error?.message || 'Failed to create a companion');
    }

    const companionId = data[0].id;

    // Revalidate the companions list and the new companion page
    revalidatePath('/companions');
    revalidatePath(`/companions/${companionId}`);

    // Redirect from server action
    redirect(`/companions/${companionId}`);
}

export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {

    const supabase = createSupabaseClient();

    let query = supabase.from('companions').select();

    if (subject && topic) {
        query = query.ilike('subject', `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    } else if (subject) {
        query = query.ilike('subject', `%${subject}%`)
    } else if (topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    }

    query = query.range((page - 1) * limit, page * limit - 1)

    const { data: companions, error } = await query;

    if (error) throw new Error(error.message);

    return companions;
}

// assets/lib/actions/companion.actions.ts
export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('companions')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(error);
        return null;
    }
    return data;
};

export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from('session_history')
        .insert({
            companion_id: companionId,
            user_id: userId
        })

    if (error) {
        throw new Error(error.message)
    }

    return data;
}

export const getRecentSessions = async (limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select('companions:companion_id (id, subject, name, topic, duration), created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);

    const rows = (data ?? []).map(r => r.companions).filter(Boolean);
    const unique = Array.from(new Map(rows.map(c => [c.id, c])).values());
    return unique;
};

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select('companions:companion_id (id, subject, name, topic, duration), created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);

    const rows = (data ?? []).map(r => r.companions).filter(Boolean);
    const unique = Array.from(new Map(rows.map(c => [c.id, c])).values());
    return unique;
};

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if (error) {
        throw new Error(error.message)
    }

    return data;
}

export const newCompanionPermissions = async () => {
    const { userId, has } = await auth();
    const supabase = createSupabaseClient();

    let limit = 0;
    if (has({ plan: 'pro' })) {
        return true;
    } else if (has({ feature: "3_companion_limit" })) {
        limit = 3;
    } else if (has({ feature: "10_companion_limit" })) {
        limit = 10;
    }

    const { data, error } = await supabase
        .from('companions')
        .select('id', { count: 'exact' })
        .eq('author', userId)

    if (error) {
        throw new Error(error.message)
    }

    const companionCount = data?.length;

    if (companionCount >= limit) {
        return false;
    } else {
        return true;
    }
}