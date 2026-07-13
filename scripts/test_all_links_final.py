#!/usr/bin/env python3
"""
Final comprehensive test of all portfolio project URLs.
Tests BOTH the pretty URL (project.vercel.app) AND the stable URL (project-arjundroid12s-projects.vercel.app).
Reports which one works for each project, so we can update the portfolio with the correct URL.
"""
import urllib.request
import urllib.error
import ssl
import re
import json

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

PROJECTS = [
    ("AI Research Agent",    "ai-research-agent",    "Research Agent"),
    ("SpellCaster",          "spellcaster",          "SpellCaster"),
    ("QUIRK",                "quirk-ten",            "QUIRK"),
    ("Realtime Chat",        "realtime-chat",        "Realtime Chat"),
    ("Realtime Whiteboard",  "realtime-whiteboard-blush", "Whiteboard"),
    ("Calculator",           "calculator-app",       "Calculator"),
    ("Notes App",            "notes-app",            "Notes"),
    ("Weather App",          "weather-app",          "Weather"),
    ("Kanban Todo",          "todo-drag-drop",       "Todo"),
    ("Movie Explorer",       "movie-explorer",       "Movie"),
    ("Pomodoro Timer",       "pomodoro-timer",       "Pomodoro"),
    ("GitHub Search",        "github-user-search",   "GitHub"),
    ("URL Shortener",        "url-shortener-api",    "URL"),
    ("JWT Auth Demo",        "jwt-auth-demo",        "JWT"),
    # Extra projects not in portfolio but in Vercel:
    ("AI Chatbot UI",        "ai-chatbot-ui",        "Chatbot"),
    ("Coding Agent",         "coding-agent",         "Coding"),
    ("Multi-Agent System",   "multi-agent-system",   "Agent"),
    ("Data Analyst Agent",   "data-analyst-agent",   "Analyst"),
    ("Markdown Blog",        "markdown-blog",        "Blog"),
    ("Expense Tracker",      "expense-tracker",      "Expense"),
    ("Portfolio Dashboard",  "portfolio-dashboard",  "Dashboard"),
    ("React Todo",           "react-todo",           "Todo"),
    ("Gesture Particle",     "gesture-particle-painter", "Gesture"),
    ("Gesture Volume",       "gesture-volume-mixer", "Gesture"),
]

def fetch(url, timeout=10):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (link-checker)"})
    try:
        opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=CTX))
        resp = opener.open(req, timeout=timeout)
        body = resp.read().decode("utf-8", errors="replace")[:8000]
        return resp.status, body, resp.geturl()
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode("utf-8", errors="replace")[:2000]
        except Exception:
            body = ""
        return e.code, body, url
    except Exception as e:
        return -1, f"{type(e).__name__}: {e}", url

def get_title(html):
    m = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
    return m.group(1).strip() if m else "(no title)"

def is_sso(body, final_url):
    if "vercel.com/login" in final_url or "sso" in final_url.lower():
        return True
    if "okta-sign-in" in body.lower() or "Login – Vercel" in body:
        return True
    return False

print(f"{'PROJECT':<22} {'PRETTY URL STATUS':<25} {'STABLE URL STATUS':<30} {'RECOMMENDED'}")
print("-" * 130)
results = []
for name, slug, expected in PROJECTS:
    pretty = f"https://{slug}.vercel.app"
    stable = f"https://{slug}-arjundroid12s-projects.vercel.app"

    # Test pretty
    p_status, p_body, p_final = fetch(pretty)
    p_title = get_title(p_body) if p_body else ""
    p_sso = is_sso(p_body, p_final)
    p_ok = (p_status == 200 and not p_sso and expected.lower() in p_title.lower())

    # Test stable
    s_status, s_body, s_final = fetch(stable)
    s_title = get_title(s_body) if s_body else ""
    s_sso = is_sso(s_body, s_final)
    s_ok = (s_status == 200 and not s_sso and expected.lower() in s_title.lower())

    if p_ok:
        rec = f"PRETTY: {pretty}"
        rec_url = pretty
    elif s_ok:
        rec = f"STABLE: {stable}"
        rec_url = stable
    elif p_status == 200 and not p_sso:
        rec = f"PRETTY (wrong title: {p_title[:30]})"
        rec_url = pretty
    elif s_status == 200 and not s_sso:
        rec = f"STABLE (wrong title: {s_title[:30]})"
        rec_url = stable
    else:
        rec = f"BROKEN (p={p_status} s={s_status})"
        rec_url = None

    print(f"{name:<22} {str(p_status)+' SSO' if p_sso else p_status:<25} {str(s_status)+' SSO' if s_sso else s_status:<30} {rec}")
    results.append((name, slug, rec_url, p_ok, s_ok, p_title, s_title))

print("\n=== SUMMARY ===")
ok_count = sum(1 for r in results if r[3] or r[4])
print(f"Working: {ok_count}/{len(results)}")
print()
print("URLs to use in portfolio:")
for name, slug, url, p_ok, s_ok, p_title, s_title in results:
    if url:
        print(f"  {name:<22} -> {url}")
    else:
        print(f"  {name:<22} -> BROKEN")

# Save mapping
out = {slug: url for name, slug, url, *_ in results if url}
with open("/home/z/my-project/scripts/final_urls.json", "w") as f:
    json.dump(out, f, indent=2)
print(f"\nSaved to /home/z/my-project/scripts/final_urls.json")
