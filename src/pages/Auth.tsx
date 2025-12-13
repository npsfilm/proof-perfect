import { useAuthForm } from '@/components/auth/hooks/useAuthForm';
import { LoginSignupView, ForgotPasswordView, VerificationView } from '@/components/auth/views';

export default function Auth() {
  const {
    state,
    setEmail,
    setPassword,
    setShowPassword,
    setShowPasswordRequirements,
    setIsForgotPassword,
    handleSubmit,
    handlePasswordReset,
    handleResendVerification,
    handleModeSwitch,
    resetToLogin,
  } = useAuthForm();

  // Verification Message View
  if (state.showVerificationMessage) {
    return <VerificationView onBackToLogin={resetToLogin} />;
  }

  // Forgot Password View
  if (state.isForgotPassword) {
    return (
      <ForgotPasswordView
        email={state.email}
        loading={state.loading}
        onEmailChange={setEmail}
        onSubmit={handlePasswordReset}
        onBackToLogin={() => setIsForgotPassword(false)}
      />
    );
  }

  // Main Login/Signup View
  return (
    <LoginSignupView
      isLogin={state.isLogin}
      email={state.email}
      password={state.password}
      showPassword={state.showPassword}
      loading={state.loading}
      unverifiedEmail={state.unverifiedEmail}
      resendLoading={state.resendLoading}
      resendCooldown={state.resendCooldown}
      showPasswordRequirements={state.showPasswordRequirements}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onToggleShowPassword={() => setShowPassword(!state.showPassword)}
      onShowPasswordRequirements={() => setShowPasswordRequirements(true)}
      onSubmit={handleSubmit}
      onModeSwitch={handleModeSwitch}
      onForgotPassword={() => setIsForgotPassword(true)}
      onResendVerification={handleResendVerification}
    />
  );
}
