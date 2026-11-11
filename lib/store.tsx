"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type {
  AppData,
  Contact,
  LegalCase,
  Opportunity,
  Video,
  Post,
  CreativeProject,
  Track,
  Transaction,
  Task,
  WorkflowDef,
  WorkflowRun,
  Approval,
  AuditEntry,
  Creation,
} from "./types";
import { seedData } from "./seed";

const STORAGE_KEY = "imran-ai-business-os:v1";

type Action =
  | { type: "hydrate"; data: AppData }
  | { type: "addContact"; item: Contact }
  | { type: "updateContact"; item: Contact }
  | { type: "removeContact"; id: string }
  | { type: "addCase"; item: LegalCase }
  | { type: "updateCase"; item: LegalCase }
  | { type: "removeCase"; id: string }
  | { type: "addOpportunity"; item: Opportunity }
  | { type: "updateOpportunity"; item: Opportunity }
  | { type: "removeOpportunity"; id: string }
  | { type: "addVideo"; item: Video }
  | { type: "updateVideo"; item: Video }
  | { type: "removeVideo"; id: string }
  | { type: "addPost"; item: Post }
  | { type: "updatePost"; item: Post }
  | { type: "removePost"; id: string }
  | { type: "addProject"; item: CreativeProject }
  | { type: "updateProject"; item: CreativeProject }
  | { type: "removeProject"; id: string }
  | { type: "addTrack"; item: Track }
  | { type: "updateTrack"; item: Track }
  | { type: "removeTrack"; id: string }
  | { type: "addTransaction"; item: Transaction }
  | { type: "removeTransaction"; id: string }
  | { type: "addTask"; item: Task }
  | { type: "toggleTask"; id: string }
  | { type: "removeTask"; id: string }
  | { type: "setLock"; lockEnabled: boolean; pin: string }
  | { type: "addWorkflow"; item: WorkflowDef }
  | { type: "removeWorkflow"; id: string }
  | { type: "addRun"; item: WorkflowRun }
  | { type: "updateRun"; item: WorkflowRun }
  | { type: "removeRun"; id: string }
  | { type: "addApproval"; item: Approval }
  | { type: "updateApproval"; item: Approval }
  | { type: "addAudit"; item: AuditEntry }
  | { type: "addCreation"; item: Creation }
  | { type: "removeCreation"; id: string }
  | { type: "setLastVisit"; ts: string }
  | { type: "reset" };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "hydrate":
      return action.data;
    case "addContact":
      return { ...state, contacts: [action.item, ...state.contacts] };
    case "updateContact":
      return { ...state, contacts: state.contacts.map((c) => (c.id === action.item.id ? action.item : c)) };
    case "removeContact":
      return { ...state, contacts: state.contacts.filter((c) => c.id !== action.id) };
    case "addCase":
      return { ...state, cases: [action.item, ...state.cases] };
    case "updateCase":
      return { ...state, cases: state.cases.map((c) => (c.id === action.item.id ? action.item : c)) };
    case "removeCase":
      return { ...state, cases: state.cases.filter((c) => c.id !== action.id) };
    case "addOpportunity":
      return { ...state, opportunities: [action.item, ...state.opportunities] };
    case "updateOpportunity":
      return { ...state, opportunities: state.opportunities.map((o) => (o.id === action.item.id ? action.item : o)) };
    case "removeOpportunity":
      return { ...state, opportunities: state.opportunities.filter((o) => o.id !== action.id) };
    case "addVideo":
      return { ...state, videos: [action.item, ...state.videos] };
    case "updateVideo":
      return { ...state, videos: state.videos.map((v) => (v.id === action.item.id ? action.item : v)) };
    case "removeVideo":
      return { ...state, videos: state.videos.filter((v) => v.id !== action.id) };
    case "addPost":
      return { ...state, posts: [action.item, ...state.posts] };
    case "updatePost":
      return { ...state, posts: state.posts.map((p) => (p.id === action.item.id ? action.item : p)) };
    case "removePost":
      return { ...state, posts: state.posts.filter((p) => p.id !== action.id) };
    case "addProject":
      return { ...state, projects: [action.item, ...state.projects] };
    case "updateProject":
      return { ...state, projects: state.projects.map((p) => (p.id === action.item.id ? action.item : p)) };
    case "removeProject":
      return { ...state, projects: state.projects.filter((p) => p.id !== action.id) };
    case "addTrack":
      return { ...state, tracks: [action.item, ...state.tracks] };
    case "updateTrack":
      return { ...state, tracks: state.tracks.map((t) => (t.id === action.item.id ? action.item : t)) };
    case "removeTrack":
      return { ...state, tracks: state.tracks.filter((t) => t.id !== action.id) };
    case "addTransaction":
      return { ...state, transactions: [action.item, ...state.transactions] };
    case "removeTransaction":
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };
    case "addTask":
      return { ...state, tasks: [action.item, ...state.tasks] };
    case "toggleTask":
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)) };
    case "removeTask":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case "setLock":
      return { ...state, settings: { ...state.settings, lockEnabled: action.lockEnabled, pin: action.pin } };
    case "addWorkflow":
      return { ...state, workflows: [action.item, ...state.workflows] };
    case "removeWorkflow":
      return { ...state, workflows: state.workflows.filter((w) => w.id !== action.id) };
    case "addRun":
      return { ...state, runs: [action.item, ...state.runs] };
    case "updateRun":
      return { ...state, runs: state.runs.map((r) => (r.id === action.item.id ? action.item : r)) };
    case "removeRun":
      return { ...state, runs: state.runs.filter((r) => r.id !== action.id) };
    case "addApproval":
      return { ...state, approvals: [action.item, ...state.approvals] };
    case "updateApproval":
      return { ...state, approvals: state.approvals.map((a) => (a.id === action.item.id ? action.item : a)) };
    case "addAudit":
      return { ...state, audit: [action.item, ...state.audit].slice(0, 200) };
    case "addCreation":
      return { ...state, creations: [action.item, ...state.creations] };
    case "removeCreation":
      return { ...state, creations: state.creations.filter((c) => c.id !== action.id) };
    case "setLastVisit":
      return { ...state, settings: { ...state.settings, lastVisit: action.ts } };
    case "reset":
      return seedData();
    default:
      return state;
  }
}

interface StoreContextValue {
  data: AppData;
  ready: boolean;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined as unknown as AppData, seedData);
  const readyRef = useRef(false);
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({ type: "hydrate", data: JSON.parse(raw) as AppData });
      }
    } catch {
      // corrupted storage — fall back to seed data
    }
    readyRef.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage full or unavailable
    }
  }, [data, ready]);

  const value = useMemo(() => ({ data, ready, dispatch }), [data, ready]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
