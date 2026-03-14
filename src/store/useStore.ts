import { useState, useCallback } from 'react';
import { Story, Dependency, Bug, Observation, BacklogItem } from '@/types';

const KEYS = {
  stories: 'ba-tracker-stories',
  dependencies: 'ba-tracker-dependencies',
  bugs: 'ba-tracker-bugs',
  observations: 'ba-tracker-observations',
  backlog: 'ba-tracker-backlog',
};

function load<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useStories() {
  const [stories, setStories] = useState<Story[]>(() => load<Story>(KEYS.stories));
  const persist = useCallback((s: Story[]) => { setStories(s); save(KEYS.stories, s); }, []);
  const addStory = useCallback((story: Story) => persist([...stories, story]), [stories, persist]);
  const updateStory = useCallback((story: Story) => persist(stories.map(s => s.id === story.id ? story : s)), [stories, persist]);
  const deleteStory = useCallback((id: string) => persist(stories.filter(s => s.id !== id)), [stories, persist]);
  return { stories, addStory, updateStory, deleteStory };
}

export function useDependencies() {
  const [dependencies, setDependencies] = useState<Dependency[]>(() => load<Dependency>(KEYS.dependencies));
  const persist = useCallback((d: Dependency[]) => { setDependencies(d); save(KEYS.dependencies, d); }, []);
  const addDependency = useCallback((dep: Dependency) => persist([...dependencies, dep]), [dependencies, persist]);
  const updateDependency = useCallback((dep: Dependency) => persist(dependencies.map(d => d.id === dep.id ? dep : d)), [dependencies, persist]);
  const deleteDependency = useCallback((id: string) => persist(dependencies.filter(d => d.id !== id)), [dependencies, persist]);
  return { dependencies, addDependency, updateDependency, deleteDependency };
}

export function useBugs() {
  const [bugs, setBugs] = useState<Bug[]>(() => load<Bug>(KEYS.bugs));
  const persist = useCallback((b: Bug[]) => { setBugs(b); save(KEYS.bugs, b); }, []);
  const addBug = useCallback((bug: Bug) => persist([...bugs, bug]), [bugs, persist]);
  const updateBug = useCallback((bug: Bug) => persist(bugs.map(b => b.id === bug.id ? bug : b)), [bugs, persist]);
  const deleteBug = useCallback((id: string) => persist(bugs.filter(b => b.id !== id)), [bugs, persist]);
  return { bugs, addBug, updateBug, deleteBug };
}

export function useObservations() {
  const [observations, setObservations] = useState<Observation[]>(() => load<Observation>(KEYS.observations));
  const persist = useCallback((o: Observation[]) => { setObservations(o); save(KEYS.observations, o); }, []);
  const addObservation = useCallback((obs: Observation) => persist([...observations, obs]), [observations, persist]);
  const updateObservation = useCallback((obs: Observation) => persist(observations.map(o => o.id === obs.id ? obs : o)), [observations, persist]);
  const deleteObservation = useCallback((id: string) => persist(observations.filter(o => o.id !== id)), [observations, persist]);
  return { observations, addObservation, updateObservation, deleteObservation };
}

export function useBacklog() {
  const [backlog, setBacklog] = useState<BacklogItem[]>(() => load<BacklogItem>(KEYS.backlog));
  const persist = useCallback((b: BacklogItem[]) => { setBacklog(b); save(KEYS.backlog, b); }, []);
  const addBacklogItem = useCallback((item: BacklogItem) => persist([...backlog, item]), [backlog, persist]);
  const updateBacklogItem = useCallback((item: BacklogItem) => persist(backlog.map(b => b.id === item.id ? item : b)), [backlog, persist]);
  const deleteBacklogItem = useCallback((id: string) => persist(backlog.filter(b => b.id !== id)), [backlog, persist]);
  return { backlog, addBacklogItem, updateBacklogItem, deleteBacklogItem };
}
