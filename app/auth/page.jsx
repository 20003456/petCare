import {
  CalendarCheck,
  ChevronLeft,
  HeartHandshake,
  LockKeyhole,
  Mail,
  PawPrint,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import heroMascotCat from "../../src/assets/hero-mascot-cat.png";

export const metadata = {
  title: "登录注册 | 爪爪焕新 Pet Spa",
  description: "爪爪焕新 Pet Spa 家长账号登录与注册",
};

export default function AuthPage() {
  return (
    <main className="auth-page">
      <header className="auth-header">
        <a className="brand" href="/" aria-label="返回爪爪焕新首页">
          <span className="brand-mark">
            <PawPrint size={22} />
          </span>
          <span>爪爪焕新</span>
        </a>
        <a className="auth-back-link" href="/">
          <ChevronLeft size={18} />
          返回首页
        </a>
      </header>

      <section className="auth-shell" aria-label="登录注册">
        <div className="auth-visual">
          <img src={heroMascotCat.src} alt="爪爪焕新店宠白色长毛猫" />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-copy">
            <p className="eyebrow">Member Care</p>
            <h1>给毛孩子建一份安心护理档案</h1>
            <p>
              登录后可保存预约信息、查看护理记录，也能让门店提前知道宠物的性格和敏感点。
            </p>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-heading">
            <p className="eyebrow">Pet Parent Account</p>
            <h2>家长账号</h2>
            <p>老用户直接登录，新用户用手机号注册。</p>
          </div>

          <div className="auth-form-grid">
            <form className="auth-form">
              <div className="auth-form-title">
                <span>
                  <UserRound size={20} />
                </span>
                <div>
                  <h3>登录</h3>
                  <p>继续管理你的预约</p>
                </div>
              </div>
              <label>
                手机号
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input type="tel" placeholder="请输入预约手机号" />
                </div>
              </label>
              <label>
                密码
                <div className="input-with-icon">
                  <LockKeyhole size={18} />
                  <input type="password" placeholder="请输入密码" />
                </div>
              </label>
              <button type="button">
                <ShieldCheck size={19} />
                登录账号
              </button>
            </form>

            <form className="auth-form auth-form-accent">
              <div className="auth-form-title">
                <span>
                  <Sparkles size={20} />
                </span>
                <div>
                  <h3>注册</h3>
                  <p>第一次来，先留一份档案</p>
                </div>
              </div>
              <label>
                家长姓名
                <div className="input-with-icon">
                  <UserRound size={18} />
                  <input type="text" placeholder="例如：小满家长" />
                </div>
              </label>
              <label>
                手机号
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input type="tel" placeholder="用于确认预约" />
                </div>
              </label>
              <label>
                邮箱
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input type="email" placeholder="可用于接收护理记录" />
                </div>
              </label>
              <button type="button">
                <CalendarCheck size={19} />
                创建账号
              </button>
            </form>
          </div>

          <div className="auth-benefits" aria-label="账号权益">
            <div>
              <HeartHandshake size={20} />
              <span>记录宠物敏感点</span>
            </div>
            <div>
              <CalendarCheck size={20} />
              <span>快速复用预约信息</span>
            </div>
            <div>
              <ShieldCheck size={20} />
              <span>护理偏好本地保存</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
