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
    }
};
