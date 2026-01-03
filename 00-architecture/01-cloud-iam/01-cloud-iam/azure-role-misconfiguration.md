# Azure IAM Role Misconfiguration Lab

## Scenario
A non-privileged user was assigned an elevated Azure role as part of routine access provisioning.

## Misconfiguration
Role assigned: <USER ADMIN>
Scope: <Azure Subscription / Resource Group C>

## Risk Analysis
- Privilege escalation potential: User can reset admin password
- Lateral movement possibilities: If a user can reset an admin password, then they can gain access by resetting the password and gaining access
- Impact on confidentiality, integrity, availability: Admin account compromise, DDoS, Ransomware attack.

## Attack Scenario
If compromised, this identity could:
- Could cause business disruption.
- Unauthorized access to trading secrets

## Remediation
- Remove standing privileges
- Use least privilege role
- Enforce PIM / just-in-time access
- Periodic access reviews

## Engineer Notes
This issue should be prevented through role governance, automation, and policy enforcement.
