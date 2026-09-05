import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight, Bell, BookOpen, Brain, BriefcaseBusiness, CalendarClock, Check, Code2,
  CheckCircle2, ChevronRight, CircleHelp, Clock3, ExternalLink, FileText, Flame,
  GraduationCap, Home, LibraryBig, Menu, MessageCircle, Mic2, Play, Plus, Quote, RotateCcw,
  Send, Settings2, SlidersHorizontal, Sparkles, Target, Trash2, Volume2, WandSparkles,
  X, Youtube,
} from 'lucide-react';
import {
  getGetDashboardQueryKey, getListSubjectsQueryKey, useCreateSubject, useCorrectEnglish,
  useDeleteSubject, useGenerateSubjectNotes, useGenerateExamPlan, useGetDashboard,
  useListResources, useListSubjects, useReviewCodingAnswer, useRunMockInterview,
  useSendLearningChat, useSendVoicePractice, getListResourcesQueryKey,
} from '@workspace/api-client-react';
import type { ChatTurn, Subject } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

const navItems = [
  { href: '/', label: 'Today', icon: Home },
  { href: '/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/practice', label: 'Practice room', icon: Mic2 },
  { href: '/talk', label: 'Talk with AI', icon: Volume2 },
  { href: '/interview', label: 'Mock interview', icon: BriefcaseBusiness },
  { href: '/exam-prep', label: 'Exam prep', icon: GraduationCap },
  { href: '/resources', label: 'Resources', icon: LibraryBig },
];

const subjectColors = ['#E8A06A', '#62B7A8', '#8B9DDF', '#D9829C', '#B8A36E'];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
      <span className="grid size-10 place-items-center rounded-[13px] bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] shadow-sm">
        <MessageCircle size={21} strokeWidth={2.4} />
      </span>
      <span>
        <span className="block font-serif text-[22px] font-semibold leading-none tracking-[-.03em]">speakwise</span>
        <span className="mt-1 block font-mono text-[9px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">practice studio</span>
      </span>
    </Link>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <div className="grain min-h-[100dvh] bg-[hsl(var(--background))]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between md:block">
          <Logo />
          <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/60 hover:bg-white/10 md:hidden" aria-label="Close navigation" data-testid="button-close-navigation"><X size={19} /></button>
        </div>
        <div className="mt-12">
          <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[.18em] text-white/40">Your studio</p>
          <nav className="space-y-1" aria-label="Main navigation">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium ${location === href ? 'bg-[hsl(var(--sidebar-accent))] text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
                <Icon size={18} strokeWidth={location === href ? 2.5 : 1.8} />
                <span>{label}</span>
                {location === href && <span className="ml-auto size-1.5 rounded-full bg-[hsl(var(--accent))]" />}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto">
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-[hsl(var(--accent))]"><Sparkles size={15} /><span className="font-mono text-[10px] uppercase tracking-[.12em]">A small reminder</span></div>
            <p className="font-serif text-[17px] leading-snug text-white/90">“Progress happens one brave sentence at a time.”</p>
          </div>
          <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] text-white/60 hover:bg-white/8 hover:text-white" data-testid="link-settings"><Settings2 size={18} /><span>Settings</span></Link>
          <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
            <span className="grid size-9 place-items-center rounded-full bg-[hsl(var(--accent))] font-semibold text-[hsl(var(--foreground))]">AM</span>
            <span><span className="block text-sm font-semibold text-white">Alex Morgan</span><span className="block text-[11px] text-white/45">Exam season, 2025</span></span>
          </div>
        </div>
      </aside>
      {open && <button className="fixed inset-0 z-30 bg-[hsl(var(--foreground))]/40 md:hidden" onClick={() => setOpen(false)} aria-label="Close menu" data-testid="button-mobile-overlay" />}
      <main className="min-h-[100dvh] md:pl-[260px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/90 px-5 backdrop-blur md:px-10">
          <button className="rounded-xl p-2.5 hover:bg-[hsl(var(--muted))] md:hidden" onClick={() => setOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={22} /></button>
          <div className="hidden md:block"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Monday, 14 October 2025</p><p className="mt-1 font-serif text-[19px]">Keep the conversation going.</p></div>
          <div className="ml-auto flex items-center gap-3"><button className="relative rounded-xl p-2.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]" aria-label="Notifications" data-testid="button-notifications"><Bell size={19} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[hsl(var(--accent))]" /></button><Link href="/settings" className="hidden items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-[12px] font-semibold sm:flex" data-testid="link-header-profile"><span className="size-5 rounded-full bg-[hsl(var(--primary))]" /><span>Alex</span></Link></div>
        </header>
        <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}

function SectionTitle({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">{eyebrow}</p><h1 className="font-serif text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[.98] tracking-[-.04em]">{title}</h1>{detail && <p className="mt-3 max-w-xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{detail}</p>}</div>{action}</div>;
}

function StatCard({ icon: Icon, label, value, note, accent = 'teal' }: { icon: typeof Flame; label: string; value: string; note: string; accent?: 'teal' | 'coral' | 'blue' }) {
  const colors = { teal: 'bg-[#D9F0EA] text-[#237B6C]', coral: 'bg-[#F9E2D7] text-[#B75C3B]', blue: 'bg-[#E5E8FA] text-[#5F6FB5]' };
  return <div className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5" data-testid={`card-stat-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="flex items-start justify-between"><span className={`grid size-9 place-items-center rounded-xl ${colors[accent]}`}><Icon size={17} /></span><ArrowUpRight size={16} className="text-[hsl(var(--muted-foreground))]" /></div><p className="mt-5 font-mono text-[11px] uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">{label}</p><p className="mt-1 font-serif text-3xl font-semibold tracking-[-.04em]">{value}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{note}</p></div>;
}

function Dashboard() {
  const dashboard = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey() } });
  const subjects = useListSubjects({ query: { queryKey: getListSubjectsQueryKey() } });
  const d = dashboard.data;
  const subjectList = subjects.data ?? [];
  const minutes = d?.minutesThisWeek ?? 0;
  const goal = d?.weeklyGoal ?? 120;
  return <div className="rise-in">
    <SectionTitle eyebrow="Good morning, Alex" title="Your next brave sentence." detail="A focused little plan for today, built around the goals you care about." action={<Link href="/practice" className="group inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/.15)] hover:brightness-105" data-testid="link-start-practice">Start a practice <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>} />
    {dashboard.isLoading ? <div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <div className="skeleton h-36 rounded-2xl" key={i} />)}</div> : dashboard.isError ? <ErrorNotice message="Your dashboard could not load." retry={() => dashboard.refetch()} /> : <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4"><StatCard icon={Flame} label="Current streak" value={`${d?.streak ?? 0} days`} note="A steady rhythm wins." accent="coral" /><StatCard icon={Clock3} label="This week" value={`${minutes} min`} note={`${Math.max(goal - minutes, 0)} min to your goal`} accent="teal" /><StatCard icon={Target} label="Weekly goal" value={`${goal} min`} note="Small sessions count." accent="blue" /><StatCard icon={BookOpen} label="Saved subjects" value={`${d?.subjectCount ?? subjectList.length}`} note="Ready when you are." accent="teal" /></div>}
    <div className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <section className="overflow-hidden rounded-2xl bg-[hsl(var(--sidebar))] p-6 text-[hsl(var(--sidebar-foreground))] md:p-8" data-testid="card-todays-plan">
        <div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">Today’s plan</p><h2 className="mt-3 max-w-md font-serif text-3xl leading-tight tracking-[-.03em]">Make space for a little practice.</h2></div><span className="grid size-11 place-items-center rounded-full border border-white/15 text-[hsl(var(--accent))]"><CalendarClock size={20} /></span></div>
        <div className="mt-8 space-y-3"><PlanRow icon={Mic2} title="Speak & sharpen" detail="8 minutes · correction practice" href="/practice" /><PlanRow icon={BriefcaseBusiness} title="Interview warm-up" detail="10 minutes · behavioural round" href="/interview" /><PlanRow icon={BookOpen} title="Review your subject" detail={d?.nextSession || '15 minutes · exam-ready notes'} href="/subjects" /></div>
      </section>
      <section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-card)] md:p-7" data-testid="card-weekly-progress">
        <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Weekly rhythm</p><h2 className="mt-2 font-serif text-2xl">Keep the thread.</h2></div><span className="font-mono text-xs text-[hsl(var(--primary))]">{Math.min(Math.round((minutes / Math.max(goal, 1)) * 100), 100)}%</span></div>
        <div className="mt-8 h-3 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-700" style={{ width: `${Math.min((minutes / Math.max(goal, 1)) * 100, 100)}%` }} /></div>
        <div className="mt-3 flex justify-between text-xs text-[hsl(var(--muted-foreground))]"><span>{minutes} minutes practiced</span><span>{goal} goal</span></div>
        <div className="mt-9 rounded-xl bg-[hsl(var(--secondary))] p-4"><Quote size={17} className="text-[hsl(var(--accent))]" /><p className="mt-2 font-serif text-[18px] leading-snug">“Clarity comes from trying the sentence out loud.”</p><p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">Your coach, Speakwise</p></div>
      </section>
    </div>
    <section className="mt-8"><div className="mb-4 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Your shelf</p><h2 className="mt-1 font-serif text-2xl">Saved subjects</h2></div><Link href="/subjects" className="text-sm font-semibold text-[hsl(var(--primary))] hover:underline" data-testid="link-view-subjects">View all</Link></div>
      {subjects.isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div> : subjectList.length === 0 ? <EmptySubjects /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{subjectList.slice(0, 3).map(subject => <SubjectMini key={subject.id} subject={subject} />)}</div>}
    </section>
  </div>;
}

function PlanRow({ icon: Icon, title, detail, href }: { icon: typeof Mic2; title: string; detail: string; href: string }) {
  return <Link href={href} className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10" data-testid={`link-plan-${title.toLowerCase().replaceAll(' ', '-')}`}><span className="grid size-9 place-items-center rounded-lg bg-white/10 text-[hsl(var(--accent))]"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white">{title}</span><span className="mt-1 block truncate text-xs text-white/50">{detail}</span></span><ChevronRight size={17} className="text-white/40 transition-transform group-hover:translate-x-1" /></Link>;
}

function SubjectMini({ subject }: { subject: Subject }) {
  return <Link href="/subjects" className="group rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-card)]" data-testid={`card-subject-${subject.id}`}><div className="flex items-start justify-between"><span className="size-3 rounded-full" style={{ backgroundColor: subject.color }} /><ArrowUpRight size={16} className="text-[hsl(var(--muted-foreground))] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div><h3 className="mt-7 font-serif text-xl">{subject.name}</h3><div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full" style={{ width: `${subject.progress}%`, backgroundColor: subject.color }} /></div><span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{subject.progress}%</span></div></Link>;
}

function EmptySubjects() {
  return <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center"><BookOpen className="mx-auto text-[hsl(var(--primary))]" size={26} /><p className="mt-3 font-serif text-xl">Your shelf is ready for its first subject.</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Add a syllabus and we’ll turn it into a clear practice path.</p><Link href="/subjects" className="mt-5 inline-flex rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white" data-testid="link-add-first-subject">Add a subject</Link></div>;
}

function ErrorNotice({ message, retry }: { message: string; retry: () => void }) {
  return <div className="rounded-2xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] p-5 text-sm"><p className="font-semibold">{message}</p><button onClick={retry} className="mt-3 rounded-lg bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold" data-testid="button-retry">Try again</button></div>;
}

function Subjects() {
  const qc = useQueryClient();
  const subjects = useListSubjects({ query: { queryKey: getListSubjectsQueryKey() } });
  const create = useCreateSubject();
  const remove = useDeleteSubject();
  const notes = useGenerateSubjectNotes();
  const [form, setForm] = useState({ name: '', syllabus: '', color: subjectColors[1] });
  const [selected, setSelected] = useState<Subject | null>(null);
  const [notesOutput, setNotesOutput] = useState<any>(null);
  const list = subjects.data ?? [];
  const submit = () => { if (!form.name.trim() || !form.syllabus.trim()) return; create.mutate({ data: form }, { onSuccess: () => { setForm({ name: '', syllabus: '', color: subjectColors[(list.length + 1) % subjectColors.length] }); qc.invalidateQueries({ queryKey: getListSubjectsQueryKey() }); } }); };
  const generate = (subject: Subject) => { setSelected(subject); notes.mutate({ id: subject.id, data: { focus: 'exam revision and speaking confidence' } }, { onSuccess: (data) => setNotesOutput(data) }); };
  return <div className="rise-in"><SectionTitle eyebrow="Your syllabus shelf" title="Subjects that make sense." detail="Keep every exam topic in one place. Speakwise will turn the syllabus into notes you can actually use." action={<a href="#add-subject" className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-white" data-testid="link-add-subject"><Plus size={17} /> Add subject</a>} />
    <div className="grid gap-8 xl:grid-cols-[.9fr_1.1fr]"><section id="add-subject" className="h-fit rounded-2xl bg-[hsl(var(--sidebar))] p-6 text-white md:p-7"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">New subject</p><h2 className="mt-3 font-serif text-2xl">What are you preparing for?</h2><div className="mt-7 space-y-4"><label className="block text-xs font-semibold text-white/60">Subject name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Business English" className="mt-2 w-full rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[hsl(var(--accent))]" data-testid="input-subject-name" /></label><label className="block text-xs font-semibold text-white/60">Paste your syllabus<textarea value={form.syllabus} onChange={e => setForm({ ...form, syllabus: e.target.value })} placeholder="Topics, units, or exam objectives..." rows={6} className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[hsl(var(--accent))]" data-testid="input-subject-syllabus" /></label><div><p className="text-xs font-semibold text-white/60">Choose a colour</p><div className="mt-2 flex gap-2">{subjectColors.map(color => <button key={color} onClick={() => setForm({ ...form, color })} className={`size-7 rounded-full border-2 ${form.color === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} aria-label={`Choose colour ${color}`} data-testid={`button-color-${color.replace('#','')}`} />)}</div></div><button onClick={submit} disabled={create.isPending || !form.name || !form.syllabus} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--foreground))] disabled:opacity-50" data-testid="button-save-subject">{create.isPending ? 'Saving subject...' : 'Save subject'}<ArrowUpRight size={16} /></button></div></section>
      <section>{subjects.isLoading ? <div className="space-y-4">{[1,2,3].map(i => <div className="skeleton h-48 rounded-2xl" key={i} />)}</div> : subjects.isError ? <ErrorNotice message="We couldn’t load your subjects." retry={() => subjects.refetch()} /> : list.length === 0 ? <EmptySubjects /> : <div className="space-y-4">{list.map((subject, index) => <article key={subject.id} className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-lg" data-testid={`card-subject-detail-${subject.id}`}><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="mt-1 size-3 rounded-full" style={{ backgroundColor: subject.color }} /><div><h3 className="font-serif text-2xl">{subject.name}</h3><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{subject.syllabus.length > 140 ? `${subject.syllabus.slice(0, 140)}…` : subject.syllabus}</p></div></div><div className="flex items-center gap-1"><button onClick={() => generate(subject)} className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--secondary))] px-3 py-2 text-xs font-semibold text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]" data-testid={`button-generate-notes-${subject.id}`}><WandSparkles size={14} /> Generate notes</button><button onClick={() => { if (window.confirm(`Remove ${subject.name}?`)) remove.mutate({ id: subject.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListSubjectsQueryKey() }) }); }} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/.1)] hover:text-[hsl(var(--destructive))]" aria-label={`Delete ${subject.name}`} data-testid={`button-delete-subject-${subject.id}`}><Trash2 size={15} /></button></div></div><div className="mt-6 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full" style={{ width: `${subject.progress}%`, backgroundColor: subject.color }} /></div><span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{subject.progress}% familiar</span></div></article>)}</div>}</section></div>
    {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-[hsl(var(--foreground))]/45 p-5" role="dialog" aria-modal="true"><div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[hsl(var(--card))] p-6 shadow-2xl md:p-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">AI study notes</p><h2 className="mt-2 font-serif text-3xl">{notesOutput?.title || `Building notes for ${selected.name}`}</h2></div><button onClick={() => { setSelected(null); setNotesOutput(null); }} className="rounded-lg p-2 hover:bg-[hsl(var(--muted))]" aria-label="Close notes" data-testid="button-close-notes"><X size={18} /></button></div>{notes.isPending ? <div className="space-y-4 py-10">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div> : notesOutput ? <div className="mt-6 space-y-6"><p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{notesOutput.overview}</p>{notesOutput.sections?.map((section: any) => <div key={section.heading}><h3 className="font-serif text-xl">{section.heading}</h3><ul className="mt-2 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">{section.points?.map((point: string) => <li key={point} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />{point}</li>)}</ul></div>)}<div className="rounded-xl bg-[hsl(var(--secondary))] p-4"><p className="font-mono text-[10px] uppercase tracking-[.16em]">Exam tips</p><ul className="mt-3 space-y-2 text-sm">{notesOutput.examTips?.map((tip: string) => <li key={tip} className="flex gap-2"><Target size={14} className="mt-0.5 text-[hsl(var(--accent-foreground))]" />{tip}</li>)}</ul></div></div> : <p className="py-10 text-sm text-[hsl(var(--muted-foreground))]">We couldn’t make those notes just yet. Close this and try again.</p>}</div></div>}
  </div>;
}

function VoicePractice() {
  const voice = useSendVoicePractice();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [goal, setGoal] = useState('CDS II speaking confidence');
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');

  const startRecording = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Voice recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = event => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = '';
        const chunkSize = 0x8000;
        for (let index = 0; index < bytes.length; index += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
        }
        voice.mutate(
          { data: { audio: btoa(binary), mimeType: blob.type || 'audio/webm', goal } },
          {
            onSuccess: result => {
              setTranscript(result.transcript);
              setReply(result.response);
              const audio = new Audio(`data:${result.audioMimeType};base64,${result.audio}`);
              void audio.play().catch(() => undefined);
            },
            onError: () => setError('The voice coach could not respond. Check your AI provider quota and try again.'),
          },
        );
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError('Microphone access was blocked. Allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return <div className="rise-in">
    <SectionTitle eyebrow="Voice coach" title="Have a real conversation." detail="Speak naturally, hear a thoughtful reply, and get a gentle correction after every turn." action={<Link href="/practice" className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-semibold hover:bg-[hsl(var(--muted))]" data-testid="link-text-practice"><MessageCircle size={16} /> Use text practice</Link>} />
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[.78fr_1.22fr]">
      <section className="rounded-2xl bg-[hsl(var(--sidebar))] p-7 text-white md:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">Speakwise audio room</p>
        <h2 className="mt-4 font-serif text-4xl leading-tight">Your voice is part of the lesson.</h2>
        <p className="mt-4 text-sm leading-relaxed text-white/60">Choose your goal, press record, and answer out loud. Speakwise transcribes your turn, replies with audio, and keeps the practice moving.</p>
        <label className="mt-8 block text-xs font-semibold text-white/60">Practice goal
          <select value={goal} onChange={event => setGoal(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none" data-testid="select-voice-goal">
            <option>CDS II speaking confidence</option>
            <option>Mock interview confidence</option>
            <option>Everyday English fluency</option>
            <option>Academic presentation practice</option>
          </select>
        </label>
        <button onClick={recording ? stopRecording : startRecording} disabled={voice.isPending} className={`mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-all ${recording ? 'bg-[#D9829C] text-white' : 'bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]'} disabled:opacity-50`} data-testid="button-voice-record">
          {recording ? <><span className="size-2.5 animate-pulse rounded-full bg-white" /> Stop recording</> : <><Mic2 size={19} /> {voice.isPending ? 'Thinking...' : 'Press to speak'}</>}
        </button>
        {error && <p className="mt-4 rounded-xl border border-white/15 bg-white/8 p-3 text-xs leading-relaxed text-white/75" role="alert">{error}</p>}
      </section>
      <section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-card)] md:p-10">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-5"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Live voice feedback</p><h2 className="mt-2 font-serif text-2xl">Listen back with intention.</h2></div><span className="grid size-11 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Volume2 size={19} /></span></div>
        <div className="mt-7 space-y-5">
          {transcript ? <div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">You said</p><p className="mt-2 rounded-xl bg-[hsl(var(--muted))] p-4 text-sm leading-relaxed">“{transcript}”</p></div> : <div className="grid min-h-[230px] place-items-center rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center"><div><Mic2 className="mx-auto text-[hsl(var(--primary))]" size={26} /><p className="mt-3 font-serif text-xl">Your first spoken turn will appear here.</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try answering: “What are you preparing for this year?”</p></div></div>}
          {reply && <div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">Speakwise replied</p><p className="mt-2 rounded-xl bg-[hsl(var(--secondary))] p-4 text-sm leading-relaxed">{reply}</p></div>}
        </div>
      </section>
    </div>
  </div>;
}

function Practice() {
  const correct = useCorrectEnglish();
  const chat = useSendLearningChat();
  const [text, setText] = useState('');
  const [goal, setGoal] = useState('exam speaking');
  const [correction, setCorrection] = useState<any>(null);
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatText, setChatText] = useState('');
  const submitCorrection = () => { if (!text.trim()) return; correct.mutate({ data: { text, context: goal, level: 'B2' } }, { onSuccess: setCorrection }); };
  const sendChat = () => { if (!chatText.trim()) return; const next = [...conversation, { role: 'user' as const, content: chatText }]; setConversation(next); setChatText(''); chat.mutate({ data: { message: next.at(-1)?.content || '', history: next as ChatTurn[], goal } }, { onSuccess: reply => setConversation([...next, { role: 'assistant', content: reply.message }]) }); };
  return <div className="rise-in"><SectionTitle eyebrow="Practice room" title="Say it out loud." detail="A judgment-free space to test a sentence, notice the details, and try again with a little more ease." /><div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]"><section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-card)] md:p-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">01 · Correction practice</p><h2 className="mt-2 font-serif text-2xl">Make a sentence, make it yours.</h2></div><span className="grid size-11 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Mic2 size={20} /></span></div><div className="mt-7"><label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">What would you like to say?</label><textarea value={text} onChange={e => setText(e.target.value)} placeholder="I am interested to apply for the role because..." rows={5} className="mt-2 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-4 text-[15px] outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))]" data-testid="input-correction-text" /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><select value={goal} onChange={e => setGoal(e.target.value)} className="rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-xs" aria-label="Practice goal" data-testid="select-practice-goal"><option value="exam speaking">Exam speaking</option><option value="interview confidence">Interview confidence</option><option value="everyday fluency">Everyday fluency</option></select><button onClick={submitCorrection} disabled={correct.isPending || !text.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" data-testid="button-correct"><Sparkles size={15} />{correct.isPending ? 'Listening...' : 'Coach me'}</button></div></div>{correction && <div className="mt-7 rounded-2xl border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--primary)/.06)] p-5" data-testid="status-correction-result"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--primary))]">A clearer version</p><p className="mt-2 font-serif text-[22px] leading-snug">“{correction.corrected}”</p></div><div className="grid size-12 place-items-center rounded-full border-4 border-[hsl(var(--primary))] font-mono text-sm font-bold text-[hsl(var(--primary))]">{correction.score}<span className="text-[9px]">/10</span></div></div><p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{correction.explanation}</p>{correction.alternatives?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{correction.alternatives.map((alt: string) => <span key={alt} className="rounded-lg bg-[hsl(var(--card))] px-3 py-2 text-xs">{alt}</span>)}</div>}</div>}</section>
      <section className="flex min-h-[530px] flex-col rounded-2xl bg-[hsl(var(--sidebar))] p-6 text-white md:p-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">02 · Free conversation</p><h2 className="mt-2 font-serif text-2xl">Talk it through.</h2></div><span className="grid size-11 place-items-center rounded-full bg-white/10 text-[hsl(var(--accent))]"><Volume2 size={19} /></span></div><div className="mt-7 flex-1 space-y-3 overflow-y-auto pr-1">{conversation.length === 0 ? <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="font-serif text-xl leading-snug">Tell me about something you’re looking forward to.</p><p className="mt-2 text-xs text-white/45">I’ll keep the conversation moving and offer gentle corrections when useful.</p></div> : conversation.map((turn, i) => <div key={`${turn.role}-${i}`} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${turn.role === 'user' ? 'ml-auto bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]' : 'bg-white/10 text-white/90'}`} data-testid={`text-chat-${i}`}>{turn.content}</div>)}</div><div className="mt-5 flex items-end gap-2 rounded-xl border border-white/15 bg-white/8 p-2"><textarea value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }} rows={2} placeholder="Write what you would say..." className="min-h-[48px] flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-white/35" data-testid="input-chat-message" /><button onClick={sendChat} disabled={chat.isPending || !chatText.trim()} className="grid size-10 place-items-center rounded-lg bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] disabled:opacity-50" aria-label="Send message" data-testid="button-send-chat"><Send size={16} /></button></div></section></div></div>;
}

function Interview() {
  const interview = useRunMockInterview();
  const [started, setStarted] = useState(false);
  const [role, setRole] = useState('Product designer');
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [reply, setReply] = useState<any>(null);
  const start = () => { setStarted(true); interview.mutate({ data: { mode: 'start', role } }, { onSuccess: setReply }); };
  const submit = () => { if (!answer.trim() || !reply) return; const next = [...history, { role: 'user' as const, content: answer }]; setHistory(next); setAnswer(''); interview.mutate({ data: { mode: 'answer', role, question: reply.question, answer, history: next } }, { onSuccess: setReply }); };
  const reset = () => { setStarted(false); setReply(null); setHistory([]); setAnswer(''); };
  return <div className="rise-in"><SectionTitle eyebrow="Mock interview" title="Practice being ready." detail="A realistic question at a time, with feedback that helps you sound like yourself on your best day." action={started ? <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-semibold hover:bg-[hsl(var(--muted))]" data-testid="button-reset-interview"><RotateCcw size={16} /> Start over</button> : undefined} /><div className="mx-auto max-w-4xl">{!started ? <section className="overflow-hidden rounded-2xl bg-[hsl(var(--sidebar))] p-7 text-white md:p-12"><div className="max-w-xl"><span className="grid size-12 place-items-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"><BriefcaseBusiness size={22} /></span><h2 className="mt-8 font-serif text-4xl leading-tight tracking-[-.035em]">The room is yours.</h2><p className="mt-4 text-sm leading-relaxed text-white/60">Choose a role and we’ll take you through a thoughtful, one-question-at-a-time interview. No trick questions. Just useful practice.</p><label className="mt-8 block text-xs font-semibold text-white/60">Role you’re preparing for<select value={role} onChange={e => setRole(e.target.value)} className="mt-2 w-full max-w-sm rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none" data-testid="select-interview-role"><option>Product designer</option><option>Marketing manager</option><option>Software engineer</option><option>Customer success specialist</option></select></label><button onClick={start} disabled={interview.isPending} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-5 py-3 text-sm font-bold text-[hsl(var(--foreground))] disabled:opacity-50" data-testid="button-start-interview"><Play size={16} fill="currentColor" />{interview.isPending ? 'Preparing your questions...' : 'Begin interview'}</button></div></section> : <section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-card)] md:p-10"><div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-5"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Live interview · {role}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Question {history.length + 1}</p></div><div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]"><span className="size-2 rounded-full bg-[hsl(var(--primary))]" /> Coach is listening</div></div>{reply ? <><div className="py-9"><h2 className="font-serif text-3xl leading-tight md:text-4xl">“{reply.question}”</h2>{reply.feedback && <div className="mt-7 rounded-xl bg-[hsl(var(--secondary))] p-5"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.16em]">Coach notes</p><span className="font-mono text-sm text-[hsl(var(--primary))]">{reply.score}/10</span></div><p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{reply.feedback}</p></div>}</div>{reply.finished ? <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--primary)/.25)] bg-[hsl(var(--primary)/.07)] p-4"><span className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 size={17} className="text-[hsl(var(--primary))]" /> Interview complete. You showed up well.</span><button onClick={reset} className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline" data-testid="button-new-interview">New interview</button></div> : <><textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Take a breath, then write how you would answer..." rows={5} className="w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-4 text-sm outline-none focus:border-[hsl(var(--primary))]" data-testid="input-interview-answer" /><div className="mt-3 flex justify-end"><button onClick={submit} disabled={!answer.trim() || interview.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" data-testid="button-submit-interview">{interview.isPending ? 'Reviewing...' : 'Send answer'}<Send size={15} /></button></div></>}</> : <div className="py-16 text-center text-sm text-[hsl(var(--muted-foreground))]">Your first question is on its way.</div>}</section>}</div></div>;
}

function ExamPrep() {
  const planMutation = useGenerateExamPlan();
  const codingMutation = useReviewCodingAnswer();
  const [track, setTrack] = useState<'cds2' | 'academic' | 'coding'>('cds2');
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [targetDate, setTargetDate] = useState('');
  const [topics, setTopics] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [language, setLanguage] = useState('Python');
  const [codingTopic, setCodingTopic] = useState('Arrays & strings');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [codingResult, setCodingResult] = useState<any>(null);
  const [answer, setAnswer] = useState('');

  const generatePlan = () => {
    planMutation.mutate(
      { data: { exam: track, dailyMinutes, targetDate: targetDate || undefined, topics: topics || undefined } },
      { onSuccess: setPlan },
    );
  };
  const getChallenge = () => {
    codingMutation.mutate(
      { data: { mode: 'start', language, topic: codingTopic, difficulty } },
      { onSuccess: setCodingResult },
    );
  };
  const reviewSolution = () => {
    if (!codingResult || !answer.trim()) return;
    codingMutation.mutate(
      { data: { mode: 'review', language, topic: codingTopic, difficulty, prompt: codingResult.prompt, answer } },
      { onSuccess: setCodingResult },
    );
  };

  return (
    <div className="rise-in">
      <SectionTitle
        eyebrow="Exam preparation studio"
        title="Prepare with a plan, not panic."
        detail="Choose your goal and Speakwise will turn it into a focused daily rhythm, with a coach ready when you need to talk it through."
        action={
          <Link href="/practice" className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-semibold hover:bg-[hsl(var(--muted))]" data-testid="link-exam-coach">
            <MessageCircle size={16} /> Talk to your coach
          </Link>
        }
      />

      <div className="mb-7 grid gap-3 md:grid-cols-3">
        {[
          { id: 'cds2' as const, icon: GraduationCap, title: 'CDS II exam', detail: 'English, GK & maths' },
          { id: 'academic' as const, icon: BookOpen, title: 'Academic exam', detail: 'Syllabus to revision plan' },
          { id: 'coding' as const, icon: Code2, title: 'Coding rounds', detail: 'Challenges & review' },
        ].map(({ id, icon: Icon, title, detail }) => (
          <button
            key={id}
            onClick={() => setTrack(id)}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${track === id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)] shadow-sm' : 'border-[hsl(var(--card-border))] bg-[hsl(var(--card))] hover:-translate-y-0.5'}`}
            data-testid={`button-exam-track-${id}`}
          >
            <span className={`grid size-10 place-items-center rounded-xl ${track === id ? 'bg-[hsl(var(--primary))] text-white' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]'}`}><Icon size={18} /></span>
            <span><span className="block font-serif text-lg">{title}</span><span className="mt-1 block text-xs text-[hsl(var(--muted-foreground))]">{detail}</span></span>
          </button>
        ))}
      </div>

      {track !== 'coding' ? (
        <div className="grid gap-6 xl:grid-cols-[.82fr_1.18fr]">
          <section className="rounded-2xl bg-[hsl(var(--sidebar))] p-6 text-white md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">{track === 'cds2' ? 'CDS II focus' : 'Your exam focus'}</p>
            <h2 className="mt-3 font-serif text-3xl">Build a rhythm you can keep.</h2>
            <div className="mt-7 space-y-4">
              <label className="block text-xs font-semibold text-white/60">Daily study time
                <select value={dailyMinutes} onChange={e => setDailyMinutes(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none" data-testid="select-exam-minutes">
                  {[30, 45, 60, 90, 120].map(minutes => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                </select>
              </label>
              <label className="block text-xs font-semibold text-white/60">Target date <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none" data-testid="input-exam-date" /></label>
              <label className="block text-xs font-semibold text-white/60">Topics you want to improve
                <textarea value={topics} onChange={e => setTopics(e.target.value)} rows={4} placeholder={track === 'cds2' ? 'e.g. current affairs, sentence improvement, percentages...' : 'Paste your syllabus or list difficult chapters...'} className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/30" data-testid="input-exam-topics" />
              </label>
              <button onClick={generatePlan} disabled={planMutation.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--foreground))] disabled:opacity-50" data-testid="button-generate-exam-plan">
                <Sparkles size={16} /> {planMutation.isPending ? 'Building your plan...' : 'Build my study plan'}
              </button>
            </div>
          </section>
          <section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-card)] md:p-8">
            {plan ? <div>
              <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Your AI plan</p><h2 className="mt-2 font-serif text-3xl">{plan.title}</h2></div><span className="grid size-11 place-items-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Target size={19} /></span></div>
              <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{plan.summary}</p>
              <div className="mt-7 rounded-xl bg-[hsl(var(--secondary))] p-5"><p className="font-mono text-[10px] uppercase tracking-[.16em]">Today</p><ul className="mt-3 space-y-2 text-sm">{plan.today?.map((item: string) => <li key={item} className="flex gap-2"><Check size={15} className="mt-0.5 text-[hsl(var(--primary))]" />{item}</li>)}</ul></div>
              <div className="mt-7 grid gap-4 md:grid-cols-2">{plan.weeks?.map((week: any) => <article key={week.title} className="rounded-xl border border-[hsl(var(--border))] p-4"><h3 className="font-serif text-xl">{week.title}</h3><p className="mt-1 text-xs font-semibold text-[hsl(var(--primary))]">{week.focus}</p><ul className="mt-3 space-y-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">{week.tasks?.map((task: string) => <li key={task}>• {task}</li>)}</ul></article>)}</div>
              <div className="mt-7"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Checkpoints</p><div className="mt-3 flex flex-wrap gap-2">{plan.checkpoints?.map((checkpoint: string) => <span key={checkpoint} className="rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-xs">{checkpoint}</span>)}</div></div>
            </div> : <div className="grid min-h-[430px] place-items-center text-center"><div className="max-w-sm"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><CalendarClock size={24} /></span><h2 className="mt-5 font-serif text-2xl">Your plan will appear here.</h2><p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Tell us when you want to study and what feels difficult. Your coach will shape the next steps.</p></div></div>}
          </section>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[.78fr_1.22fr]">
          <section className="rounded-2xl bg-[hsl(var(--sidebar))] p-6 text-white md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">Coding round lab</p>
            <h2 className="mt-3 font-serif text-3xl">Think out loud, then sharpen the solution.</h2>
            <div className="mt-7 space-y-4">
              <label className="block text-xs font-semibold text-white/60">Language<select value={language} onChange={e => setLanguage(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none" data-testid="select-coding-language"><option>Python</option><option>JavaScript</option><option>Java</option><option>C++</option></select></label>
              <label className="block text-xs font-semibold text-white/60">Topic<select value={codingTopic} onChange={e => setCodingTopic(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none" data-testid="select-coding-topic"><option>Arrays & strings</option><option>Hash maps</option><option>Two pointers</option><option>Recursion & trees</option><option>Dynamic programming</option></select></label>
              <label className="block text-xs font-semibold text-white/60">Difficulty<select value={difficulty} onChange={e => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')} className="mt-2 w-full rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none" data-testid="select-coding-difficulty"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
              <button onClick={getChallenge} disabled={codingMutation.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--foreground))] disabled:opacity-50" data-testid="button-get-coding-challenge"><Code2 size={16} /> {codingMutation.isPending ? 'Preparing challenge...' : 'Give me a challenge'}</button>
            </div>
          </section>
          <section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-card)] md:p-8">
            {codingResult ? <div><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">AI coding coach</p><h2 className="mt-2 font-serif text-2xl">Your challenge</h2></div>{codingResult.score > 0 && <span className="rounded-full bg-[hsl(var(--secondary))] px-3 py-2 font-mono text-xs text-[hsl(var(--primary))]">{codingResult.score}/10</span>}</div><div className="mt-5 rounded-xl bg-[hsl(var(--secondary))] p-5 text-sm leading-relaxed whitespace-pre-wrap">{codingResult.prompt}</div><textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={10} placeholder="Write your approach or code here. Explain your thinking as if you were in the interview..." className="mt-5 w-full resize-none rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-4 font-mono text-xs outline-none focus:border-[hsl(var(--primary))]" data-testid="input-coding-answer" /><div className="mt-3 flex justify-end"><button onClick={reviewSolution} disabled={codingMutation.isPending || !answer.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" data-testid="button-review-coding"><Sparkles size={15} /> {codingMutation.isPending ? 'Reviewing...' : 'Review my solution'}</button></div>{codingResult.score > 0 && <div className="mt-7 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-[hsl(var(--border))] p-4"><p className="font-mono text-[10px] uppercase tracking-[.15em]">Coach feedback</p><p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{codingResult.explanation}</p></div><div className="rounded-xl border border-[hsl(var(--border))] p-4"><p className="font-mono text-[10px] uppercase tracking-[.15em]">Ideal approach</p><p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{codingResult.idealApproach}</p></div><div className="rounded-xl bg-[hsl(var(--secondary))] p-4 md:col-span-2"><p className="font-mono text-[10px] uppercase tracking-[.15em]">Next step</p><p className="mt-2 text-sm">{codingResult.nextStep}</p></div></div>}</div> : <div className="grid min-h-[430px] place-items-center text-center"><div className="max-w-sm"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Code2 size={24} /></span><h2 className="mt-5 font-serif text-2xl">Your next problem is waiting.</h2><p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">Choose a language, topic, and difficulty. Then solve it like you would in a real coding round.</p></div></div>}
          </section>
        </div>
      )}
    </div>
  );
}

function Resources() {
  const resources = useListResources(undefined, { query: { queryKey: getListResourcesQueryKey() } });
  const [filter, setFilter] = useState<'all' | 'video' | 'ebook'>('all');
  const list = (resources.data ?? []).filter(r => filter === 'all' || r.type === filter);
  return <div className="rise-in"><SectionTitle eyebrow="Curated for your next step" title="Good things to listen to." detail="A small, considered library of books and videos for clearer English, better answers, and more confidence." action={<div className="flex rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">{(['all', 'video', 'ebook'] as const).map(item => <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${filter === item ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-filter-${item}`}>{item === 'all' ? 'Everything' : item === 'video' ? 'Videos' : 'Ebooks'}</button>)}</div>} /><div className="grid gap-4 md:grid-cols-2">{resources.isLoading ? [1,2,3,4].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />) : resources.isError ? <ErrorNotice message="Resources took a wrong turn." retry={() => resources.refetch()} /> : list.length === 0 ? <div className="col-span-full rounded-2xl border border-dashed p-10 text-center"><LibraryBig className="mx-auto text-[hsl(var(--primary))]" /><p className="mt-3 font-serif text-xl">Nothing in this shelf yet.</p></div> : list.map((resource, i) => <article key={`${resource.url}-${i}`} className="group rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1" data-testid={`card-resource-${i}`}><div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl ${resource.type === 'video' ? 'bg-[#F9E2D7] text-[#B75C3B]' : 'bg-[#E5E8FA] text-[#5F6FB5]'}`}>{resource.type === 'video' ? <Youtube size={18} /> : <FileText size={18} />}</span><span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{resource.duration}</span></div><h2 className="mt-6 font-serif text-2xl leading-tight">{resource.title}</h2><p className="mt-2 text-xs font-semibold text-[hsl(var(--primary))]">{resource.author}</p><p className="mt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{resource.description}</p><a href={resource.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]" data-testid={`link-resource-${i}`}>Open resource <ExternalLink size={14} /></a></article>)}</div></div>;
}

function Settings() {
  const [saved, setSaved] = useState(false);
  const [days, setDays] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('speakwise-preferences');
      return stored ? JSON.parse(stored).days ?? ['Mon', 'Wed', 'Fri'] : ['Mon', 'Wed', 'Fri'];
    } catch {
      return ['Mon', 'Wed', 'Fri'];
    }
  });
  const [time, setTime] = useState(() => {
    try {
      const stored = localStorage.getItem('speakwise-preferences');
      return stored ? JSON.parse(stored).time ?? '18:30' : '18:30';
    } catch {
      return '18:30';
    }
  });
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('speakwise-preferences');
      return stored ? JSON.parse(stored).notifications ?? true : true;
    } catch {
      return true;
    }
  });
  useEffect(() => {
    localStorage.setItem('speakwise-preferences', JSON.stringify({ days, time, notifications }));
  }, [days, time, notifications]);
  useEffect(() => {
    if (!saved || !notifications || !('Notification' in window)) return;
    if (Notification.permission === 'default') void Notification.requestPermission();
  }, [saved, notifications]);
  useEffect(() => {
    if (!notifications || !('Notification' in window)) return;
    const checkReminder = () => {
      const now = new Date();
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const reminderKey = `${now.toISOString().slice(0, 10)}-${day}-${time}`;
      if (days.includes(day) && currentTime === time && Notification.permission === 'granted' && localStorage.getItem('speakwise-last-reminder') !== reminderKey) {
        new Notification('Time for Speakwise', { body: 'A few focused minutes can move your English forward.' });
        localStorage.setItem('speakwise-last-reminder', reminderKey);
      }
    };
    checkReminder();
    const interval = window.setInterval(checkReminder, 30000);
    return () => window.clearInterval(interval);
  }, [days, time, notifications]);
  const toggleDay = (day: string) => setDays(days.includes(day) ? days.filter(d => d !== day) : [...days, day]);
  return <div className="rise-in"><SectionTitle eyebrow="Make practice yours" title="A rhythm that fits." detail="Set a gentle structure for the week. You can always change it when life changes." /><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-card)] md:p-8"><div className="flex items-start gap-4"><span className="grid size-11 place-items-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><CalendarClock size={20} /></span><div><h2 className="font-serif text-2xl">Weekly timetable</h2><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Choose the moments you’re most likely to keep.</p></div></div><div className="mt-8"><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Practice days</p><div className="mt-3 grid grid-cols-7 gap-2">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => <button key={day} onClick={() => toggleDay(day)} className={`rounded-xl border py-3 text-xs font-semibold ${days.includes(day) ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'}`} data-testid={`button-day-${day.toLowerCase()}`}>{day}</button>)}</div></div><label className="mt-7 block text-xs font-semibold text-[hsl(var(--muted-foreground))]">Preferred time<input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-2 block rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3.5 py-3 text-sm" data-testid="input-practice-time" /></label><div className="mt-8 flex items-center justify-between border-t border-[hsl(var(--border))] pt-6"><div><p className="text-sm font-semibold">Practice reminders</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">A nudge before your scheduled session.</p></div><button onClick={() => setNotifications(!notifications)} className={`relative h-7 w-12 rounded-full ${notifications ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'}`} role="switch" aria-checked={notifications} data-testid="switch-notifications"><span className={`absolute top-1 size-5 rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} /></button></div></section><section className="rounded-2xl bg-[hsl(var(--sidebar))] p-6 text-white md:p-8"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">Your settings</p><h2 className="mt-3 font-serif text-3xl">A little consistency goes a long way.</h2><div className="mt-8 space-y-4 text-sm"><div className="flex justify-between border-b border-white/10 pb-4"><span className="text-white/55">Practice days</span><span className="font-semibold">{days.length || 'None selected'}</span></div><div className="flex justify-between border-b border-white/10 pb-4"><span className="text-white/55">Usual time</span><span className="font-semibold">{time}</span></div><div className="flex justify-between border-b border-white/10 pb-4"><span className="text-white/55">Reminders</span><span className="font-semibold">{notifications ? 'On' : 'Off'}</span></div></div><button onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2200); }} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--foreground))]" data-testid="button-save-settings">{saved ? <Check size={16} /> : <SlidersHorizontal size={16} />}{saved ? 'Preferences saved' : 'Save preferences'}</button></section></div></div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Shell><Switch><Route path="/" component={Dashboard} /><Route path="/subjects" component={Subjects} /><Route path="/practice" component={Practice} /><Route path="/talk" component={VoicePractice} /><Route path="/interview" component={Interview} /><Route path="/exam-prep" component={ExamPrep} /><Route path="/resources" component={Resources} /><Route path="/settings" component={Settings} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;