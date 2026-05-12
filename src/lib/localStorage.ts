// localStorage-based data service replacing Supabase

const KEYS = {
  USERS: 'app_users',
  PROFILES: 'app_profiles',
  USER_ROLES: 'app_user_roles',
  BOOKINGS: 'app_bookings',
  PORTFOLIO_ITEMS: 'app_portfolio_items',
  INSTALLER_SPECIALTIES: 'app_installer_specialties',
  INSTALLER_AVAILABILITY: 'app_installer_availability',
  SPECIALTIES: 'app_specialties',
  CURRENT_USER: 'app_current_user',
  PENDING_SIGNUPS: 'app_pending_signups',
  PASSWORD_RESETS: 'app_password_resets',
};

const RESET_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export interface PasswordResetToken {
  token: string;
  email: string;
  expires_at: number;
  used: boolean;
  created_at: string;
}

export function requestPasswordReset(email: string): { token: string; resetUrl: string; error: string | null } {
  if (!emailExists(email)) {
    return { token: '', resetUrl: '', error: 'No account found with this email address.' };
  }
  const token = crypto.randomUUID().replace(/-/g, '');
  const entry: PasswordResetToken = {
    token,
    email,
    expires_at: Date.now() + RESET_EXPIRY_MS,
    used: false,
    created_at: new Date().toISOString(),
  };
  const all = getStore<PasswordResetToken>(KEYS.PASSWORD_RESETS).filter(
    (r) => r.email.toLowerCase() !== email.toLowerCase() || r.used
  );
  all.push(entry);
  setStore(KEYS.PASSWORD_RESETS, all);
  const resetUrl = `${window.location.origin}/auth/reset-password?token=${token}`;
  return { token, resetUrl, error: null };
}

export function getPasswordReset(token: string): PasswordResetToken | null {
  const all = getStore<PasswordResetToken>(KEYS.PASSWORD_RESETS);
  return all.find((r) => r.token === token) || null;
}

export function resetPasswordWithToken(token: string, newPassword: string): { error: string | null } {
  const entry = getPasswordReset(token);
  if (!entry) return { error: 'Invalid reset link.' };
  if (entry.used) return { error: 'This reset link has already been used.' };
  if (Date.now() > entry.expires_at) return { error: 'This reset link has expired. Please request a new one.' };

  const pwdError = validatePassword(newPassword);
  if (pwdError) return { error: pwdError };

  const users = getStore<LocalUser>(KEYS.USERS);
  const idx = users.findIndex((u) => u.email.toLowerCase() === entry.email.toLowerCase());
  if (idx === -1) return { error: 'Account not found.' };
  users[idx].password = newPassword;
  setStore(KEYS.USERS, users);

  const all = getStore<PasswordResetToken>(KEYS.PASSWORD_RESETS);
  const tIdx = all.findIndex((r) => r.token === token);
  if (tIdx !== -1) {
    all[tIdx].used = true;
    setStore(KEYS.PASSWORD_RESETS, all);
  }
  return { error: null };
}

const OTP_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes

export interface PendingSignup {
  email: string;
  password: string;
  metadata: Record<string, any>;
  otp: string;
  otp_expires_at: number;
  created_at: string;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function emailExists(email: string): boolean {
  const users = getStore<LocalUser>(KEYS.USERS);
  return users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`';]/.test(password)) return 'Password must contain at least one special character';
  return null;
}

export function requestSignupOtp(email: string, password: string, metadata: Record<string, any> = {}): { otp: string; error: string | null } {
  if (emailExists(email)) {
    return { otp: '', error: 'An account with this email already exists. Please use a different email.' };
  }
  const pwdError = validatePassword(password);
  if (pwdError) return { otp: '', error: pwdError };

  const otp = generateOtp();
  const pending: PendingSignup = {
    email,
    password,
    metadata,
    otp,
    otp_expires_at: Date.now() + OTP_EXPIRY_MS,
    created_at: new Date().toISOString(),
  };
  const all = getStore<PendingSignup>(KEYS.PENDING_SIGNUPS).filter(p => p.email.toLowerCase() !== email.toLowerCase());
  all.push(pending);
  setStore(KEYS.PENDING_SIGNUPS, all);
  return { otp, error: null };
}

export function getPendingSignup(email: string): PendingSignup | null {
  const all = getStore<PendingSignup>(KEYS.PENDING_SIGNUPS);
  return all.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
}

export function resendSignupOtp(email: string): { otp: string; error: string | null } {
  const pending = getPendingSignup(email);
  if (!pending) return { otp: '', error: 'No pending signup found for this email' };
  return requestSignupOtp(pending.email, pending.password, pending.metadata);
}

export function verifyOtpAndCreateAccount(email: string, otp: string): { user: LocalUser | null; error: string | null; expired?: boolean } {
  const pending = getPendingSignup(email);
  if (!pending) return { user: null, error: 'No pending signup found. Please sign up again.' };

  if (Date.now() > pending.otp_expires_at) {
    return { user: null, error: 'OTP has expired. Please request a new one.', expired: true };
  }
  if (pending.otp !== otp.trim()) {
    return { user: null, error: 'Incorrect OTP. Please enter the correct OTP.' };
  }

  const { user, error } = signUp(pending.email, pending.password, pending.metadata);
  if (error) return { user: null, error };

  // Remove pending entry
  const all = getStore<PendingSignup>(KEYS.PENDING_SIGNUPS).filter(p => p.email.toLowerCase() !== email.toLowerCase());
  setStore(KEYS.PENDING_SIGNUPS, all);

  // Sign out so user must log in with email + password (per requirement)
  signOutLocal();
  return { user, error: null };
}

// ---- Seed default admin ----
export const DEFAULT_ADMIN_EMAIL = 'admin@sibms.com';
export const DEFAULT_ADMIN_PASSWORD = 'Admin@123';

export function seedDefaultAdmin(): void {
  const users = getStore<LocalUser>(KEYS.USERS);
  const existing = users.find(u => u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL);
  if (existing) {
    const roles = getStore<any>(KEYS.USER_ROLES);
    if (!roles.find((r: any) => r.user_id === existing.id)) {
      roles.push({ id: generateId(), user_id: existing.id, role: 'admin', created_at: new Date().toISOString() });
      setStore(KEYS.USER_ROLES, roles);
    }
    return;
  }
  const id = generateId();
  const user: LocalUser = {
    id,
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    created_at: new Date().toISOString(),
    user_metadata: { full_name: 'Super Admin', role: 'admin' },
  };
  users.push(user);
  setStore(KEYS.USERS, users);

  const profiles = getStore<any>(KEYS.PROFILES);
  profiles.push({
    id,
    full_name: 'Super Admin',
    contact_number: '',
    province: '',
    company_name: '',
    bio: null,
    profile_photo: null,
    company_logo: null,
    company_portfolio_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  setStore(KEYS.PROFILES, profiles);

  const roles = getStore<any>(KEYS.USER_ROLES);
  roles.push({ id: generateId(), user_id: id, role: 'admin', created_at: new Date().toISOString() });
  setStore(KEYS.USER_ROLES, roles);
}

function getStore<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return crypto.randomUUID();
}

// ---- Auth ----

export interface LocalUser {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  created_at: string;
  user_metadata: Record<string, any>;
}

export function signUp(email: string, password: string, metadata: Record<string, any> = {}): { user: LocalUser; error: string | null } {
  const users = getStore<LocalUser>(KEYS.USERS);
  const normalizedEmail = email.trim().toLowerCase();
  if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
    return { user: null as any, error: 'User already exists with this email' };
  }

  const user: LocalUser = {
    id: generateId(),
    email: normalizedEmail,
    password,
    created_at: new Date().toISOString(),
    user_metadata: metadata,
  };

  users.push(user);
  setStore(KEYS.USERS, users);

  // Create profile
  const profile = {
    id: user.id,
    full_name: metadata.full_name || '',
    contact_number: metadata.contact_number || '',
    province: metadata.province || '',
    company_name: metadata.company_name || '',
    bio: null,
    profile_photo: null,
    company_logo: null,
    company_portfolio_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const profiles = getStore<any>(KEYS.PROFILES);
  profiles.push(profile);
  setStore(KEYS.PROFILES, profiles);

  // Create role
  if (metadata.role) {
    const roles = getStore<any>(KEYS.USER_ROLES);
    roles.push({
      id: generateId(),
      user_id: user.id,
      role: metadata.role,
      created_at: new Date().toISOString(),
    });
    setStore(KEYS.USER_ROLES, roles);
  }

  // Set current user
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify({ id: user.id, email: user.email }));

  return { user, error: null };
}

export function signIn(email: string, password: string): { user: LocalUser | null; error: string | null } {
  const users = getStore<LocalUser>(KEYS.USERS);
  const normalized = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalized);
  if (!user) {
    return { user: null, error: 'No account found with this email address.' };
  }
  if (user.password !== password) {
    return { user: null, error: 'Incorrect password. Please try again.' };
  }
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify({ id: user.id, email: user.email }));
  return { user, error: null };
}

export function signOutLocal(): void {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

export function getCurrentUser(): { id: string; email: string } | null {
  try {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// ---- User Roles ----

export function getUserRole(userId: string): string | null {
  const roles = getStore<any>(KEYS.USER_ROLES);
  const role = roles.find((r: any) => r.user_id === userId);
  return role?.role || null;
}

export function getAllRoles(): any[] {
  return getStore<any>(KEYS.USER_ROLES);
}

// ---- Profiles ----

export function getProfile(userId: string): any | null {
  const profiles = getStore<any>(KEYS.PROFILES);
  return profiles.find((p: any) => p.id === userId) || null;
}

export function getAllProfiles(): any[] {
  return getStore<any>(KEYS.PROFILES);
}

export function updateProfile(userId: string, updates: Record<string, any>): { error: string | null } {
  const profiles = getStore<any>(KEYS.PROFILES);
  const index = profiles.findIndex((p: any) => p.id === userId);
  if (index === -1) return { error: 'Profile not found' };
  profiles[index] = { ...profiles[index], ...updates, updated_at: new Date().toISOString() };
  setStore(KEYS.PROFILES, profiles);
  return { error: null };
}

// ---- Bookings ----

export function getBookings(filters: Record<string, any> = {}): any[] {
  let bookings = getStore<any>(KEYS.BOOKINGS);
  if (filters.client_id) bookings = bookings.filter((b: any) => b.client_id === filters.client_id);
  if (filters.installer_id) bookings = bookings.filter((b: any) => b.installer_id === filters.installer_id);
  if (filters.status) bookings = bookings.filter((b: any) => b.status === filters.status);
  return bookings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function createBooking(booking: Record<string, any>): { data: any; error: string | null } {
  const bookings = getStore<any>(KEYS.BOOKINGS);
  const newBooking = {
    id: generateId(),
    ...booking,
    status: booking.status || 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  bookings.push(newBooking);
  setStore(KEYS.BOOKINGS, bookings);
  return { data: newBooking, error: null };
}

export function updateBooking(id: string, updates: Record<string, any>): { error: string | null } {
  const bookings = getStore<any>(KEYS.BOOKINGS);
  const index = bookings.findIndex((b: any) => b.id === id);
  if (index === -1) return { error: 'Booking not found' };
  bookings[index] = { ...bookings[index], ...updates, updated_at: new Date().toISOString() };
  setStore(KEYS.BOOKINGS, bookings);
  return { error: null };
}

// ---- Portfolio Items ----

export function getPortfolioItems(installerId?: string): any[] {
  let items = getStore<any>(KEYS.PORTFOLIO_ITEMS);
  if (installerId) items = items.filter((i: any) => i.installer_id === installerId);
  return items.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function createPortfolioItem(item: Record<string, any>): { data: any; error: string | null } {
  const items = getStore<any>(KEYS.PORTFOLIO_ITEMS);
  const newItem = {
    id: generateId(),
    ...item,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  items.push(newItem);
  setStore(KEYS.PORTFOLIO_ITEMS, items);
  return { data: newItem, error: null };
}

export function updatePortfolioItem(id: string, updates: Record<string, any>): { error: string | null } {
  const items = getStore<any>(KEYS.PORTFOLIO_ITEMS);
  const index = items.findIndex((i: any) => i.id === id);
  if (index === -1) return { error: 'Item not found' };
  items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
  setStore(KEYS.PORTFOLIO_ITEMS, items);
  return { error: null };
}

export function deletePortfolioItem(id: string): { error: string | null } {
  const items = getStore<any>(KEYS.PORTFOLIO_ITEMS);
  const filtered = items.filter((i: any) => i.id !== id);
  setStore(KEYS.PORTFOLIO_ITEMS, filtered);
  return { error: null };
}

// ---- Installer Specialties ----

export function getInstallerSpecialties(installerId?: string): any[] {
  let specs = getStore<any>(KEYS.INSTALLER_SPECIALTIES);
  if (installerId) specs = specs.filter((s: any) => s.installer_id === installerId);
  return specs;
}

export function addInstallerSpecialty(installerId: string, specialty: string): { error: string | null } {
  const specs = getStore<any>(KEYS.INSTALLER_SPECIALTIES);
  if (specs.find((s: any) => s.installer_id === installerId && s.specialty === specialty)) {
    return { error: 'Specialty already added' };
  }
  specs.push({
    id: generateId(),
    installer_id: installerId,
    specialty,
    created_at: new Date().toISOString(),
  });
  setStore(KEYS.INSTALLER_SPECIALTIES, specs);
  return { error: null };
}

export function removeInstallerSpecialty(installerId: string, specialty: string): { error: string | null } {
  const specs = getStore<any>(KEYS.INSTALLER_SPECIALTIES);
  const filtered = specs.filter((s: any) => !(s.installer_id === installerId && s.specialty === specialty));
  setStore(KEYS.INSTALLER_SPECIALTIES, filtered);
  return { error: null };
}

// ---- Installer Availability ----

export function getInstallerAvailability(installerId: string): any[] {
  const avail = getStore<any>(KEYS.INSTALLER_AVAILABILITY);
  return avail.filter((a: any) => a.installer_id === installerId);
}

export function setInstallerAvailability(installerId: string, dates: { date: string; is_available: boolean }[]): { error: string | null } {
  let avail = getStore<any>(KEYS.INSTALLER_AVAILABILITY);
  // Remove existing for this installer
  avail = avail.filter((a: any) => a.installer_id !== installerId);
  // Add new
  dates.forEach(d => {
    avail.push({
      id: generateId(),
      installer_id: installerId,
      date: d.date,
      is_available: d.is_available,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });
  setStore(KEYS.INSTALLER_AVAILABILITY, avail);
  return { error: null };
}

// ---- Specialties (admin-managed) ----

export function getSpecialties(activeOnly: boolean = false): any[] {
  let specs = getStore<any>(KEYS.SPECIALTIES);
  if (activeOnly) specs = specs.filter((s: any) => s.is_active);
  return specs.sort((a: any, b: any) => a.name.localeCompare(b.name));
}

export function createSpecialty(name: string): { error: string | null } {
  const specs = getStore<any>(KEYS.SPECIALTIES);
  specs.push({
    id: generateId(),
    name,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  setStore(KEYS.SPECIALTIES, specs);
  return { error: null };
}

export function updateSpecialty(id: string, updates: Record<string, any>): { error: string | null } {
  const specs = getStore<any>(KEYS.SPECIALTIES);
  const index = specs.findIndex((s: any) => s.id === id);
  if (index === -1) return { error: 'Specialty not found' };
  specs[index] = { ...specs[index], ...updates, updated_at: new Date().toISOString() };
  setStore(KEYS.SPECIALTIES, specs);
  return { error: null };
}

export function deleteSpecialty(id: string): { error: string | null } {
  const specs = getStore<any>(KEYS.SPECIALTIES);
  const filtered = specs.filter((s: any) => s.id !== id);
  setStore(KEYS.SPECIALTIES, filtered);
  return { error: null };
}

// ---- File Storage (base64 in localStorage) ----

export function storeFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Enrichment helpers

export function getBookingsWithRelations(filters: Record<string, any> = {}): any[] {
  const bookings = getBookings(filters);
  return bookings.map(b => {
    const clientProfile = getProfile(b.client_id);
    const installerProfile = getProfile(b.installer_id);
    return {
      ...b,
      client: clientProfile ? {
        full_name: clientProfile.full_name,
        contact_number: clientProfile.contact_number,
        province: clientProfile.province,
      } : null,
      installer: installerProfile ? {
        full_name: installerProfile.full_name,
        company_name: installerProfile.company_name,
        contact_number: installerProfile.contact_number,
        province: installerProfile.province,
      } : null,
    };
  });
}

export function getInstallersWithSpecialties(): any[] {
  const roles = getAllRoles().filter(r => r.role === 'installer');
  const installerIds = roles.map(r => r.user_id);
  const profiles = getAllProfiles().filter(p => installerIds.includes(p.id));
  
  return profiles.map(profile => {
    const specialties = getInstallerSpecialties(profile.id).map(s => s.specialty);
    const portfolioCount = getPortfolioItems(profile.id).length;
    return {
      ...profile,
      specialties,
      installer_specialties: specialties.map(s => ({ specialty: s })),
      portfolio_count: portfolioCount,
    };
  });
}

// ---- Admin: User Management ----

export type AppRole = 'admin' | 'installer' | 'client';

export interface AdminUserView {
  id: string;
  email: string;
  role: AppRole | null;
  full_name: string;
  contact_number: string | null;
  province: string | null;
  company_name: string | null;
  created_at: string;
  bookings_count: number;
}

export function getAllUsersDetailed(): AdminUserView[] {
  const users = getStore<LocalUser>(KEYS.USERS);
  const profiles = getAllProfiles();
  const roles = getAllRoles();
  const bookings = getStore<any>(KEYS.BOOKINGS);

  return users.map(u => {
    const profile = profiles.find((p: any) => p.id === u.id);
    const role = roles.find((r: any) => r.user_id === u.id);
    const bookingsCount = bookings.filter((b: any) => b.client_id === u.id || b.installer_id === u.id).length;
    return {
      id: u.id,
      email: u.email,
      role: (role?.role as AppRole) || null,
      full_name: profile?.full_name || '',
      contact_number: profile?.contact_number || null,
      province: profile?.province || null,
      company_name: profile?.company_name || null,
      created_at: u.created_at,
      bookings_count: bookingsCount,
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function adminCreateUser(input: {
  email: string;
  password: string;
  role: AppRole;
  full_name: string;
  contact_number?: string;
  province?: string;
  company_name?: string;
}): { error: string | null } {
  if (emailExists(input.email)) return { error: 'An account with this email already exists.' };
  const pwdError = validatePassword(input.password);
  if (pwdError) return { error: pwdError };

  // Preserve current admin session
  const currentSession = localStorage.getItem(KEYS.CURRENT_USER);
  const { error } = signUp(input.email, input.password, {
    full_name: input.full_name,
    contact_number: input.contact_number || '',
    province: input.province || '',
    company_name: input.company_name || '',
    role: input.role,
  });
  // Restore admin session (signUp auto-logs in the new user)
  if (currentSession) localStorage.setItem(KEYS.CURRENT_USER, currentSession);
  else localStorage.removeItem(KEYS.CURRENT_USER);
  return { error };
}

export function adminUpdateUser(userId: string, updates: {
  email?: string;
  full_name?: string;
  contact_number?: string;
  province?: string;
  company_name?: string;
  role?: AppRole;
  password?: string;
}): { error: string | null } {
  const users = getStore<LocalUser>(KEYS.USERS);
  const uIdx = users.findIndex(u => u.id === userId);
  if (uIdx === -1) return { error: 'User not found' };

  if (updates.email && updates.email.toLowerCase() !== users[uIdx].email.toLowerCase()) {
    if (emailExists(updates.email)) return { error: 'Email already in use by another account.' };
    users[uIdx].email = updates.email;
  }
  if (updates.password) {
    const err = validatePassword(updates.password);
    if (err) return { error: err };
    users[uIdx].password = updates.password;
  }
  setStore(KEYS.USERS, users);

  const profileUpdates: Record<string, any> = {};
  if (updates.full_name !== undefined) profileUpdates.full_name = updates.full_name;
  if (updates.contact_number !== undefined) profileUpdates.contact_number = updates.contact_number;
  if (updates.province !== undefined) profileUpdates.province = updates.province;
  if (updates.company_name !== undefined) profileUpdates.company_name = updates.company_name;
  if (Object.keys(profileUpdates).length > 0) updateProfile(userId, profileUpdates);

  if (updates.role) {
    const roles = getStore<any>(KEYS.USER_ROLES);
    const rIdx = roles.findIndex((r: any) => r.user_id === userId);
    if (rIdx === -1) {
      roles.push({ id: generateId(), user_id: userId, role: updates.role, created_at: new Date().toISOString() });
    } else {
      roles[rIdx].role = updates.role;
    }
    setStore(KEYS.USER_ROLES, roles);
  }
  return { error: null };
}

export function adminDeleteUser(userId: string): { error: string | null } {
  const current = getCurrentUser();
  if (current?.id === userId) return { error: 'You cannot delete your own account while signed in.' };

  setStore(KEYS.USERS, getStore<LocalUser>(KEYS.USERS).filter(u => u.id !== userId));
  setStore(KEYS.PROFILES, getStore<any>(KEYS.PROFILES).filter((p: any) => p.id !== userId));
  setStore(KEYS.USER_ROLES, getStore<any>(KEYS.USER_ROLES).filter((r: any) => r.user_id !== userId));
  setStore(KEYS.BOOKINGS, getStore<any>(KEYS.BOOKINGS).filter((b: any) => b.client_id !== userId && b.installer_id !== userId));
  setStore(KEYS.PORTFOLIO_ITEMS, getStore<any>(KEYS.PORTFOLIO_ITEMS).filter((i: any) => i.installer_id !== userId));
  setStore(KEYS.INSTALLER_SPECIALTIES, getStore<any>(KEYS.INSTALLER_SPECIALTIES).filter((s: any) => s.installer_id !== userId));
  setStore(KEYS.INSTALLER_AVAILABILITY, getStore<any>(KEYS.INSTALLER_AVAILABILITY).filter((a: any) => a.installer_id !== userId));
  return { error: null };
}

export function deleteBooking(id: string): { error: string | null } {
  setStore(KEYS.BOOKINGS, getStore<any>(KEYS.BOOKINGS).filter((b: any) => b.id !== id));
  return { error: null };
}

// ---- Admin: Analytics ----

export interface AdminAnalytics {
  totals: {
    users: number;
    admins: number;
    installers: number;
    clients: number;
    bookings: number;
    pending: number;
    accepted: number;
    inProgress: number;
    completed: number;
    rejected: number;
    cancelled: number;
    portfolioItems: number;
    specialties: number;
  };
  bookingsByStatus: { status: string; count: number }[];
  usersByRole: { role: string; count: number }[];
  usersGrowth: { month: string; users: number }[];
  bookingsTrend: { month: string; bookings: number }[];
  topInstallers: { id: string; name: string; bookings: number; completed: number }[];
  topProvinces: { province: string; bookings: number }[];
  recentActivity: { id: string; type: string; description: string; date: string }[];
}

export function getAdminAnalytics(): AdminAnalytics {
  const users = getStore<LocalUser>(KEYS.USERS);
  const roles = getAllRoles();
  const bookings = getStore<any>(KEYS.BOOKINGS);
  const profiles = getAllProfiles();
  const portfolioItems = getStore<any>(KEYS.PORTFOLIO_ITEMS);
  const specialties = getStore<any>(KEYS.SPECIALTIES);

  const status = (s: string) => bookings.filter((b: any) => b.status === s).length;

  // Group by month (last 6 months)
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ key, label: d.toLocaleString('en-US', { month: 'short' }) });
  }

  const usersGrowth = months.map(m => ({
    month: m.label,
    users: users.filter(u => u.created_at.startsWith(m.key)).length,
  }));

  const bookingsTrend = months.map(m => ({
    month: m.label,
    bookings: bookings.filter((b: any) => (b.created_at || '').startsWith(m.key)).length,
  }));

  // Top installers by booking count
  const installerCounts = new Map<string, { bookings: number; completed: number }>();
  bookings.forEach((b: any) => {
    const e = installerCounts.get(b.installer_id) || { bookings: 0, completed: 0 };
    e.bookings += 1;
    if (b.status === 'completed') e.completed += 1;
    installerCounts.set(b.installer_id, e);
  });
  const topInstallers = Array.from(installerCounts.entries())
    .map(([id, v]) => {
      const p = profiles.find((pr: any) => pr.id === id);
      return { id, name: p?.company_name || p?.full_name || 'Unknown', bookings: v.bookings, completed: v.completed };
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  // Provinces
  const provinceCounts = new Map<string, number>();
  bookings.forEach((b: any) => {
    const prov = b.province || 'Unknown';
    provinceCounts.set(prov, (provinceCounts.get(prov) || 0) + 1);
  });
  const topProvinces = Array.from(provinceCounts.entries())
    .map(([province, bookings]) => ({ province, bookings }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  // Recent activity
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((b: any) => ({
      id: b.id,
      type: 'booking',
      description: `New booking: ${b.project_title}`,
      date: b.created_at,
    }));
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(u => ({ id: u.id, type: 'user', description: `New user: ${u.email}`, date: u.created_at }));
  const recentActivity = [...recentBookings, ...recentUsers]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return {
    totals: {
      users: users.length,
      admins: roles.filter(r => r.role === 'admin').length,
      installers: roles.filter(r => r.role === 'installer').length,
      clients: roles.filter(r => r.role === 'client').length,
      bookings: bookings.length,
      pending: status('pending'),
      accepted: status('accepted'),
      inProgress: status('in_progress'),
      completed: status('completed'),
      rejected: status('rejected'),
      cancelled: status('cancelled'),
      portfolioItems: portfolioItems.length,
      specialties: specialties.length,
    },
    bookingsByStatus: [
      { status: 'Pending', count: status('pending') },
      { status: 'Accepted', count: status('accepted') },
      { status: 'In Progress', count: status('in_progress') },
      { status: 'Completed', count: status('completed') },
      { status: 'Rejected', count: status('rejected') },
      { status: 'Cancelled', count: status('cancelled') },
    ].filter(s => s.count > 0),
    usersByRole: [
      { role: 'Admins', count: roles.filter(r => r.role === 'admin').length },
      { role: 'Installers', count: roles.filter(r => r.role === 'installer').length },
      { role: 'Clients', count: roles.filter(r => r.role === 'client').length },
    ].filter(r => r.count > 0),
    usersGrowth,
    bookingsTrend,
    topInstallers,
    topProvinces,
    recentActivity,
  };
}
