import { supabase } from './supabaseClient';

export const api = {
    tasks: {
        async list() {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        async create(task) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('tasks')
                .insert([{ ...task, user_id: user.id }])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async delete(id) {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);
            if (error) throw error;
        }
    },
    habits: {
        async list() {
            const { data, error } = await supabase
                .from('habits')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    },
    notes: {
        async list() {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        async create(note) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('notes')
                .insert([{ ...note, user_id: user.id }])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async update(id, updates) {
            const { data, error } = await supabase
                .from('notes')
                .update({ ...updates, updated_at: new Date() })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async delete(id) {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', id);
            if (error) throw error;
        }
    },
    events: {
        async list() {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('start_time', { ascending: true });
            if (error) throw error;
            return data;
        },
        async create(event) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('events')
                .insert([{ ...event, user_id: user.id }])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        async delete(id) {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);
            if (error) throw error;
        }
    },
    // Specific helper for fetching raw logs for dashboard heatmap
    async getHabitLogs() {
        const { data, error } = await supabase.from('habit_logs').select('*, habits(color, name)');
        if (error) throw error;
        return data;
    },

    // --- INNOVATION LAYER APIS ---

    dailyMetrics: {
        async get(date) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('daily_metrics')
                .select('*')
                .eq('date', date)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') console.error(error); // ignore not found
            return data;
        },
        async upsert(metrics) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('daily_metrics')
                .upsert({ ...metrics, user_id: user.id }, { onConflict: 'user_id, date' })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },
    reflections: {
        async list() {
            const { data, error } = await supabase.from('reflections').select('*').order('date', { ascending: false });
            if (error) throw error;
            return data;
        },
        async create(reflection) {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase.from('reflections').insert([{ ...reflection, user_id: user.id }]).select().single();
            if (error) throw error;
            return data;
        }
    },
    taskLinks: {
        async list() {
            const { data, error } = await supabase.from('task_links').select('*');
            if (error) throw error;
            return data;
        },
        async create(link) {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase.from('task_links').insert([{ ...link, user_id: user.id }]).select().single();
            if (error) throw error;
            return data;
        }
    }
};
