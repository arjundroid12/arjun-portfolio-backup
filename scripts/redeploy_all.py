#!/usr/bin/env python3
"""
Re-deploy each project from its GitHub repo to its Vercel project.
After deploy, verify the stable URL <project>-arjundroid12s-projects.vercel.app works.
"""
import os
import subprocess
import json
import sys
import time
import urllib.request
import ssl
from pathlib import Path

TOKEN = "VERCEL_TOKEN_PLACEHOLDER"
REPOS_DIR = Path("/home/z/my-project/repos-check")
TEAM = "arjundroid12s-projects"

PROJECTS = [
    ("calculator-app",      "calculator-app"),
    ("weather-app",         "weather-app"),
    ("spellcaster",         "spellcaster"),
    ("todo-drag-drop",      "todo-drag-drop"),
    ("notes-app",           "notes-app"),
    ("pomodoro-timer",      "pomodoro-timer"),
    ("github-user-search",  "github-user-search"),
    ("movie-explorer",      "movie-explorer"),
    ("url-shortener-api",   "url-shortener-api"),
    ("jwt-auth-demo",       "jwt-auth-demo"),
    ("realtime-chat",       "realtime-chat"),
    ("realtime-whiteboard", "realtime-whiteboard"),
    ("ai-research-agent",   "ai-research-agent"),
    ("ai-chatbot-ui",       "ai-chatbot-ui"),
    ("coding-agent",        "coding-agent"),
    ("multi-agent-system",  "multi-agent-system"),
    ("data-analyst-agent",  "data-analyst-agent"),
    ("markdown-blog",       "markdown-blog"),
    ("expense-tracker",     "expense-tracker"),
    ("portfolio-dashboard", "portfolio-dashboard"),
    ("react-todo",          "react-todo"),
    ("gesture-particle-painter", "gesture-particle-painter"),
    ("gesture-volume-mixer","gesture-volume-mixer"),
]

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

def is_nextjs(repo_path):
    return (repo_path / "next.config.js").exists() or (repo_path / "next.config.ts").exists() or (repo_path / "next.config.mjs").exists()

def is_static_html(repo_path):
    return (repo_path / "index.html").exists() and not (repo_path / "package.json").exists()

def ensure_vercel_json_static(repo_path):
    vjson = repo_path / "vercel.json"
    if vjson.exists():
        try:
            cfg = json.loads(vjson.read_text())
        except Exception:
            cfg = {}
    else:
        cfg = {}
    if "framework" not in cfg:
        cfg["framework"] = None
        vjson.write_text(json.dumps(cfg, indent=2))
        return True
    return False

def deploy(project_name, repo_path):
    print(f"\n>>> {project_name}")
    is_nx = is_nextjs(repo_path)
    is_static = is_static_html(repo_path)
    if is_static:
        ensure_vercel_json_static(repo_path)
    cmd = ["vercel", "deploy", "--prod", "--yes", "--token", TOKEN, "--name", project_name, "--cwd", str(repo_path)]
    start = time.time()
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=240)
        elapsed = time.time() - start
        if result.returncode == 0:
            url = result.stdout.strip().split("\n")[-1]
            print(f"    OK ({elapsed:.1f}s): {url}")
            return url
        else:
            print(f"    FAIL ({elapsed:.1f}s)")
            print(f"    STDERR: {result.stderr[-300:]}")
            print(f"    STDOUT: {result.stdout[-300:]}")
            return None
    except subprocess.TimeoutExpired:
        print(f"    TIMEOUT (>240s)")
        return None
    except Exception as e:
        print(f"    ERROR: {e}")
        return None

def fetch_title(url, timeout=8):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=timeout, context=CTX)
        html = resp.read().decode("utf-8", errors="replace")[:8000]
        import re
        m = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
        return m.group(1).strip() if m else "(no title)"
    except Exception as e:
        return f"ERROR: {e}"

def main():
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    results = []
    for proj, repo in PROJECTS:
        if only and proj not in only:
            continue
        repo_path = REPOS_DIR / repo
        if not repo_path.exists():
            print(f"\n!!! Repo not cloned: {repo}")
            results.append((proj, "MISSING-REPO", None, None))
            continue
        deploy_url = deploy(proj, repo_path)
        stable_url = f"https://{proj}-{TEAM}.vercel.app"
        title = fetch_title(stable_url) if deploy_url else None
        results.append((proj, "OK" if deploy_url else "FAIL", stable_url, title))
        print(f"    Stable URL: {stable_url}")
        print(f"    Title: {title}")

    print("\n\n=== DEPLOYMENT SUMMARY ===")
    print(f"{'PROJECT':<28} {'STATUS':<8} {'TITLE':<35} URL")
    print("-" * 130)
    ok_count = 0
    for proj, status, url, title in results:
        marker = "✓" if status == "OK" else "✗"
        print(f"{marker} {proj:<26} {status:<8} {(title or '')[:33]:<35} {url or ''}")
        if status == "OK":
            ok_count += 1
    print(f"\n{ok_count}/{len(results)} deployed successfully")

    # Save stable URLs for portfolio update
    out = {proj: url for proj, status, url, title in results if status == "OK"}
    Path("/home/z/my-project/scripts/stable_urls.json").write_text(json.dumps(out, indent=2))
    print(f"\nStable URLs saved to /home/z/my-project/scripts/stable_urls.json")

if __name__ == "__main__":
    main()
