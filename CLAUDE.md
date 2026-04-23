# HomeTeam — CLAUDE.md

## Projekt
App zur Sichtbarmachung und Wertschätzung von Hausarbeit (Mental Load). Fokus: Kooperation statt Wettbewerb. Oberfläche: warm, freundlich, clean, sanfte Animationen (Konfetti/Herzen) bei Aufgabenerledigung.

## Team
Zwei Entwickler. Bei DB-Änderungen: anderen Entwickler darauf hinweisen, `npx supabase db push` auszuführen. Bei neuen Umgebungsvariablen: `.env.example` aktualisieren und im PR erwähnen.

## Technologie-Stack
- Next.js 15 (App Router), TypeScript
- Tailwind CSS, shadcn/ui, Lucide React
- Supabase (Backend + Auth)

## Oberfläche
Prototyp wird nativ aus dem Claude Designer übergeben. Jeden Screen 1:1 nach Ästhetik, Abstands- und Farbpaletten-Vorgaben des Prototyps umsetzen. Generierte Tailwind-Konfiguration bzw. CSS-Variablen als Basis nutzen.

## Fachliche Regeln
- Haushalt wählt bei Erstellung: Modus `Punkte` (1–5) ODER `Zeit` (Minuten) — global, unveränderlich.
- Unsung-Hero-Dashboard: Auswertung nach aktuellem Monat / Quartal.
- Serien: Aufgaben, die mehrfach hintereinander von derselben Person erledigt wurden, mit Serien-Hinweis markieren.

## Programmierregeln
- React Server Components bevorzugen. `"use client"` nur bei Interaktivität.
- Ausschließlich Tailwind-Klassen, kein Inline-CSS. Dark Mode (`dark:`) immer mitdenken.
- Dateistruktur: `/components/ui` (shadcn) · `/components/shared` (eigene) · `/lib` (Hilfsfunktionen, Supabase-Client) · `/app` (Seiten, API)

## Datenbank
- Schema NIEMALS manuell im Dashboard ändern — immer Migration erstellen.
- `npx supabase db push` nur gegen das Entwicklungsprojekt.
- Ab Prod-Umstellung: Produktions-Migrationen laufen automatisch via CI beim Merge von `dev` nach `main`.

## Umgebungsvariablen
- `.env.local` niemals committen.
- Neue Variablen: leer in `.env.example` eintragen und im Pull-Request erwähnen.
- Produktions-Variablen ausschließlich im Vercel-Dashboard pflegen.

## Git-Workflow
**Aktuelle Phase: Development** — `main` ist die Entwicklungsbranche. Direkte Pushes auf `main` sind erlaubt, solange die App noch nicht produktiv läuft.
- Branch-Benennung (optional für größere Features/Experimente): `funktion/`, `fehler/`, `wartung/`
- Vor jedem neuen Feature: `git pull origin main` + `npx supabase db push`.
- Pull-Request-Text (falls über Branch gearbeitet wird): Was ändert sich? / DB-Migration enthalten? / Neue Umgebungsvariablen? / Wie testen?

**Umstellung bei erster Prod-Version:** Sobald die erste produktionsreife Version live geht, wird `main` zur Prod-Branche. Zusätzlich wird `dev` angelegt; direkte Pushes auf `main` sind dann nicht mehr erlaubt — Features laufen über `dev` → PR nach `main`.

## Erlaubte Befehle
```
npm run dev
npm run build
npx shadcn@latest add [komponente]
npx supabase migration new [name]
npx supabase db push
npx supabase status
```

## Arbeitsablauf
1. Vorgehen skizzieren, bevor Code geschrieben wird.
2. DB-Änderung nötig? Zuerst Migration erstellen und pushen, anderen Entwickler informieren.
3. Neue Umgebungsvariable? `.env.example` aktualisieren.
4. Nach Änderungen: `npm run build` prüfen.
5. Feature fertig? Commit-Text vorschlagen und strukturierten Pull-Request-Text ausgeben.
