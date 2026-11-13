// ==============================================================================
// NIAT GRIT Platform: AI Product Engineering Intelligence Engine
// Simulates specialized LLM pipelines for candidate code analysis, viva generation,
// speech-to-rubric synthesis, and forensic AST plagiarism detection.
// ==============================================================================

const codeProfiles = {
  std_rahul: {
    contestNumber: 4,
    contestTitle: "Database Concurrency & Transaction Isolation",
    fileName: "/services/wallet_service.go",
    repoSnippet: `// Rahul's Submission: /services/wallet_service.go
func (s *WalletService) TransferFunds(fromID, toID string, amount float64) error {
    tx := s.db.Begin()
    defer tx.Rollback()
    
    // VULNERABILITY: Non-deterministic lock acquisition order
    var fromAccount Account
    if err := tx.Where("id = ?", fromID).First(&fromAccount).Error; err != nil {
        return err
    }
    
    var toAccount Account
    if err := tx.Where("id = ?", toID).First(&toAccount).Error; err != nil {
        return err
    }
    
    fromAccount.Balance -= amount
    toAccount.Balance += amount
    
    tx.Save(&fromAccount)
    tx.Save(&toAccount)
    return tx.Commit().Error
}`,
    aiVulnerabilities: [
      {
        severity: "HIGH",
        title: "Bidirectional Transfer Deadlock Hazard",
        description: "Resource lock ordering is non-deterministic. If Account A transfers to Account B while Account B transfers to Account A simultaneously, PostgreSQL will deadlock.",
        suggestedQuestion: "In your WalletService TransferFunds method, how would you prevent deadlock when two users initiate concurrent cross-transfers?",
        recommendedDefense: "I would enforce deterministic global lock ordering. For example, sorting AccountIDs lexicographically before acquiring row locks (SELECT ... FOR UPDATE), mathematically eliminating cyclic wait deadlocks."
      },
      {
        severity: "MEDIUM",
        title: "Missing Idempotency Key Handling",
        description: "Network retries from client will double-deduct without a distributed redis lease or idempotency token.",
        suggestedQuestion: "If a mobile client experiences a network timeout during TransferFunds, how does your backend guarantee idempotency?",
        recommendedDefense: "I would wrap the endpoint in an Idempotency-Key header verified against a distributed Redis cache with a 120-second TTL."
      }
    ],
    readinessScore: 88,
    readinessStatus: "READY_FOR_DEFENSE",
    aiStudyFocus: [
      "Deterministic Lock Ordering in ACID Transactions",
      "Optimistic Concurrency Control with ETag Versioning",
      "Deadlock Graph Detection in PostgreSQL"
    ]
  },
  std_ananya: {
    contestNumber: 2,
    contestTitle: "Frontend State Architecture & Distributed Hydration",
    fileName: "/hooks/useRealtimeLeaderboard.ts",
    repoSnippet: `// Ananya's Submission: /hooks/useRealtimeLeaderboard.ts
export function useRealtimeLeaderboard(contestId: string) {
  const [scores, setScores] = useState<ScoreMap>({});
  
  useEffect(() => {
    const ws = new WebSocket(\`wss://grit.niat.in/live/\${contestId}\`);
    ws.onmessage = (event) => {
      const delta = JSON.parse(event.data);
      // High frequency updates trigger 60FPS re-renders
      setScores(prev => ({ ...prev, [delta.userId]: delta.score }));
    };
    return () => ws.close();
  }, [contestId]);
}`,
    aiVulnerabilities: [
      {
        severity: "HIGH",
        title: "Render Storm & Main Thread Freezing",
        description: "Unthrottled WebSocket dispatches trigger continuous React reconciliation under peak contest throughput.",
        suggestedQuestion: "How would you buffer high-frequency WebSocket updates using requestAnimationFrame or a ring buffer to protect UI frame rate?",
        recommendedDefense: "I would buffer incoming WebSocket ticks in a micro-batching queue and flush state updates synced to the browser's requestAnimationFrame cycle at 60Hz."
      }
    ],
    readinessScore: 92,
    readinessStatus: "OPTIMIZED",
    aiStudyFocus: [
      "React Reconciliation & Virtual DOM Diff Batching",
      "WebSocket Backpressure & Sliding Window Buffers",
      "Web Worker Offloading for AST Computation"
    ]
  },
  std_karthik: {
    contestNumber: 5,
    contestTitle: "Containerization & Distributed CI/CD Architecture",
    fileName: "/infra/k8s/deployment.yaml",
    repoSnippet: `// Karthik's Submission: /infra/k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grit-api-gateway
spec:
  replicas: 6
  strategy:
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: gateway
        image: niat/gateway:v2.4
        resources:
          limits: { cpu: "500m", memory: "512Mi" }
          requests: { cpu: "200m", memory: "256Mi" }
        readinessProbe:
          httpGet: { path: /healthz, port: 8080 }`,
    aiVulnerabilities: [
      {
        severity: "LOW",
        title: "Connection Draining Timeout",
        description: "Termination grace period must align with ingress connection draining to avoid dropped packets during pod evictions.",
        suggestedQuestion: "How do you ensure zero dropped in-flight HTTP requests during a Kubernetes rolling update?",
        recommendedDefense: "By configuring preStop hook sleep intervals with terminationGracePeriodSeconds set to 45 seconds, allowing envoy to drain existing HTTP keep-alives."
      }
    ],
    readinessScore: 96,
    readinessStatus: "ACCREDITED_MASTER",
    aiStudyFocus: [
      "Zero-Downtime Rolling Update Topology",
      "Graceful TCP Connection Draining & Pod Disruption Budgets",
      "Service Mesh Circuit Breaking with Istio"
    ]
  },
  std_sneha: {
    contestNumber: 4,
    contestTitle: "Database Concurrency & Transaction Isolation",
    fileName: "/controllers/booking_controller.js",
    repoSnippet: `// Sneha's Submission: /controllers/booking_controller.js
async function bookSeat(userId, seatId) {
    const seat = await Seat.findById(seatId);
    if (seat.isBooked) {
        throw new Error("Seat already taken");
    }
    // Race condition window between check and update
    await sleep(20);
    seat.isBooked = true;
    seat.bookedBy = userId;
    await seat.save();
}`,
    aiVulnerabilities: [
      {
        severity: "HIGH",
        title: "Time-of-Check to Time-of-Use (TOCTOU) Race Condition",
        description: "Concurrent requests can both read isBooked == false simultaneously, double-selling the seat.",
        suggestedQuestion: "How would you solve the TOCTOU race condition in your seat reservation logic using SQL isolation levels?",
        recommendedDefense: "I would use an atomic conditional update 'UPDATE seats SET is_booked = true WHERE id = ? AND is_booked = false' or a SELECT ... FOR UPDATE lock within a SERIALIZABLE transaction."
      }
    ],
    readinessScore: 71,
    readinessStatus: "RETAKE_COOLDOWN",
    aiStudyFocus: [
      "TOCTOU Race Conditions & Atomic Conditional Updates",
      "Pessimistic Row-Level Locks vs Optimistic Version Counters",
      "PostgreSQL Transaction Isolation Levels (Read Committed vs Serializable)"
    ]
  },
  std_vikram: {
    contestNumber: 4,
    contestTitle: "Database Concurrency & Distributed Queues",
    fileName: "/lib/queue/worker_pool.js",
    studentCode: `// Vikram's Submission: /lib/queue/worker_pool.js
class PartitionedWorkerPool {
  constructor(partitionCount = 8) {
    this.partitions = Array.from({ length: partitionCount }, () => []);
    this.hashingRing = new ConsistentHashRing(partitionCount);
  }
  dispatch(event) {
    const partitionIndex = this.hashingRing.getPartition(event.key);
    this.partitions[partitionIndex].push(event);
    this.flush(partitionIndex);
  }
}`,
    flaggedExternalRepo: `// External GitHub: github.com/distributed-systems-io/hash-pool (Submitted 3 hrs prior)
class PartitionedWorkerPool {
  constructor(partitionCount = 8) {
    this.partitions = Array.from({ length: partitionCount }, () => []);
    this.hashingRing = new ConsistentHashRing(partitionCount);
  }
  dispatch(event) {
    const partitionIndex = this.hashingRing.getPartition(event.key);
    this.partitions[partitionIndex].push(event);
    this.flush(partitionIndex);
  }
}`,
    similarityScore: 94.2,
    astNodeMatches: 842,
    fingerprintEntropy: 0.08,
    verdict: "CONFIRMED_CODE_PLAGIARISM",
    aiVulnerabilities: [
      {
        severity: "CRITICAL",
        title: "Exact AST Token Hash Plagiarism",
        description: "Code structure matches external solution verbatim with zero AST branch variation.",
        suggestedQuestion: "Explain the hash collision distribution curve of your consistent hashing ring.",
        recommendedDefense: "Candidate unable to explain mathematical derivation of consistent hash ring virtual nodes."
      }
    ],
    readinessScore: 0,
    readinessStatus: "REVOKED_MALPRACTICE",
    aiStudyFocus: [
      "NIAT Academic Integrity Policy Article 4.2",
      "Authorship Verification & Git Commit Forensics",
      "Live Whiteboard Re-examination Protocol"
    ]
  },
  std_rohit: {
    contestNumber: 3,
    contestTitle: "Scalable REST APIs & Middleware Pipelines",
    fileName: "/middleware/rateLimiter.ts",
    repoSnippet: `// Rohit's Submission: /middleware/rateLimiter.ts
const memoryCache = new Map<string, number>();

export function rateLimiter(req, res, next) {
  const ip = req.ip;
  const count = memoryCache.get(ip) || 0;
  if (count > 100) return res.status(429).send("Too Many Requests");
  memoryCache.set(ip, count + 1);
  next();
}`,
    aiVulnerabilities: [
      {
        severity: "HIGH",
        title: "In-Memory State Leak Across Distributed Instances",
        description: "Local Map cache does not sync across horizontally scaled containers and leaks memory without TTL cleanup.",
        suggestedQuestion: "Why fails an in-memory rate limiter when deploying across multiple Kubernetes pods?",
        recommendedDefense: "A single pod memory map cannot track global request counts. I would replace it with Redis Sliding Window using a sorted set (ZREMRANGEBYSCORE and ZADD)."
      }
    ],
    readinessScore: 65,
    readinessStatus: "SKILLS_IN_PROGRESS",
    aiStudyFocus: [
      "Distributed Rate Limiting with Redis Leaky Bucket / Sliding Window",
      "Memory Leak Mitigation in Node.js Event Loops",
      "Middleware Chain Sequencing & Error Propagation"
    ]
  }
};

module.exports = {
  // 1. AI Pre-Viva Diagnostic for Student Preparation
  getStudentAIDiagnostic(studentId) {
    const profile = codeProfiles[studentId] || codeProfiles['std_rahul'];
    return {
      studentId,
      benchmarkContest: profile.contestTitle || "Track Skill Benchmark",
      fileName: profile.fileName || "/services/main.go",
      readinessScore: profile.readinessScore || 85,
      readinessStatus: profile.readinessStatus || "READY_FOR_DEFENSE",
      codeSnippet: profile.repoSnippet || profile.studentCode || "// Code submission",
      aiVulnerabilities: profile.aiVulnerabilities || [
        {
          severity: "MEDIUM",
          title: "Concurrency Race Hazard",
          description: "Potential race condition in shared state access.",
          suggestedQuestion: "How do you prevent data races in your submission?",
          recommendedDefense: "Using sync.Mutex or atomic operations."
        }
      ],
      aiStudyFocus: profile.aiStudyFocus || [
        "Distributed Lock Ordering in ACID Transactions",
        "Optimistic Concurrency Control with ETag Versioning",
        "Database Deadlock Graph Detection in PostgreSQL"
      ]
    };
  },

  // 2. AI Interviewer Copilot (Generates live probe questions from candidate code)
  getInterviewerAICopilot(studentId) {
    const profile = codeProfiles[studentId] || codeProfiles['std_rahul'];
    return {
      candidateStrengths: "Clean modular repository organization; 100% test case pass rate in Benchmark Contests.",
      primaryArchitecturalRisk: profile.aiVulnerabilities?.[0]?.title || "Deadlock under high concurrency",
      recommendedDefenseQuestions: (profile.aiVulnerabilities || []).map((v, i) => ({
        id: i + 1,
        question: v.suggestedQuestion,
        evaluationTarget: v.title,
        expectedKeywords: ["SELECT FOR UPDATE", "Lock Ordering", "Deterministic Sorting", "Idempotency Key"]
      }))
    };
  },

  // 3. AI Rubric Synthesis from Interview Notes
  synthesizeRubric(studentName, scores, rawNotes) {
    const avg = ((scores.systemDesign + scores.problemSolving + scores.codeQuality) / 3).toFixed(1);
    const pass = avg >= 3.5;

    let aiSummary = "";
    if (pass) {
      aiSummary = `Exemplary viva defense. ${studentName} articulated distributed system trade-offs with maturity, specifically defending their transactional lock ordering and cache eviction strategy. Foundational algorithmic thinking was solid (${scores.problemSolving}/5), and architectural hygiene was production-grade (${scores.codeQuality}/5). Fully accredited for Track Badge.`;
    } else {
      aiSummary = `Constructive technical viva. ${studentName} demonstrated good algorithmic fluency, but could not defend database transaction isolation anomalies or deadlock resolution under concurrent loads. Panel recommends 10-day review of ACID isolation levels and optimistic locking before re-attempting.`;
    }

    return {
      computedAverage: avg,
      recommendedOutcome: pass ? 'PASS' : 'RETAKE_LATER',
      aiSynthesizedFeedback: aiSummary,
      suggestedReviewModules: pass ? [] : [
        "NIAT Advanced Database Systems: Isolation & Deadlocks",
        "Distributed Transaction Patterns: Sagas vs 2PC"
      ]
    };
  },

  // 4. AI Forensic AST Code Similarity Analysis (For Malpractice Detection)
  getAIForensicReport(studentId) {
    const profile = codeProfiles[studentId] || codeProfiles['std_vikram'];
    return {
      studentId,
      similarityScore: profile.similarityScore || 94.2,
      astNodeMatches: profile.astNodeMatches || 842,
      fingerprintEntropy: profile.fingerprintEntropy || 0.08,
      verdict: profile.verdict || "CONFIRMED_CODE_PLAGIARISM",
      studentCodeSnippet: profile.studentCode || codeProfiles.std_vikram.studentCode,
      flaggedSourceSnippet: profile.flaggedExternalRepo || codeProfiles.std_vikram.flaggedExternalRepo,
      forensicMarkers: profile.forensicMarkers || [
        "Identical Abstract Syntax Tree (AST) structure across 14 functions",
        "Verbatim variable identifiers and function signatures",
        "Identical commit timestamp cluster matching external repository leak by 3 hours",
        "Zero commit hash divergence in core concurrency algorithms"
      ],
      aiRecommendation: "Immediate revocation of Track Badge Credential under NIAT Academic Honor Code Article 4.2."
    };
  },

  // 5. AI Smart Nudge Personalization
  generateSmartNudge(studentName, daysElapsed, trackName) {
    return {
      smsText: `Hi ${studentName}! You cleared all 5 benchmarks for ${trackName} ${daysElapsed || 2} days ago! Don't let your technical momentum cool down—reserve your 45-min viva slot now to mint your verified badge: https://grit.niat.in/viva/book`,
      emailSubject: `🎯 Final Step for your ${trackName} Badge: Reserve Your Viva Panel Slot`,
      urgencyTag: (daysElapsed || 2) > 3 ? "HIGH_DROP_OFF_RISK" : "OPTIMAL_ENGAGEMENT"
    };
  }
};
