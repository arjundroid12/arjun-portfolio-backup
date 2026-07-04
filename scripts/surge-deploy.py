#!/usr/bin/env python3
"""Non-interactive surge.sh deploy using pexpect."""
import sys
import pexpect

DOMAIN = "arjun-portfolio-2026.surge.sh"
EMAIL = "arjunvashishtha2004@gmail.com"
PASSWORD = "ArjunPort2026!"

cmd = f"npx surge out {DOMAIN}"
child = pexpect.spawn(cmd, timeout=120, encoding="utf-8")
child.logfile_read = sys.stdout

while True:
    try:
        idx = child.expect(
            [
                r"[Ee]mail:",
                r"[Pp]assword:",
                r"project path",
                r"domain:",
                r"[Ss]uccess",
                r"[Ee]rror",
                r"Deployed",
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
    elif idx == 2:  # project path (already set via argv)
        child.sendline("")
    elif idx == 3:  # domain
        child.sendline(DOMAIN)
    elif idx == 4 or idx == 6:  # success / deployed
        print("\n[OK] DEPLOYED")
        break
    elif idx == 5:  # error
        print("\n[ERR] surge reported error")
        break
    elif idx == 7:  # EOF
        print("\n[EOF] process exited")
        break
    elif idx == 8:  # timeout
        print("\n[TIMEOUT]")
        break

child.close()
print(f"\n[exit code] {child.exitstatus}")
