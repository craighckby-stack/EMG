/**
 * File: src/components/Ecosystem.tsx
 * Role: Modern Black & Emerald Project Ecosystem & Repository Grid
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  Globe,
  Compass,
  GitBranch,
  Search,
  Filter,
  ArrowUpRight,
  Swords,
} from 'lucide-react';

export interface EcosystemProject {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  url: string;
  category: 'security' | 'evolution' | 'interactive' | 'testing' | 'research';
  categoryLabel: string;
  badge: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'cyan';
  ctaLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  isFeatured?: boolean;
}

export const ECOSYSTEM_PROJECTS: EcosystemProject[] = [
  {
    id: 'pii-sanitizer',
    title: 'Git-Secret-PII-Sanitizer-2',
    subtitle: 'Pre-Flight Security Gateway',
    description:
      'High-speed regex and entropy scanning suite to scrub API keys, private credentials, and PII from git working trees before LLM submission.',
    url: 'https://github.com/craighckby-stack/Git-Secret-PII-Sanitizer-2',
    category: 'security',
    categoryLabel: 'Security & Sanitizer',
    badge: 'Recommended Gateway',
    badgeColor: 'emerald',
    ctaLabel: 'Open Sanitizer Repo',
    icon: ShieldCheck,
    isFeatured: true,
  },
  {
    id: 'darlek-caan',
    title: 'DARLEK CAAN',
    subtitle: 'Autonomous Code Evolution & AI Command Center',
    description:
      'Mission-critical autonomous code evolution matrix, neural pipeline telemetry stream, and distributed multi-model AI command platform.',
    url: 'https://ais-pre-amubz4v3czr3772fnvrcru-483535245139.asia-southeast1.run.app/',
    category: 'evolution',
    categoryLabel: 'AI Command Center',
    badge: 'Autonomous Core',
    badgeColor: 'emerald',
    ctaLabel: 'Launch Command Center',
    icon: Terminal,
    isFeatured: true,
  },
  {
    id: 'huxley-singularity',
    title: 'Huxley Singularity Loop',
    subtitle: 'Recursive Neural Optimizer',
    description:
      'Recursive self-improving neural loop and autonomous feedback synthesis engine driving evolutionary code refactoring loops.',
    url: 'https://ais-pre-km7pxypy7meeld2j6lnyqm-483535245139.asia-southeast1.run.app',
    category: 'evolution',
    categoryLabel: 'Neural Singularity',
    badge: 'Live Deployment',
    badgeColor: 'cyan',
    ctaLabel: 'Access Singularity Loop',
    icon: Cpu,
    isFeatured: true,
  },
  {
    id: 'darlek-vs-jesus-chess',
    title: 'Darlek Caan vs Jesus Chess',
    subtitle: 'Grandmaster Tactical AI Duel Arena',
    description:
      'High-stakes agentic chess tournament pitting Dalek Caan’s supreme neural logic matrix against celestial tactical gameplay on Google AI Studio.',
    url: 'https://ai.studio/apps/4f692b1f-527f-4c1d-b423-e2bbe06b2009',
    category: 'interactive',
    categoryLabel: 'AI Studio Chess Arena',
    badge: 'Neural Duel Arena',
    badgeColor: 'cyan',
    ctaLabel: 'Play Chess in Studio',
    icon: Swords,
    isFeatured: true,
  },
  {
    id: 'wonder-craig',
    title: 'Wonder Craig: The Brave Adventure',
    subtitle: 'Agentic Interactive Game Universe',
    description:
      'Immersive interactive story and generative game universe driven by real-time agentic narrative orchestration and dynamic world states.',
    url: 'https://ai.studio/apps/2120b556-3b9e-4d23-b65b-bf3ef98aa510',
    category: 'interactive',
    categoryLabel: 'AI Studio Application',
    badge: 'Interactive Universe',
    badgeColor: 'amber',
    ctaLabel: 'Enter Adventure in Studio',
    icon: Compass,
    isFeatured: false,
  },
  {
    id: 'aetherforge-omega',
    title: 'AetherForge Ω: Global Genesis',
    subtitle: 'Autonomous World Simulation Engine',
    description:
      'Cosmological genesis simulator, multi-agent emergent society modeling, and autonomous planetary sandbox generator on AI Studio.',
    url: 'https://ai.studio/apps/2c919791-444e-40a2-ba71-e2ec13057cba',
    category: 'interactive',
    categoryLabel: 'AI Studio Application',
    badge: 'Genesis Engine',
    badgeColor: 'purple',
    ctaLabel: 'Launch Genesis in Studio',
    icon: Globe,
    isFeatured: false,
  },
  {
    id: 'emg-tests',
    title: 'EMG-Tests Suite',
    subtitle: 'C-Dialect Verification Harness',
    description:
      'Comprehensive seeded defect testbed and AST regression harness for testing compiler gateways and dialect self-healing rules.',
    url: 'https://github.com/craighckby-stack/EMG-Tests',
    category: 'testing',
    categoryLabel: 'Verification Suite',
    badge: 'Regression Matrix',
    badgeColor: 'emerald',
    ctaLabel: 'View Test Harness',
    icon: GitBranch,
    isFeatured: false,
  },
  {
    id: 'pkm-system',
    title: 'PKM Knowledge Ledger',
    subtitle: 'Research Lineages & Architectural Postmortems',
    description:
      'Personal knowledge management repository storing negative constraint ledgers, architectural blueprints, and AI development postmortems.',
    url: 'https://github.com/craighckby-stack/PKM',
    category: 'research',
    categoryLabel: 'Knowledge Base',
    badge: 'Knowledge Core',
    badgeColor: 'blue',
    ctaLabel: 'Browse PKM Repository',
    icon: Layers,
    isFeatured: false,
  },
];

interface EcosystemProps {
  id?: string;
  onOpenLicense?: () => void;
}

export const Ecosystem: React.FC<EcosystemProps> = ({ id = 'emg-ecosystem-section' }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProjects = ECOSYSTEM_PROJECTS.filter((proj) => {
    const matchesCat = activeCategory === 'all' || proj.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      proj.title.toLowerCase().includes(q) ||
      (proj.subtitle && proj.subtitle.toLowerCase().includes(q)) ||
      proj.description.toLowerCase().includes(q) ||
      proj.categoryLabel.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'amber':
        return 'bg-amber-950/80 border-amber-500/50 text-amber-300';
      case 'cyan':
        return 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300';
      case 'purple':
        return 'bg-purple-950/80 border-purple-500/50 text-purple-300';
      case 'blue':
        return 'bg-blue-950/80 border-blue-500/50 text-blue-300';
      case 'emerald':
      default:
        return 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';
    }
  };

  const getCardAccent = (color?: string) => {
    switch (color) {
      case 'amber':
        return 'hover:border-amber-500/50 group-hover:text-amber-400';
      case 'cyan':
        return 'hover:border-cyan-500/50 group-hover:text-cyan-400';
      case 'purple':
        return 'hover:border-purple-500/50 group-hover:text-purple-400';
      case 'blue':
        return 'hover:border-blue-500/50 group-hover:text-blue-400';
      case 'emerald':
      default:
        return 'hover:border-emerald-500/50 group-hover:text-emerald-400';
    }
  };

  return (
    <section
      id={id}
      className="cyber-card bg-[#070e0a]/90 border border-emerald-500/25 p-5 md:p-6 rounded-2xl flex flex-col gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative overflow-hidden"
    >
      {/* Decorative ambient subtle glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-950 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-950 to-[#040805] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-950 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Developer Ecosystem & Repository Hub
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                {ECOSYSTEM_PROJECTS.length} Systems
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Autonomous agents, pre-flight sanitizers, AI command centers, and simulation environments
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-ecosystem-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects & repos..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#040805] border border-emerald-950 focus:border-emerald-500/60 text-xs text-zinc-200 placeholder-zinc-500 outline-none w-48 sm:w-56 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#040805] p-1 rounded-xl border border-emerald-950">
            <button
              id="btn-cat-all"
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              id="btn-cat-evolution"
              onClick={() => setActiveCategory('evolution')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'evolution'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              AI Agents
            </button>
            <button
              id="btn-cat-security"
              onClick={() => setActiveCategory('security')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'security'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Security
            </button>
            <button
              id="btn-cat-interactive"
              onClick={() => setActiveCategory('interactive')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'interactive'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Apps
            </button>
          </div>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const IconComponent = project.icon;
          const badgeClass = getBadgeStyle(project.badgeColor);
          const accentClass = getCardAccent(project.badgeColor);

          return (
            <div
              key={project.id}
              id={`card-project-${project.id}`}
              className={`p-5 rounded-xl bg-[#050b07] border border-emerald-950 ${accentClass} transition-all duration-200 flex flex-col justify-between gap-4 group cyber-card-hover relative overflow-hidden`}
            >
              {/* Top Card Details */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#09150d] border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${badgeClass}`}
                  >
                    {project.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    {project.title}
                  </h3>
                  {project.subtitle && (
                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      {project.subtitle}
                    </p>
                  )}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                  {project.description}
                </p>
              </div>

              {/* Action Button & Link Details */}
              <div className="pt-3 border-t border-emerald-950/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span className="truncate max-w-[200px]">
                    {project.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                  <span className="text-emerald-400 font-semibold uppercase text-[10px]">
                    {project.categoryLabel}
                  </span>
                </div>

                <a
                  id={`btn-cta-${project.id}`}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#09170e] hover:bg-emerald-500 text-zinc-200 hover:text-black font-bold text-xs border border-emerald-700/60 hover:border-emerald-400 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:shadow-emerald-950"
                >
                  <span>{project.ctaLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="py-10 text-center space-y-2 text-zinc-400">
          <Filter className="w-6 h-6 mx-auto text-zinc-500" />
          <p className="text-xs font-mono">No ecosystem projects match the selected filter criteria.</p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="text-xs text-emerald-400 underline underline-offset-4 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
};
