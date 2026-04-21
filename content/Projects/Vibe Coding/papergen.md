---
title: Custom Paper Generator
draft: false
tags:
  - tech/vibecoding
  - school
  - unfinished
description:
created: 2026-04-21
modified:
holiday:
---
- Todo
	- [ ] split fields further - class number, class code, school (internal), school external
	- [ ] Update templates with further split fields and remove Liberty branding
		- MLA might be wonky rn - course number, last name
		- APA has Liberty in there
	- [ ] Create universal profile fields
		- I shouldn't need to enter a name each time I add a class - university/college should also be stable, even if school varies
	- [ ] Add additional relevant templates
	- [ ] Add support for non-word templates
		- typst/latex?

The following project is used to generate papers for a semester to eliminate time spent filling in templates. It runs a small python script that fills in fields from a json file into pre-generated templates. A registry file allows you to right click and generate the file, with selections for the class and inputs for paper title and due date. In the code blocks are installation instructions readme.md , papergen.py, the classes.json file, and the registry key.

Templates:
[APA](APA7.docx)
[MLA](MLA.docx)
[Turabian w/ headings](TurabianHeadings.docx)
# Installation Guide
## PaperGen — Setup Guide

Generate pre-filled academic paper files from your templates with a right-click.

---

### Requirements

- Windows 10 or 11
- Python 3.10+ installed and **on your PATH**
  - Download from https://python.org — check "Add Python to PATH" during install

---

### Installation (5 steps)

#### 1. Install the Python dependency

Open a terminal (Win+R → `cmd`) and run:

```
pip install python-docx
```

#### 2. Create the PaperGen folder

Create this folder (it likely already exists if you ran pip):

```
%APPDATA%\PaperGen\
```

Tip: paste `%APPDATA%\PaperGen` directly into File Explorer's address bar.

#### 3. Copy files into place

Copy `papergen.py` into:
```
%APPDATA%\PaperGen\papergen.py
```

#### 4. Add your templates

Place your `.docx` template files in:
```
%APPDATA%\PaperGen\templates\
```

**Using your own existing templates:**
Open each `.docx` in Word and replace the blank fields with these placeholders exactly as written:

| Field | Placeholder |
|---|---|
| Your name | `{{your_name}}` |
| Professor's name | `{{professor_name}}` |
| Class name | `{{class_name}}` |
| Class number | `{{class_number}}` |
| School / college | `{{school}}` |
| Paper title | `{{paper_title}}` |
| Due date | `{{due_date}}` |

Save the file as e.g. `mla.docx` or `turabian.docx` in the templates folder.
The filename (without `.docx`) is what appears in the Style dropdown.

#### 5. Install the right-click menu

**Important:** Before running, open `install_context_menu.reg` in Notepad and verify the
path in the `[command]` line matches where you put `papergen.py`. It should be:

```
C:\Users\YourActualUsername\AppData\Roaming\PaperGen\papergen.py
```

Then double-click `install_context_menu.reg` and click Yes when prompted.

---

### Usage

#### New Paper
Right-click any folder background (not on a file) → **New Paper from Template**

1. Select your class from the dropdown
2. Select your formatting style (MLA, Turabian, etc.)
3. Enter the paper title
4. Confirm or change the due date
5. Click **Generate** — the `.docx` appears in that folder

#### Manage Classes
Either click **Manage Classes** from the New Paper window, or run:

```
python papergen.py --manage
```

From there you can:
- **Add** a class (fill in the form)
- **Edit** an existing class
- **Delete** a single class
- **Clear Semester** — removes all classes at once (useful at semester end)

---

### File Locations

| File | Location |
|---|---|
| Main script | `%APPDATA%\PaperGen\papergen.py` |
| Class config | `%APPDATA%\PaperGen\classes.json` |
| Templates | `%APPDATA%\PaperGen\templates\*.docx` |

You can back up or edit `classes.json` directly in any text editor — it's plain JSON.

---

### Uninstalling the Right-Click Menu

Open Registry Editor (`regedit`), navigate to:

```
HKEY_CLASSES_ROOT\Directory\Background\shell\
```

Delete the `PaperGen` key.

---

### Troubleshooting

**"No templates found"** — Make sure `.docx` files are in `%APPDATA%\PaperGen\templates\`

**Nothing happens on right-click** — Make sure `pythonw.exe` is on your PATH.
Test by running `where pythonw` in a terminal. If not found, reinstall Python with PATH option checked.

**Placeholder not replaced** — Make sure the placeholder text is in a single run in Word.
If you typed it manually, delete it and retype `{{placeholder_name}}` fresh (don't paste from this doc).
# papergen.py
```python
"""
PaperGen - Academic Paper Template Generator
"""

import sys
import os
import json
from pathlib import Path
from datetime import date
import tkinter as tk
from tkinter import ttk, messagebox
from docx import Document

APPDATA = Path(os.environ.get("APPDATA", Path.home())) / "PaperGen"
CLASSES_FILE = APPDATA / "classes.json"
TEMPLATES_DIR = APPDATA / "templates"

APPDATA.mkdir(parents=True, exist_ok=True)
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)


def load_classes():
    if not CLASSES_FILE.exists():
        return []
    with open(CLASSES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_classes(classes):
    with open(CLASSES_FILE, "w", encoding="utf-8") as f:
        json.dump(classes, f, indent=2, ensure_ascii=False)


def list_templates():
    return sorted(p.stem for p in TEMPLATES_DIR.glob("*.docx"))


def replace_in_paragraph(para, placeholders):
    """
    Merge all runs into full text, replace placeholders, write back into
    first run and clear the rest. Handles Word splitting text across runs.
    """
    if not para.runs:
        return
    full_text = "".join(run.text for run in para.runs)
    replaced = full_text
    for key, val in placeholders.items():
        replaced = replaced.replace(key, val)
    if replaced == full_text:
        return
    para.runs[0].text = replaced
    for run in para.runs[1:]:
        run.text = ""


def generate_paper(cls, template_name, title, due_date, output_folder):
    template_path = TEMPLATES_DIR / f"{template_name}.docx"
    if not template_path.exists():
        raise FileNotFoundError(f"Template not found: {template_path}")

    placeholders = {
        "{{your_name}}": cls.get("your_name", ""),
        "{{professor_name}}": cls.get("professor_name", ""),
        "{{class_name}}": cls.get("class_name", ""),
        "{{class_number}}": cls.get("class_number", ""),
        "{{school}}": cls.get("school", ""),
        "{{paper_title}}": title,
        "{{due_date}}": due_date,
    }

    doc = Document(str(template_path))

    for para in doc.paragraphs:
        replace_in_paragraph(para, placeholders)

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    replace_in_paragraph(para, placeholders)

    for section in doc.sections:
        for para in section.header.paragraphs:
            replace_in_paragraph(para, placeholders)
        for para in section.footer.paragraphs:
            replace_in_paragraph(para, placeholders)

    your_name = cls.get("your_name", "")
    name_parts = your_name.strip().split()
    if len(name_parts) >= 2:
        name_prefix = f"{name_parts[-1]}{name_parts[0]}"
    else:
        name_prefix = "".join(name_parts)
    safe_title = "".join(c for c in title if c.isalnum() or c in " ").title().replace(" ", "")
    filename = f"{name_prefix}{safe_title}.docx"
    out_path = Path(output_folder) / filename
    doc.save(str(out_path))
    return out_path


# ── Minimal UI helpers ────────────────────────────────────────────────────────
def lbl(parent, text, bold=False, **kw):
    return tk.Label(parent, text=text,
                    font=("Segoe UI", 10, "bold" if bold else "normal"), **kw)

def entry(parent, textvariable=None, width=32):
    return tk.Entry(parent, textvariable=textvariable, width=width,
                    font=("Segoe UI", 10))

def dropdown(parent, values, textvariable=None, width=30):
    return ttk.Combobox(parent, values=values, textvariable=textvariable,
                        width=width, state="readonly", font=("Segoe UI", 10))

def btn(parent, text, command, **kw):
    return tk.Button(parent, text=text, command=command,
                     font=("Segoe UI", 10), padx=10, pady=4, **kw)

def hsep(parent):
    return ttk.Separator(parent, orient="horizontal")


# ── New Paper Window ──────────────────────────────────────────────────────────
class NewPaperWindow:
    def __init__(self, output_folder):
        self.output_folder = output_folder
        self.root = tk.Tk()
        self.root.title("PaperGen — New Paper")
        self.root.resizable(False, False)
        self._build()
        self._center()

    def _build(self):
        root = self.root

        lbl(root, "New Paper", bold=True).grid(
            row=0, column=0, columnspan=2, pady=(12, 0), padx=16, sticky="w")
        lbl(root, f"\u2192 {self.output_folder}", fg="gray").grid(
            row=1, column=0, columnspan=2, padx=16, sticky="w")
        hsep(root).grid(row=2, column=0, columnspan=2, sticky="ew", padx=16, pady=6)

        classes = load_classes()
        templates = list_templates()

        self.class_var = tk.StringVar()
        self.template_var = tk.StringVar()
        self.title_var = tk.StringVar()
        self.date_var = tk.StringVar(value=date.today().strftime("%B %d, %Y"))

        if not classes:
            messagebox.showwarning("No Classes",
                "No classes found. Add one via Manage Classes.", parent=root)
        if not templates:
            messagebox.showwarning("No Templates",
                f"No .docx templates found in:\n{TEMPLATES_DIR}", parent=root)

        class_labels = [f"{c['class_number']} \u2014 {c['class_name']}" for c in classes]
        self._classes = classes

        self._class_dropdown = dropdown(root, class_labels, self.class_var)
        fields = [
            ("Class", self._class_dropdown),
            ("Template / Style", dropdown(root, templates, self.template_var)),
            ("Paper Title", entry(root, self.title_var)),
            ("Due Date", entry(root, self.date_var)),
        ]

        for i, (label_text, widget) in enumerate(fields):
            lbl(root, label_text).grid(
                row=3+i*2, column=0, sticky="w", padx=16, pady=(8, 1))
            widget.grid(
                row=4+i*2, column=0, columnspan=2, sticky="ew", padx=16, pady=(0, 4))

        root.grid_columnconfigure(0, weight=1)

        if class_labels:
            self.class_var.set(class_labels[0])
        if templates:
            self.template_var.set(templates[0])

        r = 3 + len(fields) * 2
        hsep(root).grid(row=r, column=0, columnspan=2, sticky="ew", padx=16, pady=8)

        btns = tk.Frame(root)
        btns.grid(row=r+1, column=0, columnspan=2, padx=16, pady=(0, 12), sticky="ew")
        btn(btns, "Manage Classes", self._open_manage).pack(side="left")
        btn(btns, "Generate", self._generate).pack(side="right")

    def _center(self):
        self.root.update_idletasks()
        w, h = self.root.winfo_width(), self.root.winfo_height()
        sw, sh = self.root.winfo_screenwidth(), self.root.winfo_screenheight()
        self.root.geometry(f"{w}x{h}+{(sw-w)//2}+{(sh-h)//2}")

    def _open_manage(self):
        self.root.withdraw()
        ManageClassesWindow(on_close=self._on_manage_close)

    def _on_manage_close(self):
        self.root.deiconify()
        # Reload classes and update dropdown
        classes = load_classes()
        class_labels = [f"{c['class_number']} \u2014 {c['class_name']}" for c in classes]
        self._classes = classes
        self._class_dropdown["values"] = class_labels
        if class_labels:
            self.class_var.set(class_labels[0])
        else:
            self.class_var.set("")

    def _generate(self):
        classes = load_classes()
        class_labels = [f"{c['class_number']} \u2014 {c['class_name']}" for c in classes]

        if not self.class_var.get():
            messagebox.showerror("Error", "Select a class.", parent=self.root); return
        if not self.template_var.get():
            messagebox.showerror("Error", "Select a template.", parent=self.root); return
        if not self.title_var.get().strip():
            messagebox.showerror("Error", "Enter a paper title.", parent=self.root); return

        idx = class_labels.index(self.class_var.get())
        try:
            out = generate_paper(
                cls=classes[idx],
                template_name=self.template_var.get(),
                title=self.title_var.get().strip(),
                due_date=self.date_var.get().strip(),
                output_folder=self.output_folder,
            )
            messagebox.showinfo("Done", f"Created:\n{out.name}", parent=self.root)
            self.root.destroy()
        except Exception as e:
            messagebox.showerror("Error", str(e), parent=self.root)

    def run(self):
        self.root.mainloop()


# ── Manage Classes Window ─────────────────────────────────────────────────────
class ManageClassesWindow:
    def __init__(self, on_close=None):
        self.on_close = on_close
        self.root = tk.Toplevel() if on_close else tk.Tk()
        self.root.title("PaperGen \u2014 Manage Classes")
        self.root.resizable(False, False)
        self._build()
        self._center()
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

    def _build(self):
        root = self.root
        lbl(root, "Manage Classes", bold=True).pack(padx=16, pady=(12, 2), anchor="w")
        lbl(root, str(CLASSES_FILE), fg="gray").pack(padx=16, anchor="w")
        hsep(root).pack(fill="x", padx=16, pady=6)

        self.list_frame = tk.Frame(root)
        self.list_frame.pack(padx=16, fill="both")
        self._render_list()

        hsep(root).pack(fill="x", padx=16, pady=6)
        btns = tk.Frame(root)
        btns.pack(padx=16, pady=(0, 12), fill="x")
        btn(btns, "+ Add Class", self._add).pack(side="left")
        btn(btns, "Clear Semester", self._clear, fg="red").pack(side="right")

    def _render_list(self):
        for w in self.list_frame.winfo_children():
            w.destroy()
        classes = load_classes()
        if not classes:
            lbl(self.list_frame, "No classes yet.").pack(pady=8)
            return
        for i, cls in enumerate(classes):
            row = tk.Frame(self.list_frame)
            row.pack(fill="x", pady=2)
            info = tk.Frame(row)
            info.pack(side="left")
            lbl(info, f"{cls['class_number']} \u2014 {cls['class_name']}", bold=True).pack(anchor="w")
            lbl(info, f"{cls['professor_name']} \u00b7 {cls['school']}", fg="gray").pack(anchor="w")
            acts = tk.Frame(row)
            acts.pack(side="right")
            btn(acts, "Delete", lambda i=i: self._delete(i), fg="red").pack(side="right", padx=2)
            btn(acts, "Edit", lambda i=i: self._edit(i)).pack(side="right", padx=2)

    def _add(self):
        ClassFormDialog(self.root, on_save=self._on_save)

    def _edit(self, idx):
        ClassFormDialog(self.root, on_save=self._on_save, existing=load_classes()[idx], idx=idx)

    def _on_save(self, data, idx=None):
        classes = load_classes()
        if idx is None:
            classes.append(data)
        else:
            classes[idx] = data
        save_classes(classes)
        self._render_list()

    def _delete(self, idx):
        classes = load_classes()
        if messagebox.askyesno("Delete", f"Delete {classes[idx]['class_number']}?", parent=self.root):
            classes.pop(idx)
            save_classes(classes)
            self._render_list()

    def _clear(self):
        classes = load_classes()
        if not classes:
            messagebox.showinfo("Empty", "No classes to clear.", parent=self.root); return
        if messagebox.askyesno("Clear Semester", f"Delete all {len(classes)} class(es)?",
                               icon="warning", parent=self.root):
            save_classes([])
            self._render_list()

    def _center(self):
        self.root.update_idletasks()
        w, h = self.root.winfo_width(), self.root.winfo_height()
        sw, sh = self.root.winfo_screenwidth(), self.root.winfo_screenheight()
        self.root.geometry(f"{w}x{h}+{(sw-w)//2}+{(sh-h)//2}")

    def _on_close(self):
        if self.on_close:
            self.on_close()
        self.root.destroy()

    def run(self):
        self.root.mainloop()


# ── Class Form Dialog ─────────────────────────────────────────────────────────
class ClassFormDialog(tk.Toplevel):
    FIELDS = [
        ("your_name", "Your Name"),
        ("professor_name", "Professor Name"),
        ("class_name", "Class Name"),
        ("class_number", "Class Number"),
        ("school", "School / College"),
    ]

    def __init__(self, parent, on_save, existing=None, idx=None):
        super().__init__(parent)
        self.on_save = on_save
        self.idx = idx
        self.title("Edit Class" if existing else "Add Class")
        self.resizable(False, False)
        self.grab_set()

        self.vars = {k: tk.StringVar(value=existing.get(k, "") if existing else "")
                     for k, _ in self.FIELDS}

        lbl(self, "Edit Class" if existing else "Add Class", bold=True).pack(
            padx=16, pady=(12, 8), anchor="w")

        form = tk.Frame(self)
        form.pack(padx=16, fill="x")
        for i, (key, display) in enumerate(self.FIELDS):
            lbl(form, display).grid(row=i*2, column=0, sticky="w", pady=(6, 1))
            entry(form, self.vars[key]).grid(row=i*2+1, column=0, sticky="ew")

        hsep(self).pack(fill="x", padx=16, pady=10)
        btns = tk.Frame(self)
        btns.pack(padx=16, pady=(0, 12), fill="x")
        btn(btns, "Cancel", self.destroy).pack(side="left")
        btn(btns, "Save", self._save).pack(side="right")

        self.update_idletasks()
        w, h = self.winfo_width(), self.winfo_height()
        sw, sh = self.winfo_screenwidth(), self.winfo_screenheight()
        self.geometry(f"{w}x{h}+{(sw-w)//2}+{(sh-h)//2}")

    def _save(self):
        data = {k: v.get().strip() for k, v in self.vars.items()}
        if not data["class_name"] or not data["class_number"]:
            messagebox.showerror("Required", "Class name and number are required.", parent=self)
            return
        self.on_save(data, self.idx)
        self.destroy()


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] != "--manage":
        output_folder = sys.argv[1]
        if not os.path.isdir(output_folder):
            messagebox.showerror("Error", f"Invalid folder:\n{output_folder}")
            sys.exit(1)
        NewPaperWindow(output_folder).run()
    else:
        ManageClassesWindow().run()
```
# classes.json
```json
[
  {
    "your_name": "Jayson Dayson",
    "professor_name": "Professor Chesterton",
    "class_name": "Hat Chasing",
    "class_number": "RUN 402",
    "school": "School of Whiimsy"
  }
]
```
# install_context_menu.reg
>[!warning] Use your own applicable paths here!
```
Windows Registry Editor Version 5.00

; PaperGen - Right-click context menu for folders
; Double-click this file to install, then confirm the prompt.
; To uninstall, open regedit and delete:
;   HKEY_CLASSES_ROOT\Directory\Background\shell\PaperGen

[HKEY_CLASSES_ROOT\Directory\Background\shell\PaperGen]
@="New Paper from Template"
"Icon"="%SystemRoot%\\System32\\shell32.dll,1"

[HKEY_CLASSES_ROOT\Directory\Background\shell\PaperGen\command]
@="C:\\Python314\\pythonw.exe \"C:\\Users\\Your Actual Username\\AppData\\Roaming\\PaperGen\\papergen.py\" \"%V\""
```
