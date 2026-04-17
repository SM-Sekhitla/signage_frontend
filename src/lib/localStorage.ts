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
  if (users.find(u => u.email === email)) {
    return { user: null as any, error: 'User already exists with this email' };
  }

  const user: LocalUser = {
    id: generateId(),
    email,
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
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return { user: null, error: 'Invalid login credentials' };
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
