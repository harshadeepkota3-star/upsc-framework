// NOTE: This is a mock authentication service for demonstration purposes.
// It uses localStorage, which is not secure for a real production application.
// In a real-world scenario, this would be replaced with actual API calls to a secure backend.

interface UnverifiedUser {
  email: string;
  passwordHash: string; // In a real app, this would be a securely hashed password
  verificationCode: string;
  expires: number;
}

interface VerifiedUser {
  email: string;
  passwordHash: string;
}

interface Session {
  email: string;
}

const USERS_DB_KEY = 'upsc-ai-users';
const UNVERIFIED_USERS_DB_KEY = 'upsc-ai-unverified-users';
const SESSION_KEY = 'upsc-ai-session';
const CODE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

// Helper to get data from localStorage
const getStore = <T>(key: string): Record<string, T> => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

// Helper to set data to localStorage
const setStore = <T>(key: string, data: Record<string, T>): void => {
  localStorage.setItem(key, JSON.stringify(data));
};


export const authService = {
  /**
   * Simulates signing up a new user.
   * "Sends" a verification code and stores the unverified user.
   */
  signUp: async (email: string, password: string): Promise<{ success: true; verificationCode: string }> => {
    const users = getStore<VerifiedUser>(USERS_DB_KEY);
    if (users[email]) {
      throw new Error("An account with this email already exists.");
    }
    
    // Simulate a delay
    await new Promise(res => setTimeout(res, 500));

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`%c[MOCK EMAIL SERVICE] Verification code for ${email}: ${verificationCode}`, 'color: #00E5FF; font-weight: bold;');
    
    const unverifiedUsers = getStore<UnverifiedUser>(UNVERIFIED_USERS_DB_KEY);
    unverifiedUsers[email] = {
      email,
      passwordHash: password, // NOT a real hash for this demo
      verificationCode,
      expires: Date.now() + CODE_EXPIRATION_MS,
    };
    setStore(UNVERIFIED_USERS_DB_KEY, unverifiedUsers);

    return { success: true, verificationCode };
  },

  /**
   * Confirms the sign-up process with a verification code.
   */
  confirmSignUp: async (email: string, code: string): Promise<Session> => {
    const unverifiedUsers = getStore<UnverifiedUser>(UNVERIFIED_USERS_DB_KEY);
    const unverifiedUser = unverifiedUsers[email];
    
    if (!unverifiedUser) {
      throw new Error("No pending verification for this email. Please sign up again.");
    }
    if (unverifiedUser.expires < Date.now()) {
      delete unverifiedUsers[email];
      setStore(UNVERIFIED_USERS_DB_KEY, unverifiedUsers);
      throw new Error("Verification code has expired. Please sign up again.");
    }
    if (unverifiedUser.verificationCode !== code) {
      throw new Error("Invalid verification code.");
    }

    // Simulate a delay
    await new Promise(res => setTimeout(res, 500));
    
    const users = getStore<VerifiedUser>(USERS_DB_KEY);
    users[email] = {
      email: unverifiedUser.email,
      passwordHash: unverifiedUser.passwordHash,
    };
    setStore(USERS_DB_KEY, users);
    
    // Clean up unverified user
    delete unverifiedUsers[email];
    setStore(UNVERIFIED_USERS_DB_KEY, unverifiedUsers);
    
    // Create session (log in)
    const session: Session = { email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
  },

  /**
   * Simulates logging in a user.
   */
  logIn: async (email: string, password: string): Promise<Session> => {
    const users = getStore<VerifiedUser>(USERS_DB_KEY);
    const user = users[email];

    // Simulate a delay
    await new Promise(res => setTimeout(res, 500));
    
    if (!user || user.passwordHash !== password) {
      throw new Error("Invalid email or password.");
    }

    const session: Session = { email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
  },

  /**
   * Simulates logging out a user.
   */
  logOut: async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
    return Promise.resolve();
  },

  /**
   * Gets the current user session from localStorage.
   */
  getCurrentUser: (): Session | null => {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  },
};
