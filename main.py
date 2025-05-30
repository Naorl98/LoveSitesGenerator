import tkinter as tk
from tkinter import filedialog, colorchooser, messagebox, ttk, scrolledtext
import shutil, os, zipfile, json
from PIL import Image, ImageDraw, ImageFont

TEMPLATES_PATH = "templates"
OUTPUT_PATH = "output"
EMOJI_FONT_PATH = os.path.join(TEMPLATES_PATH, "NotoColorEmoji.ttf")

EMOJI_LIST = [
    "❤️", "😍", "😘", "🥰", "😁", "😂", "😎", "🎉", "🎈", "🌟",
    "🤩", "🔥", "💋", "👑", "💎", "🎵", "💐", "🍫", "🎂", "🌈",
    "🐶", "🐱", "🦄", "🦊", "🐻", "🐼", "🦁", "🐸", "🍕", "🍔"
]

TITLE_FONTS = [
    "Segoe UI", "Noto Sans Hebrew", "Rubik", "Arial", "Tahoma",
    "David Libre", "Frank Ruhl Libre", "Assistant", "Verdana", "Times New Roman"
]

DEFAULT_FLOATING_MESSAGES = [
    "את מושלמת 💖", "אני אוהב אותך מלאאאאא 😘", "את החיים שלי ❤️",
    "נסקוש שלי 🥰", "זכיתי בך 💕", "כבר אמרתי שאני מאוהב קשות? 😍"
]

def emoji_to_favicon(emoji, out_path):
    size = (64, 64)
    img = Image.new('RGBA', size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype(EMOJI_FONT_PATH, 48)
    except Exception as e:
        print(f"Emoji font not found: {e}")
        font = ImageFont.load_default()
    try:
        bbox = font.getbbox(emoji)
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(((size[0] - w) / 2, (size[1] - h) / 2 - bbox[1]), emoji, font=font, fill=(0, 0, 0, 255))
    except Exception:
        draw.text((8, 8), emoji, font=font, fill=(0, 0, 0, 255))
    img.save(out_path, format='ICO')

def generate_site(data):
    if not os.path.exists(OUTPUT_PATH):
        os.makedirs(OUTPUT_PATH)
    safe_name = data['site_name'].replace(" ", "_")
    site_dir = os.path.join(OUTPUT_PATH, safe_name)
    if os.path.exists(site_dir):
        shutil.rmtree(site_dir)
    shutil.copytree(data['template_path'], site_dir)

    # הכנת שמות לתמונות הגלריה
    gallery_img_names = [f"user_{i+1}{os.path.splitext(img)[-1]}" for i, img in enumerate(data["gallery_images"])]

    # ---- index.html ----
    index_file = os.path.join(site_dir, "index.html")
    with open(index_file, "r", encoding="utf-8") as f:
        html = f.read()
    # החלפות ערכים ל-index.html
    html = html.replace("{{title}}", data["title"])
    html = html.replace("{{title_font}}", data["title_font"])
    html = html.replace("{{title_font_size}}", data["title_font_size"])
    html = html.replace("{{letter_text}}", data["letter_text"])
    html = html.replace("{{footer_text}}", data["footer_text"])
    html = html.replace("{{timer_date}}", data["timer_date"])
    html = html.replace("{{floating_messages_json}}", json.dumps(data["floating_messages"], ensure_ascii=False))
    html = html.replace("{{bucket}}", data["bucket"])
    html = html.replace("{{img_dir}}", data["img_dir"])
    html = html.replace("{{song_dir}}", data["song_dir"])
    html = html.replace("{{hero_bg}}", f'img/{os.path.basename(data["hero_bg"])}' if data["hero_bg"] else "")
    html = html.replace("{{emoji}}", data["emoji"])
    html = html.replace("{{emailjs_user_id}}", data["emailjs_user_id"])
    html = html.replace("{{emailjs_service_id}}", data["emailjs_service_id"])
    html = html.replace("{{emailjs_template_id}}", data["emailjs_template_id"])
    html = html.replace("{{email}}", data["email"])
    html = html.replace("{{name}}", data["name"])
    html = html.replace("{{replay_email}}", data["replay_email"])
    html = html.replace("{{email_message_text}}", data["email_message_text"])
    html = html.replace("{{site_name}}", data["site_name"])
    with open(index_file, "w", encoding="utf-8") as f:
        f.write(html)

    # ---- main.js ----
    js_file = os.path.join(site_dir, "js", "main.js")
    with open(js_file, "r", encoding="utf-8") as f:
        js = f.read()
    js = js.replace("{{BUCKET}}", data["bucket"])
    js = js.replace("{{IMG_DIR}}", data["img_dir"])
    js = js.replace("{{SONG_DIR}}", data["song_dir"])
    js = js.replace("{{GALLERY_IMAGES}}", json.dumps(gallery_img_names, ensure_ascii=False))
    js = js.replace("{{HERO_BG}}", f'"img/{os.path.basename(data["hero_bg"])}"' if data["hero_bg"] else '""')
    js = js.replace("{{EMOJI}}", data["emoji"])
    js = js.replace("{{EMAILJS_USER_ID}}", data["emailjs_user_id"])
    js = js.replace("{{EMAILJS_SERVICE_ID}}", data["emailjs_service_id"])
    js = js.replace("{{EMAILJS_TEMPLATE_ID}}", data["emailjs_template_id"])
    js = js.replace("{{TO_EMAIL}}", data["email"])
    js = js.replace("{{FROM_NAME}}", data["name"])
    js = js.replace("{{REPLY_EMAIL}}", data["replay_email"])
    js = js.replace("{{EMAIL_MSG_TEXT}}", data["email_message_text"])
    js = js.replace("{{SITE_TITLE}}", data["site_name"])
    js = js.replace("{{TIMER_DATE}}", data["timer_date"])
    with open(js_file, "w", encoding="utf-8") as f:
        f.write(js)

    # ---- main.css ----
    css_file = os.path.join(site_dir, "css", "main.css")
    with open(css_file, "r", encoding="utf-8") as f:
        css = f.read()
    css = css.replace('font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;',
                      f'font-family: "{data["font"]}", "Segoe UI", "Helvetica Neue", Arial, sans-serif;')
    with open(css_file, "w", encoding="utf-8") as f:
        f.write(css)

    # ---- gallery images ----
    img_dir = os.path.join(site_dir, "img")
    if not os.path.exists(img_dir):
        os.makedirs(img_dir)
    for i, img_path in enumerate(data['gallery_images']):
        shutil.copy(img_path, os.path.join(img_dir, f"user_{i+1}{os.path.splitext(img_path)[-1]}"))
    if data.get("hero_bg"):
        shutil.copy(data["hero_bg"], os.path.join(img_dir, os.path.basename(data["hero_bg"])))
    # ---- favicon ----
    favicon_path = os.path.join(site_dir, "favicon.ico")
    emoji_to_favicon(data['emoji'], favicon_path)

    # ---- ZIP ----
    zip_path = os.path.join(OUTPUT_PATH, safe_name + ".zip")
    zipf = zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED)
    for root, dirs, files in os.walk(site_dir):
        for file in files:
            zipf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), site_dir))
    zipf.close()
    return zip_path

class ColorPickerField(tk.Frame):
    def __init__(self, parent, label, default="#ffffff", **kwargs):
        super().__init__(parent, **kwargs)
        self.var = tk.StringVar(value=default)
        ttk.Label(self, text=label).pack(side="left", padx=(0, 8))
        self.entry = ttk.Entry(self, textvariable=self.var, width=10, justify="right")
        self.entry.pack(side="left")
        self.color_btn = tk.Button(self, bg=self.var.get(), width=3, relief="flat", command=self.pick_color)
        self.color_btn.pack(side="left", padx=6)
        self.var.trace_add('write', self.update_btn)
    def pick_color(self):
        color = colorchooser.askcolor(color=self.var.get())[1]
        if color:
            self.var.set(color)
    def update_btn(self, *_):
        self.color_btn.configure(bg=self.var.get())
    def get(self):
        return self.var.get()
    def set(self, value):
        self.var.set(value)

class SiteGeneratorUI:
    def __init__(self, root):
        root.title("❤️ Love Website Generator")
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('TButton', font=('Segoe UI', 11, 'bold'), padding=6)
        style.configure('TLabel', font=('Segoe UI', 11))
        style.configure('TEntry', font=('Segoe UI', 11))
        style.configure('TCombobox', font=('Segoe UI', 15))
        style.configure('TLabelframe', background="#f5f7fa")
        root.configure(bg="#f5f7fa")

        template_choices = [d for d in os.listdir(TEMPLATES_PATH) if os.path.isdir(os.path.join(TEMPLATES_PATH, d))]

        canvas = tk.Canvas(root, borderwidth=0, background="#f5f7fa", highlightthickness=0)
        vsb = tk.Scrollbar(root, orient="vertical", command=canvas.yview)
        canvas.configure(yscrollcommand=vsb.set)
        vsb.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)
        self.frame = tk.Frame(canvas, bg="#f5f7fa")
        self.frame_id = canvas.create_window((0, 0), window=self.frame, anchor="nw")
        self.frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        self.frame.bind('<Enter>', lambda e: self.frame.bind_all('<MouseWheel>', _on_mousewheel))
        self.frame.bind('<Leave>', lambda e: self.frame.unbind_all('<MouseWheel>'))

        self.data = {
            "site_name": "my_love_site",
            "title": "",
            "title_font": TITLE_FONTS[0],
            "title_font_size": "38",
            "font": "Segoe UI",
            "bg_color": "#fff5f0",
            "text_color": "#222222",
            "emoji": EMOJI_LIST[0],
            "letter_text": "",
            "footer_text": "נוצר ע״י אחד שאוהב אותך מלאאאאאא 🥰",
            "timer_date": "2025-03-06T14:26:00",
            "gallery_images": [],
            "template_path": os.path.join(TEMPLATES_PATH, template_choices[0]),
            "emailjs_user_id": "",
            "emailjs_service_id": "",
            "emailjs_template_id": "",
            "email": "",
            "name": "",
            "replay_email": "",
            "email_message_text": "I LOVE U! Sent automatically from my site. Date: {{date}}",
            "floating_messages": list(DEFAULT_FLOATING_MESSAGES),
            "bucket": "https://nessy-site.s3.eu-central-1.amazonaws.com",
            "img_dir": "img/",
            "song_dir": "songs/",
            "hero_bg": "",
        }

        # --- Site Info Frame ---
        site_frame = ttk.LabelFrame(self.frame, text="🌟 Website Info", padding=12)
        site_frame.pack(fill="x", padx=16, pady=(16, 10))

        ttk.Label(site_frame, text="Site Folder/ZIP Name:").grid(row=0, column=0, sticky="e", padx=2, pady=2)
        self.site_name_entry = ttk.Entry(site_frame, justify="right")
        self.site_name_entry.insert(0, "my_love_site")
        self.site_name_entry.grid(row=0, column=1, sticky="w", padx=2, pady=2)

        ttk.Label(site_frame, text="Main Title:").grid(row=1, column=0, sticky="e", padx=2, pady=2)
        self.title_entry = ttk.Entry(site_frame, justify="right")
        self.title_entry.grid(row=1, column=1, sticky="w", padx=2, pady=2)

        ttk.Label(site_frame, text="Title Font:").grid(row=2, column=0, sticky="e", padx=2, pady=2)
        self.title_font_var = tk.StringVar(value=TITLE_FONTS[0])
        self.title_font_combo = ttk.Combobox(site_frame, textvariable=self.title_font_var, values=TITLE_FONTS, state='readonly')
        self.title_font_combo.grid(row=2, column=1, sticky="w", padx=2, pady=2)

        ttk.Label(site_frame, text="Title Font Size:").grid(row=3, column=0, sticky="e", padx=2, pady=2)
        self.title_font_size_var = tk.StringVar(value="38")
        self.title_font_size_entry = ttk.Entry(site_frame, textvariable=self.title_font_size_var, width=6, justify="right")
        self.title_font_size_entry.grid(row=3, column=1, sticky="w", padx=2, pady=2)

        ttk.Label(site_frame, text="Main Font:").grid(row=4, column=0, sticky="e", padx=2, pady=2)
        self.font_entry = ttk.Entry(site_frame, justify="right")
        self.font_entry.insert(0, "Segoe UI")
        self.font_entry.grid(row=4, column=1, sticky="w", padx=2, pady=2)

        ttk.Label(site_frame, text="Choose Template:").grid(row=5, column=0, sticky="e", padx=2, pady=2)
        self.template_var = tk.StringVar(value=template_choices[0])
        self.template_combo = ttk.Combobox(site_frame, textvariable=self.template_var, values=template_choices, state='readonly')
        self.template_combo.grid(row=5, column=1, sticky="w", padx=2, pady=2)

        # S3/Bucket config
        ttk.Label(site_frame, text="AWS S3 Bucket URL:").grid(row=6, column=0, sticky="e", padx=2, pady=2)
        self.bucket_entry = ttk.Entry(site_frame, justify="right")
        self.bucket_entry.insert(0, "https://nessy-site.s3.eu-central-1.amazonaws.com")
        self.bucket_entry.grid(row=6, column=1, sticky="w", padx=2, pady=2)

        ttk.Label(site_frame, text="Images Directory (img/):").grid(row=7, column=0, sticky="e", padx=2, pady=2)
        self.img_dir_entry = ttk.Entry(site_frame, justify="right")
        self.img_dir_entry.insert(0, "img/")
        self.img_dir_entry.grid(row=7, column=1, sticky="w", padx=2, pady=2)

        ttk.Label(site_frame, text="Songs Directory (songs/):").grid(row=8, column=0, sticky="e", padx=2, pady=2)
        self.song_dir_entry = ttk.Entry(site_frame, justify="right")
        self.song_dir_entry.insert(0, "songs/")
        self.song_dir_entry.grid(row=8, column=1, sticky="w", padx=2, pady=2)

        # Hero BG
        ttk.Label(site_frame, text="Hero Background Image (optional):").grid(row=9, column=0, sticky="e", padx=2, pady=2)
        self.hero_bg_path = tk.StringVar()
        self.hero_bg_btn = ttk.Button(site_frame, text="Choose...", command=self.pick_hero_bg)
        self.hero_bg_btn.grid(row=9, column=1, sticky="w", padx=2, pady=2)
        self.hero_bg_label = ttk.Label(site_frame, textvariable=self.hero_bg_path)
        self.hero_bg_label.grid(row=10, column=1, sticky="w", padx=2, pady=2)

        color_frame = ttk.Frame(site_frame)
        color_frame.grid(row=11, column=0, columnspan=2, sticky="w", pady=2, padx=2)
        self.bg_color_picker = ColorPickerField(color_frame, "Background Color:", "#fff5f0")
        self.bg_color_picker.pack(side="left", padx=8, pady=2)
        self.text_color_picker = ColorPickerField(color_frame, "Text Color:", "#222222")
        self.text_color_picker.pack(side="left", padx=24, pady=2)

        ttk.Label(site_frame, text="Floating Emoji:").grid(row=12, column=0, sticky="e", padx=2, pady=2)
        self.emoji_var = tk.StringVar(value=EMOJI_LIST[0])
        self.emoji_combo = ttk.Combobox(site_frame, textvariable=self.emoji_var, values=EMOJI_LIST, width=7, state='readonly')
        self.emoji_combo.grid(row=12, column=1, sticky="w", padx=2, pady=2)

        # --- Gallery & BG image ---
        gallery_frame = ttk.LabelFrame(self.frame, text="🖼️ Gallery & Approved Image", padding=12)
        gallery_frame.pack(fill="x", padx=16, pady=10)
        ttk.Label(gallery_frame, text="Upload Gallery Images:").grid(row=0, column=0, sticky="e", padx=2, pady=2)
        self.img_btn = ttk.Button(gallery_frame, text="Choose Images", command=self.pick_imgs)
        self.img_btn.grid(row=0, column=1, sticky="w", padx=2, pady=2)

        # --- Love Letter & Footer ---
        letter_frame = ttk.LabelFrame(self.frame, text="💌 Love Letter & Footer", padding=12)
        letter_frame.pack(fill="x", padx=16, pady=10)
        ttk.Label(letter_frame, text="Love Letter Text:").grid(row=0, column=0, sticky="ne", padx=2, pady=2)
        self.letter_entry = scrolledtext.ScrolledText(letter_frame, height=4, font=("Segoe UI", 11), wrap="word")
        self.letter_entry.grid(row=0, column=1, sticky="we", padx=2, pady=2)
        self.letter_entry.insert("1.0", "")
        ttk.Label(letter_frame, text="Footer Text:").grid(row=1, column=0, sticky="e", padx=2, pady=2)
        self.footer_entry = ttk.Entry(letter_frame, justify="right")
        self.footer_entry.insert(0, "נוצר ע״י אחד שאוהב אותך מלאאאאאא 🥰")
        self.footer_entry.grid(row=1, column=1, sticky="w", padx=2, pady=2)

        # --- Timer & Floating Messages ---
        timer_frame = ttk.LabelFrame(self.frame, text="⏰ Timer & Floating Messages", padding=12)
        timer_frame.pack(fill="x", padx=16, pady=10)
        ttk.Label(timer_frame, text="Start Date (YYYY-MM-DDTHH:MM:SS):").grid(row=0, column=0, sticky="e", padx=2, pady=2)
        self.timer_entry = ttk.Entry(timer_frame, justify="right")
        self.timer_entry.insert(0, "2025-03-06T14:26:00")
        self.timer_entry.grid(row=0, column=1, sticky="w", padx=2, pady=2)

        ttk.Label(timer_frame, text="Floating Messages (1 per line):").grid(row=1, column=0, sticky="ne", padx=2, pady=2)
        self.floating_msgs_entry = scrolledtext.ScrolledText(timer_frame, height=4, font=("Segoe UI", 11), wrap="word")
        self.floating_msgs_entry.grid(row=1, column=1, sticky="we", padx=2, pady=2)
        self.floating_msgs_entry.insert("1.0", "\n".join(DEFAULT_FLOATING_MESSAGES))

        # --- EmailJS Integration ---
        email_frame = ttk.LabelFrame(self.frame, text="📧 EmailJS Settings", padding=12)
        email_frame.pack(fill="x", padx=16, pady=10)
        ttk.Label(email_frame, text="To Email:").grid(row=0, column=0, sticky="e", padx=2, pady=2)
        self.to_email_entry = ttk.Entry(email_frame, justify="right")
        self.to_email_entry.grid(row=0, column=1, sticky="w", padx=2, pady=2)
        ttk.Label(email_frame, text="From Name:").grid(row=1, column=0, sticky="e", padx=2, pady=2)
        self.from_name_entry = ttk.Entry(email_frame, justify="right")
        self.from_name_entry.grid(row=1, column=1, sticky="w", padx=2, pady=2)
        ttk.Label(email_frame, text="EmailJS Service ID:").grid(row=3, column=0, sticky="e", padx=2, pady=2)
        self.emailjs_service_id_entry = ttk.Entry(email_frame, justify="right")
        self.emailjs_service_id_entry.grid(row=3, column=1, sticky="w", padx=2, pady=2)
        ttk.Label(email_frame, text="EmailJS Template ID:").grid(row=4, column=0, sticky="e", padx=2, pady=2)
        self.emailjs_template_id_entry = ttk.Entry(email_frame, justify="right")
        self.emailjs_template_id_entry.grid(row=4, column=1, sticky="w", padx=2, pady=2)
        ttk.Label(email_frame, text="EmailJS User ID:").grid(row=5, column=0, sticky="e", padx=2, pady=2)
        self.emailjs_user_id_entry = ttk.Entry(email_frame, justify="right")
        self.emailjs_user_id_entry.grid(row=5, column=1, sticky="w", padx=2, pady=2)

        self.generate_btn = ttk.Button(self.frame, text="🚀 Generate Website!", command=self.generate)
        self.generate_btn.pack(pady=20)

    def pick_imgs(self):
        files = filedialog.askopenfilenames(filetypes=[("Images", "*.jpg *.png *.jpeg *.gif")])
        if files:
            self.data['gallery_images'] = files

    def pick_hero_bg(self):
        file = filedialog.askopenfilename(filetypes=[("Images", "*.jpg *.png *.jpeg *.gif")])
        if file:
            self.hero_bg_path.set(file)

    def generate(self):
        self.data["site_name"] = self.site_name_entry.get() or "my_love_site"
        self.data["title"] = self.title_entry.get()
        self.data["title_font"] = self.title_font_var.get()
        self.data["title_font_size"] = self.title_font_size_var.get()
        self.data["font"] = self.font_entry.get()
        self.data["emoji"] = self.emoji_var.get()
        self.data["bg_color"] = self.bg_color_picker.get()
        self.data["text_color"] = self.text_color_picker.get()
        self.data["template_path"] = os.path.join(TEMPLATES_PATH, self.template_var.get())
        self.data["letter_text"] = self.letter_entry.get("1.0", tk.END).strip()
        self.data["footer_text"] = self.footer_entry.get()
        self.data["timer_date"] = self.timer_entry.get()
        self.data["floating_messages"] = [msg.strip() for msg in self.floating_msgs_entry.get("1.0", tk.END).split("\n") if msg.strip()]
        self.data["emailjs_service_id"] = self.emailjs_service_id_entry.get()
        self.data["emailjs_template_id"] = self.emailjs_template_id_entry.get()
        self.data["emailjs_user_id"] = self.emailjs_user_id_entry.get()
        self.data["email"] = self.to_email_entry.get()
        self.data["name"] = self.from_name_entry.get()
        self.data["email_message_text"] = "I LOVE U! Sent automatically from my site. Date: {{date}}"
        self.data["bucket"] = self.bucket_entry.get()
        self.data["img_dir"] = self.img_dir_entry.get()
        self.data["song_dir"] = self.song_dir_entry.get()
        self.data["hero_bg"] = self.hero_bg_path.get()
        zip_path = generate_site(self.data)
        messagebox.showinfo("Website Ready!", f"Your love website was saved to:\n{zip_path}")

if __name__ == "__main__":
    root = tk.Tk()
    root.minsize(700, 1000)
    app = SiteGeneratorUI(root)
    root.mainloop()
