# Projekt-Kontext: HomeTeam (Haushalts-Appreciation)

## 🎯 Vision & Vibe
HomeTeam ist eine App zur Sichtbarmachung von Hausarbeit (Mental Load). 
- **Kein harter Wettbewerb:** Der Fokus liegt auf Wertschätzung und Kooperation.
- **Transparenz:** Es soll sichtbar werden, wer was leistet, um Dankbarkeit zu fördern oder Aufgaben fair zu übernehmen.
- **Design:** Warm, freundlich, clean. Nutze sanfte Animationen (z.B. Konfetti oder Herzen) bei Erledigung.

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **Backend/Auth:** Supabase

## 🎨 UI/UX Source of Truth (Claude Designer)
- **Referenz:** Der visuelle Prototyp wurde mit dem Claude Designer erstellt.
- **Vorgabe:** Claude Code soll sich bei der Implementierung von Komponenten, Layouts und Animationen strikt an die Ästhetik, Spacing-Regeln und Farbpaletten des Prototyps halten.
- **Assets:** Nutze die vom Designer generierten Tailwind-Konfigurationen oder CSS-Variablen als Basis.
- **Vorgehen:** Bevor du eine neue Seite baust, schaue dir den entsprechenden Screen im Prototyp-Export an und setze ihn 1:1 in Next.js/shadcn um.

## 📏 Business Logic & Regeln
- **Globaler Metrik-Modus:** Ein Haushalt entscheidet sich bei Erstellung für 'Punkte' ODER 'Zeit'. 
- **Punkte-Skala:** Festgelegt auf 1 bis 5 (1 = wenig Aufwand, 5 = hoher Aufwand).
- **Zeit-Modus:** Angabe in Minuten.
- **Unsung Hero Dashboard:** Fokus auf langfristige Auswertungen (aktueller Monat / aktuelles Quartal).
- **Streaks:** Markiere Aufgaben, die mehrmals hintereinander von derselben Person erledigt wurden ("Streak-Hinweis").

## 💻 Erlaubte Befehle (CLI Commands)
Claude, du hast die Erlaubnis, folgende Befehle selbstständig auszuführen:

### Entwicklung & Build
- `npm run dev` - Startet den Dev-Server
- `npm run build` - Prüft auf Build-Fehler
- `npx shadcn@latest add [component]` - Fügt neue UI-Komponenten hinzu

### Datenbank (Supabase CLI)
- `npx supabase db push` - Pusht lokale Änderungen in die Dev-DB
- `npx supabase migration new [name]` - Erstellt eine neue Migrationsdatei
- `npx supabase status` - Zeigt den Status der Verbindung an
- **Wichtig:** Ändere das DB-Schema NIEMALS manuell im Dashboard. Erstelle immer eine Migration.

## 🏗 Coding Standards
- **Komponenten:** Nutze React Server Components (RSC) wo immer möglich. Client Components nur für Interaktivität (`"use client"`).
- **Styling:** Nutze konsequent Tailwind-Klassen. Achte auf Dark Mode Support (`dark:`).
- **Dateistruktur:** - `/components/ui` - Shadcn Komponenten
    - `/components/shared` - Eigene wiederverwendbare Komponenten
    - `/lib` - Utility Funktionen und Supabase-Client
    - `/app` - Next.js App Router (Pages & API)

## 🔄 Workflow-Anweisungen für Claude
1. **Planung:** Bevor du Code schreibst, skizziere kurz dein Vorgehen.
2. **Datenbank:** Wenn ein Feature eine DB-Änderung braucht, erstelle zuerst die Migration.
3. **Tests:** Prüfe nach Änderungen, ob `npm run build` noch durchläuft.
4. **Git:** Wenn ein Feature fertig ist, erinnere den User daran, einen Commit/Push zu machen oder frage, ob du den Commit-Text formulieren sollst.