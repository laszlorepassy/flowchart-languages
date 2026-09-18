# Folyamatábrázoló — languages / nyelvi változatok

[English](#english) · [Magyar](#magyar)

**Folyamatábrázoló** (English name: *Flowchart Designer*) is a
Flowgorithm-compatible flowchart editor and interpreter for teaching
programming: in the browser at <https://repassylaszlo.hu/app/flowchart/>, and
as an offline desktop edition for exams. This repository holds its
**language files**. Anyone can add a new language or improve one: fork this
repository, translate, and send a pull request. Accepted languages appear in
the next version of both the web app and the desktop app.

---

## English

### What a language file is

Every language is **one JSON file** in [`languages/`](languages), named after
its language code: `de.json` (German), `fr.json` (French), `pt-BR.json`
(Brazilian Portuguese), … [`languages/en.json`](languages/en.json) is the
**reference**: every other file has the same structure.

```jsonc
{
  "language": {
    "code": "de",                 // the file name without .json
    "name": "German",             // the language's name in English
    "nativeName": "Deutsch",      // the language's own name (shown in the language menu)
    "translators": ["Your Name"]  // shown in the app's help
  },
  "messages": {                   // the user interface: buttons, menus, messages
    "menuNew": "Neu",
    "errAlreadyDeclared": "Die Variable \"{name}\" ist bereits deklariert.",
    …
  },
  "help": { … }                   // the help page (optional, see below)
}
```

### How to add a language

1. **Fork** this repository (the *Fork* button on GitHub).
2. In your fork, **copy** `languages/en.json` to `languages/<code>.json`, e.g.
   `languages/de.json`. Use the two-letter
   [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) of
   the language (a region may follow: `pt-BR`).
3. **Fill in** the `"language"` block: `code`, `name`, `nativeName`, and
   your name in `translators`.
4. **Translate** the texts (the values after the `:`), never the keys
   (before the `:`). You can do it on GitHub itself (the pencil icon), or in
   any text editor that saves UTF-8.
5. Open a **pull request** to this repository. The **Validate language files**
   check runs automatically and tells you exactly what to fix, if anything.

You don't have to finish in one go: a message you leave out is shown in
English. The same goes for the whole `"help"` block: without it, the help
page is shown in English.

### Rules for the texts

- **Placeholders** such as `{name}`, `{expected}`, `{file}` are filled in by
  the app (with a variable name, a number, a file name, …). Keep each one
  exactly as it is (the check verifies this), but put it wherever your
  language needs it: `"Variable \"{name}\" is already declared."` →
  `"A(z) \"{name}\" változó már deklarálva van."`
- Keep **code** unchanged: keywords and function names of the flowchart
  language (`and`, `or`, `not`, `mod`, `Len`, `ToString`, `eof`, …), type
  names (`Integer`, `Real`, `String`, `Boolean`) and examples written in them
  (`1 < x and x < 5`), file names, commands (`sudo apt install …`).
- Keep the text **short** where English is short: buttons, menu items and
  tab names have little room.
- `"help"` → `"sections"` is the help page: each section has a `"title"`, and
  either `"content"` (a text is a paragraph, a list of texts is a bulleted
  list) or a `"table"` (translate `"head"` and the text cells; keep the code
  cells — the columns listed in `"codeColumns"` — as they are).
- `"help"` → `"examReplacements"`: in the exam edition, a help line starting
  with the text on the left is replaced by the text on the right. Translate
  both sides so that the left side is exactly the start of your translated
  help line.
- `"help"` → `"download"`: the download panel of the exam edition's
  installers (`{version}` and `{file}` are filled in by the app).

### Checking your file on your computer (optional)

With [Node.js](https://nodejs.org/) 18 or newer:

```
node tools/languages.mjs
```

or, with only Docker installed:

```
docker run --rm -v "$PWD":/w -w /w node:20-alpine node tools/languages.mjs
```

`ERROR` lines must be fixed; `note` lines only list what is still in English.

### What is not translated (yet)

The built-in example programs and the pseudocode view exist in English and
Hungarian; in other languages they are shown in English.

### Contributions

By sending a pull request you agree that your translation becomes part of
Folyamatábrázoló and may be used, modified and distributed with it, in the
web app and the desktop app, free of charge. Your name, as given in
`"translators"`, is shown in the app's help. Folyamatábrázoló itself is
© 2026 Répássy László, all rights reserved.

---

## Magyar

### Mi a nyelvi fájl?

Minden nyelv **egyetlen JSON-fájl** a [`languages/`](languages) mappában, a
nyelv kódjáról elnevezve: `de.json` (német), `fr.json` (francia), `pt-BR.json`
(brazíliai portugál), … A [`languages/en.json`](languages/en.json) a
**minta**: minden más fájl ugyanígy épül fel. (A magyar fordítás:
[`languages/hu.json`](languages/hu.json).)

```jsonc
{
  "language": {
    "code": "de",                 // a fájl neve .json nélkül
    "name": "German",             // a nyelv neve angolul
    "nativeName": "Deutsch",      // a nyelv saját neve (ez látszik a nyelvválasztóban)
    "translators": ["A neved"]    // megjelenik az alkalmazás súgójában
  },
  "messages": { … },              // a felület: gombok, menük, üzenetek
  "help": { … }                   // a súgó (elhagyható, lásd lent)
}
```

### Új nyelv hozzáadása

1. **Forkold** ezt a repót (a GitHubon a *Fork* gomb).
2. A forkodban **másold le** a `languages/en.json` fájlt `languages/<kód>.json`
   néven, pl. `languages/de.json`. A nyelv kétbetűs
   [ISO 639-1 kódját](https://hu.wikipedia.org/wiki/ISO_639-1_k%C3%B3dok_list%C3%A1ja)
   használd (utána jöhet régió is: `pt-BR`).
3. **Töltsd ki** a `"language"` részt: `code`, `name`, `nativeName`, és a
   neved a `translators` listában.
4. **Fordítsd le** a szövegeket (a `:` utáni értékeket), a kulcsokat (a `:`
   előttieket) soha. Megteheted magán a GitHubon (a ceruza ikonnal), vagy
   bármilyen szövegszerkesztőben, amely UTF-8-ban ment.
5. Nyiss **pull requestet** ebbe a repóba. A **Validate language files**
   ellenőrzés magától lefut, és pontosan megmondja, ha valamit javítani kell.

Nem kell egyszerre befejezni: amelyik szöveget kihagyod, az angolul jelenik
meg. Ugyanígy a teljes `"help"` rész is elhagyható: nélküle a súgó angolul
látszik.

### Szabályok a szövegekhez

- A **helyőrzőket** (`{name}`, `{expected}`, `{file}`, …) az alkalmazás tölti
  ki (változónévvel, számmal, fájlnévvel stb.). Mindegyik pontosan maradjon
  meg (az ellenőrzés ezt vizsgálja), de oda tedd, ahová a nyelvtan kívánja:
  `"Variable \"{name}\" is already declared."` →
  `"A(z) \"{name}\" változó már deklarálva van."`
- A **kód** változatlan marad: a folyamatábra-nyelv kulcsszavai és
  függvénynevei (`and`, `or`, `not`, `mod`, `Len`, `ToString`, `eof`, …), a
  típusnevek (`Integer`, `Real`, `String`, `Boolean`) és a velük írt példák
  (`1 < x and x < 5`), a fájlnevek és a parancsok (`sudo apt install …`).
- Ahol az angol rövid, ott maradjon **rövid** a fordítás is: a gombokon, a
  menükben és a füleken kevés a hely.
- `"help"` → `"sections"`: a súgó oldal. Minden szakasznak van `"title"`-je,
  és vagy `"content"`-je (egy szöveg egy bekezdés, egy szöveglista egy
  felsorolás), vagy `"table"`-je (a `"head"` és a szöveges cellák
  fordítandók, a kódcellák — a `"codeColumns"`-ban felsorolt oszlopok — nem).
- `"help"` → `"examReplacements"`: a vizsgaváltozatban az a súgósor, amely a
  bal oldali szöveggel kezdődik, a jobb oldali szövegre cserélődik. Mindkét
  oldalt fordítsd le úgy, hogy a bal oldal pontosan a lefordított súgósor
  eleje legyen.
- `"help"` → `"download"`: a vizsgaváltozat telepítőinek letöltési panelje
  (a `{version}` és a `{file}` helyére az alkalmazás írja be az értéket).

### A fájl ellenőrzése a saját gépeden (nem kötelező)

[Node.js](https://nodejs.org/) 18 vagy újabb verzióval:

```
node tools/languages.mjs
```

vagy csak Dockerrel:

```
docker run --rm -v "$PWD":/w -w /w node:20-alpine node tools/languages.mjs
```

Az `ERROR` sorokat javítani kell; a `note` sorok csak azt sorolják fel, ami
még angolul van.

### Ami (még) nem fordítható

A beépített példaprogramok és a pszeudokód nézet magyarul és angolul
létezik; más nyelveken angolul jelennek meg.

### Hozzájárulás

A pull request beküldésével hozzájárulsz, hogy a fordításod a
Folyamatábrázoló része legyen, és azzal együtt — a webes és az asztali
változatban — díjmentesen felhasználható, módosítható és terjeszthető
legyen. A neved, ahogy a `"translators"`-ban megadtad, megjelenik az
alkalmazás súgójában. Maga a Folyamatábrázoló © 2026 Répássy László, minden
jog fenntartva.
