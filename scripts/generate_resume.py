#!/usr/bin/env python3
"""
Generate Arjun's updated resume PDF with all projects from the portfolio + GitHub.
ATS-friendly single-column format.
"""
import sys, os
sys.path.insert(0, '/home/z/my-project/skills/pdf/scripts')

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Font Registration ──
pdfmetrics.registerFont(TTFont('FreeSerif', '/usr/share/fonts/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', '/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', '/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', '/usr/share/fonts/truetype/freefont/FreeSerifBoldItalic.ttf'))
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold', italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')

# ── Colors ──
ACCENT = colors.HexColor('#1a1a2e')       # Dark navy for headings
TEXT_MUTED = colors.HexColor('#555555')    # Muted gray for meta text
TEXT_BODY = colors.HexColor('#222222')     # Near-black for body

# ── Styles ──
name_style = ParagraphStyle(
    'ResumeName', fontName='FreeSerif-Bold', fontSize=22,
    leading=26, alignment=TA_CENTER, spaceAfter=2,
    textColor=ACCENT
)
title_style = ParagraphStyle(
    'ResumeTitle', fontName='FreeSerif', fontSize=11,
    leading=14, alignment=TA_CENTER, spaceAfter=2,
    textColor=TEXT_MUTED
)
contact_style = ParagraphStyle(
    'ResumeContact', fontName='FreeSerif', fontSize=9.5,
    leading=13, alignment=TA_CENTER, textColor=TEXT_MUTED,
    spaceAfter=6
)
section_title_style = ParagraphStyle(
    'ResumeSectionTitle', fontName='FreeSerif-Bold', fontSize=12,
    leading=15, spaceBefore=8, spaceAfter=3,
    textColor=ACCENT
)
job_title_style = ParagraphStyle(
    'ResumeJobTitle', fontName='FreeSerif-Bold', fontSize=10.5,
    leading=13, spaceAfter=1
)
job_meta_style = ParagraphStyle(
    'ResumeJobMeta', fontName='FreeSerif-Italic', fontSize=9.5,
    leading=12, textColor=TEXT_MUTED, spaceAfter=3
)
bullet_style = ParagraphStyle(
    'ResumeBullet', fontName='FreeSerif', fontSize=9.5,
    leading=13, leftIndent=14, bulletIndent=0,
    spaceBefore=0.5, spaceAfter=0.5
)
body_style = ParagraphStyle(
    'ResumeBody', fontName='FreeSerif', fontSize=9.5,
    leading=13, spaceAfter=2, alignment=TA_JUSTIFY
)
project_style = ParagraphStyle(
    'ResumeProject', fontName='FreeSerif-Bold', fontSize=10,
    leading=13, spaceBefore=3, spaceAfter=1
)
project_tech_style = ParagraphStyle(
    'ResumeProjectTech', fontName='FreeSerif-Italic', fontSize=9,
    leading=12, textColor=TEXT_MUTED, spaceAfter=1
)

# ── Helpers ──
def section_header(title):
    return [
        Paragraph(f'<b>{title.upper()}</b>', section_title_style),
        HRFlowable(width='100%', thickness=0.8, color=ACCENT,
                    spaceBefore=0, spaceAfter=5),
    ]

def project_entry(name, desc, tech, link=None):
    elements = [Paragraph(f'<b>{name}</b>', project_style)]
    elements.append(Paragraph(desc, body_style))
    elements.append(Paragraph(f'<i>Tech: {tech}</i>', project_tech_style))
    if link:
        elements.append(Paragraph(f'<font color="#555555">{link}</font>', project_tech_style))
    elements.append(Spacer(1, 2))
    return elements

# ── Build Document ──
output_path = '/home/z/my-project/download/Arjun_Vashishtha_Resume.pdf'
os.makedirs('/home/z/my-project/download', exist_ok=True)

doc = SimpleDocTemplate(
    output_path, pagesize=A4,
    leftMargin=1.5*cm, rightMargin=1.5*cm,
    topMargin=1.3*cm, bottomMargin=1.3*cm,
    title='Resume - Arjun Vashishtha',
    author='Arjun Vashishtha', creator='Arjun Vashishtha'
)

story = []

# ── Header ──
story.append(Paragraph('<b>ARJUN VASHISHTHA</b>', name_style))
story.append(Paragraph('Software Management &amp; Marketing &bull; Data Science &bull; AI Builder', title_style))
story.append(Paragraph(
    '+91 9105459616 &nbsp;|&nbsp; arjunvashishtha2004@gmail.com &nbsp;|&nbsp; Bhopal, India &nbsp;|&nbsp; '
    '<font color="#1a1a2e">github.com/arjundroid12</font> &nbsp;|&nbsp; <font color="#1a1a2e">arjun-portfolio-emc.pages.dev</font>',
    contact_style
))

# ── Summary ──
story.extend(section_header('Professional Summary'))
story.append(Paragraph(
    'Fourth-year B.Tech CSE student at VIT Bhopal, currently working in Software Management &amp; Marketing at Techify Inc. '
    'Bridges product, data, and growth — coordinating software projects, building websites and applications with AI and no-code tools, '
    'and driving marketing through UGC content and paid social campaigns. Strong foundation in Python, machine learning, and data '
    'analytics, with hands-on experience building autonomous AI agents, full-stack web applications, and data-driven solutions. '
    'Passionate about shipping practical products that solve real problems.',
    body_style
))

# ── Experience ──
story.extend(section_header('Experience'))
story.append(Paragraph('<b>Software Management &amp; Marketing</b>', job_title_style))
story.append(Paragraph('Techify Inc. &nbsp;|&nbsp; Nov 2025 – Present &nbsp;|&nbsp; Bhopal, India', job_meta_style))
story.append(Paragraph('• <i>Intern (Nov 2025 – Feb 2026) → Full-time (Mar 2026 – Present)</i>', bullet_style))
story.append(Paragraph('• Manage software projects end-to-end, coordinating development priorities and delivery timelines across the team.', bullet_style))
story.append(Paragraph('• Build and launch websites and applications using AI and no-code platforms, turning ideas into working products quickly.', bullet_style))
story.append(Paragraph('• Plan and run marketing campaigns across Instagram, Facebook, and Google Ads to drive reach and engagement.', bullet_style))
story.append(Paragraph('• Create UGC content and produce/edit video to support brand and product marketing initiatives.', bullet_style))

# ── Projects (highlighted) ──
story.extend(section_header('Key Projects'))
story.append(Paragraph(
    '12+ projects built across AI/ML, full-stack, frontend, and backend. '
    'Live demos and source code available on GitHub. Selected highlights:',
    body_style
))

story.extend(project_entry(
    'Dungeon Portfolio (This Website)',
    'Premium dungeon/RPG-themed portfolio with 8-layer parallax cave backgrounds, animated King character with click-triggered '
    'attack sequences, Goddess NPC with 40+ topic knowledge base, achievement system (10 unlockables), screen shake effects, '
    'ambient castle music, treasure chest loot system, RPG-style project cards with rarity borders, and animated pixel-art '
    'animals across all sections. Built with Next.js 16, Framer Motion, Lenis smooth scroll, and Web Audio API. Deployed on Cloudflare Pages.',
    'Next.js 16, TypeScript, Tailwind CSS 4, Framer Motion, Lenis, Web Audio API, Cloudflare Pages',
    'arjun-portfolio-emc.pages.dev'
))

story.extend(project_entry(
    'SmartAgro — AI Plant Disease Detection',
    'AI system that helps farmers detect plant diseases and get remedies from image or text input. Uses CNN/Random Forest '
    'for image classification and NLP for remedy queries, with a web interface and recent-query history.',
    'Python, CNN, Random Forest, NLP, Web Interface',
    'github.com/arjundroid12/SmartAgro-A-disease-detection-model-with-Human-Interaction'
))

story.extend(project_entry(
    'FIOLA — AI Voice Assistant',
    'Custom voice assistant built with LLMs and Python for speech recognition and task automation. Handles natural language '
    'commands and executes tasks autonomously.',
    'Python, LLM, Speech Recognition'
))

story.extend(project_entry(
    'AI Agents Suite (4 Agents)',
    'Built four autonomous AI agents: (1) Research Agent using the ReAct pattern for autonomous reasoning, (2) Multi-Agent '
    'System where 3 AIs collaborate to solve problems, (3) Data Analyst Agent that writes and executes Python in-browser '
    'via Pyodide, (4) Coding Agent — a mini v0.dev that generates HTML/CSS/JS from natural language descriptions.',
    'Next.js, Cerebras, Pyodide, ReAct Pattern, Multi-Agent Systems'
))

story.extend(project_entry(
    'Gesture Particle Painter & Gesture Volume Mixer',
    'Two MediaPipe Hands projects: a gesture-controlled particle painter (paint with hand movements, mouse fallback) and a '
    'volume mixer controlled by hand height, pinch-to-mute, and two-hand dual-channel control.',
    'MediaPipe Hands, Web Audio API, Canvas API, JavaScript'
))

story.extend(project_entry(
    'Realtime Chat & Realtime Whiteboard',
    'Multi-user real-time applications built with Socket.io: a multi-room chat with typing indicators and online user list, '
    'and a collaborative whiteboard with shared canvas, colors, brush sizes, and undo functionality.',
    'Node.js, Express, Socket.io, WebSockets, Canvas API',
    'github.com/arjundroid12/realtime-chat'
))

story.extend(project_entry(
    'JWT Auth Demo & URL Shortener API',
    'Production-style backend projects: JWT authentication with bcrypt password hashing, refresh tokens, and token rotation; '
    'REST API for URL shortening with click analytics, custom aliases, and expiry support.',
    'Node.js, Express, JWT, bcrypt, LowDB',
    'github.com/arjundroid12/jwt-auth-demo'
))

story.extend(project_entry(
    'Frontend App Suite (6 Apps)',
    'Six vanilla JS applications with live demos: Calculator (custom expression parser), Notes App (custom markdown parser, '
    'tags, search), Weather App (Open-Meteo API, 5-day forecast), Kanban Todo (drag &amp; drop), Movie Explorer (search, '
    'filters, favorites), Pomodoro Timer (stats charts, notifications). All deployed on surge.sh.',
    'Vanilla JavaScript, HTML5, CSS3, localStorage, Chart.js, various APIs',
    'github.com/arjundroid12 (see repos)'
))

# ── Core Skills ──
story.extend(section_header('Core Skills'))
story.append(Paragraph('<b>Data Science &amp; Machine Learning:</b> &nbsp;Python (Pandas, NumPy, scikit-learn), CNN, Random Forest, NLP, exploratory data analysis, model building &amp; evaluation', body_style))
story.append(Paragraph('<b>AI Engineering:</b> &nbsp;Cerebras, OpenAI API, ReAct Pattern, Multi-Agent Systems, Pyodide, LLM integration', body_style))
story.append(Paragraph('<b>Web Development:</b> &nbsp;JavaScript, TypeScript, React, Next.js 16, Node.js, Express, Tailwind CSS, Framer Motion, Three.js', body_style))
story.append(Paragraph('<b>Data &amp; Analytics:</b> &nbsp;Power BI, MySQL, Excel, data cleaning &amp; preprocessing, data visualization', body_style))
story.append(Paragraph('<b>Software &amp; Product:</b> &nbsp;Project coordination, AI website building, no-code app development, REST API design', body_style))
story.append(Paragraph('<b>Marketing &amp; Content:</b> &nbsp;UGC content creation, social media advertising (Instagram, Facebook, Google Ads), video editing &amp; videography', body_style))
story.append(Paragraph('<b>Tools &amp; Platforms:</b> &nbsp;Git, GitHub Actions, Vercel, Render, Cloudflare Pages, Three.js, MediaPipe, Web Audio API', body_style))

# ── Education ──
story.extend(section_header('Education'))
story.append(Paragraph('<b>B.Tech in Computer Science &amp; Engineering</b>', job_title_style))
story.append(Paragraph('VIT Bhopal University, Bhopal &nbsp;|&nbsp; 2023 – 2027 &nbsp;|&nbsp; Fourth Year (Undergraduate)', job_meta_style))

# ── Interests ──
story.extend(section_header('Interests'))
story.append(Paragraph(
    'Music (vocalist &amp; flutist), videography, content creation, social media, and game development. '
    'Active GitHub contributor with daily coding challenges auto-committed via GitHub Actions.',
    body_style
))

# ── Build ──
doc.build(story)
print(f"Resume generated: {output_path}")
print(f"File size: {os.path.getsize(output_path)} bytes")
