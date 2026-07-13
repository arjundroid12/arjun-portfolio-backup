#!/usr/bin/env python3
"""
Test every project demo URL in the portfolio.
For each URL:
  - HTTP status (must be 200)
  - Title from HTML (must match expected project name)
  - SSO/Vercel login redirect (means project is broken)
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
    # (name, demo_url, expected_title_substring)
    ("AI Research Agent",    "https://ai-research-agent.vercel.app/",       "Research Agent"),
    ("SpellCaster",          "https://spellcaster.vercel.app",              "SpellCaster"),
    ("QUIRK",                "https://quirk-ten.vercel.app",                "QUIRK"),
    ("Realtime Chat",        "https://realtime-chat.vercel.app",            "Realtime chat"),
    ("Realtime Whiteboard",  "https://realtime-whiteboard-blush.vercel.app","Whiteboard"),
    ("Calculator",           "https://calculator-app.vercel.app",           "Calculator"),
    ("Notes App",            "https://notes-app.vercel.app",                "Notes"),
    ("Weather App",          "https://weather-app.vercel.app",              "Weather"),
    ("Kanban Todo",          "https://todo-drag-drop.vercel.app",           "Kanban"),
    ("Movie Explorer",       "https://movie-explorer.vercel.app",           "Movie"),
    ("Pomodoro Timer",       "https://pomodoro-timer.vercel.app",           "Pomodoro"),
    ("GitHub Search",        "https://github-user-search.vercel.app",       "GitHub"),
    ("URL Shortener",        "https://url-shortener-api.vercel.app",        "URL"),
    ("JWT Auth Demo",        "https://github.com/arjundroid12/jwt-auth-demo","jwt-auth"),
]

def fetch(url, timeout=12):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (link-checker)"})
    try:
        # Don't follow redirects automatically — we want to detect SSO redirect
        opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=CTX))
        resp = opener.open(req, timeout=timeout)
        return resp.status, resp.read().decode("utf-8", errors="replace")[:8000], resp.geturl()
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode("utf-8", errors="replace")[:2000]
        except Exception:
            body = ""
        return e.code, body, url
    except urllib.error.URLError as e:
        return 0, f"URLError: {e}", url
    except Exception as e:
        return -1, f"{type(e).__name__}: {e}", url

def get_title(html):
    m = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
    return m.group(1).strip() if m else "(no <title>)"

def is_sso_redirect(final_url, body):
    if "sso" in final_url.lower() and "vercel.com" in final_url.lower():
        return True
    if "okta-sign-in" in body.lower():
        return True
    if "Sign In" in body and "Vercel" in body and len(body) < 3000:
        return True
    return False

print(f"{'PROJECT':<22} {'STATUS':<8} {'SSO?':<6} {'TITLE':<40} {'VERDICT'}")
print("-" * 110)
results = []
for name, url, expected in PROJECTS:
    status, body, final_url = fetch(url)
    title = get_title(body) if body else "(empty)"
    sso = is_sso_redirect(final_url, body)
    title_ok = expected.lower() in title.lower() if title != "(no <title>)" and not sso else False
    if status == 200 and not sso and title_ok:
        verdict = "OK"
    elif status == 200 and not sso:
        verdict = "WRONG-TITLE"
    elif sso:
        verdict = "SSO-BLOCKED"
    elif status == 404:
        verdict = "404"
    else:
        verdict = f"FAIL({status})"
    print(f"{name:<22} {status:<8} {'YES' if sso else 'no':<6} {title[:38]:<40} {verdict}")
    results.append({"name": name, "url": url, "status": status, "title": title, "sso": sso, "verdict": verdict})

print("\n=== SUMMARY ===")
ok = sum(1 for r in results if r["verdict"] == "OK")
broken = [r for r in results if r["verdict"] != "OK"]
print(f"OK: {ok}/{len(results)}")
if broken:
    print(f"\nBROKEN ({len(broken)}):")
    for r in broken:
        print(f"  - {r['name']:<22} {r['url']}")
        print(f"    verdict={r['verdict']}, status={r['status']}, title='{r['title']}', sso={r['sso']}")
