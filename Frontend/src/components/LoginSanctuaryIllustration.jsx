const LoginSanctuaryIllustration = () => (
  <div className="login-sanctuary-scene" role="group" aria-label="SkillForge fox in a moonlit sanctuary">
    <div className="login-sanctuary-moon" aria-hidden="true" />
    <div className="login-sanctuary-orbit" aria-hidden="true" />
    <div className="login-sanctuary-clouds" aria-hidden="true" />
    <div className="login-sanctuary-lake" aria-hidden="true" />
    <div className="login-sanctuary-fireflies" aria-hidden="true">
      {Array.from({ length: 10 }, (_, index) => (
        <span key={index} style={{ left: `${7 + index * 9}%`, top: `${12 + ((index * 19) % 68)}%`, animationDelay: `${-index * 0.9}s`, animationDuration: `${6 + index * 0.7}s` }} />
      ))}
    </div>
    <img
      src="/brand/skillforge-fox.png"
      alt="SkillForge's purple fox holding a magical flame"
      className="login-sanctuary-illustration"
      fetchPriority="high"
    />
    <div className="login-sanctuary-wordmark">
      <span>SkillForge</span>
      <small>EMPOWER YOUR CRAFT</small>
    </div>
  </div>
);

export default LoginSanctuaryIllustration;
