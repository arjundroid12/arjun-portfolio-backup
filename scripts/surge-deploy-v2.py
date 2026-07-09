#!/usr/bin/env python3
"""Drive surge login + deploy via pexpect (non-interactive)."""
import sys
import pexpect
import time

EMAIL = "arjunvashishtha2004@gmail.com"
PASSWORD = "ArjunPort2026!"
DOMAIN = "arjun-portfolio-2026.surge.sh"

# Step 1: Login (creates account if doesn't exist)
print("=" * 60)
print("[STEP 1] Logging in to surge.sh")
print("=" * 60)
child = pexpect.spawn("npx surge login", timeout=60, encoding="utf-8")
child.logfile_read = sys.stdout

step = 0
while step < 5:
    try:
        idx = child.expect(
            [
                r"[Ee]mail:",
                r"[Pp]assword:",
                r"[Tt]oken",
                r"[Ll]ogged in",
                r"[Ee]rror",
                pexpect.EOF,
                pexpect.TIMEOUT,
            ],
            timeout=30,
        )
    except Exception as e:
        print(f"\n[ERR] {e}")
        break

    if idx == 0:  # email
        child.sendline(EMAIL)
    elif idx == 1:  # password
        child.sendline(PASSWORD)
    elif idx == 2:  # token request (after password, surge outputs a token)
        # Read the token from the output and save it
        # Surge writes the token to ~/.surge/token automatically
        print("\n[OK] Got token response")
        child.sendline("")
    elif idx == 3:  # logged in
        print("\n[OK] Logged in!")
        break
    elif idx == 4:  # error
        print("\n[ERR] login error")
        break
    elif idx == 5:  # EOF
        print("\n[EOF] process exited")
        break
    elif idx == 6:  # timeout
        print("\n[TIMEOUT]")
        break
    step += 1

child.close()
print(f"\n[exit code] {child.exitstatus}")

# Check if token was saved
import os
token_path = os.path.expanduser("~/.surge/token")
if os.path.exists(token_path):
    print(f"[OK] Token saved at {token_path}")
else:
    print(f"[WARN] No token at {token_path}")
    # Try to read from auth.json
    auth_path = os.path.expanduser("~/.surge/account.json")
    if os.path.exists(auth_path):
        print(f"[INFO] Account file at {auth_path}")

# Step 2: Deploy
print("\n" + "=" * 60)
print("[STEP 2] Deploying to surge.sh")
print("=" * 60)
child = pexpect.spawn(
    f"npx surge /home/z/my-project/out {DOMAIN}",
    timeout=120,
    encoding="utf-8",
)
child.logfile_read = sys.stdout

step = 0
while step < 8:
    try:
        idx = child.expect(
            [
                r"[Ee]mail:",
                r"[Pp]assword:",
                r"project path",
                r"domain:",
                r"[Ss]uccess",
                r"[Dd]eployed",
                r"[Ee]rror",
                pexpect.EOF,
                pexpect.TIMEOUT,
            ],
            timeout=120,
        )
    except Exception as e:
        print(f"\n[ERR] {e}")
        break

    if idx == 0:  # email
        child.sendline(EMAIL)
    elif idx == 1:  # password
        child.sendline(PASSWORD)
    elif idx == 2:  # project path (already specified via argv)
        child.sendline("/home/z/my-project/out")
    elif idx == 3:  # domain
        child.sendline(DOMAIN)
    elif idx == 4 or idx == 5:  # success / deployed
        print("\n[OK] DEPLOYED!")
        break
    elif idx == 6:  # error
        print("\n[ERR] deploy error")
        break
    elif idx == 7:  # EOF
        print("\n[EOF] process exited")
        break
    elif idx == 8:  # timeout
        print("\n[TIMEOUT]")
        break
    step += 1

child.close()
print(f"\n[exit code] {child.exitstatus}")
print(f"\n[URL] https://{DOMAIN}")
