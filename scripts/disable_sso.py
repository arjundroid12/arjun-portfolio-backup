"""Disable Vercel SSO Protection on all projects (if any have it enabled)."""
import urllib.request
import json
import ssl

TOKEN = "VERCEL_TOKEN_PLACEHOLDER"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

# List all projects
req = urllib.request.Request("https://api.vercel.com/v9/projects?limit=100", headers=HEADERS)
data = json.loads(urllib.request.urlopen(req).read())
projects = data.get("projects", [])
print(f"Found {len(projects)} projects")

for p in projects:
    name = p["name"]
    # Check SSO protection
    sso = p.get("ssoProtection")
    if sso and sso.get("enabled"):
        print(f"  Disabling SSO on: {name}")
        body = json.dumps({"ssoProtection": {"enabled": False}}).encode()
        req = urllib.request.Request(f"https://api.vercel.com/v9/projects/{name}", data=body, headers=HEADERS, method="PATCH")
        try:
            urllib.request.urlopen(req).read()
            print(f"    OK")
        except Exception as e:
            print(f"    FAIL: {e}")
    else:
        pass  # SSO not enabled, skip
print("Done checking SSO.")
