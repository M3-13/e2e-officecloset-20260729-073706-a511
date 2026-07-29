# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Elegantes, dunkles Red-Carpet-/Hollywood-Ambiente: tiefes Nacht-Schwarz als Bühne, Champagner-Gold als Luxus-Akzent und ein sattes Teppich-Rot für Aktionen, mit seriflastigen Display-Headlines und viel Ruhe um die Garderoben-Galerie.

## Colors

- `--color-bg`: **#0E0B0C**
- `--color-surface`: **#171214**
- `--color-fg`: **#F5EFE6**
- `--color-accent`: **#C9A65A**
- `--color-accent_hover`: **#DBBB72**
- `--color-carpet`: **#8E1B22**
- `--color-carpet_hover`: **#A82830**
- `--color-border`: **#3A2F2C**
- `--color-muted`: **#9A8F86**

## Typography

- `font_family`: 'Cormorant Garamond', 'Playfair Display', Georgia, 'Times New Roman', serif
- `body_family`: 'Inter', 'Helvetica Neue', Arial, sans-serif
- `heading_weight`: 600
- `body_weight`: 400
- `scale_h1`: 44px
- `scale_h2`: 30px
- `scale_h3`: 22px
- `scale_body`: 16px
- `scale_small`: 13px

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button

Primär (Gold): bg=accent, Text=#0E0B0C, font body_family 600, padding 12/24, radius md, min-height 44px; hover=accent_hover; active=leicht dunkler + translateY(1px); disabled opacity 0.5, cursor not-allowed. Sekundär (Carpet): bg=carpet, Text=fg, hover=carpet_hover. Ghost/Text: transparent, 1px border=border, Text=fg, hover border=accent + Text=accent. Fokus: 2px outline accent, offset 2px.

### Input

bg=surface, 1px border=border, radius md, padding 12/16, Text=fg, Placeholder=muted, min-height 44px, font body_family. Focus: border=accent + subtiler Glow (0 0 0 3px rgba(201,166,90,0.25)). Label darüber 13px muted uppercase letter-spacing 0.08em. Fehlerzustand: border=carpet, Hinweistext carpet 13px.

### Card

Garderoben-/Outfit-Karte: bg=surface, radius lg, border 1px border, overflow hidden. Bild oben 4:5 object-cover mit dünner Goldlinie unten (1px accent 30%). Body padding 16, Titel serif h3, Kategorie als Chip. Hover: border=accent 60% + Anhebung (box-shadow 0 8px 24px rgba(0,0,0,0.5), translateY(-2px)).

### Chip/CategoryFilter

Pill radius pill, padding 6/14, font body 13px. Inaktiv: transparent, border 1px border, Text muted. Aktiv/ausgewählt: bg=accent, Text=#0E0B0C. Hover inaktiv: border=accent, Text=fg. Als horizontale Filterleiste über der Galerie, wrap auf Mobile.

### Modal

Overlay rgba(14,11,12,0.7) mit backdrop-blur 4px. Dialog bg=surface, radius lg, max-width 520px, padding 32, 1px border=border, Titel serif h2 mit dünnem Gold-Divider darunter. Close-X oben rechts (muted, hover fg). Aktionen unten rechts: Ghost 'Abbrechen' + Primär-Button. Für Löschen: Carpet-Button als Bestätigung.

### Nav/Topbar

Sticky top, bg=bg mit 1px border-bottom=border, Höhe 64px, padding 0/24. Links Wortmarke 'Glamour Closet' serif 22px accent. Mitte/rechts Links (Garderobe, Outfit-Creator, Outfits) body 15px muted, aktiv=fg mit 2px Gold-Underline. Rechts Avatar/Logout Ghost-Button. Mobile: Burger, Links als Sheet von rechts.

### ImageUpload

Dropzone: gestrichelte 1.5px border=border radius md, bg=surface, min-height 160px, zentriert Icon+Text muted 'Bild hierher ziehen oder wählen (JPG/PNG, max 5 MB)'. Hover/Dragover: border=accent, bg leicht heller. Nach Upload: Vorschau-Thumbnail mit Entfernen-X. Fehler (Typ/Größe): border=carpet + carpet Hinweistext.

### Gallery

Responsives Grid der Kleidungsstück-Karten: 4 Spalten Desktop, 3 Tablet, 2 Mobile, gap 24px. Empty-State zentriert: serif Überschrift 'Deine Garderobe ist noch leer', muted Text + Primär-Button 'Erstes Stück hinzufügen'.

### OutfitCreator

Zweispaltig Desktop: links scrollbare Auswahl-Galerie (Karten mit Checkbox-Overlay Gold-Häkchen bei Auswahl, ausgewählt=2px accent Rahmen), rechts Sticky-Panel bg=surface radius lg padding 24 mit Outfit-Name-Input, Miniatur-Stapel der gewählten Teile und Primär-Button 'Outfit speichern'. Mobile: Auswahl oben, Panel als fixe Bottom-Bar.

### Toast

Unten rechts, bg=surface, 1px border=border links 3px accent-Streifen, radius md, padding 12/16, Text fg 14px. Erfolg=accent-Streifen, Fehler=carpet-Streifen. Auto-Dismiss 4s, manuell schließbar.

## Layout Principles

- Container max-width 1200px, zentriert, seitliches Padding 24px (Mobile 16px).
- Breakpoints: Mobile <640px, Tablet 640–1024px, Desktop >1024px.
- Abstand zwischen Sektionen 48px, innerhalb von Karten/Panels 16–24px; großzügiger Weißraum als Teil des Luxus-Looks.
- Dunkle Bühne (bg) durchgehend; Inhalte sitzen auf surface-Flächen mit dezenten Gold-Details – Gold sparsam einsetzen (Akzente, Aktive-Zustände), niemals große Flächen.
- Bilder sind die Hauptdarsteller: object-cover, konsistentes 4:5-Format in der Galerie, ruhige Rahmen statt bunter Overlays.
- Serif nur für Headlines/Wortmarke, Sans-Serif (Inter) für Fließtext, Labels und UI – für Lesbarkeit und Kontrast zur Eleganz.
- Touch-Ziele mind. 44px; Fokuszustände immer sichtbar (Gold-Outline) für Barrierefreiheit auf dunklem Grund.
