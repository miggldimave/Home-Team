# Product Requirements Document (PRD): HomeTeam

## 1. Produktvision
**HomeTeam** ist eine kollaborative Web-App zur Organisation und Sichtbarmachung von Hausarbeit. Im Gegensatz zu klassischen Wettbewerbs-Apps liegt der Fokus hier auf **gegenseitiger Anerkennung, Wertschätzung und der fairen Verteilung des Mental Load**. Die App macht unsichtbare Arbeit sichtbar und fördert ein positives Miteinander im Haushalt durch Transparenz und "Kudos"-Momente.

## 2. Tech Stack (Verbindlich)
- **Framework:** Next.js 15 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS (inkl. Dark Mode Support via `system settings`)
- **UI Komponenten:** shadcn/ui (basierend auf Radix UI)
- **Icons:** Lucide React
- **Backend/Datenbank/Auth:** Supabase (PostgreSQL, Row Level Security)
- **Design-Referenz:** Claude Designer Prototyp (siehe `/docs/prototype` oder entsprechende Design-Assets)

## 3. UX / UI Vibe & Design-Prinzipien
- **Vibe:** "Warm, kooperativ, clean und einladend". Keine aggressiven Bestenlisten.
- **Farben:** Sanfte Akzentfarben, keine harten Rot/Grün-Kontraste (vermeide "Richtig/Falsch"-Gefühl).
- **Gamification:** Fokus auf "Streaks" und "Kudos" (Lob). Sanfte Animationen (Konfetti/Herzen) bei Erledigung einer Aufgabe.
- **Responsivität:** Mobile-First (optimiert für das Smartphone in der Küche), aber voll funktionsfähig auf Desktop/Mac.

## 4. Datenmodell & Haushaltseinstellungen
### Haushalte & Nutzer
- Die App ist **Multi-Tenant**. Ein Haushalt umfasst mehrere Nutzer.
- **Globales Setting (pro Haushalt):** Bei Erstellung des Haushalts wird festgelegt, ob der Aufwand in **"Punkten"** oder in **"Zeit (Minuten)"** gemessen wird.
    - **Punkte-Modus:** Eine fixe Skala von 1 bis 5 (1 = geringer Aufwand, 5 = hoher Aufwand).
    - **Zeit-Modus:** Schätzung in Minuten.
- Aufgaben werden pro Haushalt definiert und mit dem entsprechenden Wert (Punkte oder Zeit) versehen.

### Saisons/Perioden
- Punkte werden nicht gelöscht, sondern in Zeiträumen (Monat/Quartal) betrachtet, um langfristige Trends der Lastverteilung zu zeigen.

## 5. Kernfunktionen (Epics)

### Epic 1: Auth & Haushalts-Setup
- Login/Registrierung via E-Mail oder Social Login (Supabase Auth).
- Erstellen eines Haushalts oder Beitreten via Einladungscode.
- **Admin-Bereich:** Anlegen, Bearbeiten und Löschen von Aufgaben inklusive Zyklen (z.B. "Täglich", "Alle 3 Tage", "Wöchentlich").

### Epic 2: Aufgaben-Tracking (Daily Business)
- **Dashboard:** Anzeige aller fälligen Aufgaben des Haushalts.
- **Erledigung:** Ein-Klick-Check-In. Die Aufgabe wird dem Nutzerkonto gutgeschrieben.
- **Streak-Logik:** Erkennt, wenn eine Person eine Aufgabe oder Kategorie mehrfach hintereinander erledigt hat.
- **Motivation:** Wenn Nutzer A eine Aufgabe oft erledigt hat, erhält Nutzer B einen dezenten Hinweis: *"Alex hat das die letzten 3 Male gemacht. Möchtest du ihn heute entlasten?"*

### Epic 3: Wertschätzung & "Unsung Hero" Dashboard
- Fokus auf den **aktuellen Monat** oder das **aktuelle Quartal**.
- Highlights wie: *"Sam hat diesen Monat die Küche gerockt (70% der Aufgaben erledigt)"*.
- Visualisierung der "Mental Load" Verteilung als neutrales Diagramm (Pie-Chart oder Balance-Bar).

### Epic 4: Analytics & Transparenz
- **Gemeinsamer Effort:** Chart, das die investierte Zeit/Punkte des gesamten Haushalts über die Zeit zeigt.
- **Kategorie-Auswertung:** Welche Bereiche (Bad, Küche, Wäsche) nehmen die meiste Zeit in Anspruch?
- **Toggle-Sicherheit:** Alle Ansichten passen sich automatisch dem globalen Modus (Punkte vs. Zeit) an.

## 6. Seed-Daten (Standard-Aufgaben)
Bei Initialisierung eines Haushalts können folgende Aufgaben optional geladen werden:
- **Allgemein:** Altglas, Blumen gießen, Staubsaugen, Wocheneinkauf.
- **Bad:** Mülleimer leeren, Bad putzen.
- **Küche:** Abwaschen, Geschirrspüler, Kochen, Müll rausbringen, Oberflächen reinigen.
- **Wäsche:** Waschen, Aufhängen, Wegräumen.

## 7. Anweisungen für Claude Code
1. **Schema First:** Erstelle zuerst das Supabase-Schema (Migrations) für Haushalte, Profile und Aufgaben.
2. **Designer-Treue:** Nutze den Code/Stil aus dem Claude Designer Prototyp als Basis für alle UI-Komponenten.
3. **Global State:** Implementiere einen Provider für das Haushalts-Setting (Punkte vs. Zeit), damit die UI überall die korrekten Suffixe (`pt` oder `min`) anzeigt.
4. **Keine manuellen DB-Änderungen:** Nutze ausschließlich die Supabase CLI für Schema-Änderungen.
