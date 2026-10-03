import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;

export async function fetchPublicContent() {
  if (!supabase) return null;
  const [{ data: projects }, { data: skills }, { data: experience }, { data: settings }] = await Promise.all([
    supabase.from('projects').select('*').eq('published', true).order('sort_order'),
    supabase.from('skills').select('*').order('sort_order'),
    supabase.from('experience').select('*').order('sort_order'),
    supabase.from('site_settings').select('key,value').in('key', ['profile_photo_url'])
  ]);
  return { projects: (projects || []).map((item) => ({ ...item, tags: item.tech_stack || [] })), skills: (skills || []).map((item) => item.name), experience: experience || [], photo: settings?.find((item) => item.key === 'profile_photo_url')?.value || null };
}

export async function fetchAdminContent() {
  if (!supabase) return null;
  const [{ data: projects }, { data: skills }, { data: experience }, { data: messages }, { data: settings }] = await Promise.all([
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('skills').select('*').order('sort_order'),
    supabase.from('experience').select('*').order('sort_order'),
    supabase.from('messages').select('*').order('created_at', { ascending: false }),
    supabase.from('site_settings').select('key,value').in('key', ['profile_photo_url'])
  ]);
  return { projects: projects || [], skills: skills || [], experience: experience || [], messages: messages || [], photo: settings?.find((item) => item.key === 'profile_photo_url')?.value || null };
}

export async function createProject(project) {
  if (!supabase) return { data: null, error: null };
  return supabase.from('projects').insert({ title: project.title, category: project.category, description: project.description, tech_stack: project.tags || [], image_url: project.image_url || null, live_url: project.live_url || null, repo_url: project.repo_url || null, featured: Boolean(project.featured), published: project.published !== false }).select().single();
}

export async function removeRecord(table, id) {
  if (!supabase || !id) return { error: null };
  return supabase.from(table).delete().eq('id', id);
}

export async function updateRecord(table, id, record) {
  if (!supabase || !id) return { data: null, error: null };
  return supabase.from(table).update(record).eq('id', id).select().single();
}

export async function createSimpleRecord(table, record) {
  if (!supabase) return { data: null, error: null };
  return supabase.from(table).insert(record).select().single();
}

export async function uploadProfilePhoto(file) {
  if (!supabase) return { url: null, error: null };
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `profile/hero-${Date.now()}.${extension}`;
  const upload = await supabase.storage.from('portfolio-assets').upload(path, file, { upsert: true, contentType: file.type });
  if (upload.error) return { url: null, error: upload.error };
  const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(path);
  const setting = await supabase.from('site_settings').upsert({ key: 'profile_photo_url', value: data.publicUrl }).select().single();
  return { url: data.publicUrl, error: setting.error };
}

export async function markMessageRead(id) {
  if (!supabase || !id) return { error: null };
  return supabase.from('messages').update({ is_read: true }).eq('id', id);
}
