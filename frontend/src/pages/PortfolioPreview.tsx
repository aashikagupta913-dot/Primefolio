import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';

export const PortfolioPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'preview'>('preview');

  const [editTitle, setEditTitle] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (portfolio) {
      setEditTitle(portfolio.title || '');
      setEditTagline(portfolio.tagline || '');
      setEditEmail(portfolio.contact_email || '');
      setEditAbout(portfolio.about || '');
    }
  }, [portfolio]);

  useEffect(() => {
    if (!id) return;

    const fetchPortfolio = async () => {
      try {
        const data = await apiService.getPortfolio(id);
        setPortfolio(data);
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message || 'Failed to retrieve portfolio configuration.'
        );
      } finally {
        setLoading(false);
      }
    };

    const run = async () => {
      await fetchPortfolio();
    };
    run();
  }, [id]);

  const handleTogglePublish = async () => {
    if (!portfolio || publishing) return;
    setPublishing(true);

    try {
      const nextState = !portfolio.is_published;
      const res = await apiService.updatePortfolio(portfolio.id, { is_published: nextState });
      if (res.success && res.portfolio) {
        const updatedData = await apiService.getPortfolio(portfolio.id);
        setPortfolio(updatedData);
      }
    } catch (err: any) {
      setErrorMsg('Failed to update publication status.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDownloadHtml = () => {
    if (!portfolio) return;

    let htmlContent = '';

    if (isAi && blueprint) {
      // Render AI standalone HTML
      const ordered = blueprint.sectionOrder || ['aboutSection', 'skillsSection', 'projectsSection', 'experienceSection', 'contactSection'];

      const sectionsHtml = ordered.map((secName: string) => {
        const lower = secName.toLowerCase();
        if (lower === 'about' || secName === 'aboutSection') {
          const about = blueprint.aboutSection;
          if (!about) return '';
          return `
            <section id="about" class="py-16 border-b" style="border-color: ${secondaryColor}15">
              <div class="max-w-3xl">
                <h3 class="text-3xl font-extrabold mb-6 tracking-tight" style="color: ${primaryColor}">${about.title || 'About Me'}</h3>
                <div class="space-y-4">
                  <p class="text-lg leading-relaxed opacity-90">${about.description || ''}</p>
                  ${(about.bioParagraphs || []).map((p: string) => `<p class="text-base leading-relaxed opacity-75">${p}</p>`).join('')}
                </div>
              </div>
            </section>
          `;
        }
        if (lower === 'skills' || secName === 'skillsSection') {
          const skills = blueprint.skillsSection;
          if (!skills) return '';
          return `
            <section id="skills" class="py-16 border-b" style="border-color: ${secondaryColor}15">
              <h3 class="text-3xl font-extrabold mb-8 tracking-tight" style="color: ${primaryColor}">${skills.title || 'Skills'}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                ${(skills.categories || []).map((cat: any) => `
                  <div class="p-6 border bg-opacity-40" style="background-color: ${cardBgColor}; border-color: ${secondaryColor}10; border-radius: ${isBrutalist ? '0px' : '12px'}; box-shadow: ${isBrutalist ? '4px 4px 0px 0px #000000' : 'none'}">
                    <h4 class="text-xs uppercase tracking-wider font-extrabold mb-4 opacity-70" style="color: ${primaryColor}">${cat.name}</h4>
                    <div class="flex flex-wrap gap-2">
                      ${(cat.items || []).map((item: string) => `
                        <span class="text-xs px-2.5 py-1 rounded border font-medium" style="background-color: ${primaryColor}06; border-color: ${primaryColor}15; color: ${textColor}">${item}</span>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        }
        if (lower === 'projects' || secName === 'projectsSection') {
          const projects = blueprint.projectsSection;
          if (!projects) return '';
          return `
            <section id="projects" class="py-16 border-b" style="border-color: ${secondaryColor}15">
              <h3 class="text-3xl font-extrabold mb-8 tracking-tight" style="color: ${primaryColor}">${projects.title || 'Featured Projects'}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${(projects.items || []).map((proj: any) => `
                  <div class="p-6 border bg-opacity-40" style="background-color: ${cardBgColor}; border-color: ${secondaryColor}15; border-radius: ${isBrutalist ? '0px' : '12px'}; box-shadow: ${isBrutalist ? '4px 4px 0px 0px #000000' : 'none'}">
                    <div class="flex justify-between items-start mb-3">
                      <h4 class="font-bold text-lg" style="color: ${textColor}">${proj.title}</h4>
                      ${proj.role ? `<span class="text-xs px-2.5 py-0.5 rounded-full font-semibold" style="background-color: ${secondaryColor}15; color: ${secondaryColor}">${proj.role}</span>` : ''}
                    </div>
                    <p class="text-sm opacity-80 mb-4">${proj.description}</p>
                    ${proj.technologies && proj.technologies.length > 0 ? `
                      <div class="flex flex-wrap gap-1.5 mb-4">
                        ${proj.technologies.map((tech: string) => `
                          <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded" style="background-color: ${primaryColor}10; color: ${primaryColor}">${tech}</span>
                        `).join('')}
                      </div>
                    ` : ''}
                    ${proj.link ? `<a href="${proj.link}" target="_blank" rel="noreferrer" class="inline-flex items-center text-xs font-bold hover:underline" style="color: ${primaryColor}">View Code/Project →</a>` : ''}
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        }
        if (lower === 'experience' || secName === 'experienceSection') {
          const exp = blueprint.experienceSection;
          if (!exp) return '';
          return `
            <section id="experience" class="py-16 border-b" style="border-color: ${secondaryColor}15">
              <h3 class="text-3xl font-extrabold mb-8 tracking-tight" style="color: ${primaryColor}">${exp.title || 'Work Experience'}</h3>
              <div class="space-y-8">
                ${(exp.items || []).map((item: any) => `
                  <div class="relative pl-6 border-l-2" style="border-color: ${primaryColor}30">
                    <div class="absolute w-3.5 h-3.5 rounded-full -left-[8px] top-1.5 border-2" style="background-color: ${bgColor}; border-color: ${primaryColor}"></div>
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <div>
                        <h4 class="font-bold text-lg" style="color: ${textColor}">${item.role}</h4>
                        <p class="text-sm font-semibold" style="color: ${secondaryColor}">${item.company}</p>
                      </div>
                      <span class="text-xs font-semibold opacity-60 mt-1 sm:mt-0">${item.duration}</span>
                    </div>
                    ${item.description ? `<p class="text-sm opacity-85 mb-3">${item.description}</p>` : ''}
                    ${item.achievements && item.achievements.length > 0 ? `
                      <ul class="list-disc list-inside text-xs opacity-75 space-y-1.5 pl-2">
                        ${item.achievements.map((ach: string) => `<li>${ach}</li>`).join('')}
                      </ul>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        }
        if (lower === 'contact' || secName === 'contactSection') {
          const contact = blueprint.contactSection;
          if (!contact) return '';
          return `
            <section id="contact" class="py-16">
              <h3 class="text-3xl font-extrabold mb-4 tracking-tight" style="color: ${primaryColor}">${contact.title || 'Get In Touch'}</h3>
              <p class="text-base opacity-80 mb-6 max-w-xl">${contact.description}</p>
              <div class="space-y-4">
                ${contact.email ? `
                  <div>
                    <span class="block text-xs uppercase font-extrabold opacity-50 mb-1">Email Address</span>
                    <a href="mailto:${contact.email}" class="text-lg font-bold hover:underline" style="color: ${primaryColor}">${contact.email}</a>
                  </div>
                ` : ''}
                ${contact.socialLinks && Object.keys(contact.socialLinks).length > 0 ? `
                  <div class="pt-2">
                    <span class="block text-xs uppercase font-extrabold opacity-50 mb-2">Social Channels</span>
                    <div class="flex flex-wrap gap-3">
                      ${Object.entries(contact.socialLinks).map(([platform, url]: [string, any]) => {
            if (!url) return '';
            return `<a href="${url}" target="_blank" rel="noreferrer" class="px-3.5 py-1.5 border hover:underline font-bold text-xs uppercase tracking-wider transition" style="border-color: ${secondaryColor}25; color: ${secondaryColor}; border-radius: ${isBrutalist ? '0px' : '6px'}; background-color: ${secondaryColor}03">${platform}</a>`;
          }).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </section>
          `;
        }
        return '';
      }).join('');

      const hero = blueprint.heroSection;
      const heroHtml = hero ? `
        <header class="py-24 border-b" style="border-color: ${secondaryColor}15">
          <div class="max-w-3xl space-y-6">
            <span class="px-3 py-1 rounded-full text-xs font-semibold tracking-wider font-mono" style="background-color: ${primaryColor}15; color: ${primaryColor}">${blueprint.theme || 'AI Custom Style'}</span>
            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight leading-none" style="color: ${primaryColor}">${hero.headline || blueprint.siteTitle}</h1>
            <p class="text-xl md:text-3xl font-medium opacity-90 leading-relaxed">${hero.subheadline || blueprint.tagline}</p>
            ${blueprint.contactSection?.email ? `
              <div class="pt-4">
                <a href="mailto:${blueprint.contactSection.email}" class="inline-block px-6 py-3 font-semibold text-sm transition" style="background-color: ${primaryColor}; color: ${isLightTheme ? '#ffffff' : '#050508'}; border-radius: ${isBrutalist ? '0px' : '8px'}; border: ${isBrutalist ? '2px solid #000000' : 'none'}; box-shadow: ${isBrutalist ? '4px 4px 0px 0px #000000' : 'none'}">${hero.ctaText || 'Get In Touch'}</a>
              </div>
            ` : ''}
          </div>
        </header>
      ` : '';

      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${blueprint.siteTitle || portfolio.title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: '${fontName}', sans-serif;
              background-color: ${bgColor};
              color: ${textColor};
            }
          </style>
        </head>
        <body class="min-h-screen">
          <div class="max-w-4xl mx-auto px-6 md:px-12 py-12">
            ${heroHtml}
            ${sectionsHtml}
          </div>
        </body>
        </html>
      `;
    } else {
      const isCosmic = portfolio.selected_theme === 'cosmic-creative';
      const isShowcase = portfolio.selected_theme === 'creative-showcase';
      const isPortfolio2023 = portfolio.selected_theme === 'portfolio-2023';
      const isPlayfulRetro = portfolio.selected_theme === 'playful-retro';
      const isFigDesigner = portfolio.selected_theme === 'fig-designer';

      if (isPortfolio2023) {
        const namePart = portfolio.title.split('|')[0].trim();
        const rolePart = portfolio.title.split('|')[1]?.trim() || "Software Engineer";

        const experienceItems = (portfolio.experience || []).slice(0, 3).map((exp: any) => `
          <div class="relative pl-6 border-l border-slate-800">
            <div class="absolute w-2 h-2 rounded-full -left-[4.5px] top-1.5 bg-teal-400"></div>
            <div class="space-y-1">
              <span class="text-[9px] font-mono text-slate-500">${exp.start_date || ''} - ${exp.end_date || ''}</span>
              <h4 class="font-bold text-sm text-white">${exp.position || ''}</h4>
              <p class="text-xs text-teal-400 font-semibold">${exp.company || ''}</p>
              <p class="text-[11px] text-slate-400 leading-relaxed">${exp.description || ''}</p>
            </div>
          </div>
        `).join('');

        const projectItems = (portfolio.projects || []).slice(0, 4).map((proj: any) => `
          <div class="p-4 rounded-xl bg-slate-950 border border-slate-900 flex flex-col justify-between space-y-4 group">
            <div class="space-y-2">
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-sm text-slate-100">${proj.name || ''}</h4>
                ${proj.role ? `<span class="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold">${proj.role}</span>` : ''}
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed line-clamp-3">${proj.description || ''}</p>
            </div>
            ${proj.url ? `<a href="${proj.url}" target="_blank" class="text-[10px] font-bold text-teal-400 flex items-center gap-1 hover:underline">View Project <span>→</span></a>` : ''}
          </div>
        `).join('');

        const skillsItems = (portfolio.skills || []).slice(0, 3).map((group: any) => `
          <div class="space-y-1.5">
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500">${group.category || ''}</span>
            <div class="flex flex-wrap gap-1.5">
              ${(group.skills || []).map((s: string) => `<span class="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800/80 text-slate-300 font-medium">${s}</span>`).join('')}
            </div>
          </div>
        `).join('');

        htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${portfolio.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Outfit', sans-serif;
                background-color: #070a13;
                color: #e2e8f0;
              }
            </style>
          </head>
          <body class="min-h-screen p-6 md:p-12">
            <div class="max-w-4xl mx-auto space-y-10">
              <!-- Nav -->
              <nav class="flex justify-between items-center pb-4 border-b border-slate-900/60">
                <span class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                  ${namePart}
                </span>
                <div class="flex space-x-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <a href="#about" class="hover:text-teal-400 transition">About</a>
                  <a href="#skills" class="hover:text-teal-400 transition">Skills</a>
                  <a href="#projects" class="hover:text-teal-400 transition">Works</a>
                </div>
              </nav>

              <!-- Bento Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Welcome -->
                <div class="md:col-span-2 bg-[#0d1222]/80 border border-slate-900/60 rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
                  <div class="space-y-4">
                    <span class="text-xs font-bold font-mono tracking-widest text-teal-400 uppercase bg-teal-400/5 px-2.5 py-1 rounded-md border border-teal-500/10">Available for Work</span>
                    <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                      Hi, I'm <span class="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">${namePart}</span>. <br />
                      ${rolePart}
                    </h1>
                    <p class="text-slate-400 text-sm md:text-base leading-relaxed">
                      ${portfolio.tagline || ''}
                    </p>
                  </div>
                </div>

                <!-- About -->
                <div class="bg-[#0d1222]/80 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between">
                  <div class="space-y-3">
                    <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl">👨‍💻</div>
                    <h3 class="font-bold text-lg text-white">About Me</h3>
                    <p class="text-xs text-slate-400 leading-relaxed">${portfolio.about || ''}</p>
                  </div>
                </div>

                <!-- Stack -->
                <div class="bg-[#0d1222]/80 border border-slate-900/60 rounded-2xl p-6">
                  <h3 class="font-bold text-lg text-white mb-4">Core Stack</h3>
                  <div class="space-y-4">${skillsItems}</div>
                </div>

                <!-- Selected Works -->
                <div class="md:col-span-2 bg-[#0d1222]/80 border border-slate-900/60 rounded-2xl p-6">
                  <h3 class="font-bold text-lg text-white mb-6">Selected Works</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${projectItems}</div>
                </div>

                <!-- Experience -->
                <div class="md:col-span-3 bg-[#0d1222]/80 border border-slate-900/60 rounded-2xl p-6">
                  <h3 class="font-bold text-lg text-white mb-6">Professional Timeline</h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">${experienceItems}</div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;
      } else if (isCosmic) {
        const namePart = portfolio.title.split('|')[0].trim();
        const rolePart = portfolio.title.split('|')[1]?.trim() || "Software Engineer";

        const experienceItems = (portfolio.experience || []).slice(0, 4).map((item: any, idx: number) => {
          let emoji = '📘';
          if (idx === 1) emoji = '🔮';
          if (idx === 2) emoji = '☕';
          if (idx === 3) emoji = '📍';
          return `
            <div class="p-6 rounded-2xl border flex items-start space-x-4 transition-all duration-300" style="background-color: rgba(17, 9, 40, 0.45); border-color: rgba(99, 102, 241, 0.15); backdrop-filter: blur(10px)">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style="background-color: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3)">
                ${emoji}
              </div>
              <div class="space-y-1.5 flex-grow">
                <div class="flex justify-between items-start">
                  <h4 class="font-extrabold text-sm text-white">${item.company}</h4>
                  <span class="text-[10px] font-mono text-slate-500">${item.start_date} - ${item.end_date}</span>
                </div>
                <p class="text-xs text-purple-400 font-bold">${item.position}</p>
                <p class="text-xs text-slate-400 leading-relaxed">${item.description || ''}</p>
              </div>
            </div>
          `;
        }).join('');

        const projectItems = (portfolio.projects || []).map((proj: any, idx: number) => {
          const isEven = idx % 2 === 0;
          return `
            <div class="flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12">
              <div class="w-full md:w-1/2 relative">
                <div class="relative bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl p-4">
                  <div class="flex items-center space-x-1.5 mb-3 opacity-60">
                    <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  </div>
                  <div class="aspect-[4/3] w-full rounded-lg bg-indigo-950/20 border border-indigo-900/30 flex items-center justify-center p-6 text-center">
                    <div class="space-y-2">
                      <span class="text-purple-400 text-sm font-extrabold block">WHO AM I?</span>
                      <p class="text-[10px] text-slate-500 font-mono">Work as frontend developer</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="w-full md:w-1/2 space-y-4">
                <span class="text-xs font-bold text-purple-400 font-mono uppercase tracking-widest">Featured Project</span>
                <h3 class="text-2xl font-black text-white">${proj.name}</h3>
                <p class="text-slate-400 text-sm leading-relaxed p-4 rounded-xl border border-indigo-950/40" style="background-color: rgba(17, 9, 40, 0.2)">
                  ${proj.description || ''}
                </p>
                ${proj.technologies && proj.technologies.length > 0 ? `
                  <div class="flex flex-wrap gap-2 pt-2">
                    ${proj.technologies.map((t: string) => `<span class="text-[10px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-900/40">${t}</span>`).join('')}
                  </div>
                ` : ''}
                ${proj.url ? `<a href="${proj.url}" target="_blank" class="inline-flex items-center text-xs font-extrabold text-purple-400 hover:text-purple-300 underline">Explore Live Code →</a>` : ''}
              </div>
            </div>
          `;
        }).join('');

        const skillBadges = (portfolio.skills || []).flatMap((s: any) => s.skills || []).slice(0, 12).map((s: string) => `
          <span class="px-3 py-1 bg-indigo-950/30 border border-indigo-900/40 rounded-full text-xs font-semibold text-slate-300">${s}</span>
        `).join('');

        htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${portfolio.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Caveat:wght@700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Plus Jakarta Sans', sans-serif;
                background: radial-gradient(circle at 50% 20%, #170d38 0%, #060214 70%);
                color: #cbd5e1;
              }
            </style>
          </head>
          <body class="min-h-screen">
            <div class="max-w-4xl mx-auto px-6 md:px-12 py-12 space-y-24">
              <!-- Header Nav -->
              <nav class="flex justify-between items-center py-6">
                <span class="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Ʃ</span>
                <div class="flex space-x-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <a href="#about" class="hover:text-purple-400 transition">Home</a>
                  <a href="#experience" class="hover:text-purple-400 transition">About</a>
                  <a href="#projects" class="hover:text-purple-400 transition">Lab</a>
                </div>
              </nav>

              <!-- Hero -->
              <header class="text-center space-y-6 max-w-2xl mx-auto pt-10">
                <div class="relative flex flex-col items-center mb-8">
                  <div class="relative w-48 h-48 rounded-full bg-indigo-950/50 border border-indigo-900/40 flex items-center justify-center overflow-hidden shadow-2xl">
                    <div class="absolute bottom-0 w-36 h-36 flex flex-col items-center">
                      <div class="w-20 h-20 rounded-full bg-amber-200 relative flex items-center justify-center">
                        <div class="absolute top-1 w-24 h-8 bg-stone-800 rounded-t-full"></div>
                        <div class="w-16 h-6 flex justify-between px-1.5 mt-2">
                          <span class="w-5 h-5 rounded-full border border-stone-800 bg-white/10"></span>
                          <span class="w-5 h-5 rounded-full border border-stone-800 bg-white/10"></span>
                        </div>
                      </div>
                      <div class="w-28 h-16 bg-zinc-800 rounded-t-lg border-b border-zinc-700/80 mt-2 relative flex items-center justify-center">
                        <span class="text-white text-[8px] opacity-60"></span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="absolute -top-6 right-1/4 translate-x-20 rotate-[12deg] flex items-center space-x-2 font-handwriting">
                    <svg class="w-10 h-10 text-purple-400 -scale-y-100 -rotate-90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span class="text-purple-400 text-lg font-bold tracking-wide" style="font-family: 'Caveat', cursive">Hello! I Am ${namePart}</span>
                  </div>
                </div>

                <span class="text-xs font-mono text-purple-400 font-extrabold uppercase tracking-widest block">A Designer who</span>
                <h1 class="text-5xl font-black tracking-tight leading-tight text-white">
                  Judges a book <br />
                  by its <span class="relative inline-block px-4 py-1 border-2 border-dashed border-purple-500 rounded-full rotate-[-2deg]">cover...</span>
                </h1>
                
                <h2 class="text-2xl font-bold text-slate-200 mt-6">I'm a ${rolePart}.</h2>
                <p class="text-slate-400 text-base leading-relaxed max-w-xl mx-auto mt-4">${portfolio.about}</p>
              </header>

              <!-- Experience -->
              <section id="experience" class="space-y-8 pt-10">
                <h3 class="text-2xl font-black text-center text-white">Work Experience</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  ${experienceItems}
                </div>
              </section>

              <!-- Skills & Central Orb -->
              <section class="text-center pt-10">
                <h3 class="text-xl font-bold max-w-xl mx-auto leading-relaxed mb-12">
                  I'm currently looking to join a <span class="text-purple-400 underline decoration-wavy decoration-purple-600 font-extrabold">cross-functional</span> team <br />
                  that values improving people's lives through accessible design
                </h3>
                <div class="relative w-full max-w-md mx-auto h-64 flex flex-col justify-end items-center mb-8">
                  <svg class="absolute inset-0 w-full h-full text-indigo-950/60 pointer-events-none" viewBox="0 0 200 200" fill="none">
                    <path d="M100 160 C80 120, 30 110, 30 70" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M100 160 C90 120, 65 100, 65 60" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M100 160 C100 110, 100 90, 100 50" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M100 160 C110 120, 135 100, 135 60" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M100 160 C120 120, 170 110, 170 70" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  
                  <div class="absolute top-10 left-3 bg-purple-500/10 border border-purple-500/30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><span class="text-sm">🎨</span></div>
                  <div class="absolute top-4 left-14 bg-indigo-500/10 border border-indigo-500/30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><span class="text-sm">⚛️</span></div>
                  <div class="absolute top-0 bg-blue-500/10 border border-blue-500/30 w-12 h-12 rounded-full flex items-center justify-center shadow-xl"><span class="text-base">🚀</span></div>
                  <div class="absolute top-4 right-14 bg-pink-500/10 border border-pink-500/30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><span class="text-sm">⚡</span></div>
                  <div class="absolute top-10 right-3 bg-emerald-500/10 border border-emerald-500/30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><span class="text-sm">🟢</span></div>

                  <div class="w-24 h-24 rounded-full bg-purple-950/80 border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center relative z-10">
                    <span class="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Ʃ</span>
                  </div>
                </div>
                <div class="flex flex-wrap justify-center gap-2 max-w-xl mx-auto mt-6">
                  ${skillBadges}
                </div>
              </section>

              <!-- Projects -->
              <section id="projects" class="space-y-16 pt-10">
                <h3 class="text-xs text-slate-500 uppercase tracking-widest font-mono mb-2">Featured Work</h3>
                <h2 class="text-3xl font-black mb-12 text-white">Example Projects</h2>
                <div class="space-y-16">
                  ${projectItems}
                </div>
              </section>

              <!-- Contact -->
              <footer class="py-20 text-center border-t border-slate-900">
                <h2 class="text-3xl font-black mb-6 text-white">Contact</h2>
                <p class="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
                  I'm currently looking to join a cross-functional team that values improving people's lives through accessible design, or have a project in mind? Let's connect.
                </p>
                ${portfolio.contact_email ? `
                  <div class="mb-8">
                    <a href="mailto:${portfolio.contact_email}" class="text-lg font-black hover:text-purple-400 transition underline decoration-2 decoration-purple-600">${portfolio.contact_email}</a>
                  </div>
                ` : ''}
              </footer>
            </div>
          </body>
          </html>
        `;
      } else if (isShowcase) {
        const namePart = portfolio.title.split('|')[0].trim();
        const rolePart = portfolio.title.split('|')[1]?.trim() || "Web Designer";

        const projectItems = (portfolio.projects || []).map((proj: any) => `
          <div class="p-8 rounded-3xl border transition-all duration-300" style="background-color: rgba(30, 27, 24, 0.45); border-color: rgba(120, 113, 108, 0.15)">
            <h4 class="text-xl font-bold text-white mb-2">${proj.name}</h4>
            <p class="text-sm text-stone-400 leading-relaxed mb-4">${proj.description || ''}</p>
            ${proj.technologies && proj.technologies.length > 0 ? `
              <div class="flex flex-wrap gap-2">
                ${proj.technologies.map((t: string) => `<span class="text-[10px] font-mono text-stone-400 px-2 py-0.5 rounded bg-stone-800">${t}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('');

        const profileImageTag = portfolio.profile_image_url ? `
          <div class="relative">
            <div class="absolute inset-0 bg-stone-500/10 rounded-3xl blur-xl"></div>
            <img src="${portfolio.profile_image_url}" alt="${namePart}" class="w-80 h-96 object-cover rounded-3xl shadow-2xl border border-stone-850 relative z-10" />
          </div>
        ` : `
          <div class="w-80 h-96 bg-stone-900 border border-stone-800 rounded-3xl flex flex-col items-center justify-center text-stone-500 shadow-2xl">
            <span class="text-7xl mb-4">👤</span>
            <span class="text-xs uppercase tracking-widest text-stone-400 font-bold">No Profile Picture</span>
          </div>
        `;

        htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${portfolio.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Outfit', sans-serif;
                background-color: #0c0a09;
                color: #d6d3d1;
              }
            </style>
          </head>
          <body class="min-h-screen">
            <div class="max-w-4xl mx-auto px-6 md:px-12 py-12 space-y-24">
              <!-- Header -->
              <nav class="flex justify-between items-center py-6">
                <span class="text-xl font-bold tracking-tight text-white">${namePart}</span>
                <div class="flex items-center space-x-6 text-sm text-stone-300">
                  <a href="#about" class="hover:text-white transition">Home</a>
                  <a href="#projects" class="hover:text-white transition">Projects</a>
                  <a href="#contact" class="hover:text-white transition">Contacts</a>
                </div>
              </nav>

              <!-- Hero -->
              <header class="flex flex-col md:flex-row items-center justify-between gap-12 py-8 relative">
                <div class="absolute top-0 right-0 w-96 h-96 bg-stone-900/30 rounded-full blur-[140px] -z-10"></div>
                <div class="w-full md:w-1/2 text-left space-y-6">
                  <p class="text-lg text-stone-400 font-medium">Hi , I'm ${namePart},</p>
                  <h1 class="text-5xl md:text-6xl font-black text-white leading-tight uppercase">I'M A <br /><span>${rolePart}</span></h1>
                  <p class="text-stone-400 text-base leading-relaxed max-w-md">${portfolio.about || ''}</p>
                </div>
                <div class="w-full md:w-1/2 flex justify-center">
                  ${profileImageTag}
                </div>
              </header>

              <!-- Projects -->
              <section id="projects" class="space-y-8 pt-10 border-t border-stone-900">
                <h3 class="text-xs text-stone-500 uppercase tracking-widest font-mono">Portfolio</h3>
                <h2 class="text-3xl font-black text-white uppercase">Selected Projects</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  ${projectItems}
                </div>
              </section>

              <!-- Contact -->
              <footer id="contact" class="py-16 text-center border-t border-stone-900">
                <h2 class="text-2xl font-bold text-white uppercase mb-4">Let's Connect</h2>
                ${portfolio.contact_email ? `<a href="mailto:${portfolio.contact_email}" class="text-lg font-bold text-white underline decoration-2">${portfolio.contact_email}</a>` : ''}
              </footer>
            </div>
          </body>
          </html>
        `;
      } else if (isPlayfulRetro) {
        const rolePart = portfolio.title.split('|')[1]?.trim() || "UIUX Designer";

        const experienceItems = (portfolio.experience || []).slice(0, 3).map((exp: any) => `
          <div class="relative pl-6 border-l-2 border-black mb-6">
            <div class="absolute w-3.5 h-3.5 rounded-full -left-[8px] top-1.5 border-2 border-black bg-[#98e58a]"></div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
              <div>
                <h4 class="font-bold text-lg text-black">${exp.position || ''}</h4>
                <p class="text-sm font-semibold text-purple-600">${exp.company || ''}</p>
              </div>
              <span class="text-xs font-semibold opacity-60 mt-1 sm:mt-0">${exp.start_date || ''} - ${exp.end_date || ''}</span>
            </div>
            <p class="text-sm opacity-85">${exp.description || ''}</p>
          </div>
        `).join('');

        const projectItems = (portfolio.projects || []).map((proj: any, idx: number) => `
          <div class="border-2 border-black rounded-2xl bg-white mb-8 overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left">
            <div class="border-b-2 border-black bg-white flex font-mono text-xs font-bold uppercase tracking-wider">
              <span class="border-r-2 border-black px-6 py-3 bg-yellow-300">PROJECT ${idx + 1}</span>
              <span class="px-6 py-3 text-stone-900 font-black">${proj.name}</span>
            </div>
            <div class="p-8 space-y-6">
              <div class="space-y-3">
                <h4 class="text-lg font-black uppercase text-stone-900 flex items-center gap-1.5">
                  <span class="text-indigo-500">▰</span> ABOUT THE PROJECT
                </h4>
                <p class="text-sm md:text-base font-bold leading-relaxed text-stone-700">${proj.description || ''}</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-2 border-black rounded-2xl bg-stone-100 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                <div class="border-b-2 md:border-b-0 md:border-r-2 border-black pb-4 md:pb-0 md:pr-6 space-y-2">
                  <span class="text-[10px] uppercase tracking-widest text-stone-400 font-black block">Role</span>
                  <p class="font-black text-stone-900 text-sm">${proj.role || rolePart}</p>
                </div>
                <div class="space-y-2">
                  <span class="text-[10px] uppercase tracking-widest text-stone-400 font-black block">Tools Used</span>
                  <div class="flex flex-wrap gap-2">
                    ${(proj.technologies || []).map((t: string) => `
                      <span class="text-xs px-3 py-1 border-2 border-black bg-white rounded-lg font-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">${t}</span>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-8 bg-[#98e58a] border-t-2 border-b-2 border-black relative overflow-hidden">
              <h4 class="text-xl font-black uppercase text-stone-900 mb-8 flex items-center gap-1.5">
                <span class="text-purple-600">▲</span> PROCESS FLOW
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                <div class="bg-[#c084fc] border-2 border-black p-5 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between space-y-4 font-bold">
                  <span class="absolute -top-3.5 left-4 bg-yellow-300 border-2 border-black px-2 py-0.5 rounded text-[9px] font-black uppercase">Step 1</span>
                  <div class="pt-2">
                    <h5 class="font-black text-stone-900 text-xs mb-1 uppercase">Project Brief</h5>
                    <p class="text-[10px] text-stone-900 font-semibold leading-relaxed">Outline goal of the project, deliverables, timelines, and primary research benchmarks.</p>
                  </div>
                </div>
                <div class="bg-[#c084fc] border-2 border-black p-5 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between space-y-4 font-bold">
                  <span class="absolute -top-3.5 left-4 bg-yellow-300 border-2 border-black px-2 py-0.5 rounded text-[9px] font-black uppercase">Step 2</span>
                  <div class="pt-2">
                    <h5 class="font-black text-stone-900 text-xs mb-1 uppercase">Moodboard & Sitemap</h5>
                    <p class="text-[10px] text-stone-900 font-semibold leading-relaxed">Define color schemes, style tokens, sitemaps, and design visual moodboards collaboratively.</p>
                  </div>
                </div>
                <div class="bg-[#c084fc] border-2 border-black p-5 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between space-y-4 font-bold">
                  <span class="absolute -top-3.5 left-4 bg-yellow-300 border-2 border-black px-2 py-0.5 rounded text-[9px] font-black uppercase">Step 3</span>
                  <div class="pt-2">
                    <h5 class="font-black text-stone-900 text-xs mb-1 uppercase">Lo-fi & Hi-fi Wireframes</h5>
                    <p class="text-[10px] text-stone-900 font-semibold leading-relaxed">Build screen prototypes, outline key interactions, and establish design system components.</p>
                  </div>
                </div>
                <div class="bg-[#c084fc] border-2 border-black p-5 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between space-y-4 font-bold">
                  <span class="absolute -top-3.5 left-4 bg-yellow-300 border-2 border-black px-2 py-0.5 rounded text-[9px] font-black uppercase">Step 4</span>
                  <div class="pt-2">
                    <h5 class="font-black text-stone-900 text-xs mb-1 uppercase">Usability Auditing</h5>
                    <p class="text-[10px] text-stone-900 font-semibold leading-relaxed">Conduct user sessions with target demographic to isolate usability bottlenecks and iterate.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-8 bg-[#ffa8e2] space-y-8 text-center">
              <h4 class="text-xl font-black uppercase text-stone-900">📸 INTERFACE WIREFRAMES & DESIGNS</h4>
              <div class="max-w-xl mx-auto bg-stone-900 border-4 border-black p-4 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-2">
                <div class="h-48 w-full bg-white border-2 border-black rounded-xl overflow-hidden flex flex-col justify-between p-4 font-mono text-left">
                  <div class="h-3 w-16 bg-stone-900 rounded"></div>
                  <div class="space-y-2">
                    <div class="h-6 w-32 bg-yellow-300 border border-black rounded"></div>
                    <div class="h-2 w-48 bg-stone-300 rounded"></div>
                  </div>
                  <div class="flex gap-2">
                    <div class="h-10 w-10 bg-[#85d0f0] border border-black rounded"></div>
                    <div class="h-10 w-10 bg-[#ffa8e2] border border-black rounded"></div>
                    <div class="h-10 w-10 bg-[#98e58a] border border-black rounded"></div>
                  </div>
                </div>
                <div class="h-3 w-24 bg-stone-800 rounded-full mx-auto"></div>
              </div>
              <div class="bg-yellow-300 border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center space-x-3">
                <span class="text-xl">😃</span>
                <span class="font-black text-xs uppercase tracking-wider">Get a feel of it! Web Prototype & Mobile Prototype</span>
                <span class="text-xl">😃</span>
              </div>
            </div>
          </div>
        `).join('');

        const skillsItems = (portfolio.skills || []).map((cat: any) => `
          <div class="p-6 border-2 border-black bg-white rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            <h4 class="text-xs uppercase tracking-wider font-extrabold mb-3 text-stone-500">${cat.category}</h4>
            <div class="flex flex-wrap gap-1.5">
              ${(cat.skills || []).map((s: string) => `<span class="text-xs px-2.5 py-1 rounded border-2 border-black bg-yellow-50 font-medium">${s}</span>`).join('')}
            </div>
          </div>
        `).join('');

        htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${portfolio.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Outfit', sans-serif;
                background-color: #ebebeb;
                color: #000000;
              }
            </style>
          </head>
          <body class="min-h-screen p-4 md:p-8">
            <div class="max-w-4xl mx-auto space-y-6">
              
              <!-- HERO -->
              <header class="border-2 border-black rounded-2xl bg-white overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div class="border-b-2 border-black bg-[#faf8f5] px-6 py-3 flex justify-between items-center font-mono text-xs font-bold">
                  <span>PORTFOLIO PRESENTATION</span>
                  <span>★ ★ ★</span>
                </div>
                <div class="py-20 px-6 text-center relative overflow-hidden bg-stone-50/50 min-h-[450px] flex flex-col justify-center items-center">
                  <div class="absolute left-6 top-10 text-5xl select-none">🌸</div>
                  <div class="absolute right-12 top-6 text-5xl select-none">🌟</div>
                  <div class="absolute left-10 bottom-6 text-6xl select-none rotate-[-12deg]">🌈</div>
                  <div class="absolute right-10 bottom-10 text-5xl select-none rotate-[15deg]">👾</div>
                  
                  <div class="bg-[#f97316] text-white border-2 border-black rounded-xl px-5 py-2 font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-6 select-none rotate-[3deg]">
                    ${rolePart}
                  </div>
                  
                  <h1 class="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none select-none pb-6">
                    <span class="text-yellow-300 pr-3" style="-webkit-text-stroke: 2px #000000; filter: drop-shadow(4px 4px 0px #000000);">PORT</span>
                    <span class="text-sky-300" style="-webkit-text-stroke: 2px #000000; filter: drop-shadow(4px 4px 0px #000000);">FOLIO</span>
                  </h1>
                  
                  <p class="text-base md:text-lg font-extrabold max-w-lg leading-relaxed text-stone-850 mt-2">
                    ${portfolio.tagline || ''}
                  </p>
                </div>
              </header>

              <!-- ABOUT -->
              <section id="about" class="border-2 border-black rounded-2xl bg-[#85d0f0] overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left">
                <div class="border-b-2 border-black bg-white flex font-mono text-xs font-bold uppercase tracking-wider">
                  <span class="border-r-2 border-black px-6 py-3 bg-[#ffa8e2]">ABOUT ME</span>
                </div>
                <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div class="space-y-6">
                    <h3 class="text-2xl font-black uppercase text-stone-900 mb-6 flex items-center gap-2">
                      <span>✨</span> WHAT I DO
                    </h3>
                    <p class="text-sm md:text-base font-extrabold leading-relaxed text-stone-850">
                      ${portfolio.about || ''}
                    </p>
                    <div class="flex flex-wrap gap-4 pt-4">
                      ${portfolio.contact_email ? `<a href="mailto:${portfolio.contact_email}" class="bg-yellow-300 border-2 border-black rounded-xl px-4 py-2 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)]">Contact Email ↗</a>` : ''}
                      ${portfolio.social_links?.linkedin ? `<a href="${portfolio.social_links.linkedin}" target="_blank" class="bg-yellow-300 border-2 border-black rounded-xl px-4 py-2 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)]">LinkedIn Profile ↗</a>` : ''}
                    </div>
                  </div>
                  <div class="flex justify-center">
                    <div class="relative w-60 h-60">
                      <div class="absolute inset-0 bg-[#c084fc] border-2 border-black rounded-3xl rotate-[-4deg] shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
                      ${portfolio.profile_image_url ? `
                        <img src="${portfolio.profile_image_url}" alt="Profile" class="w-full h-full object-cover rounded-3xl border-2 border-black relative z-10 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      ` : `
                        <div class="w-full h-full bg-[#f2f2f2] border-2 border-black rounded-3xl flex flex-col items-center justify-center text-stone-500 relative z-10 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          <span class="text-5xl">👤</span>
                          <span class="text-[10px] uppercase font-black tracking-widest mt-2">UX Designer</span>
                        </div>
                      `}
                    </div>
                  </div>
                </div>
              </section>

              <!-- SKILLS -->
              <section id="skills" class="border-2 border-black rounded-2xl bg-white overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left p-8">
                <h3 class="text-2xl font-black uppercase text-stone-900 mb-8 flex items-center gap-1.5">
                  <span>💪</span> SKILLS & EXPERIENCE
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  ${skillsItems}
                </div>
              </section>

              <!-- PROJECTS -->
              ${projectItems}

              <!-- TIMELINE -->
              ${portfolio.experience && portfolio.experience.length > 0 ? `
                <section id="experience" class="border-2 border-black rounded-2xl bg-white p-8 overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left">
                  <h3 class="text-2xl font-black uppercase text-stone-900 mb-8">💼 PROFESSIONAL EXPERIENCE</h3>
                  <div class="space-y-8">
                    ${experienceItems}
                  </div>
                </section>
              ` : ''}

              <!-- FOOTER -->
              <footer class="border-2 border-black rounded-2xl bg-white py-16 px-6 text-center relative overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div class="absolute left-6 bottom-4 text-5xl select-none rotate-[10deg] opacity-75">🌈</div>
                <div class="absolute right-6 top-4 text-5xl select-none rotate-[-10deg] opacity-75">🌈</div>
                <div class="space-y-8 flex flex-col items-center">
                  <h1 class="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none select-none pb-4">
                    <span class="text-yellow-300 pr-3" style="-webkit-text-stroke: 2px #000000; filter: drop-shadow(4px 4px 0px #000000);">THANK</span>
                    <span class="text-sky-300" style="-webkit-text-stroke: 2px #000000; filter: drop-shadow(4px 4px 0px #000000);">YOU!</span>
                  </h1>
                </div>
              </footer>

            </div>
          </body>
          </html>
        `;
      } else if (isFigDesigner) {
        const namePart = portfolio.title.split('|')[0].trim();
        const rolePart = portfolio.title.split('|')[1]?.trim() || "UIUX Designer";
        const nameParts = namePart.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const experienceItems = (portfolio.experience || []).map((exp: any) => `
          <div class="relative pl-6 border-l border-stone-850">
            <div class="absolute w-2.5 h-2.5 rounded-full -left-[5.5px] top-1.5 bg-blue-600"></div>
            <div class="space-y-1">
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-sm text-white">${exp.position || ''}</h4>
                <span class="text-[9px] font-mono text-stone-500">${exp.start_date || ''} - ${exp.end_date || ''}</span>
              </div>
              <p class="text-xs text-stone-400 font-semibold">${exp.company || ''}</p>
              <p class="text-[11px] text-stone-400 leading-relaxed">${exp.description || ''}</p>
            </div>
          </div>
        `).join('');

        const projectItems = (portfolio.projects || []).map((proj: any) => `
          <div class="p-6 rounded-2xl bg-stone-950 border border-stone-900 flex flex-col justify-between space-y-4 min-h-[220px]">
            <div class="space-y-4">
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-sm text-white">${proj.name || ''}</h4>
                ${proj.role ? `<span class="text-[8px] px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400 font-bold uppercase tracking-wider">${proj.role}</span>` : ''}
              </div>
              <p class="text-[11px] text-stone-400 leading-relaxed">${proj.description || ''}</p>
            </div>
            <div class="flex items-center justify-between border-t border-stone-900/60 pt-4 mt-6">
              <div class="flex flex-wrap gap-1.5">
                ${(proj.technologies || []).slice(0, 3).map((t: string) => `<span class="text-[9px] font-mono text-stone-500 px-2 py-0.5 rounded bg-stone-900 border border-stone-900">${t}</span>`).join('')}
              </div>
              ${proj.url ? `<a href="${proj.url}" target="_blank" class="text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:underline">Explore →</a>` : ''}
            </div>
          </div>
        `).join('');

        const skillsItems = (portfolio.skills || []).map((group: any) => 
          (group.skills || []).slice(0, 3).map((s: string) => `<span class="text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-850 text-stone-400 font-medium">${s}</span>`).join('')
        ).join('');

        htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${portfolio.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Space Grotesk', sans-serif;
                background-color: #000000;
                color: #ffffff;
              }
              .splash-bg {
                position: absolute;
                top: 10%;
                left: 5%;
                width: 550px;
                height: 550px;
                background: radial-gradient(circle, rgba(60,60,60,0.18) 0%, rgba(20,20,20,0.08) 50%, rgba(0,0,0,0) 70%);
                filter: blur(40px);
                pointer-events: none;
                z-index: 0;
              }
            </style>
          </head>
          <body class="min-h-screen relative pb-20">
            <div class="splash-bg"></div>
            <div class="max-w-6xl mx-auto px-6 pt-8 relative z-10 space-y-16">
              
              <nav class="flex justify-between items-center pb-6 border-b border-stone-900">
                <span class="text-xl font-bold tracking-tight text-white">
                  <span class="border-b-2 border-white pb-0.5">${firstName}</span> ${lastName}
                </span>
                <div class="flex space-x-6 text-sm text-stone-400">
                  <a href="#about" class="hover:text-white transition">Home</a>
                  <a href="#projects" class="hover:text-white transition">Projects</a>
                  <a href="#about" class="hover:text-white transition">About</a>
                  <a href="#contact" class="hover:text-white transition">Contacts</a>
                </div>
              </nav>

              <div class="flex flex-col md:flex-row items-center justify-between gap-12 py-10">
                <div class="w-full md:w-1/2 space-y-6">
                  <span class="text-stone-400 text-sm tracking-wide font-medium">Hi , I'm ${firstName},</span>
                  <h1 class="text-5xl md:text-7xl font-black tracking-tight leading-none uppercase">
                    I'M A <span class="bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">${rolePart}</span>
                  </h1>
                  <div class="space-y-2 text-stone-400 text-xs md:text-sm font-medium">
                    <div class="flex items-center space-x-2"><span>⚡</span><span>Interactive web systems deployment</span></div>
                    <div class="flex items-center space-x-2"><span>⚡</span><span>Robust component-driven design systems</span></div>
                    <div class="flex items-center space-x-2"><span>⚡</span><span>State synchronization pipeline management</span></div>
                  </div>
                  <div class="pt-4">
                    <a href="#projects" class="inline-block text-sm font-bold text-white hover:text-stone-350 transition underline underline-offset-8 decoration-2 decoration-blue-600">View My Projects</a>
                  </div>
                </div>

                <div class="w-full md:w-1/2 flex justify-center">
                  <div class="w-72 h-72 rounded-full border-[3px] border-white flex items-center justify-center p-3 overflow-hidden bg-gradient-to-br from-stone-900 to-black shadow-2xl">
                    <svg viewBox="0 0 100 100" fill="none" class="w-48 h-48 text-stone-200" stroke="currentColor" stroke-width="2.5">
                      <circle cx="50" cy="40" r="16" stroke="currentColor" stroke-width="2" />
                      <path d="M 33,35 C 30,22 45,18 50,20 C 55,18 70,22 67,35" stroke="currentColor" stroke-width="2" fill="currentColor" />
                      <path d="M 45,38 L 47,38" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                      <path d="M 53,38 L 55,38" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
                      <path d="M 38,42 C 43,47 57,47 62,42 L 64,49 C 55,54 45,54 36,49 Z" fill="black" stroke="currentColor" stroke-width="2"/>
                      <path d="M 28,75 C 28,58 72,58 72,75" stroke="currentColor" stroke-width="2" />
                      <path d="M 50,58 L 50,66" stroke="currentColor" stroke-width="2" />
                      <circle cx="50" cy="70" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>

              <section id="about" class="py-12 border-t border-stone-900 text-left">
                <h3 class="text-xs text-stone-500 uppercase tracking-widest font-mono mb-3">About Me</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div class="md:col-span-2">
                    <h4 class="text-xl font-bold text-white mb-4 uppercase">My Narrative</h4>
                    <p class="text-stone-300 text-sm md:text-base leading-relaxed">${portfolio.about || ''}</p>
                  </div>
                  <div class="bg-stone-950 border border-stone-900 p-6 rounded-2xl space-y-4">
                    <h4 class="text-sm font-bold text-white uppercase tracking-wider">Milestone Stack</h4>
                    <div class="flex flex-wrap gap-2">${skillsItems}</div>
                  </div>
                </div>
              </section>

              ${projectItems ? `
                <section id="projects" class="py-12 border-t border-stone-900 text-left">
                  <div class="flex justify-between items-end mb-8">
                    <div>
                      <span class="text-xs text-stone-500 uppercase tracking-widest font-mono block mb-1">Portfolio</span>
                      <h3 class="text-2xl font-black text-white uppercase">Selected Work</h3>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">${projectItems}</div>
                </section>
              ` : ''}

              ${experienceItems ? `
                <section class="py-12 border-t border-stone-900 text-left">
                  <span class="text-xs text-stone-500 uppercase tracking-widest font-mono block mb-1">Timeline</span>
                  <h3 class="text-2xl font-black text-white uppercase mb-8">Professional Milestones</h3>
                  <div class="space-y-8 max-w-3xl">${experienceItems}</div>
                </section>
              ` : ''}

              <section id="contact" class="py-12 border-t border-stone-900 text-center">
                <h3 class="text-xl font-bold text-white uppercase mb-4">Get In Touch</h3>
                ${portfolio.contact_email ? `<a href="mailto:${portfolio.contact_email}" class="text-lg font-bold text-white hover:text-stone-350 underline underline-offset-4 decoration-2 decoration-blue-600">${portfolio.contact_email}</a>` : ''}
              </section>

            </div>
          </body>
          </html>
        `;
      } else {
        // Template portfolio download    // Template portfolio download
        htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${portfolio.title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: '${fontName}', sans-serif;
                background-color: ${bgColor};
                color: ${textColor};
              }
            </style>
          </head>
          <body class="min-h-screen">
            <div class="max-w-4xl mx-auto px-6 md:px-12 py-12">
              <header class="py-20 border-b" style="border-color: ${secondaryColor}15">
                <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-4" style="color: ${primaryColor}">${portfolio.title}</h1>
                <p class="text-lg md:text-xl font-medium opacity-80">${portfolio.tagline}</p>
              </header>
              
              <section class="py-12 border-b" style="border-color: ${secondaryColor}15">
                <h3 class="text-2xl font-bold mb-4" style="color: ${primaryColor}">About Me</h3>
                <p class="text-base leading-relaxed opacity-90">${portfolio.about || ''}</p>
              </section>
              
              ${portfolio.skills && portfolio.skills.length > 0 ? `
                <section class="py-12 border-b" style="border-color: ${secondaryColor}15">
                  <h3 class="text-2xl font-bold mb-6" style="color: ${primaryColor}">Skills</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    ${portfolio.skills.map((cat: any) => `
                      <div class="p-6 border border-stone-200 bg-opacity-40" style="background-color: ${cardBgColor}; border-radius: 12px">
                        <h4 class="text-sm font-bold uppercase mb-3 opacity-70" style="color: ${primaryColor}">${cat.category}</h4>
                        <div class="flex flex-wrap gap-2">
                          ${(cat.skills || []).map((s: string) => `<span class="text-xs px-2.5 py-1 rounded border border-stone-200 font-medium" style="background-color: ${primaryColor}06; color: ${textColor}">${s}</span>`).join('')}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </section>
              ` : ''}
              
              ${portfolio.projects && portfolio.projects.length > 0 ? `
                <section class="py-12 border-b" style="border-color: ${secondaryColor}15">
                  <h3 class="text-2xl font-bold mb-6" style="color: ${primaryColor}">Projects</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${portfolio.projects.map((proj: any) => `
                      <div class="p-6 border border-stone-200 bg-opacity-40" style="background-color: ${cardBgColor}; border-radius: 12px">
                        <h4 class="font-bold text-lg mb-2" style="color: ${textColor}">${proj.name}</h4>
                        <p class="text-sm opacity-80 mb-3">${proj.description || ''}</p>
                        ${proj.technologies && proj.technologies.length > 0 ? `<div class="flex flex-wrap gap-1 mb-3">${proj.technologies.map((t: string) => `<span class="text-[10px] font-mono px-2 py-0.5 rounded border border-stone-200" style="background-color: ${primaryColor}10; color: ${primaryColor}">${t}</span>`).join('')}</div>` : ''}
                        ${proj.url ? `<a href="${proj.url}" target="_blank" class="text-xs font-semibold hover:underline" style="color: ${primaryColor}">View Code/Project →</a>` : ''}
                      </div>
                    `).join('')}
                  </div>
                </section>
              ` : ''}

              ${portfolio.experience && portfolio.experience.length > 0 ? `
                <section class="py-12 border-b" style="border-color: ${secondaryColor}15">
                  <h3 class="text-2xl font-bold mb-6" style="color: ${primaryColor}">Work Experience</h3>
                  <div class="space-y-6">
                    ${portfolio.experience.map((item: any) => `
                      <div class="pl-4 border-l-2" style="border-color: ${primaryColor}30">
                        <h4 class="font-bold text-lg" style="color: ${textColor}">${item.position}</h4>
                        <p class="text-sm font-semibold" style="color: ${secondaryColor}">${item.company} | ${item.start_date} - ${item.end_date}</p>
                        <p class="text-sm opacity-80 mt-2">${item.description || ''}</p>
                        ${item.achievements && item.achievements.length > 0 ? `<ul class="list-disc list-inside text-xs opacity-75 mt-2 pl-2">${item.achievements.map((ach: string) => `<li>${ach}</li>`).join('')}</ul>` : ''}
                      </div>
                    `).join('')}
                  </div>
                </section>
              ` : ''}

              <section class="py-12">
                <h3 class="text-2xl font-bold mb-4" style="color: ${primaryColor}">Get in Touch</h3>
                <p class="text-base opacity-80 mb-4">Feel free to reach out to connect or discuss new opportunities.</p>
                ${portfolio.contact_email ? `<p class="font-bold">Email: <a href="mailto:${portfolio.contact_email}" class="hover:underline" style="color: ${primaryColor}">${portfolio.contact_email}</a></p>` : ''}
              </section>
            </div>
          </body>
          </html>
        `;
      }
    }

    // Trigger download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${portfolio.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadPicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await apiService.updatePortfolio(portfolio.id, { profile_image_url: base64String });
        if (res.success && res.portfolio) {
          const updated = await apiService.getPortfolio(portfolio.id);
          setPortfolio(updated);
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        setErrorMsg("Failed to upload profile picture.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    try {
      const res = await apiService.updatePortfolio(portfolio.id, { profile_image_url: null });
      if (res.success && res.portfolio) {
        const updated = await apiService.getPortfolio(portfolio.id);
        setPortfolio(updated);
      }
    } catch (err) {
      console.error("Error removing image:", err);
      setErrorMsg("Failed to remove profile picture.");
    }
  };

  const handleSaveChanges = async () => {
    if (!portfolio || saving) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await apiService.updatePortfolio(portfolio.id, {
        title: editTitle,
        tagline: editTagline,
        contact_email: editEmail,
        about: editAbout
      });
      if (res.success && res.portfolio) {
        const updated = await apiService.getPortfolio(portfolio.id);
        setPortfolio(updated);
        alert("Portfolio information updated successfully!");
      }
    } catch (err: any) {
      console.error("Error saving changes:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to save portfolio changes.");
    } finally {
      setSaving(false);
    }
  };

  const isAi = portfolio?.selected_generation_mode === 'ai';
  const blueprint = portfolio?.ai_generated_config;
  const themeConfig = portfolio?.theme?.config;
  const aiSource = isAi ? (blueprint?.ai_source || 'Groq Live') : null;

  // AI-generated Vibe Theme Setup
  const themeLower = ((blueprint?.theme) || "").toLowerCase();
  const isLightTheme =
    themeLower.includes('light') ||
    themeLower.includes('white') ||
    themeLower.includes('apple') ||
    themeLower.includes('clean') ||
    themeLower.includes('minimal');

  const isBrutalist = themeLower.includes('brutalist') || themeLower.includes('sharp') || themeLower.includes('pop');
  const isGlass = themeLower.includes('glass') || themeLower.includes('cyber') || themeLower.includes('neon') || themeLower.includes('glow');

  const primaryColor = isAi ? (blueprint?.primaryColor || '#818cf8') : (themeConfig?.primary || '#818cf8');
  const secondaryColor = isAi ? (blueprint?.secondaryColor || '#a78bfa') : (themeConfig?.secondary || '#a78bfa');
  const bgColor = isAi ? (isLightTheme ? '#ffffff' : '#050508') : (themeConfig?.background || '#0f172a');
  const textColor = isAi ? (isLightTheme ? '#1a1a1a' : '#f8fafc') : (themeConfig?.background === '#f9fafb' ? '#1f2937' : '#f8fafc');
  const cardBgColor = isAi
    ? (isLightTheme ? '#f4f4f5' : '#111116')
    : (themeConfig?.background === '#f9fafb' ? '#ffffff' : '#1e293b');

  const fontName = isAi ? (blueprint?.typography || 'Outfit') : (themeConfig?.font || 'Inter');

  // Dynamic Google Font Injection
  useEffect(() => {
    if (!portfolio) return;
    const font = fontName;
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}:wght@300;400;500;600;700;800&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [portfolio, fontName]);

  const getAiAnimationStyleBlock = () => {
    if (!isAi || !blueprint?.animationStyle) return '';
    const animType = blueprint.animationStyle.toLowerCase();

    if (animType.includes('glitch') || animType.includes('cyber') || animType.includes('pulse')) {
      return `
        @keyframes cyber-pulse {
          0%, 100% { filter: drop-shadow(0 0 2px ${primaryColor}30); opacity: 0.95; }
          50% { filter: drop-shadow(0 0 8px ${primaryColor}aa); opacity: 1; }
        }
        .ai-animated-card {
          animation: cyber-pulse 3s infinite ease-in-out;
        }
      `;
    }
    if (animType.includes('right') || animType.includes('slide')) {
      return `
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .ai-animated-card {
          animation: slide-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `;
    }
    if (animType.includes('fade') || animType.includes('up')) {
      return `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ai-animated-card {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `;
    }
    if (animType.includes('zoom') || animType.includes('scale')) {
      return `
        @keyframes smooth-zoom {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .ai-animated-card {
          animation: smooth-zoom 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex items-center justify-center font-outfit">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-stone-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-550 font-medium">Loading portfolio preview...</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !portfolio) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex items-center justify-center px-6 font-outfit">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="font-semibold text-stone-800">{errorMsg}</p>
          <Link to="/dashboard" className="inline-block px-6 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition font-bold text-xs tracking-wide uppercase border border-stone-200">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDERER 1: TEMPLATE MODE (PREDEFINED THEMES)
  // ==========================================================
  const renderTemplatePortfolio = () => {
    const isCosmic = portfolio.selected_theme === 'cosmic-creative';
    const isShowcase = portfolio.selected_theme === 'creative-showcase';
    const isPortfolio2023 = portfolio.selected_theme === 'portfolio-2023';
    const isPlayfulRetro = portfolio.selected_theme === 'playful-retro';

    const renderPlayfulRetroPortfolio = () => {
      const namePart = portfolio.title.split('|')[0].trim();
      const rolePart = portfolio.title.split('|')[1]?.trim() || "UIUX Designer";

      return (
        <div className="w-full min-h-screen text-black bg-[#ebebeb] font-outfit relative" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {/* Decorative Google Fonts */}
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet" />

          {/* 1. HERO SECTION */}
          <header className="border-2 border-black rounded-2xl bg-white m-4 overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-2 border-black bg-[#faf8f5] px-6 py-3 flex justify-between items-center font-mono text-xs font-bold">
              <span>PORTFOLIO PRESENTATION</span>
              <span className="flex space-x-1.5 text-stone-500">
                <span>★</span><span>★</span><span>★</span>
              </span>
            </div>

            <div className="py-20 px-6 text-center relative overflow-hidden bg-[#ebebeb]/50 min-h-[450px] flex flex-col justify-center items-center">
              {/* Floating Emojis / Decorative Elements */}
              <div className="absolute left-6 top-10 text-5xl select-none animate-bounce" style={{ animationDuration: '3s' }}>🌸</div>
              <div className="absolute right-12 top-6 text-5xl select-none animate-pulse">🌟</div>
              <div className="absolute left-10 bottom-6 text-6xl select-none rotate-[-12deg]">🌈</div>
              <div className="absolute right-10 bottom-10 text-5xl select-none rotate-[15deg]">👾</div>

              {/* Green Flower Shape Badge for Current Year */}
              <div className="absolute left-24 top-24 w-16 h-16 bg-[#22c55e] border-2 border-black rounded-full flex flex-col items-center justify-center font-black text-xs text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] rotate-[-15deg] select-none">
                <span>2026</span>
                <span className="text-[10px]">🌸</span>
              </div>

              {/* Orange Job Title Pill */}
              <div className="bg-[#f97316] text-white border-2 border-black rounded-xl px-5 py-2 font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_rgba(0,0,0,1)] mb-6 select-none rotate-[3deg] hover:rotate-0 transition duration-300">
                {rolePart}
              </div>

              {/* Title: Yellow & Blue Outlined letters */}
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none select-none pb-6">
                <span className="text-yellow-300 pr-3" style={{ WebkitTextStroke: '2px #000000', filter: 'drop-shadow(4px 4px 0px #000000)' }}>PORT</span>
                <br className="sm:hidden" />
                <span className="text-sky-300" style={{ WebkitTextStroke: '2px #000000', filter: 'drop-shadow(4px 4px 0px #000000)' }}>FOLIO</span>
              </h1>

              <p className="text-base md:text-lg font-extrabold max-w-lg leading-relaxed text-stone-850 mt-2">
                {portfolio.tagline}
              </p>
            </div>
          </header>

          {/* 2. ABOUT ME SECTION */}
          <section id="about" className="border-2 border-black rounded-2xl bg-[#85d0f0] m-4 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
            <div className="border-b-2 border-black bg-white flex font-mono text-xs font-bold uppercase tracking-wider">
              <span className="border-r-2 border-black px-6 py-3 bg-[#ffa8e2]">ABOUT ME</span>
              <span className="px-6 py-3 text-stone-500 hidden sm:block">My Vision</span>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-black uppercase text-stone-900 mb-6 flex items-center gap-2">
                  <span>✨</span> WHAT I DO
                </h3>
                <p className="text-sm md:text-base font-extrabold leading-relaxed text-stone-850">
                  {portfolio.about}
                </p>

                {/* Social Badges */}
                <div className="flex flex-wrap gap-4 pt-4">
                  {portfolio.social_links?.linkedin && (
                    <a
                      href={portfolio.social_links.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-yellow-300 border-2 border-black rounded-xl px-4 py-2 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition duration-200"
                    >
                      LinkedIn Profile ↗
                    </a>
                  )}
                  {portfolio.social_links?.github && (
                    <a
                      href={portfolio.social_links.github}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#ffa8e2] border-2 border-black rounded-xl px-4 py-2 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition duration-200"
                    >
                      GitHub Workspace ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Portrait container */}
              <div className="flex justify-center">
                <div className="relative w-60 h-60">
                  <div className="absolute inset-0 bg-[#c084fc] border-2 border-black rounded-3xl rotate-[-4deg] shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#98e58a] border-2 border-black rounded-full flex items-center justify-center text-sm shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] z-20">
                    ⭐
                  </div>
                  {portfolio.profile_image_url ? (
                    <img
                      src={portfolio.profile_image_url}
                      alt={namePart}
                      className="w-full h-full object-cover rounded-3xl border-2 border-black relative z-10 hover:rotate-[2deg] transition duration-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#f2f2f2] border-2 border-black rounded-3xl flex flex-col items-center justify-center text-stone-500 relative z-10 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <span className="text-5xl">👤</span>
                      <span className="text-[10px] uppercase font-black tracking-widest mt-2">UX Designer</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 3. PROJECTS SECTION */}
          {portfolio.projects && portfolio.projects.map((proj: any, idx: number) => (
            <div key={idx} className="border-2 border-black rounded-2xl bg-white m-4 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
              {/* Project Header bar */}
              <div className="border-b-2 border-black bg-white flex font-mono text-xs font-bold uppercase tracking-wider">
                <span className="border-r-2 border-black px-6 py-3 bg-yellow-300">PROJECT {idx + 1}</span>
                <span className="px-6 py-3 text-stone-900 font-black">{proj.name}</span>
              </div>

              {/* Detail block (White background) */}
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-lg font-black uppercase text-stone-900 flex items-center gap-1.5">
                    <span className="text-indigo-500">▰</span> ABOUT THE PROJECT
                  </h4>
                  <p className="text-sm md:text-base font-extrabold leading-relaxed text-stone-700">
                    {proj.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-2 border-black rounded-2xl bg-[#ebebeb]/30 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                  <div className="border-b-2 md:border-b-0 md:border-r-2 border-black pb-4 md:pb-0 md:pr-6 space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-black block">Role</span>
                    <p className="font-black text-stone-900 text-sm">{proj.role || rolePart}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-black block">Tools Used</span>
                    <div className="flex flex-wrap gap-2">
                      {proj.technologies && proj.technologies.map((t: string, ti: number) => (
                        <span key={ti} className="text-xs px-3 py-1 border-2 border-black bg-white rounded-lg font-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Process block (Green background `#98e58a`) */}
              <div className="p-8 bg-[#98e58a] border-t-2 border-b-2 border-black relative overflow-hidden">
                <div className="absolute right-12 top-6 text-6xl opacity-25 select-none font-black">↪️</div>
                <h4 className="text-xl font-black uppercase text-stone-900 mb-8 flex items-center gap-1.5">
                  <span className="text-purple-600">▲</span> PROCESS FLOW
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                  <div className="bg-[#c084fc] border-2 border-black p-5 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between space-y-4">
                    <span className="absolute -top-3.5 left-4 bg-yellow-300 border-2 border-black px-2 py-0.5 rounded text-[9px] font-black uppercase">Step 1</span>
                    <div className="pt-2">
                      <h5 className="font-black text-stone-900 text-xs mb-1 uppercase">Project Brief</h5>
                      <p className="text-[10px] text-stone-900 font-extrabold leading-relaxed">Outline goal of the project, deliverables, timelines, and primary research benchmarks.</p>
                    </div>
                  </div>
                  <div className="bg-[#c084fc] border-2 border-black p-5 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between space-y-4">
                    <span className="absolute -top-3.5 left-4 bg-yellow-300 border-2 border-black px-2 py-0.5 rounded text-[9px] font-black uppercase">Step 2</span>
                    <div className="pt-2">
                      <h5 className="font-black text-stone-900 text-xs mb-1 uppercase">Moodboard & Sitemap</h5>
                      <p className="text-[10px] text-stone-900 font-extrabold leading-relaxed">Define color schemes, style tokens, sitemaps, and design visual moodboards collaboratively.</p>
                    </div>
                  </div>
                  <div className="bg-[#c084fc] border-2 border-black p-5 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between space-y-4">
                    <span className="absolute -top-3.5 left-4 bg-yellow-300 border-2 border-black px-2 py-0.5 rounded text-[9px] font-black uppercase">Step 3</span>
                    <div className="pt-2">
                      <h5 className="font-black text-stone-900 text-xs mb-1 uppercase">Lo-fi & Hi-fi Wireframes</h5>
                      <p className="text-[10px] text-stone-900 font-extrabold leading-relaxed">Build screen prototypes, outline key interactions, and establish design system components.</p>
                    </div>
                  </div>
                  <div className="bg-[#c084fc] border-2 border-black p-5 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between space-y-4">
                    <span className="absolute -top-3.5 left-4 bg-yellow-300 border-2 border-black px-2 py-0.5 rounded text-[9px] font-black uppercase">Step 4</span>
                    <div className="pt-2">
                      <h5 className="font-black text-stone-900 text-xs mb-1 uppercase">Usability Auditing</h5>
                      <p className="text-[10px] text-stone-900 font-extrabold leading-relaxed">Conduct user sessions with target demographic to isolate usability bottlenecks and iterate.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mockups section (Pink background `#ffa8e2`) */}
              <div className="p-8 bg-[#ffa8e2] space-y-8 text-center">
                <h4 className="text-xl font-black uppercase text-stone-900 flex items-center justify-center gap-1.5">
                  <span>📸</span> INTERFACE WIREFRAMES & DESIGNS
                </h4>

                {/* Outlined Laptop Mockup */}
                <div className="max-w-xl mx-auto bg-stone-900 border-4 border-black p-4 rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-2 select-none transform hover:scale-[1.01] transition duration-300">
                  <div className="h-48 w-full bg-white border-2 border-black rounded-xl overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full flex flex-col justify-between p-4 bg-white text-left font-mono">
                      <div className="h-3 w-16 bg-stone-900 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-6 w-32 bg-yellow-300 border border-black rounded"></div>
                        <div className="h-2 w-48 bg-stone-300 rounded"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-10 w-10 bg-[#85d0f0] border border-black rounded"></div>
                        <div className="h-10 w-10 bg-[#ffa8e2] border border-black rounded"></div>
                        <div className="h-10 w-10 bg-[#98e58a] border border-black rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-3 w-24 bg-stone-800 rounded-full mx-auto"></div>
                </div>

                {/* Smiley banner */}
                <div className="bg-yellow-300 border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center space-x-3 select-none">
                  <span className="text-xl">😃</span>
                  <span className="font-black text-xs uppercase tracking-wider">Get a feel of it! Web Prototype & Mobile Prototype</span>
                  <span className="text-xl">😃</span>
                </div>
              </div>
            </div>
          ))}

          {/* 4. FOOTER / THANK YOU */}
          <footer className="border-2 border-black rounded-2xl bg-white m-4 py-16 px-6 text-center relative overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="absolute left-6 bottom-4 text-5xl select-none rotate-[10deg] opacity-75">🌈</div>
            <div className="absolute right-6 top-4 text-5xl select-none rotate-[-10deg] opacity-75">🌈</div>

            <div className="space-y-8 flex flex-col items-center">
              <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none select-none pb-4">
                <span className="text-yellow-300 pr-3" style={{ WebkitTextStroke: '2px #000000', filter: 'drop-shadow(4px 4px 0px #000000)' }}>THANK</span>
                <br className="sm:hidden" />
                <span className="text-sky-300" style={{ WebkitTextStroke: '2px #000000', filter: 'drop-shadow(4px 4px 0px #000000)' }}>YOU!</span>
              </h1>

              {/* QR Codes representation */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-10 pt-4">
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-28 h-28 bg-white border-2 border-black p-2 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:translate-y-[-2px] transition duration-200 cursor-pointer">
                    <div className="w-full h-full border border-black border-dashed rounded-lg flex flex-col items-center justify-center font-mono text-[8px] font-black text-stone-400 p-1 leading-tight select-none">
                      <span>QR CODE</span>
                      <span className="text-[6px]">CURRICULUM VITAE</span>
                    </div>
                  </div>
                  <span className="bg-[#98e58a] border-2 border-black rounded-lg px-2.5 py-1 font-black text-[9px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                    Curriculum Vitae ✍️
                  </span>
                </div>
                <div className="space-y-3 flex flex-col items-center">
                  <div className="w-28 h-28 bg-white border-2 border-black p-2 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:translate-y-[-2px] transition duration-200 cursor-pointer">
                    <div className="w-full h-full border border-black border-dashed rounded-lg flex flex-col items-center justify-center font-mono text-[8px] font-black text-stone-400 p-1 leading-tight select-none">
                      <span>QR CODE</span>
                      <span className="text-[6px]">BEHANCE PROFILE</span>
                    </div>
                  </div>
                  <span className="bg-[#ffa8e2] border-2 border-black rounded-lg px-2.5 py-1 font-black text-[9px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                    Behance Profile 🎨
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      );
    };

    if (isPlayfulRetro) {
      return renderPlayfulRetroPortfolio();
    }

    if (isPortfolio2023) {
      const namePart = portfolio.title.split('|')[0].trim();
      const rolePart = portfolio.title.split('|')[1]?.trim() || "Software Engineer";

      return (
        <div
          className="p-6 md:p-12 min-h-screen text-left"
          style={{
            backgroundColor: '#070a13',
            color: '#e2e8f0',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          {/* Top navigation */}
          <nav className="flex justify-between items-center mb-10 pb-4 border-b border-slate-900/60 max-w-6xl mx-auto">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
              {namePart}
            </span>
            <div className="flex items-center space-x-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <a href="#about" className="hover:text-teal-400 transition">About</a>
              <a href="#skills" className="hover:text-teal-400 transition">Skills</a>
              <a href="#projects" className="hover:text-teal-400 transition">Works</a>
              {portfolio.contact_email && (
                <a href={`mailto:${portfolio.contact_email}`} className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/25 transition">
                  Hire Me
                </a>
              )}
            </div>
          </nav>

          {/* Bento Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

            {/* Card 1: Main Welcome (2/3 width) */}
            <div className="md:col-span-2 bg-[#0d1222]/80 border border-slate-900/60 rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-slate-800 transition duration-300">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition duration-300"></div>
              <div className="space-y-4 relative z-10">
                <span className="text-xs font-bold font-mono tracking-widest text-teal-400 uppercase bg-teal-400/5 px-2.5 py-1 rounded-md border border-teal-500/10">Available for Work</span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Hi, I'm <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">{namePart}</span>. <br />
                  {rolePart}
                </h1>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl">
                  {portfolio.tagline}
                </p>
              </div>
            </div>

            {/* Card 2: Interactive Stats/Bio (1/3 width) */}
            <div className="bg-[#0d1222]/80 border border-slate-900/60 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-800 transition duration-300">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-inner">
                  👨‍💻
                </div>
                <h3 className="font-bold text-lg text-white">About Me</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-6">
                  {portfolio.about}
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                {portfolio.social_links?.github && (
                  <a href={portfolio.social_links.github} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-400 hover:text-white transition underline">Github ↗</a>
                )}
                {portfolio.social_links?.linkedin && (
                  <a href={portfolio.social_links.linkedin} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-400 hover:text-white transition underline">LinkedIn ↗</a>
                )}
              </div>
            </div>

            {/* Card 3: Skills Bento (1/3 width) */}
            <div className="bg-[#0d1222]/80 border border-slate-900/60 rounded-2xl p-6 hover:border-slate-800 transition duration-300">
              <h3 className="font-bold text-lg text-white mb-4">Core Stack</h3>
              <div className="space-y-4">
                {(portfolio.skills || []).slice(0, 3).map((group: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{group.category}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(group.skills || []).map((s: string, si: number) => (
                        <span key={si} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800/80 text-slate-300 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Works Grid (2/3 width) */}
            <div className="md:col-span-2 bg-[#0d1222]/80 border border-slate-900/60 rounded-2xl p-6 hover:border-slate-800 transition duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-white">Selected Works</h3>
                <span className="text-xs text-slate-500 font-mono">{(portfolio.projects || []).length} projects</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(portfolio.projects || []).slice(0, 4).map((proj: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-900 hover:border-teal-500/30 transition duration-300 flex flex-col justify-between space-y-4 group">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-teal-400 transition">{proj.name}</h4>
                        {proj.role && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-semibold">{proj.role}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{proj.description}</p>
                    </div>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-teal-400 group-hover:underline flex items-center gap-1">
                        View Project <span>→</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 5: Timeline / Work Experience (Full width) */}
            <div className="md:col-span-3 bg-[#0d1222]/80 border border-slate-900/60 rounded-2xl p-6 hover:border-slate-800 transition duration-300">
              <h3 className="font-bold text-lg text-white mb-6">Professional Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(portfolio.experience || []).slice(0, 3).map((exp: any, idx: number) => (
                  <div key={idx} className="relative pl-6 border-l border-slate-800">
                    <div className="absolute w-2 h-2 rounded-full -left-[4px] top-1.5 bg-teal-400"></div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-500">{exp.start_date} - {exp.end_date}</span>
                      <h4 className="font-bold text-sm text-white">{exp.position}</h4>
                      <p className="text-xs text-teal-400 font-semibold">{exp.company}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      );
    }

    if (isShowcase) {
      const renderShowcaseHero = () => {
        const namePart = portfolio.title.split('|')[0].trim();
        const rolePart = portfolio.title.split('|')[1]?.trim() || "Web Designer";

        return (
          <header className="py-12 relative overflow-hidden text-stone-100">
            {/* Nav */}
            <div className="flex justify-between items-center mb-16 relative z-10">
              <span className="text-xl font-bold tracking-tight text-white">{namePart}</span>
              <div className="flex items-center space-x-6 text-sm text-stone-300">
                <a href="#about" className="hover:text-white transition">Home</a>
                <a href="#projects" className="hover:text-white transition">Projects</a>
                <a href="#about" className="hover:text-white transition">About</a>
                <a href="#contact" className="hover:text-white transition">Contacts</a>
                <div className="flex items-center space-x-3 pl-4 border-l border-stone-850">
                  <span className="hover:text-white transition cursor-pointer text-base">📸</span>
                  <span className="hover:text-white transition cursor-pointer text-base">💻</span>
                  <span className="hover:text-white transition cursor-pointer text-base">🌐</span>
                </div>
              </div>
            </div>

            {/* Hero Main */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 py-8 relative z-10">
              {/* Left Column */}
              <div className="w-full md:w-1/2 text-left space-y-6">
                <p className="text-lg text-stone-400 font-medium">Hi , I'm {namePart},</p>
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight uppercase">
                  I'M A <br />
                  <span className="text-white">{rolePart}</span>
                </h1>
                <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-md">
                  {portfolio.about}
                </p>
                <div className="pt-4">
                  <a
                    href="#projects"
                    className="inline-block text-sm font-bold text-white hover:text-stone-350 transition underline underline-offset-8 decoration-2"
                  >
                    View My Projects
                  </a>
                </div>
              </div>

              {/* Right Column (Picture) */}
              <div className="w-full md:w-1/2 flex justify-center">
                {portfolio.profile_image_url ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-stone-500/10 rounded-3xl blur-xl group-hover:scale-105 transition duration-500"></div>
                    <img
                      src={portfolio.profile_image_url}
                      alt={namePart}
                      className="w-80 h-96 object-cover rounded-3xl shadow-2xl border border-stone-850 relative z-10"
                    />
                  </div>
                ) : (
                  <div className="w-80 h-96 bg-stone-900/60 border border-stone-805 rounded-3xl flex flex-col items-center justify-center text-stone-500 relative overflow-hidden shadow-2xl">
                    <span className="text-7xl mb-4">👤</span>
                    <span className="text-xs uppercase tracking-widest text-stone-400 font-bold">No Profile Picture</span>
                    <span className="text-[10px] text-stone-600 mt-1">Upload one on the Edit tab</span>
                  </div>
                )}
              </div>
            </div>
          </header>
        );
      };

      const renderShowcaseProjects = () => {
        if (!portfolio.projects || portfolio.projects.length === 0) return null;
        return (
          <section id="projects" className="py-16 border-t border-stone-900 text-stone-100">
            <h3 className="text-xs text-stone-500 uppercase tracking-widest font-mono mb-2">Portfolio</h3>
            <h2 className="text-3xl font-black mb-12 text-white uppercase">Selected Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {portfolio.projects.map((proj: any, idx: number) => (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-stone-900/40 border border-stone-850 hover:border-stone-700 transition-all duration-300"
                >
                  <h4 className="text-xl font-bold text-white mb-2">{proj.name}</h4>
                  <p className="text-sm text-stone-400 leading-relaxed mb-4">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {proj.technologies.map((t: string, ti: number) => (
                        <span key={ti} className="text-[10px] font-mono text-stone-400 px-2 py-0.5 rounded bg-stone-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      };

      const renderShowcaseContact = () => {
        return (
          <section id="contact" className="py-16 border-t border-stone-900 text-center text-stone-100">
            <h2 className="text-2xl font-bold text-white uppercase mb-4">Let's Connect</h2>
            {portfolio.contact_email && (
              <a
                href={`mailto:${portfolio.contact_email}`}
                className="text-lg font-bold text-white hover:text-stone-300 underline decoration-2"
              >
                {portfolio.contact_email}
              </a>
            )}
          </section>
        );
      };

      return (
        <div
          className="p-8 md:p-14 min-h-[600px] text-left relative overflow-hidden bg-[#0c0a09]"
          style={{
            color: '#d6d3d1',
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-stone-900/30 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-stone-900/20 rounded-full blur-[120px] pointer-events-none"></div>

          {renderShowcaseHero()}
          {renderShowcaseProjects()}
          {renderShowcaseContact()}
        </div>
      );
    }

    if (isCosmic) {
      const renderCosmicHero = () => {
        const namePart = portfolio.title.split('|')[0].trim();
        const rolePart = portfolio.title.split('|')[1]?.trim() || "Software Engineer";

        return (
          <header className="py-16 md:py-24 relative overflow-hidden text-slate-100">
            {/* Ambient Purple Glow */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none"></div>

            {/* Nav */}
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Ʃ</span>
              </div>
              <div className="flex space-x-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <a href="#about" className="hover:text-purple-400 transition">Home</a>
                <a href="#experience" className="hover:text-purple-400 transition">About</a>
                <a href="#projects" className="hover:text-purple-400 transition">Lab</a>
              </div>
            </div>

            {/* Avatar & Floating handwriting */}
            <div className="relative flex flex-col items-center mb-8">
              <div className="relative w-48 h-48 rounded-full bg-indigo-950/50 border border-indigo-900/40 flex items-center justify-center overflow-hidden shadow-2xl">
                {/* Simulated Memoji peaking */}
                <div className="absolute bottom-0 w-36 h-36 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-amber-200 relative flex items-center justify-center">
                    <div className="absolute top-1 w-24 h-8 bg-stone-800 rounded-t-full"></div>
                    <div className="w-16 h-6 flex justify-between px-1.5 mt-2">
                      <span className="w-5 h-5 rounded-full border border-stone-800 bg-white/10"></span>
                      <span className="w-5 h-5 rounded-full border border-stone-800 bg-white/10"></span>
                    </div>
                  </div>
                  <div className="w-28 h-16 bg-zinc-800 rounded-t-lg border-b border-zinc-700/80 mt-2 relative flex items-center justify-center">
                    <span className="text-white text-[8px] opacity-60"></span>
                  </div>
                </div>
              </div>

              {/* Handwriting Pointer */}
              <div className="absolute -top-6 right-1/4 translate-x-20 rotate-[12deg] flex items-center space-x-2 font-handwriting">
                <svg className="w-10 h-10 text-purple-400 -scale-y-100 -rotate-90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-purple-400 text-lg font-bold tracking-wide" style={{ fontFamily: "'Caveat', cursive" }}>Hello! I Am {namePart}</span>
              </div>
            </div>

            {/* Headline and narrative text */}
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <span className="text-xs font-mono text-purple-400 font-extrabold uppercase tracking-widest block">A Designer who</span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
                Judges a book <br />
                by its <span className="relative inline-block px-4 py-1 border-2 border-dashed border-purple-500 rounded-full rotate-[-2deg]">cover...</span>
              </h1>
              <p className="text-xs text-slate-500 italic mt-1">Because if the cover does not impress you what else can?</p>

              <div className="pt-6 space-y-3">
                <h2 className="text-2xl font-bold text-slate-200">
                  I'm a {rolePart}.<span className="text-purple-400 animate-pulse">|</span>
                </h2>
                {portfolio.experience[0] && (
                  <p className="text-sm font-semibold text-slate-400 flex items-center justify-center space-x-2">
                    <span>Currently, I'm a Software Engineer at</span>
                    <span className="text-blue-400 hover:underline cursor-pointer">@{portfolio.experience[0].company}</span>
                  </p>
                )}
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto pt-4">
                  {portfolio.about}
                </p>
              </div>
            </div>
          </header>
        );
      };

      const renderCosmicExperience = () => {
        if (!portfolio.experience || portfolio.experience.length === 0) return null;

        const items = portfolio.experience.slice(0, 4);

        const renderIcon = (idx: number) => {
          switch (idx) {
            case 0:
              return (
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex-shrink-0">
                  <span className="text-2xl">📘</span>
                </div>
              );
            case 1:
              return (
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)] flex-shrink-0">
                  <span className="text-2xl">🔮</span>
                </div>
              );
            case 2:
              return (
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex-shrink-0">
                  <span className="text-2xl">☕</span>
                </div>
              );
            case 3:
            default:
              return (
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] flex-shrink-0">
                  <span className="text-2xl">📍</span>
                </div>
              );
          }
        };

        return (
          <section id="experience" className="py-16 border-t border-slate-900 text-slate-100">
            <h3 className="text-2xl md:text-3xl font-black text-center mb-2 text-white">Work Experience</h3>
            <p className="text-xs text-slate-500 text-center mb-12 uppercase tracking-widest font-mono">My Professional History</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border transition-all duration-300 flex items-start space-x-4 bg-[#110928]/45 border-indigo-950/40 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] group"
                  style={{ backdropFilter: 'blur(12px)' }}
                >
                  {renderIcon(idx)}
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition">{item.company}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{item.start_date} - {item.end_date}</span>
                    </div>
                    <p className="text-xs text-purple-400 font-bold">{item.position}</p>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      };

      const renderCosmicSkills = () => {
        if (!portfolio.skills || portfolio.skills.length === 0) return null;

        const allSkills = portfolio.skills.flatMap((s: any) => s.skills || []).slice(0, 12);

        return (
          <section className="py-16 text-center text-slate-100 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-600/10 blur-[90px] pointer-events-none"></div>

            <h3 className="text-xl md:text-2xl font-bold max-w-xl mx-auto leading-relaxed mb-12">
              I'm currently looking to join a <span className="text-purple-400 underline decoration-wavy decoration-purple-600 font-extrabold">cross-functional</span> team <br />
              that values improving people's lives through accessible design
            </h3>

            <div className="relative w-full max-w-md mx-auto h-64 flex flex-col justify-end items-center mb-8">
              <svg className="absolute inset-0 w-full h-full text-indigo-950/60 pointer-events-none" viewBox="0 0 200 200" fill="none">
                <path d="M100 160 C80 120, 30 110, 30 70" stroke="currentColor" strokeWidth="1.5" />
                <path d="M100 160 C90 120, 65 100, 65 60" stroke="currentColor" strokeWidth="1.5" />
                <path d="M100 160 C100 110, 100 90, 100 50" stroke="currentColor" strokeWidth="1.5" />
                <path d="M100 160 C110 120, 135 100, 135 60" stroke="currentColor" strokeWidth="1.5" />
                <path d="M100 160 C120 120, 170 110, 170 70" stroke="currentColor" strokeWidth="1.5" />
              </svg>

              <div className="absolute top-10 left-3 bg-purple-500/10 border border-purple-500/30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><span className="text-sm">🎨</span></div>
              <div className="absolute top-4 left-14 bg-indigo-500/10 border border-indigo-500/30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><span className="text-sm">⚛️</span></div>
              <div className="absolute top-0 bg-blue-500/10 border border-blue-500/30 w-12 h-12 rounded-full flex items-center justify-center shadow-xl"><span className="text-base">🚀</span></div>
              <div className="absolute top-4 right-14 bg-pink-500/10 border border-pink-500/30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><span className="text-sm">⚡</span></div>
              <div className="absolute top-10 right-3 bg-emerald-500/10 border border-emerald-500/30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><span className="text-sm">🟢</span></div>

              <div className="w-24 h-24 rounded-full bg-purple-950/80 border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center relative z-10 animate-pulse">
                <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Ʃ</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto mt-6">
              {allSkills.map((s: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-950/30 border border-indigo-900/40 rounded-full text-xs font-semibold text-slate-300 hover:border-purple-500/40 transition duration-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        );
      };

      const renderCosmicProjects = () => {
        if (!portfolio.projects || portfolio.projects.length === 0) return null;

        return (
          <section id="projects" className="py-16 border-t border-slate-900 text-slate-100">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest font-mono mb-2">Featured Work</h3>
            <h2 className="text-3xl font-black mb-12 text-white">Example Projects</h2>

            <div className="space-y-16 max-w-4xl mx-auto">
              {portfolio.projects.map((proj: any, idx: number) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12`}
                  >
                    <div className="w-full md:w-1/2 relative group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl group-hover:scale-105 transition duration-500"></div>
                      <div className="relative bg-slate-950 border border-slate-900/80 rounded-2xl overflow-hidden shadow-2xl p-4">
                        <div className="flex items-center space-x-1.5 mb-3 opacity-60">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                        </div>
                        <div className="aspect-[4/3] w-full rounded-lg bg-indigo-950/20 border border-indigo-900/30 flex items-center justify-center p-6 text-center">
                          <div className="space-y-2">
                            <span className="text-purple-400 text-sm font-extrabold block">WHO AM I?</span>
                            <p className="text-[10px] text-slate-500 font-mono">Work as frontend developer</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-1/2 space-y-4">
                      <span className="text-xs font-bold text-purple-400 font-mono uppercase tracking-widest">Featured Project</span>
                      <h3 className="text-2xl font-black text-white">{proj.name}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed bg-[#110928]/30 p-4 rounded-xl border border-indigo-950/40">
                        {proj.description}
                      </p>

                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {proj.technologies.map((t: string, ti: number) => (
                            <span
                              key={ti}
                              className="text-[10px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-900/40"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {proj.url && (
                        <div className="pt-2">
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-xs font-extrabold text-purple-400 hover:text-purple-300 underline"
                          >
                            Explore Live Code →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      };

      const renderCosmicContact = () => {
        return (
          <section className="py-20 border-t border-slate-900 text-center text-slate-100">
            <h2 className="text-3xl font-black mb-6 text-white">Contact</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
              I'm currently looking to join a cross-functional team that values improving people's lives through accessible design, or have a project in mind? Let's connect.
            </p>
            {portfolio.contact_email && (
              <div className="mb-8">
                <a
                  href={`mailto:${portfolio.contact_email}`}
                  className="text-lg font-black hover:text-purple-400 transition underline decoration-2 decoration-purple-600"
                >
                  {portfolio.contact_email}
                </a>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <span className="w-8 h-8 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center text-sm hover:border-purple-500 transition cursor-pointer">📸</span>
              <span className="w-8 h-8 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center text-sm hover:border-purple-500 transition cursor-pointer">🌐</span>
              <span className="w-8 h-8 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center text-sm hover:border-purple-500 transition cursor-pointer">💻</span>
            </div>
          </section>
        );
      };

      return (
        <div
          className="p-8 md:p-14 min-h-[600px] text-left relative overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 50% 20%, #170d38 0%, #060214 70%)',
            color: '#cbd5e1',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap" rel="stylesheet" />

          {renderCosmicHero()}
          {renderCosmicExperience()}
          {renderCosmicSkills()}
          {renderCosmicProjects()}
          {renderCosmicContact()}
        </div>
      );
    }

    const renderAboutSection = () => (
      <section key="about" className="py-12 border-b" style={{ borderColor: `${secondaryColor}15` }}>
        <h3 className="text-2xl font-bold mb-4 tracking-tight" style={{ color: primaryColor }}>About Me</h3>
        <p className="leading-relaxed text-sm md:text-base opacity-90" style={{ color: textColor }}>
          {portfolio.about}
        </p>
      </section>
    );

    const renderSkillsSection = () => (
      <section key="skills" className="py-12 border-b" style={{ borderColor: `${secondaryColor}15` }}>
        <h3 className="text-2xl font-bold mb-6 tracking-tight" style={{ color: primaryColor }}>Technical Skillsets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.skills.map((group: any, idx: number) => (
            <div
              key={idx}
              className="p-6 border rounded-xl"
              style={{ backgroundColor: cardBgColor, borderColor: `${secondaryColor}15` }}
            >
              <h4 className="text-xs uppercase tracking-wider font-extrabold mb-3 opacity-60" style={{ color: primaryColor }}>{group.category}</h4>
              <div className="flex flex-wrap gap-1.5">
                {group.skills.map((skill: string, si: number) => (
                  <span
                    key={si}
                    className="text-xs px-2.5 py-1 rounded-md border font-medium"
                    style={{ backgroundColor: `${primaryColor}06`, borderColor: `${primaryColor}15`, color: textColor }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );

    const renderProjectsSection = () => (
      <section key="projects" className="py-12 border-b" style={{ borderColor: `${secondaryColor}15` }}>
        <h3 className="text-2xl font-bold mb-6 tracking-tight" style={{ color: primaryColor }}>Featured Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolio.projects.map((proj: any, idx: number) => (
            <div
              key={idx}
              className="p-6 border rounded-xl hover:scale-[1.01] hover:shadow-md transition-all duration-300"
              style={{ backgroundColor: cardBgColor, borderColor: `${secondaryColor}15` }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg" style={{ color: textColor }}>{proj.name}</h4>
                {proj.role && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}
                  >
                    {proj.role}
                  </span>
                )}
              </div>
              <p className="text-sm opacity-80 mb-4" style={{ color: textColor }}>{proj.description}</p>
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies.map((tech: string, ti: number) => (
                    <span
                      key={ti}
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );

    const renderExperienceSection = () => (
      <section key="experience" className="py-12 border-b" style={{ borderColor: `${secondaryColor}15` }}>
        <h3 className="text-2xl font-bold mb-6 tracking-tight" style={{ color: primaryColor }}>Professional Experience</h3>
        <div className="space-y-8">
          {portfolio.experience.map((exp: any, idx: number) => (
            <div key={idx} className="relative pl-6 border-l-2" style={{ borderColor: `${primaryColor}30` }}>
              <div
                className="absolute w-3.5 h-3.5 rounded-full -left-[8px] top-1.5 border-2"
                style={{ backgroundColor: bgColor, borderColor: primaryColor }}
              ></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-lg" style={{ color: textColor }}>{exp.position}</h4>
                  <p className="text-sm font-semibold" style={{ color: secondaryColor }}>{exp.company}</p>
                </div>
                <span className="text-xs font-semibold opacity-60 mt-1 sm:mt-0" style={{ color: textColor }}>
                  {exp.start_date} - {exp.end_date}
                </span>
              </div>
              <p className="text-sm opacity-80 mb-3" style={{ color: textColor }}>{exp.description}</p>
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="list-disc list-inside text-xs opacity-75 space-y-1.5 pl-2" style={{ color: textColor }}>
                  {exp.achievements.map((ach: string, ai: number) => (
                    <li key={ai}>{ach}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );

    const renderEducationSection = () => (
      <section key="education" className="py-12">
        <h3 className="text-2xl font-bold mb-6 tracking-tight" style={{ color: primaryColor }}>Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolio.education.map((edu: any, idx: number) => (
            <div
              key={idx}
              className="p-6 border rounded-xl"
              style={{ backgroundColor: cardBgColor, borderColor: `${secondaryColor}15` }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-base" style={{ color: textColor }}>{edu.school}</h4>
                <span className="text-xs opacity-60" style={{ color: textColor }}>{edu.start_date} - {edu.end_date}</span>
              </div>
              <p className="text-sm" style={{ color: secondaryColor }}>{edu.degree} in {edu.field_of_study}</p>
              {edu.description && <p className="text-xs opacity-70 mt-2" style={{ color: textColor }}>{edu.description}</p>}
            </div>
          ))}
        </div>
      </section>
    );

    return (
      <div
        className="p-8 md:p-14 min-h-[600px] transition-all duration-300 text-left"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          fontFamily: `'${fontName}', sans-serif`,
        }}
      >
        <header className="py-12 border-b" style={{ borderColor: `${secondaryColor}15` }}>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none">
              {portfolio.title}
            </h1>
            <p className="text-lg md:text-xl font-semibold opacity-90" style={{ color: secondaryColor }}>
              {portfolio.tagline}
            </p>
            {portfolio.contact_email && (
              <div className="pt-2">
                <a
                  href={`mailto:${portfolio.contact_email}`}
                  className="inline-block px-4 py-2 rounded-lg text-xs font-semibold border transition"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                    backgroundColor: `${primaryColor}05`,
                    borderRadius: '8px'
                  }}
                >
                  Get in Touch: {portfolio.contact_email}
                </a>
              </div>
            )}
          </div>
        </header>

        {renderAboutSection()}
        {renderSkillsSection()}
        {renderProjectsSection()}
        {renderExperienceSection()}
        {renderEducationSection()}
      </div>
    );
  };

  // ==========================================================
  // RENDERER 2: AI DYNAMIC MODE (QWEN BLUEPRINT SPECIFICATIONS)
  // ==========================================================
  const renderAiGeneratedPortfolio = () => {
    if (!blueprint) return null;

    const renderHero = () => {
      const hero = blueprint.heroSection;
      if (!hero) return null;
      return (
        <header className="py-16 md:py-24 border-b ai-animated-card" style={{ borderColor: isBrutalist ? '#000000' : `${secondaryColor}15` }}>
          <div className="max-w-3xl space-y-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider font-mono" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
              {blueprint.theme || "AI Custom Style"}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none" style={{ color: primaryColor }}>
              {hero.headline || blueprint.siteTitle}
            </h1>
            <p className="text-lg md:text-2xl font-medium opacity-90 leading-relaxed" style={{ color: textColor }}>
              {hero.subheadline || blueprint.tagline}
            </p>
            {blueprint.contactSection?.email && (
              <div className="pt-4">
                <a
                  href={`mailto:${blueprint.contactSection.email}`}
                  className="inline-block px-6 py-3 font-semibold text-sm transition"
                  style={{
                    backgroundColor: primaryColor,
                    color: isLightTheme ? '#ffffff' : '#050508',
                    borderRadius: isBrutalist ? '0px' : '8px',
                    border: isBrutalist ? '2px solid #000000' : 'none',
                    boxShadow: isBrutalist ? '4px 4px 0px 0px #000000' : undefined
                  }}
                >
                  {hero.ctaText || "Get In Touch"}
                </a>
              </div>
            )}
          </div>
        </header>
      );
    };

    const renderAbout = () => {
      const about = blueprint.aboutSection;
      if (!about) return null;
      return (
        <section key="aboutSection" className="py-12 border-b ai-animated-card" style={{ borderColor: isBrutalist ? '#000000' : `${secondaryColor}15` }}>
          <h3 className="text-2xl md:text-3xl font-extrabold mb-6 tracking-tight" style={{ color: primaryColor }}>
            {about.title || "About Me"}
          </h3>
          <div className="space-y-4 max-w-3xl">
            <p className="text-base md:text-lg font-medium leading-relaxed opacity-95" style={{ color: textColor }}>
              {about.description}
            </p>
            {about.bioParagraphs && about.bioParagraphs.map((p: string, i: number) => (
              <p key={i} className="text-sm md:text-base leading-relaxed opacity-80" style={{ color: textColor }}>
                {p}
              </p>
            ))}
          </div>
        </section>
      );
    };

    const renderSkills = () => {
      const skills = blueprint.skillsSection;
      if (!skills) return null;
      return (
        <section key="skillsSection" className="py-12 border-b ai-animated-card" style={{ borderColor: isBrutalist ? '#000000' : `${secondaryColor}15` }}>
          <h3 className="text-2xl md:text-3xl font-extrabold mb-8 tracking-tight" style={{ color: primaryColor }}>
            {skills.title || "Skills & Expertise"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.categories && skills.categories.map((cat: any, idx: number) => (
              <div
                key={idx}
                className={`p-6 border transition-all duration-300 ${isGlass ? 'backdrop-blur-md bg-opacity-40' : ''
                  }`}
                style={{
                  backgroundColor: cardBgColor,
                  borderColor: isBrutalist ? '#000000' : `${secondaryColor}10`,
                  borderRadius: isBrutalist ? '0px' : '12px',
                  boxShadow: isBrutalist ? '4px 4px 0px 0px #000000' : undefined
                }}
              >
                <h4 className="text-xs uppercase tracking-wider font-extrabold mb-4 opacity-70" style={{ color: primaryColor }}>
                  {cat.name}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items && cat.items.map((item: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded border font-medium"
                      style={{
                        backgroundColor: `${primaryColor}06`,
                        borderColor: `${primaryColor}15`,
                        color: textColor,
                        borderRadius: isBrutalist ? '0px' : '6px'
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    };

    const renderProjects = () => {
      const projects = blueprint.projectsSection;
      if (!projects) return null;
      return (
        <section key="projectsSection" className="py-12 border-b ai-animated-card" style={{ borderColor: isBrutalist ? '#000000' : `${secondaryColor}15` }}>
          <h3 className="text-2xl md:text-3xl font-extrabold mb-8 tracking-tight" style={{ color: primaryColor }}>
            {projects.title || "Featured Projects"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.items && projects.items.map((proj: any, idx: number) => (
              <div
                key={idx}
                className={`p-6 border transition-all duration-300 ${isBrutalist ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'rounded-xl hover:scale-[1.01] hover:shadow-md'
                  } ${isGlass ? 'backdrop-blur-md bg-opacity-40' : ''}`}
                style={{
                  backgroundColor: cardBgColor,
                  borderColor: isBrutalist ? '#000000' : `${secondaryColor}15`,
                  borderRadius: isBrutalist ? '0px' : '12px'
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg" style={{ color: textColor }}>{proj.title}</h4>
                  {proj.role && (
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}
                    >
                      {proj.role}
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-80 mb-4" style={{ color: textColor }}>{proj.description}</p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.technologies.map((tech: string, ti: number) => (
                      <span
                        key={ti}
                        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${primaryColor}10`,
                          color: primaryColor,
                          borderRadius: isBrutalist ? '0px' : '4px'
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-bold hover:underline"
                    style={{ color: primaryColor }}
                  >
                    View Code/Project →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    };

    const renderExperience = () => {
      const exp = blueprint.experienceSection;
      if (!exp) return null;
      return (
        <section key="experienceSection" className="py-12 border-b ai-animated-card" style={{ borderColor: isBrutalist ? '#000000' : `${secondaryColor}15` }}>
          <h3 className="text-2xl md:text-3xl font-extrabold mb-8 tracking-tight" style={{ color: primaryColor }}>
            {exp.title || "Experience"}
          </h3>
          <div className="space-y-8">
            {exp.items && exp.items.map((item: any, idx: number) => (
              <div key={idx} className="relative pl-6 border-l-2" style={{ borderColor: `${primaryColor}30` }}>
                <div
                  className="absolute w-3.5 h-3.5 rounded-full -left-[8px] top-1.5 border-2"
                  style={{ backgroundColor: bgColor, borderColor: primaryColor }}
                ></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-lg" style={{ color: textColor }}>{item.role}</h4>
                    <p className="text-sm font-semibold" style={{ color: secondaryColor }}>{item.company}</p>
                  </div>
                  <span className="text-xs font-semibold opacity-60 mt-1 sm:mt-0" style={{ color: textColor }}>
                    {item.duration}
                  </span>
                </div>
                {item.description && <p className="text-sm opacity-85 mb-3" style={{ color: textColor }}>{item.description}</p>}
                {item.achievements && item.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-xs opacity-75 space-y-1.5 pl-2" style={{ color: textColor }}>
                    {item.achievements.map((ach: string, ai: number) => (
                      <li key={ai}>{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    };

    const renderContact = () => {
      const contact = blueprint.contactSection;
      if (!contact) return null;
      return (
        <section key="contactSection" className="py-12 ai-animated-card">
          <h3 className="text-2xl md:text-3xl font-extrabold mb-4 tracking-tight" style={{ color: primaryColor }}>
            {contact.title || "Get In Touch"}
          </h3>
          <p className="text-sm md:text-base opacity-80 mb-6 max-w-xl" style={{ color: textColor }}>
            {contact.description}
          </p>
          <div className="space-y-4">
            {contact.email && (
              <div>
                <span className="block text-xs uppercase font-extrabold opacity-50 mb-1" style={{ color: textColor }}>Email Address</span>
                <a href={`mailto:${contact.email}`} className="text-lg font-bold hover:underline" style={{ color: primaryColor }}>
                  {contact.email}
                </a>
              </div>
            )}
            {contact.socialLinks && Object.keys(contact.socialLinks).length > 0 && (
              <div className="pt-2">
                <span className="block text-xs uppercase font-extrabold opacity-50 mb-2" style={{ color: textColor }}>Social Channels</span>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(contact.socialLinks).map(([platform, url]: [string, any]) => {
                    if (!url) return null;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 border hover:underline font-bold text-xs uppercase tracking-wider transition"
                        style={{
                          borderColor: isBrutalist ? '#000000' : `${secondaryColor}25`,
                          color: secondaryColor,
                          borderRadius: isBrutalist ? '0px' : '6px',
                          backgroundColor: `${secondaryColor}03`
                        }}
                      >
                        {platform}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      );
    };

    const rawSections = blueprint.sectionOrder || ['aboutSection', 'skillsSection', 'projectsSection', 'experienceSection', 'contactSection'];
    const orderedSections = rawSections.map((sec: string) => {
      const lower = sec.toLowerCase();
      if (lower === 'about') return 'aboutSection';
      if (lower === 'skills') return 'skillsSection';
      if (lower === 'projects') return 'projectsSection';
      if (lower === 'experience') return 'experienceSection';
      if (lower === 'contact') return 'contactSection';
      return sec;
    });

    console.log("Qwen Blueprint:", blueprint);
    console.log("Raw sectionOrder:", blueprint.sectionOrder);
    console.log("Normalized orderedSections:", orderedSections);

    return (
      <div
        className="p-8 md:p-14 min-h-[600px] transition-all duration-300 text-left"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          fontFamily: `'${fontName}', sans-serif`,
        }}
      >
        {renderHero()}

        {orderedSections.map((sectionName: string) => {
          console.log("Rendering section name:", sectionName);
          switch (sectionName) {
            case 'aboutSection':
              return renderAbout();
            case 'skillsSection':
              return renderSkills();
            case 'projectsSection':
              return renderProjects();
            case 'experienceSection':
              return renderExperience();
            case 'contactSection':
              return renderContact();
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col justify-between font-outfit">
      <style>{getAiAnimationStyleBlock()}</style>

      {/* Control Panel Header */}
      <header className="border-b border-stone-200 bg-[#fcfbf9]/80 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-stone-500 hover:text-stone-900 transition text-sm font-medium">
              ← Dashboard
            </Link>
            <div className="h-4 w-px bg-stone-200"></div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-base text-stone-900">{portfolio.title}</h2>
                {isAi && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${aiSource === 'Fallback Mock' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                    {aiSource}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 font-mono">
                {portfolio.subdomain || 'unset'}.devportfolio.ai
              </p>
            </div>
          </div>

          {/* Tab selectors & Buttons */}
          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex bg-stone-100 p-1 border border-stone-250/50 rounded-lg">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'preview' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
                  }`}
              >
                Sandbox Preview
              </button>
              <button
                onClick={() => setActiveTab('control')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === 'control' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
                  }`}
              >
                Edit & Metadata
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleTogglePublish}
                disabled={publishing}
                className={`px-4 py-2 rounded-lg font-bold text-xs tracking-wide uppercase transition duration-200 border ${portfolio.is_published
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-stone-900 hover:bg-stone-850 text-white border-transparent'
                  }`}
              >
                {portfolio.is_published ? '● Live' : 'Publish Draft'}
              </button>
              <Link
                to={`/video-generator?portfolio_id=${portfolio.id}`}
                className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold tracking-wide uppercase border border-stone-200 transition"
              >
                Avatar Video
              </Link>
              <button
                onClick={handleDownloadHtml}
                className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold tracking-wide uppercase transition flex items-center space-x-1.5"
              >
                <span>⬇</span>
                <span>Download HTML</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {isAi && aiSource === 'Fallback Mock' && (
        <div className="bg-amber-50 border-b border-amber-250/65 px-6 py-3 text-center text-xs font-bold text-amber-800 flex items-center justify-center space-x-2">
          <span>⚠️</span>
          <span><strong>Notice:</strong> This portfolio was generated using the local Fallback Mock instead of the live Groq API (likely due to invalid credentials or API issues). Configure a valid Groq API key to activate live generation.</span>
        </div>
      )}

      {/* Main Panel Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 relative">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center font-medium">
            {errorMsg}
          </div>
        )}

        {activeTab === 'control' ? (
          <div className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-2xl p-8 space-y-6 shadow-sm text-left">
            <h3 className="text-xl font-extrabold border-b border-stone-150 pb-3 text-stone-900">Portfolio Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold block">Website Title</span>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-250 hover:border-stone-400 bg-stone-50/30 rounded-xl text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition duration-200"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold block">Contact Email</span>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-250 hover:border-stone-400 bg-stone-50/30 rounded-xl text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition duration-200"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold block">Generation Method</span>
                <p className="text-stone-800 font-bold font-mono uppercase text-xs pt-2">
                  {portfolio.selected_generation_mode || 'Legacy Template'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold block">Custom Vibe Theme</span>
                <p className="text-stone-800 font-bold font-mono text-xs capitalize pt-2">
                  {isAi ? blueprint?.theme || 'AI Custom' : portfolio.selected_theme || 'Minimalist'}
                </p>
              </div>
              {isAi && blueprint?.typography && (
                <div className="space-y-1 md:col-span-2">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold block">AI Typography Selection</span>
                  <p className="text-stone-800 font-bold font-mono text-xs pt-1">{blueprint.typography}</p>
                </div>
              )}
              <div className="space-y-1 md:col-span-2">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold block">Tagline</span>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-250 hover:border-stone-400 bg-stone-50/30 rounded-xl text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition duration-200 font-bold"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold block">About / Narrative Bio</span>
                <textarea
                  value={editAbout}
                  onChange={(e) => setEditAbout(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-stone-250 hover:border-stone-400 bg-stone-50/30 rounded-xl text-stone-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition duration-200 leading-relaxed"
                />
              </div>
              <div className="space-y-4 md:col-span-2 pt-4 border-t border-stone-200">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-extrabold block">Profile Picture (Showcase Theme Only)</span>
                <div className="flex items-center space-x-6">
                  {portfolio.profile_image_url ? (
                    <img
                      src={portfolio.profile_image_url}
                      alt="Profile Preview"
                      className="w-20 h-20 object-cover rounded-2xl border border-stone-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-stone-100 border border-stone-250 border-dashed rounded-2xl flex flex-col items-center justify-center text-stone-400">
                      <span className="text-xl">👤</span>
                      <span className="text-[9px] uppercase tracking-wider mt-1 font-bold">None</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPicture}
                      className="hidden"
                      id="profile-picture-upload-input"
                    />
                    <label
                      htmlFor="profile-picture-upload-input"
                      className="inline-block px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-xs font-bold cursor-pointer transition uppercase tracking-wider shadow-sm"
                    >
                      {portfolio.profile_image_url ? 'Change Image' : 'Upload Profile Picture'}
                    </label>
                    {portfolio.profile_image_url && (
                      <button
                        onClick={handleRemovePicture}
                        className="block text-xs font-semibold text-red-600 hover:text-red-800 transition text-left"
                      >
                        Remove Picture
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Save changes action */}
              <div className="md:col-span-2 flex justify-end pt-4 border-t border-stone-200">
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white font-bold text-xs tracking-wider uppercase transition shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving changes...' : 'Save Portfolio Details'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Real visual rendering of Live Portfolio site */
          <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xl">
            {/* Header simulated navbar */}
            <div className="bg-[#fcfbf9] px-4 py-2.5 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-400/80"></span>
              </div>
              <div className="bg-white border border-stone-200 px-8 py-1 rounded-md text-[11px] font-mono text-stone-450 select-none truncate max-w-xs md:max-w-md">
                https://{portfolio.subdomain || 'draft'}.devportfolio.ai
              </div>
              <div className="w-12"></div>
            </div>

            {/* Rendered dynamic site */}
            {isAi && blueprint ? renderAiGeneratedPortfolio() : renderTemplatePortfolio()}
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-stone-500 text-sm bg-stone-50">
        <p>© {new Date().getFullYear()} Primefolio. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default PortfolioPreview;
