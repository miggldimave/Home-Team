# Projekt-Kontext: HomeTeam (Haushalts-Appreciation)

## 🎯 Vision & Vibe
HomeTeam ist eine App zur Sichtbarmachung von Hausarbeit (Mental Load).
- **Kein harter Wettbewerb:** Der Fokus liegt auf Wertschätzung und Kooperation.
- **Transparenz:** Es soll sichtbar werden, wer was leistet, um Dankbarkeit zu fördern oder Aufgaben fair zu übernehmen.
- **Design:** Warm, freundlich, clean. Nutze sanfte Animationen (z.B. Konfetti oder Herzen) bei Erledigung.

## 👥 Team
Dieses Projekt wird von **zwei Entwicklern** gemeinsam gebaut. Beachte:
- Bei DB-Änderungen explizit darauf hinweisen, dass der andere Dev `npx supabase db push` ausführen muss.
- Bei neuen Env-Variablen immer `.env.example` aktualisieren und im PR-Text erwähnen.

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **Backend/Auth:** Supabase

## 🎨 UI/UX Source of Truth
- Der visuelle Prototyp wird direkt aus dem Claude Designer übergeben.
- Halte dich bei der Implementierung von Komponenten, Layouts und Animationen strikt an die Ästhetik, Spacing-Regeln und Farbpaletten des Prototyps.
- Nutze die vom Designer generierten Tailwind-Konfigurationen oder CSS-Variablen als Basis.
- Bevor du eine neue Seite baust, prüfe den entsprechenden Screen im übergebenen Prototyp und setze ihn 1:1 in Next.js/shadcn um.

## 📏 Business Logic & Regeln
- **Globaler Metrik-Modus:** Ein Haushalt entscheidet sich bei Erstellung für 'Punkte' ODER 'Zeit'.
- **Punkte-Skala:** Festgelegt auf 1 bis 5 (1 = wenig Aufwand, 5 = hoher Aufwand).
- **Zeit-Modus:** Angabe in Minuten.
- **Unsung Hero Dashboard:** Fokus auf langfristige Auswertungen (aktueller Monat / aktuelles Quartal).
- **Streaks:** Markiere Aufgaben, die mehrmals hintereinander von derselben Person erledigt wurden ("Streak-Hinweis").

## 🏗 Coding Standards
- **Komponenten:** Nutze React Server Components (RSC) wo immer möglich. Client Components nur für Interaktivität (`"use client"`).
- **Styling:** Nutze konsequent Tailwind-Klassen. Achte auf Dark Mode Support (`dark:`).
- **Dateistruktur:**
  - `/components/ui` — shadcn Komponenten
  - `/components/shared` — Eigene wiederverwendbare Komponenten
  - `/lib` — Utility Funktionen und Supabase-Client
  - `/app` — Next.js App Router (Pages & API Routes)

## 🗄 Datenbank (Supabase)
- **Ändere das DB-Schema NIEMALS manuell im Dashboard.** Erstelle immer eine Migration.
- `npx supabase db push` geht immer gegen das **Dev-Projekt** — niemals gegen Prod.
- Prod-Migrationen laufen automatisch via CI beim Merge auf `main`.
- Nach einer neuen Migration den anderen Entwickler explizit darauf hinweisen, dass er `npx supabase db push` lokal ausführen muss.

## 🔐 Environment Variables
- `.env.local` wird niemals committet (ist in `.gitignore`).
- Wenn du eine neue Env-Variable brauchst: Trage sie mit leerem Wert in `.env.example` ein und erwähne sie im PR-Text.
- Variablen für Prod werden ausschließlich im Vercel-Dashboard gepflegt.

## 🔀 Git & Collaboration
- **Kein direkter Push auf `main`** — immer via Pull Request.
- **Branch-Naming:** `feat/`, `fix/`, `chore/` (z.B. `feat/task-streaks`, `fix/streak-counter`)
- **Vor jedem neuen Feature:** `git pull origin main` ausführen und danach `npx supabase db push`, um den lokalen Stand zu aktualisieren.
- PR-Beschreibungen immer strukturiert:
  - **Was ändert sich?**
  - **DB-Migration enthalten?** (ja/nein)
  - **Neue Env-Vars?** (ja/nein)
  - **Wie testen?**

## 💻 Erlaubte Befehle (CLI Commands)
Claude, du hast die Erlaubnis, folgende Befehle selbstständig auszuführen:

### Entwicklung & Build
- `npm run dev` — Startet den Dev-Server
- `npm run build` — Prüft auf Build-Fehler
- `npx shadcn@latest add [component]` — Fügt neue UI-Komponenten hinzu

### Datenbank (Supabase CLI)
- `npx supabase migration new [name]` — Erstellt eine neue Migrationsdatei
- `npx supabase db push` — Pusht lokale Migrationen in die Dev-DB
- `npx supabase status` — Zeigt den Verbindungsstatus an

## 🔄 Workflow-Anweisungen für Claude
1. **Planung:** Bevor du Code schreibst, skizziere kurz dein Vorgehen.
2. **Datenbank:** Wenn ein Feature eine DB-Änderung braucht, erstelle zuerst die Migration, pushe sie, und weise auf den nötigen `db push` des anderen Devs hin.
3. **Env-Vars:** Wenn du eine neue Variable brauchst, aktualisiere `.env.example` und weise darauf hin.
4. **Build-Check:** Prüfe nach Änderungen, ob `npm run build` noch durchläuft.
5. **Git:** Wenn ein Feature fertig ist, erinnere den User daran, einen Commit/Push zu machen, und schlage einen strukturierten PR-Text vor.
