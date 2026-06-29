#!/usr/bin/env python3
"""
Deploy static sites to Surge.sh using pexpect for interactive auth.
Creates a Surge account on first run, then deploys the given folder to the given domain.
"""

import pexpect
import sys
import os

EMAIL = "arjunvashishtha2004@gmail.com"
PASSWORD = "Arjun@2026Portfolio"


def deploy_to_surge(folder, domain):
    print(f"\n{'='*60}")
    print(f"Deploying {folder} -> {domain}")
    print(f"{'='*60}")

    cmd = f"surge {folder} {domain}"
    child = pexpect.spawn(cmd, timeout=120, encoding="utf-8")
    child.logfile_read = sys.stdout

    try:
        while True:
            try:
                idx = child.expect(
                    [r"email:", r"password:", r"password \(required\):", r"domain:", r"project path:", pexpect.EOF],
                    timeout=30,
                )
                if idx == 0:
                    child.sendline(EMAIL)
                elif idx in (1, 2):
                    child.sendline(PASSWORD)
                elif idx == 3:
                    child.sendline(domain)
                elif idx == 4:
                    child.sendline(folder)
                elif idx == 5:
                    break
            except pexpect.exceptions.TIMEOUT:
                print("\nTimeout, sending newline...")
                child.sendline("")
                continue
    except Exception as e:
        print(f"\nError: {e}")
        return False

    print(f"\n{'='*60}")
    print(f"Deploy finished for {domain}")
    print(f"{'='*60}")
    return True


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python surge_deploy.py <folder> <domain>")
        sys.exit(1)

    folder = sys.argv[1]
    domain = sys.argv[2]

    if not os.path.isdir(folder):
        print(f"Folder not found: {folder}")
        sys.exit(1)

    success = deploy_to_surge(folder, domain)
    sys.exit(0 if success else 1)
