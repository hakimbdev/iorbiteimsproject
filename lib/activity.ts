import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserActivity, LoginAttempt, UserRegistration, ActivityType } from '@/types/activity';

// Helper function to get device and browser info
const getDeviceInfo = () => {
  if (typeof window === 'undefined') return {};

  const userAgent = window.navigator.userAgent;
  const browser = userAgent.match(/(chrome|safari|firefox|msie|trident|edge(?=\/))\/?\s*(\d+)/i)?.[1] || '';
  const device = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'mobile' : 'desktop';

  return { userAgent, browser, device };
};

// Track user activity
export async function trackActivity(
  userId: string,
  type: string,
  metadata: Record<string, any> = { success: true }
) {
  try {
    const activityRef = collection(db, "activity");
    await addDoc(activityRef, {
      userId,
      type,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error tracking activity:", error);
  }
}

// Track login attempts
export async function trackLoginAttempt(
  userId: string,
  email: string,
  success: boolean,
  method: string,
  error?: string
) {
  try {
    const loginAttemptsRef = collection(db, "login_attempts");
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "Unknown";
    
    const metadata = {
      success,
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      error,
    };

    await addDoc(loginAttemptsRef, {
      userId,
      email,
      method,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error tracking login attempt:", error);
  }
}

// Track user registration
export async function trackRegistration(
  userId: string,
  email: string,
  success: boolean,
  error?: string
) {
  await trackActivity(userId, "registration", { success, email, error });
}

// Get recent login attempts for a user
export async function getRecentLoginAttempts(userId: string): Promise<LoginAttempt[]> {
  try {
    const loginAttemptsRef = collection(db, "login_attempts");
    const q = query(
      loginAttemptsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as LoginAttempt[];
  } catch (error) {
    console.error("Error fetching login attempts:", error);
    return [];
  }
}

// Get user activity history
export async function getUserActivity(userId: string): Promise<UserActivity[]> {
  try {
    const activityRef = collection(db, "activity");
    const q = query(
      activityRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as UserActivity[];
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return [];
  }
}

function detectDevice(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "Mobile";
  if (/tablet/i.test(userAgent)) return "Tablet";
  return "Desktop";
}

function detectBrowser(userAgent: string): string {
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent)) return "Safari";
  if (/edge/i.test(userAgent)) return "Edge";
  if (/opera/i.test(userAgent)) return "Opera";
  return "Unknown";
} 