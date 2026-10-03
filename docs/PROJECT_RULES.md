# LockBudget — Project Rules (READ AT THE START OF EVERY BATCH)

These rules override anything you infer. If a rule conflicts with a task, stop and ask.

## 1. Scope and approvals
- Work only on the batch I have approved. Never start the next batch.
- Do not modify existing files until I approve a file-impact list for that batch.
- Never delete or modify files outside the Flutter work (Expo/Supabase code, remote docs, fonts the Expo app uses) without asking first.
- Do not change business logic, policy values, or architecture unless I explicitly say so in this conversation. If you think something is wrong, report it as a question. Do not fix it.
- Do not "improve" designs. Figma/Penpot and /home/topaz/Downloads/figma-export are the sources of truth. Allowed deviations: real text inputs, scroll safety, 48dp touch targets. List each one.

## 2. Business rules (provisional, single source: lib/core/config/policy_config.dart)
- All money is integer kobo. No floating-point Naira, no rounding loss. Any division remainder goes to the last day so totals are exact.
- Daily allowance rolls over automatically back to the account. It is not swept to the vault and it is not a user setting.
- 5% penalty applies only when force-withdrawing from fixed savings. Year locks are hard-locked for the first 90 days.
- Emergency Fund is its own vault: always unlockable, but deposited money is only touchable 48 hours after the deposit. Withdrawals do not go into today's allowance.
- Quick Spend "Release" is an instant internal ledger debit. External bank withdrawal only via the Withdrawal Flow.
- KYC Tier 1: ₦50,000 max top-up, ₦300,000 balance cap, ₦10,000 daily spend. Interest: 10.5% / 12% / 14% p.a.
- STATUS: the rollover, kobo, penalty and emergency-fund rules above are decided but NOT yet applied in code. Apply them only after I approve Batch 1, in a separate commit, after you list your open questions.

## 3. Honesty and verification
- Mark claims VERIFIED only with evidence I can see (a command output, a viewed image, a test result). Otherwise INFERRED or UNKNOWN.
- Never state numbers, timestamps, or counts you did not get from a command in this session.
- Explain a diff or failure only after checking the cause.
- Screen counts: show row by row. Count V1 drafts, --full variants, unique screens, and compound sub-states separately.

## 4. Safe working habits
- Run every script with `timeout 60`. Never write unbounded loops. Walk trees with a parent-to-children map and a visited set.
- Stage files explicitly. Never use `git add -A`. Do not commit generated renders, build output, or secrets.
- No force-push, rebase, or hard reset. Atomic commits with Conventional Commit messages.
- Run flutter analyze and flutter test before each push. Report real commit hashes.
- Never print or store tokens or credentials.

## 5. Report format
Phase/Batch, Completed (VERIFIED vs INFERRED), Deviations from Figma, Blockers and questions, Next steps, Inventory status. Then stop and wait for approval.
