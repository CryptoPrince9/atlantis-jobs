import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Job {
  id: string;
  title: string;
  company_name: string;
  company_wallet: string;
  description: string;
  requirements: string[];
  location: string;
  salary_range: string;
  tx_hash: string;
  payment_amount: number;
  status: 'active' | 'closed' | 'pending_verification';
  created_at: string;
}

export interface Candidate {
  id: string;
  wallet_address: string;
  name: string;
  email?: string;
  raw_cv?: string;
  parsed_skills: string[];
  parsed_experience: any[];
  parsed_education: any[];
  is_premium: boolean;
  premium_until?: string;
  premium_tx_hash?: string;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_wallet: string;
  candidate_name?: string;
  match_score: number;
  status: 'applied' | 'ai_interviewed' | 'shortlisted' | 'rejected';
  created_at: string;
}

export interface Interview {
  id: string;
  application_id: string;
  transcript: { role: 'ai' | 'candidate'; content: string; timestamp: string }[];
  ai_evaluation?: {
    technical_score: number;
    communication_score: number;
    problem_solving_score: number;
    overall_recommendation: string;
  };
  final_score: number;
  summary: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  completed_at?: string;
}

// Persistent Storage Engine (localStorage + Supabase + Memory Fallback)
class PersistentStore {
  private jobsKey = 'atlantis_jobs_db';
  private candidatesKey = 'atlantis_candidates_db';
  private applicationsKey = 'atlantis_applications_db';
  private interviewsKey = 'atlantis_interviews_db';

  private jobs: Job[] = [
    {
      id: 'job-1',
      title: 'Senior Web3 & Smart Contract Engineer',
      company_name: 'DeFi Autonomous DAO',
      company_wallet: '0x1111111111111111111111111111111111111111',
      description: 'Looking for a Senior Web3 Engineer proficient in Solidity, BSC/EVM chains, Viem, and Next.js to lead decentralized smart contract architecture.',
      requirements: ['Solidity', 'BSC', 'Next.js', 'Viem/Wagmi', 'EVM Security'],
      location: 'Remote Global',
      salary_range: '$120,000 - $180,000 USDT',
      tx_hash: '0xmocked_job_tx_hash_300_usdt_1',
      payment_amount: 300,
      status: 'active',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'job-2',
      title: 'AI & LLM Pipeline Architect',
      company_name: 'Neural Agent Labs',
      company_wallet: '0x2222222222222222222222222222222222222222',
      description: 'Architect open-source LLM agent swarms, Hugging Face models, RAG pipelines, and serverless AI routing for enterprise hiring apps.',
      requirements: ['Python', 'Hugging Face', 'Groq', 'LangChain', 'Next.js', 'PyTorch'],
      location: 'Remote (US/EU)',
      salary_range: '$140,000 - $200,000 USDT',
      tx_hash: '0xmocked_job_tx_hash_300_usdt_2',
      payment_amount: 300,
      status: 'active',
      created_at: new Date(Date.now() - 172800000).toISOString(),
    }
  ];

  private candidates: Candidate[] = [
    {
      id: 'cand-1',
      wallet_address: '0x3333333333333333333333333333333333333333',
      name: 'Alex Vance',
      email: 'alex.vance@web3ai.dev',
      parsed_skills: ['Solidity', 'Next.js', 'TypeScript', 'BSC', 'Python', 'Hugging Face'],
      parsed_experience: [{ role: 'Lead Web3 Developer', company: 'CryptoX', duration: '3 yrs' }],
      parsed_education: [{ degree: 'B.S. Computer Science', institution: 'MIT' }],
      is_premium: true,
      premium_until: new Date(Date.now() + 25 * 86400000).toISOString(),
      premium_tx_hash: '0xmocked_boost_tx_hash_10_usdt',
      created_at: new Date().toISOString(),
    }
  ];

  private applications: Application[] = [
    {
      id: 'app-1',
      job_id: 'job-1',
      candidate_wallet: '0x3333333333333333333333333333333333333333',
      candidate_name: 'Alex Vance',
      match_score: 92,
      status: 'ai_interviewed',
      created_at: new Date().toISOString(),
    }
  ];

  private interviews: Interview[] = [
    {
      id: 'int-1',
      application_id: 'app-1',
      transcript: [
        { role: 'ai', content: 'Welcome to your AI Screening Interview for Senior Web3 Engineer. Could you explain how you handle BEP20 token transfers and reentrancy protection in Solidity?', timestamp: new Date().toISOString() },
        { role: 'candidate', content: 'I use OpenZeppelin ReentrancyGuard and SafeERC20 transfer functions, ensuring Checks-Effects-Interactions pattern strictly.', timestamp: new Date().toISOString() }
      ],
      ai_evaluation: {
        technical_score: 95,
        communication_score: 90,
        problem_solving_score: 92,
        overall_recommendation: 'Strong Hire - Demonstrates deep understanding of EVM security and BEP20 standards.',
      },
      final_score: 93,
      summary: 'Candidate answered technical Web3 security questions with high accuracy and clear explanations.',
      status: 'completed',
      completed_at: new Date().toISOString(),
    }
  ];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const storedJobs = localStorage.getItem(this.jobsKey);
        if (storedJobs) this.jobs = JSON.parse(storedJobs);

        const storedCand = localStorage.getItem(this.candidatesKey);
        if (storedCand) this.candidates = JSON.parse(storedCand);

        const storedApps = localStorage.getItem(this.applicationsKey);
        if (storedApps) this.applications = JSON.parse(storedApps);

        const storedInt = localStorage.getItem(this.interviewsKey);
        if (storedInt) this.interviews = JSON.parse(storedInt);
      } catch (err) {
        console.warn('LocalStorage load warning:', err);
      }
    }
  }

  private syncToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.jobsKey, JSON.stringify(this.jobs));
        localStorage.setItem(this.candidatesKey, JSON.stringify(this.candidates));
        localStorage.setItem(this.applicationsKey, JSON.stringify(this.applications));
        localStorage.setItem(this.interviewsKey, JSON.stringify(this.interviews));
      } catch (err) {
        console.warn('LocalStorage sync warning:', err);
      }
    }
  }

  public getJobs(): Job[] {
    this.loadFromStorage();
    return this.jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addJob(job: Omit<Job, 'id' | 'created_at'>): Job {
    this.loadFromStorage();
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.jobs.unshift(newJob);
    this.syncToStorage();
    return newJob;
  }

  public getCandidates(): Candidate[] {
    this.loadFromStorage();
    return this.candidates.sort((a, b) => (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0));
  }

  public getCandidateByWallet(wallet: string): Candidate | undefined {
    this.loadFromStorage();
    return this.candidates.find(c => c.wallet_address.toLowerCase() === wallet.toLowerCase());
  }

  public saveCandidate(candidate: Partial<Candidate> & { wallet_address: string }): Candidate {
    this.loadFromStorage();
    const existingIndex = this.candidates.findIndex(c => c.wallet_address.toLowerCase() === candidate.wallet_address.toLowerCase());
    if (existingIndex >= 0) {
      this.candidates[existingIndex] = { ...this.candidates[existingIndex], ...candidate };
      this.syncToStorage();
      return this.candidates[existingIndex];
    } else {
      const newCand: Candidate = {
        id: `cand-${Date.now()}`,
        name: candidate.name || 'Anonymous Developer',
        parsed_skills: candidate.parsed_skills || [],
        parsed_experience: candidate.parsed_experience || [],
        parsed_education: candidate.parsed_education || [],
        is_premium: candidate.is_premium || false,
        created_at: new Date().toISOString(),
        ...candidate,
      };
      this.candidates.unshift(newCand);
      this.syncToStorage();
      return newCand;
    }
  }

  public getApplications(jobId?: string): Application[] {
    this.loadFromStorage();
    if (jobId) {
      return this.applications.filter(a => a.job_id === jobId);
    }
    return this.applications;
  }

  public addApplication(app: Omit<Application, 'id' | 'created_at'>): Application {
    this.loadFromStorage();
    const newApp: Application = {
      ...app,
      id: `app-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.applications.unshift(newApp);
    this.syncToStorage();
    return newApp;
  }

  public updateApplicationStatus(id: string, status: Application['status']): void {
    this.loadFromStorage();
    const app = this.applications.find(a => a.id === id);
    if (app) {
      app.status = status;
      this.syncToStorage();
    }
  }

  public getInterview(id: string): Interview | undefined {
    this.loadFromStorage();
    return this.interviews.find(i => i.id === id || i.application_id === id);
  }

  public saveInterview(interview: Interview): Interview {
    this.loadFromStorage();
    const existingIndex = this.interviews.findIndex(i => i.id === interview.id);
    if (existingIndex >= 0) {
      this.interviews[existingIndex] = interview;
    } else {
      this.interviews.push(interview);
    }
    this.syncToStorage();
    return interview;
  }
}

export const db = new PersistentStore();
