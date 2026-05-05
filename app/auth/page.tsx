import type { Metadata } from "next";
import { ChevronLeft, PawPrint } from "lucide-react";
import heroMascotCat from "../../src/assets/hero-mascot-cat.png";
import AuthForms from "./AuthForms";

export const metadata: Metadata = {
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
            <p>老用户直接登录，新用户用手机号和密码注册。</p>
          </div>

          <AuthForms />
        </div>
      </section>
    </main>
  );
}
