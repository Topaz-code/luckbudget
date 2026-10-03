# LOCKBUDGET — NAVIGATION FLOWS & PROTOTYPE TOPOLOGY

**Generated:** Phase 1 Discovery & Audit  
**Source of Truth:** `figma_scripter_clean.js`, `figma_scripter_v5.js`, `figma_plugin/code.js`, `lockbudget.penpot`

---

## 1. Master Navigation Architecture

The LockBudget application is organized into a **Root Shell** that handles initial authentication/onboarding state, routing into a persistent **4-Tab Navigation Shell**, with deep-linkable modal sub-flows for transactional interactions.

```mermaid
flowchart TD
    AppLaunch([App Launch]) --> AuthCheck{Is Onboarded?}
    
    AuthCheck -->|No| Flow_Onboarding[Flow 1: Onboarding & First Funding]
    AuthCheck -->|Yes| MainShell[Main Navigation Shell]
    
    Flow_Onboarding -->|Completed / Skipped| MainShell
    
    subgraph Persistent Bottom Navigation
        MainShell --> TabHome[Tab 1: Home Dashboard]
        MainShell --> TabSave[Tab 2: Savings Hub]
        MainShell --> TabBudget[Tab 3: Budget & Recap]
        MainShell --> TabActivity[Tab 4: Activity & History]
    end
    
    TabHome --> Flow_QuickSpend[Flow 2: Quick Spend Flow]
    TabHome --> Flow_Withdrawal[Flow 3: Withdrawal Flow]
    TabHome --> Flow_TopUp[Flow 5: Top-Up Inbound Transfer]
    TabHome --> Flow_Profile[Flow 8: Profile & Settings Drawer]
    
    TabSave --> Flow_SavingsLock[Flow 4: Savings Lock Setup & Top-Up]
    TabBudget --> Flow_Recap[Flow 6: Monthly Budget Recap]
    TabActivity --> Flow_TransactionDetail[Flow 7: Transaction Detail Drill-down]
    
    Flow_QuickSpend --> Flow_EdgeCases[Flow 9: Edge Cases & Failure States]
    Flow_SavingsLock --> Flow_EmergencyUnlock[Flow 9: Emergency Unlock]
```

---

## 2. Detailed Sub-Flows

### Flow 1: Onboarding & First Funding Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Intro as Group 4 (Intro)
    participant Budget as Group 3 (Budget Setup)
    participant Fund as first-funding-prompt 1
    participant Home as home-dashboard 1

    User->>Intro: Launches app for the first time
    User->>Intro: Views Otis Ledger & Value Props
    alt New User
        User->>Intro: Taps "Continue" or "Continue with Google"
        Intro->>Budget: Navigates via SMART_ANIMATE
        User->>Budget: Adjusts Income (₦50k) & Expense Sliders
        User->>Budget: Taps "Lock it in."
        Budget->>Fund: Navigates via SMART_ANIMATE
        User->>Fund: Views Virtual Bank Account (Wema Bank)
        alt Completes Transfer
            User->>Fund: Taps "I have made the transfer"
            Fund->>Home: Navigates to Home Dashboard
        else Funds Later
            User->>Fund: Taps "I will fund later"
            Fund->>Home: Navigates to Home Dashboard
        end
    else Returning User
        User->>Intro: Taps "Login"
        Intro->>Home: Navigates to Home Dashboard directly
    end
```

---

### Flow 2: Quick Spend Execution Flow
```mermaid
flowchart LR
    Home[home-dashboard 1] -->|Tap 'Spend' or Food Card| QS_Amount[quick-spend-amount 1]
    QS_Amount -->|Tap 'Review'| QS_Review[quick-spend-review 1]
    QS_Review -->|Tap 'Release'| QS_Proc[quick-spend-processing 1]
    QS_Review -->|Tap 'Back'| QS_Amount
    QS_Proc -->|Auto-advance 1.4s| QS_Receipt[quick-spend-receipt 1]
    QS_Receipt -->|Tap 'Done'| Home
    QS_Receipt -->|Tap 'Share'| ShareSheet[Native Share Intent]
```

---

### Flow 3: Bank Withdrawal Flow
```mermaid
flowchart LR
    Home[Home / Profile] -->|Select 'Withdraw'| W_Amount[withdrawal-amount 1]
    W_Amount -->|Enter Amount & Tap 'Review'| W_Review[withdrawal-review 1]
    W_Review -->|Confirm Details & Tap 'Withdraw'| W_Proc[withdrawal-processing 1]
    W_Review -->|Tap 'Back'| W_Amount
    W_Proc -->|Authorize Payout| W_Receipt[withdrawal-receipt 1]
    W_Receipt -->|Tap 'Done'| Home
```

---

### Flow 4: Savings Lock Setup & Management
```mermaid
flowchart TD
    SaveHome[save-home 1] -->|Tap 'Save for a year'| Setup_Year[save-year-setup 1]
    SaveHome -->|Tap 'Save till goal'| Setup_Goal[save-goal-setup 1]
    SaveHome -->|Tap 'Save for a period'| Setup_Period[save-period-setup 1]
    SaveHome -->|Tap active goal card| Detail_Goal[save-goal-detail 1]
    
    Setup_Year -->|Review| Rev_Year[save-year-review 1] -->|Confirm| Succ_Year[save-year-success 1] --> Rec_Year[save-year-receipt 1]
    Setup_Goal -->|Review| Rev_Goal[save-goal-review 1] -->|Confirm| Succ_Goal[save-goal-success 1] --> Rec_Goal[save-goal-receipt 1]
    Setup_Period -->|Review| Rev_Period[save-period-review 1] -->|Confirm| Succ_Period[save-period-success 1] --> Rec_Period[save-period-receipt 1]
    
    Detail_Goal -->|Tap 'Top up'| Topup_Goal[save-goal-topup 1]
    Topup_Goal --> Rev_Topup[save-goal-topup-review 1] --> Succ_Topup[save-goal-topup-success 1] --> Rec_Topup[save-goal-topup-receipt 1]
    
    Detail_Goal -->|Tap 'Break Lock'| Emergency_Warning[Emergency Penalty Warning]
```

---

### Flow 5: Top-Up Inbound Transfer Flow
```mermaid
flowchart TD
    Dashboard[home-dashboard 1] -->|Tap 'Top up' CTA| TopUpModal[top-up-account-details 1]
    TopUpModal -->|Tap 'Copy Account Number'| CopyAction[Copy to Clipboard + Toast Feedback]
    TopUpModal -->|Tap 'Done' / Close| Dashboard
    TopUpModal -->|Inbound Webhook Arrives| PushNotice[Push Notification: 'Transfer Received ₦25,000']
    PushNotice -->|User Taps| ActivityTopUp[activity-detail-topup 1]
```

---

### Flow 6: Budget & Monthly Recap Flow
```mermaid
flowchart LR
    TabBudget[budget 1] -->|Tap 'View recap' CTA| RecapScreen[budget-recap 1]
    TabBudget -->|Scroll Down| BudgetFull[budget--full 1]
    RecapScreen -->|Tap Month Selector| RecapArchive[recap_all 1]
    RecapScreen -->|Tap 'Back'| TabBudget
```

---

### Flow 7: Activity History & Transaction Drill-down
```mermaid
flowchart TD
    ActivityTab[activity 1] -->|Tap Food Item| DetailFood[activity-detail-food 1]
    ActivityTab -->|Tap Airtime/Internet| DetailNet[activity-detail-internet 1]
    ActivityTab -->|Tap Electricity| DetailElec[activity-detail-electricity 1]
    ActivityTab -->|Tap Savings Deposit| DetailSave[activity-detail-save 1]
    ActivityTab -->|Tap Inbound Transfer| DetailTopup[activity-detail-topup 1]
    ActivityTab -->|Tap Withdrawal| DetailWithdraw[activity-detail-withdrawal 1]
    
    DetailFood --> StatusDone[Status: DONE (Green)]
    DetailFood --> StatusPending[Status: PENDING (Amber) - activity-detail-pending 1]
    DetailFood --> StatusFailed[Status: FAILED (Red) - activity-detail-failed 1]
    DetailFood --> StatusSyncDelayed[Status: SYNC DELAYED - activity-detail-sync-delayed 1]
    
    StatusFailed --> FullRCA[activity-detail-failed--full 1]
    StatusSyncDelayed --> FullSync[activity-detail-sync-delayed--full 1]
```

---

### Flow 8: Profile, Settings, Security, & Support Flow
```mermaid
flowchart TD
    Dashboard[home-dashboard 1] -->|Tap Otis Avatar| ProfileWindow[profile-window 2]
    
    ProfileWindow -->|Personal Profile| UserProfile[user-profile 2 / user-profile--full 1]
    ProfileWindow -->|Personal Bank Account| BankAccounts[personal-bank-account 2]
    ProfileWindow -->|Security Settings| Security[security-settings 2]
    ProfileWindow -->|Notification Settings| Notifications[notification-settings 2]
    ProfileWindow -->|Help & Support| HelpSupport[help-support 2]
    ProfileWindow -->|General Settings| Settings[settings 2 / settings--full 1]
    ProfileWindow -->|Delete Account| DeleteConfirmation[delete-account-confirmation 2]
    ProfileWindow -->|Logout| IntroScreen[Group 4 (Intro Screen)]
    
    Security -->|Change PIN| PinResetFlow[PIN Reset via OTP Challenge]
    Security -->|Biometrics Toggle| BiometricsAuth[LocalAuth Challenge]
    HelpSupport -->|Live Chat| LiveChatModal[In-App Support Chat]
    HelpSupport -->|WhatsApp| ExternalWhatsApp[Launch WhatsApp URL]
```

---

### Flow 9: Failure, Offline, & Emergency Unlock Flows
```mermaid
flowchart TD
    Action[User Triggers Transaction] --> ConditionCheck{System Check}
    
    ConditionCheck -->|No Network| OfflineBanner[offline_all 1: Global Offline Banner]
    OfflineBanner --> QueueTx[Transaction Queued Locally]
    QueueTx --> Reconnect[Network Restored → Auto Sync]
    
    ConditionCheck -->|Insufficient Daily Allowance| FailAllowance[failure_states_all 1: Insufficient Funds]
    FailAllowance --> SuggestTopup[CTA: 'Top up Allowance']
    
    ConditionCheck -->|Bank Switch Timeout| FailTimeout[failure_states_all 1: Network Timeout]
    FailTimeout --> ReversalPending[Status: SYNC DELAYED / REVERSAL]
    
    ConditionCheck -->|Invalid PIN 3 Times| FailLockout[failure_states_all 1: Security Lockout 15m]
    
    UserRequestEmergency[User Requests Early Savings Access] --> EmergencyPrompt[emergency_all 1: Access Emergency Fund]
    EmergencyPrompt --> PenaltyWarning[Display 5% Early Break Penalty Notice]
    PenaltyWarning --> ConfirmEmergency[2FA PIN Challenge]
    ConfirmEmergency --> Disburse[Disburse Funds to Available Balance]
```
