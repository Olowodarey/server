# Stacks Academy Smart Contracts Analysis & Recommendations

## Current State

### Existing Infrastructure

**Backend Configuration:**
- Certificate contract address configured in `.env`
- Stacks network: Testnet
- Admin private key for contract interactions
- NFT minting service (stub implementation)

**Database Entities:**
- `certificates`: Tracks NFT certificate minting
- `gallery_projects`: User project submissions
- `project_votes`: Community voting on projects
- `user_progress`: Course completion tracking
- `xp_events`: XP earning history

**Modules Ready for Blockchain:**
1. ✅ Certificates module (partial - needs contract)
2. ✅ Gallery module (ready for on-chain features)
3. ✅ Gamification module (ready for token rewards)

## Recommended Smart Contracts

### 1. Certificate NFT Contract (SIP-009) - PRIORITY 1

**Purpose:** Issue verifiable, non-transferable certificates for course completion

**Contract Name:** `stacks-academy-certificates`

**Key Features:**
```clarity
;; SIP-009 NFT for course completion certificates
;; Non-transferable (soulbound) to prevent selling credentials

(define-non-fungible-token certificate uint)

(define-data-var last-token-id uint u0)

;; Certificate metadata
(define-map certificate-data
  { token-id: uint }
  {
    recipient: principal,
    module-id: uint,
    score: uint,
    completion-date: uint,
    metadata-uri: (string-ascii 256)
  }
)

;; Mint certificate (admin only)
(define-public (mint-certificate 
  (recipient principal)
  (module-id uint)
  (score uint)
  (metadata-uri (string-ascii 256)))
  ;; Implementation
)

;; Get certificate details
(define-read-only (get-certificate-data (token-id uint))
  ;; Return certificate info
)

;; Check if user has certificate for module
(define-read-only (has-module-certificate 
  (user principal)
  (module-id uint))
  ;; Return bool
)

;; Override transfer to make soulbound
(define-public (transfer ...)
  (err u403) ;; Certificates cannot be transferred
)
```

**Why Non-Transferable:**
- Prevents credential fraud
- Maintains academic integrity
- Certificates tied to actual learner

**Metadata Structure:**
```json
{
  "name": "Stacks Academy - Bitcoin Fundamentals",
  "description": "Completed Bitcoin Fundamentals course with 95% score",
  "image": "ipfs://QmXxx.../certificate-1.png",
  "attributes": [
    {"trait_type": "Module", "value": "Bitcoin Fundamentals"},
    {"trait_type": "Score", "value": 95},
    {"trait_type": "Completion Date", "value": "2024-03-19"},
    {"trait_type": "Level", "value": 5},
    {"trait_type": "XP Earned", "value": 1500}
  ]
}
```

### 2. Achievement Badge Contract (SIP-009) - PRIORITY 2

**Purpose:** Award special badges for milestones and achievements

**Contract Name:** `stacks-academy-badges`

**Key Features:**
```clarity
;; Multiple badge types as separate NFT collections
;; Transferable for showcasing

(define-non-fungible-token achievement-badge uint)

;; Badge types
(define-constant BADGE-FIRST-QUIZ u1)
(define-constant BADGE-PERFECT-SCORE u2)
(define-constant BADGE-STREAK-7 u3)
(define-constant BADGE-STREAK-30 u4)
(define-constant BADGE-LEVEL-5 u5)
(define-constant BADGE-LEVEL-10 u6)
(define-constant BADGE-FIRST-CONTRACT u7)
(define-constant BADGE-GALLERY-SUBMIT u8)

(define-map badge-metadata
  { badge-type: uint }
  {
    name: (string-ascii 50),
    description: (string-ascii 200),
    image-uri: (string-ascii 256),
    max-supply: (optional uint)
  }
)

;; Track user badges
(define-map user-badges
  { user: principal, badge-type: uint }
  { token-id: uint, earned-at: uint }
)

;; Mint badge (admin only)
(define-public (mint-badge
  (recipient principal)
  (badge-type uint))
  ;; Check if already earned
  ;; Mint NFT
  ;; Record in user-badges
)

;; Check if user has badge
(define-read-only (has-badge
  (user principal)
  (badge-type uint))
  ;; Return bool
)

;; Get all user badges
(define-read-only (get-user-badges (user principal))
  ;; Return list of badge types
)
```

**Badge Types:**
- 🎯 First Quiz Completed
- 💯 Perfect Score
- 🔥 7-Day Streak
- 🔥 30-Day Streak  
- ⭐ Level 5 Reached
- 🏆 Level 10 Reached
- 📝 First Contract Deployed
- 🎨 Gallery Submission
- 🤝 Community Helper (voted on 10 projects)
- 🎓 Course Master (completed all modules)

### 3. Reputation Token (FT) - PRIORITY 3

**Purpose:** Fungible token for reputation and governance

**Contract Name:** `stacks-academy-reputation`

**Key Features:**
```clarity
;; SIP-010 Fungible Token for reputation
;; Non-transferable to prevent gaming the system

(define-fungible-token reputation-token)

;; Reputation balance (read-only, managed by contract)
(define-map reputation-balance
  { user: principal }
  { amount: uint, last-updated: uint }
)

;; Award reputation (admin only)
(define-public (award-reputation
  (recipient principal)
  (amount uint)
  (reason (string-ascii 100)))
  ;; Mint tokens
  ;; Update balance
  ;; Emit event
)

;; Burn reputation (for penalties)
(define-public (burn-reputation
  (user principal)
  (amount uint)
  (reason (string-ascii 100)))
  ;; Only admin
  ;; Burn tokens
)

;; Get reputation score
(define-read-only (get-reputation (user principal))
  ;; Return balance
)

;; Override transfer to make non-transferable
(define-public (transfer ...)
  (err u403) ;; Reputation cannot be transferred
)
```

**Reputation Sources:**
- Complete quiz: +10 REP
- Perfect score: +25 REP
- Complete module: +100 REP
- Gallery submission: +50 REP
- Project upvoted: +5 REP per vote
- Help others (future): +20 REP
- Maintain streak: +5 REP per day

**Use Cases:**
- Leaderboard rankings
- Unlock special features
- Governance voting weight (future)
- Access to exclusive content

### 4. Project Registry Contract - PRIORITY 4

**Purpose:** On-chain registry of verified student projects

**Contract Name:** `stacks-academy-projects`

**Key Features:**
```clarity
;; Registry of verified student projects
;; Links to deployed contracts and repos

(define-map projects
  { project-id: uint }
  {
    creator: principal,
    title: (string-ascii 100),
    category: (string-ascii 20),
    contract-address: (optional principal),
    repo-url: (string-ascii 256),
    submission-date: uint,
    verified: bool,
    vote-count: uint
  }
)

(define-data-var last-project-id uint u0)

;; Submit project
(define-public (submit-project
  (title (string-ascii 100))
  (category (string-ascii 20))
  (contract-address (optional principal))
  (repo-url (string-ascii 256)))
  ;; Create project entry
  ;; Emit event
)

;; Verify project (admin only)
(define-public (verify-project (project-id uint))
  ;; Mark as verified
  ;; Award reputation
)

;; Vote on project
(define-public (vote-project (project-id uint))
  ;; Check not already voted
  ;; Increment vote count
  ;; Award reputation to creator
)

;; Get project details
(define-read-only (get-project (project-id uint))
  ;; Return project data
)
```

**Benefits:**
- Permanent record of student work
- Verifiable portfolio
- Community validation
- Reputation building

### 5. Staking/Rewards Contract - FUTURE

**Purpose:** Stake STX to earn learning rewards

**Contract Name:** `stacks-academy-staking`

**Concept:**
```clarity
;; Stake STX to unlock premium features
;; Earn rewards for consistent learning

(define-map stakes
  { user: principal }
  {
    amount: uint,
    staked-at: uint,
    unlock-at: uint,
    rewards-earned: uint
  }
)

;; Stake STX
(define-public (stake-stx (amount uint) (lock-period uint))
  ;; Transfer STX to contract
  ;; Record stake
  ;; Unlock premium features
)

;; Claim rewards
(define-public (claim-rewards)
  ;; Calculate rewards based on:
  ;; - Stake amount
  ;; - Lock period
  ;; - Learning activity
  ;; - Streak maintenance
)

;; Unstake
(define-public (unstake)
  ;; Check lock period expired
  ;; Return STX + rewards
)
```

**Reward Multipliers:**
- Base: 1x rewards
- 30-day lock: 1.5x rewards
- 90-day lock: 2x rewards
- Active learner (daily): +0.5x
- Perfect scores: +0.25x per quiz

## Implementation Priority

### Phase 1: Core Credentials (Months 1-2)
1. ✅ Certificate NFT Contract
   - Deploy to testnet
   - Integrate with backend
   - Test minting flow
   - Design certificate images
   - Deploy metadata to IPFS

2. ✅ Backend Integration
   - Implement `@stacks/transactions` calls
   - Replace stub in `StacksNftService`
   - Add transaction monitoring
   - Handle minting failures gracefully

### Phase 2: Gamification (Months 3-4)
3. ✅ Achievement Badge Contract
   - Define all badge types
   - Create badge artwork
   - Deploy contract
   - Integrate with XP system
   - Auto-award on milestones

4. ✅ Reputation Token
   - Deploy FT contract
   - Integrate with all XP sources
   - Add reputation leaderboard
   - Display on profiles

### Phase 3: Community (Months 5-6)
5. ✅ Project Registry
   - Deploy contract
   - Migrate gallery to on-chain
   - Add verification workflow
   - Implement voting

### Phase 4: Advanced (Future)
6. ⏳ Staking/Rewards
   - Design tokenomics
   - Deploy staking contract
   - Add premium features
   - Launch rewards program

## Technical Stack

### Development Tools
```bash
# Install Clarinet
curl -L https://github.com/hirosystems/clarinet/releases/download/v2.0.0/clarinet-linux-x64.tar.gz | tar xz

# Initialize contracts
clarinet new stacks-academy-contracts
cd stacks-academy-contracts

# Create contracts
clarinet contract new certificates
clarinet contract new badges
clarinet contract new reputation
clarinet contract new projects
```

### Testing Framework
```clarity
;; Use Clarinet for unit tests
;; Example test for certificate minting

(define-test mint-certificate-success
  (let ((recipient 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM))
    (contract-call? .certificates mint-certificate
      recipient
      u1  ;; module-id
      u95 ;; score
      "ipfs://QmXxx")
    (asserts! (is-ok result) "Minting should succeed")
    (asserts! (is-eq (get-certificate-owner u1) recipient) "Owner should match")
  )
)
```

### Backend Integration
```typescript
// Example: Mint certificate NFT
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV,
  principalCV,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

async mintCertificate(params: MintParams) {
  const network = new StacksTestnet();
  
  const txOptions = {
    contractAddress: this.config.get('stacks.certificateContractAddress'),
    contractName: 'stacks-academy-certificates',
    functionName: 'mint-certificate',
    functionArgs: [
      principalCV(params.recipientAddress),
      uintCV(params.moduleId),
      uintCV(params.score),
      stringAsciiCV(params.metadataUri),
    ],
    senderKey: this.config.get('stacks.adminPrivateKey'),
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  return { txId: broadcastResponse.txid };
}
```

## Security Considerations

### Access Control
- ✅ Admin-only minting functions
- ✅ Signature verification for all transactions
- ✅ Rate limiting on backend
- ✅ Input validation in contracts

### Anti-Gaming Measures
- ✅ Non-transferable certificates (soulbound)
- ✅ Non-transferable reputation tokens
- ✅ One certificate per module per user
- ✅ Cooldown periods for certain actions
- ✅ Backend validation before minting

### Data Integrity
- ✅ Immutable certificate data
- ✅ Cryptographic proof of completion
- ✅ Timestamp verification
- ✅ Score validation ranges

## Cost Estimation

### Transaction Costs (Testnet → Mainnet)

**Certificate Minting:**
- Contract deployment: ~0.5 STX (one-time)
- Per mint: ~0.001-0.002 STX
- 1000 certificates: ~2 STX

**Badge Minting:**
- Contract deployment: ~0.4 STX (one-time)
- Per mint: ~0.001 STX
- 1000 badges: ~1 STX

**Reputation Awards:**
- Contract deployment: ~0.3 STX (one-time)
- Per award: ~0.0005 STX
- 10,000 awards: ~5 STX

**Total Initial Investment:**
- All contracts deployed: ~1.5 STX
- First 1000 users: ~10 STX
- Monthly operations (10k users): ~50 STX

## Metadata & Assets

### IPFS Storage
```json
// Certificate metadata template
{
  "name": "Stacks Academy Certificate - {MODULE_NAME}",
  "description": "Awarded for completing {MODULE_NAME} with {SCORE}% score",
  "image": "ipfs://QmCertificateImage/module-{ID}.png",
  "external_url": "https://stacksacademy.com/certificates/{CERT_ID}",
  "attributes": [
    {"trait_type": "Module", "value": "{MODULE_NAME}"},
    {"trait_type": "Module ID", "value": {MODULE_ID}},
    {"trait_type": "Score", "value": {SCORE}},
    {"trait_type": "Completion Date", "value": "{DATE}"},
    {"trait_type": "Student Level", "value": {LEVEL}},
    {"trait_type": "Total XP", "value": {XP}},
    {"trait_type": "Issuer", "value": "Stacks Academy"}
  ],
  "properties": {
    "certificate_id": "{CERT_ID}",
    "student_address": "{WALLET}",
    "verification_url": "https://stacksacademy.com/verify/{CERT_ID}"
  }
}
```

### Certificate Design
- Professional certificate template
- Stacks Academy branding
- QR code for verification
- Unique certificate ID
- Student name/wallet
- Module completion details
- Digital signature

## Next Steps

### Immediate Actions
1. ✅ Set up Clarinet development environment
2. ✅ Write Certificate NFT contract
3. ✅ Write comprehensive tests
4. ✅ Deploy to testnet
5. ✅ Update backend integration
6. ✅ Test end-to-end flow

### Week 1-2: Contract Development
- [ ] Create `contracts/` directory
- [ ] Write certificate contract
- [ ] Write badge contract
- [ ] Add unit tests
- [ ] Add integration tests

### Week 3-4: Backend Integration
- [ ] Install `@stacks/transactions`
- [ ] Implement minting service
- [ ] Add transaction monitoring
- [ ] Handle errors gracefully
- [ ] Add retry logic

### Week 5-6: Testing & Deployment
- [ ] Test on testnet
- [ ] Create certificate designs
- [ ] Upload metadata to IPFS
- [ ] Deploy to mainnet
- [ ] Monitor first mints

### Week 7-8: Frontend Integration
- [ ] Add certificate display
- [ ] Show NFT in profile
- [ ] Add verification page
- [ ] Display badges
- [ ] Show reputation score

## Resources

### Documentation
- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [SIP-009 NFT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md)
- [SIP-010 FT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [@stacks/transactions](https://github.com/hirosystems/stacks.js)

### Example Contracts
- [Stacks NFT Examples](https://github.com/hirosystems/clarity-examples)
- [Soulbound Token Implementation](https://github.com/clarity-lang/soulbound-token)
- [Reputation System](https://github.com/clarity-lang/reputation-contract)

---

**Last Updated**: March 2024
**Version**: 1.0
**Status**: Planning Phase
