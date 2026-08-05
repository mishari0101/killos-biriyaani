"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  UserIcon,
  LockIcon,
  ShieldIcon,
  SaveIcon,
} from "@/components/ui/icons";
import { TextInput } from "@/components/admin/settings/text-input";
import { PasswordField } from "@/components/admin/account/password-field";
import { SectionCard } from "@/components/admin/settings/section-card";
import { Toast, type ToastState } from "@/components/admin/settings/toast";
import { LogoutButton } from "@/components/admin/logout-button";

interface AccountSettingsFormProps {
  initialName: string;
  initialEmail: string;
  lastLoginAt: string | null;
}

const NAME_MAX = 120;
const EMAIL_MAX = 160;
const PASSWORD_MIN = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Record<string, string>;

function validateProfile(name: string, email: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!name.trim()) {
    errors.name = "Display name is required.";
  } else if (name.trim().length > NAME_MAX) {
    errors.name = `Display name must be ${NAME_MAX} characters or fewer.`;
  }
  if (!email.trim()) {
    errors.email = "Admin email is required.";
  } else if (email.trim().length > EMAIL_MAX) {
    errors.email = `Email must be ${EMAIL_MAX} characters or fewer.`;
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
}

function validatePasswordChange(
  current: string,
  next: string,
  confirm: string
): FieldErrors {
  const errors: FieldErrors = {};
  if (!current) errors.currentPassword = "Current password is required.";
  if (!next) {
    errors.newPassword = "New password is required.";
  } else {
    if (next.length < PASSWORD_MIN) {
      errors.newPassword = `New password must be at least ${PASSWORD_MIN} characters.`;
    }
    if (!/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) {
      errors.newPassword = "New password must include at least one letter and one number.";
    }
    if (current && next === current) {
      errors.newPassword = "New password must be different from the current password.";
    }
  }
  if (!confirm) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (next && next !== confirm) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export function AccountSettingsForm({
  initialName,
  initialEmail,
  lastLoginAt,
}: AccountSettingsFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({});
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const lastLoginLabel = useMemo(() => {
    if (!lastLoginAt) return "Never signed in";
    return new Date(lastLoginAt).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [lastLoginAt]);

  const clearProfileError = useCallback((key: string) => {
    setProfileErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }, []);

  const clearPasswordError = useCallback((key: string) => {
    setPasswordErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }, []);

  async function handleSaveProfile() {
    if (profileSaving) return;
    const errors = validateProfile(name, email);
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) {
      setToast({ type: "error", message: "Some fields need attention before saving." });
      return;
    }

    setProfileSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const serverErrors = data?.errors as FieldErrors | undefined;
        if (serverErrors && Object.keys(serverErrors).length > 0) {
          setProfileErrors(serverErrors);
        }
        setToast({
          type: "error",
          message: data?.error ?? "Could not save your profile. Please try again.",
        });
        return;
      }
      if (data?.user) {
        setName(data.user.name);
        setEmail(data.user.email);
      }
      setToast({ type: "success", message: "Profile saved successfully." });
      router.refresh();
    } catch {
      setToast({ type: "error", message: "Could not reach the server. Please try again." });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleSavePassword() {
    if (passwordSaving) return;
    const errors = validatePasswordChange(currentPassword, newPassword, confirmPassword);
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) {
      setToast({ type: "error", message: "Some fields need attention before saving." });
      return;
    }

    setPasswordSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const serverErrors = data?.errors as FieldErrors | undefined;
        if (serverErrors && Object.keys(serverErrors).length > 0) {
          setPasswordErrors(serverErrors);
        }
        setToast({
          type: "error",
          message: data?.error ?? "Could not change your password. Please try again.",
        });
        return;
      }
      setToast({
        type: "success",
        message: "Password changed. Please sign in again.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        router.replace("/admin/login?changed=1");
        router.refresh();
      }, 1200);
    } catch {
      setToast({ type: "error", message: "Could not reach the server. Please try again." });
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="pb-16">
      <div className="space-y-6">
        {/* 1 — Profile */}
        <SectionCard
          index="01"
          title="Profile"
          description="Your display name and sign-in email."
          icon={UserIcon}
        >
          <div className="admin-field-grid">
            <TextInput
              id="adminName"
              label="Display Name"
              value={name}
              onChange={(v) => {
                setName(v);
                clearProfileError("name");
              }}
              placeholder="Owner"
              maxLength={NAME_MAX}
              autoComplete="name"
              error={profileErrors.name}
              hint="Shown in the dashboard header."
            />
            <TextInput
              id="adminEmail"
              label="Admin Email"
              type="email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                clearProfileError("email");
              }}
              placeholder="admin@example.com"
              maxLength={EMAIL_MAX}
              autoComplete="email"
              error={profileErrors.email}
              hint="The email you sign in with."
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="admin-btn admin-btn-primary font-semibold disabled:opacity-60"
            >
              {profileSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1a1a]/25 border-t-[#1a1a1a]" />
                  Saving…
                </>
              ) : (
                <>
                  <SaveIcon size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </SectionCard>

        {/* 2 — Change Password */}
        <SectionCard
          index="02"
          title="Change Password"
          description="Keep your sign-in secure with a strong password."
          icon={LockIcon}
        >
          <div className="space-y-5">
            <PasswordField
              id="currentPassword"
              label="Current Password"
              value={currentPassword}
              onChange={(v) => {
                setCurrentPassword(v);
                clearPasswordError("currentPassword");
              }}
              placeholder="Your current password"
              autoComplete="current-password"
              error={passwordErrors.currentPassword}
            />

            <div className="admin-field-grid">
              <PasswordField
                id="newPassword"
                label="New Password"
                value={newPassword}
                onChange={(v) => {
                  setNewPassword(v);
                  clearPasswordError("newPassword");
                }}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                error={passwordErrors.newPassword}
                hint="At least 8 characters with a letter and a number."
              />
              <PasswordField
                id="confirmPassword"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v);
                  clearPasswordError("confirmPassword");
                }}
                placeholder="Repeat the new password"
                autoComplete="new-password"
                error={passwordErrors.confirmPassword}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSavePassword}
              disabled={passwordSaving}
              className="admin-btn admin-btn-primary font-semibold disabled:opacity-60"
            >
              {passwordSaving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1a1a]/25 border-t-[#1a1a1a]" />
                  Saving…
                </>
              ) : (
                <>
                  <SaveIcon size={16} />
                  Save Password
                </>
              )}
            </button>
          </div>
        </SectionCard>

        {/* 3 — Security */}
        <SectionCard
          index="03"
          title="Security"
          description="Session activity and sign-out."
          icon={ShieldIcon}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="admin-field-label">Last Login</p>
              <p className="mt-1 text-[0.9rem] text-[var(--admin-fg)]" suppressHydrationWarning>
                {lastLoginLabel}
              </p>
              <p className="admin-field-hint mt-1">
                The most recent successful sign-in to this account.
              </p>
            </div>
            <div className="sm:w-56">
              <LogoutButton />
            </div>
          </div>
        </SectionCard>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
