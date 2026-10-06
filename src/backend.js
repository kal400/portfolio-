import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;

function normalizeProject(p, idx) {
  if (!p) return null;
  const tags = Array.isArray(p.tags) && p.tags.length
    ? p.tags
    : (Array.isArray(p.tech_stack) ? p.tech_stack : []);
  return {
    ...p,
    id: p.id || `proj-${idx + 1}`,
    title: p.title || 'Untitled Project',
    category: p.category || 'General',
    description: p.description || '',
    tags,
    tech_stack: tags,
    tone: p.tone || 'blue',
    featured: Boolean(p.featured),
    published: p.published !== false,
    year: p.year || '2025',
    metric: p.metric || '',
    url: p.url || p.live_url || p.liveUrl || '',
    liveUrl: p.liveUrl || p.live_url || 'https://github.com/kal400',
    githubUrl: p.githubUrl || p.repo_url || 'https://github.com/kal400',
    highlights: Array.isArray(p.highlights) ? p.highlights : []
  };
}

function normalizeSkill(s, idx) {
  if (!s) return null;
  return {
    id: s.id || `skill-${idx + 1}`,
    name: s.name || '',
    category: s.category || 'Frontend',
    level: s.level || 'Proficient',
    desc: s.desc || '',
    sort_order: s.sort_order || idx + 1
  };
}

function normalizeExperience(e, idx) {
  if (!e) return null;
  return {
    id: e.id || `exp-${idx + 1}`,
    role: e.role || '',
    company: e.company || '',
    period: e.period || e.date_range || '',
    date_range: e.date_range || e.period || '',
    description: e.description || '',
    sort_order: e.sort_order || idx + 1
  };
}

export async function fetchPublicContent() {
  if (!supabase) return null;
  try {
    const [{ data: projects }, { data: skills }, { data: experience }, { data: settings }] = await Promise.all([
      supabase.from('projects').select('*').eq('published', true).order('sort_order'),
      supabase.from('skills').select('*').order('sort_order'),
      supabase.from('experience').select('*').order('sort_order'),
      supabase.from('site_settings').select('key,value')
    ]);

    const settingsMap = {};
    (settings || []).forEach(s => { settingsMap[s.key] = s.value; });

    let fullProjects = null;
    if (settingsMap['projects_list']) {
      try {
        const parsed = JSON.parse(settingsMap['projects_list']);
        if (Array.isArray(parsed) && parsed.length > 0) fullProjects = parsed;
      } catch {}
    }

    let fullSkills = null;
    if (settingsMap['skills_list']) {
      try {
        const parsed = JSON.parse(settingsMap['skills_list']);
        if (Array.isArray(parsed) && parsed.length > 0) fullSkills = parsed;
      } catch {}
    }

    let fullExp = null;
    if (settingsMap['experience_list']) {
      try {
        const parsed = JSON.parse(settingsMap['experience_list']);
        if (Array.isArray(parsed) && parsed.length > 0) fullExp = parsed;
      } catch {}
    }

    const rawProjects = fullProjects || (projects || []);
    const rawSkills = fullSkills || (skills || []);
    const rawExp = fullExp || (experience || []);

    return {
      projects: rawProjects.map(normalizeProject).filter(Boolean),
      skills: rawSkills.map(normalizeSkill).filter(Boolean),
      experience: rawExp.map(normalizeExperience).filter(Boolean),
      photo: settingsMap['profile_photo_url'] || null
    };
  } catch (err) {
    console.error('fetchPublicContent error:', err);
    return null;
  }
}

export async function fetchAdminContent() {
  if (!supabase) return null;
  try {
    const [{ data: projects }, { data: skills }, { data: experience }, { data: messages }, { data: settings }] = await Promise.all([
      supabase.from('projects').select('*').order('sort_order'),
      supabase.from('skills').select('*').order('sort_order'),
      supabase.from('experience').select('*').order('sort_order'),
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('key,value')
    ]);

    const settingsMap = {};
    (settings || []).forEach(s => { settingsMap[s.key] = s.value; });

    let fullProjects = null;
    if (settingsMap['projects_list']) {
      try {
        const parsed = JSON.parse(settingsMap['projects_list']);
        if (Array.isArray(parsed) && parsed.length > 0) fullProjects = parsed;
      } catch {}
    }

    let fullSkills = null;
    if (settingsMap['skills_list']) {
      try {
        const parsed = JSON.parse(settingsMap['skills_list']);
        if (Array.isArray(parsed) && parsed.length > 0) fullSkills = parsed;
      } catch {}
    }

    let fullExp = null;
    if (settingsMap['experience_list']) {
      try {
        const parsed = JSON.parse(settingsMap['experience_list']);
        if (Array.isArray(parsed) && parsed.length > 0) fullExp = parsed;
      } catch {}
    }

    const rawProjects = fullProjects || (projects || []);
    const rawSkills = fullSkills || (skills || []);
    const rawExp = fullExp || (experience || []);

    return {
      projects: rawProjects.map(normalizeProject).filter(Boolean),
      skills: rawSkills.map(normalizeSkill).filter(Boolean),
      experience: rawExp.map(normalizeExperience).filter(Boolean),
      messages: messages || [],
      photo: settingsMap['profile_photo_url'] || null
    };
  } catch (err) {
    console.error('fetchAdminContent error:', err);
    return null;
  }
}

export async function saveProjectsList(projects) {
  if (!supabase) return;
  try {
    const cleanProjects = (projects || []).map((p, idx) => normalizeProject(p, idx)).filter(Boolean);
    await supabase.from('site_settings').upsert({
      key: 'projects_list',
      value: JSON.stringify(cleanProjects)
    });
    for (let i = 0; i < cleanProjects.length; i++) {
      const p = cleanProjects[i];
      const dbRow = {
        title: p.title,
        category: p.category,
        description: p.description,
        tech_stack: p.tags || p.tech_stack || [],
        image_url: p.image_url || null,
        live_url: p.liveUrl || p.live_url || null,
        repo_url: p.githubUrl || p.repo_url || null,
        featured: Boolean(p.featured),
        published: p.published !== false,
        sort_order: i + 1
      };
      if (typeof p.id === 'number') {
        await supabase.from('projects').update(dbRow).eq('id', p.id);
      } else {
        const { data } = await supabase.from('projects').upsert(dbRow).select();
        if (data?.[0]?.id) p.id = data[0].id;
      }
    }
  } catch (err) {
    console.error('saveProjectsList error:', err);
  }
}

export async function saveSkillsList(skills) {
  if (!supabase) return;
  try {
    await supabase.from('site_settings').upsert({
      key: 'skills_list',
      value: JSON.stringify(skills)
    });
    for (let i = 0; i < skills.length; i++) {
      const s = skills[i];
      await supabase.from('skills').upsert({
        name: s.name,
        category: s.category,
        sort_order: i + 1
      }, { onConflict: 'name' }).catch(() => {});
    }
  } catch (err) {
    console.error('saveSkillsList error:', err);
  }
}

export async function saveExperienceList(experience) {
  if (!supabase) return;
  try {
    await supabase.from('site_settings').upsert({
      key: 'experience_list',
      value: JSON.stringify(experience)
    });
    for (let i = 0; i < experience.length; i++) {
      const exp = experience[i];
      await supabase.from('experience').upsert({
        role: exp.role,
        company: exp.company,
        date_range: exp.period || exp.date_range || 'Present',
        description: exp.description || '',
        sort_order: i + 1
      }).catch(() => {});
    }
  } catch (err) {
    console.error('saveExperienceList error:', err);
  }
}

export async function createProject(project) {
  if (!supabase) return { data: null, error: null };
  return supabase.from('projects').insert({
    title: project.title,
    category: project.category,
    description: project.description,
    tech_stack: project.tags || [],
    image_url: project.image_url || null,
    live_url: project.live_url || null,
    repo_url: project.repo_url || null,
    featured: Boolean(project.featured),
    published: project.published !== false
  }).select().single();
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

export async function uploadProfilePhoto(file, base64Fallback = null) {
  if (!supabase) return { url: base64Fallback, error: null };
  let photoUrl = null;

  try {
    const extension = file?.name?.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `profile/hero-${Date.now()}.${extension}`;
    const upload = await supabase.storage.from('portfolio-assets').upload(path, file, { upsert: true, contentType: file?.type || 'image/jpeg' });
    if (!upload.error) {
      const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(path);
      photoUrl = data?.publicUrl;
    }
  } catch (err) {}

  if (!photoUrl && base64Fallback) {
    photoUrl = base64Fallback;
  }

  if (photoUrl) {
    const setting = await supabase.from('site_settings').upsert({
      key: 'profile_photo_url',
      value: photoUrl
    }).select().single();
    return { url: photoUrl, error: setting.error };
  }

  return { url: null, error: { message: 'Could not upload or encode photo.' } };
}

export async function markMessageRead(id) {
  if (!supabase || !id) return { error: null };
  return supabase.from('messages').update({ is_read: true }).eq('id', id);
}
