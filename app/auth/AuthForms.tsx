"use client";

import { type FormEvent, useState } from "react";
import {
  CalendarCheck,
  HeartHandshake,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { normalizeChinaPhone } from "../../lib/phone";
import { getPasswordIssues, validatePasswordStrength } from "../../lib/password";

const initialLogin = {
  phone: "",
  password: "",
};

const initialRegister = {
  customerName: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";
type LoginField = keyof typeof initialLogin;
type RegisterField = keyof typeof initialRegister;

export default function AuthForms() {
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loginStatus, setLoginStatus] = useState<SubmitStatus>("idle");
  const [registerStatus, setRegisterStatus] = useState<SubmitStatus>("idle");
  const [loginMessage, setLoginMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const passwordIssues = getPasswordIssues(registerForm.password.trim());

  const updateLogin = (field: LoginField, value: string) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
  };

  const updateRegister = (field: RegisterField, value: string) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginStatus("submitting");
    setLoginMessage("");

    const phone = normalizeChinaPhone(loginForm.phone);
    const password = loginForm.password.trim();

    if (!phone || !password) {
      setLoginStatus("error");
      setLoginMessage("请填写手机号和密码。");
      return;
    }

    const response = await loginWithPassword({ phone, password });

    if (!response.ok) {
      setLoginStatus("error");
      setLoginMessage(response.message);
      return;
    }

    setLoginStatus("success");
    setLoginMessage("登录成功，正在返回预约页。");
    window.location.href = "/#booking";
  };

  const submitRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterStatus("submitting");
    setRegisterMessage("");

    try {
      const phone = normalizeChinaPhone(registerForm.phone);
      const password = registerForm.password.trim();
      const confirmPassword = registerForm.confirmPassword.trim();

      if (!registerForm.customerName.trim() || !phone || !password) {
        throw new Error("请填写姓名、手机号和密码。");
      }

      const passwordStrength = validatePasswordStrength(password);

      if (!passwordStrength.isValid) {
        throw new Error(passwordStrength.message);
      }

      if (password !== confirmPassword) {
        throw new Error("两次输入的密码不一致。");
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: registerForm.customerName,
          phone,
          password,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "注册失败，请稍后再试。");
      }

      const loginResponse = await loginWithPassword({
        phone,
        password,
      });

      if (!loginResponse.ok) {
        throw new Error(loginResponse.message);
      }

      setRegisterForm(initialRegister);
      setRegisterStatus("success");
      setRegisterMessage("注册成功，正在返回预约页。");
      window.location.href = "/#booking";
    } catch (error) {
      setRegisterStatus("error");
      setRegisterMessage(
        error instanceof Error ? error.message : "注册失败，请稍后再试。",
      );
    }
  };

  return (
    <>
      <div className="auth-form-grid">
        <form className="auth-form" onSubmit={submitLogin}>
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
              <input
                type="tel"
                placeholder="请输入预约手机号"
                value={loginForm.phone}
                onChange={(event) => updateLogin("phone", event.target.value)}
                required
              />
            </div>
          </label>
          <label>
            密码
            <div className="input-with-icon">
              <LockKeyhole size={18} />
              <input
                type="password"
                placeholder="请输入密码"
                value={loginForm.password}
                onChange={(event) => updateLogin("password", event.target.value)}
                required
              />
            </div>
          </label>
          <button type="submit" disabled={loginStatus === "submitting"}>
            <ShieldCheck size={19} />
            {loginStatus === "submitting" ? "登录中..." : "登录账号"}
          </button>
          {loginMessage ? (
            <p className={`auth-message auth-message-${loginStatus}`}>
              {loginMessage}
            </p>
          ) : null}
        </form>

        <form className="auth-form auth-form-accent" onSubmit={submitRegister}>
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
              <input
                type="text"
                placeholder="例如：小满家长"
                value={registerForm.customerName}
                onChange={(event) => updateRegister("customerName", event.target.value)}
                required
              />
            </div>
          </label>
          <label>
            手机号
            <div className="input-with-icon">
              <Phone size={18} />
              <input
                type="tel"
                placeholder="用于确认预约"
                value={registerForm.phone}
                onChange={(event) => updateRegister("phone", event.target.value)}
                required
              />
            </div>
          </label>
          <label>
            密码
            <div className="input-with-icon">
              <LockKeyhole size={18} />
              <input
                type="password"
                placeholder="至少 8 位，包含字母和数字"
                value={registerForm.password}
                onChange={(event) => updateRegister("password", event.target.value)}
                minLength={8}
                required
              />
            </div>
            <span className="password-hint">
              {passwordIssues.length > 0
                ? `还需要：${passwordIssues.join("、")}`
                : "密码强度符合要求"}
            </span>
          </label>
          <label>
            确认密码
            <div className="input-with-icon">
              <LockKeyhole size={18} />
              <input
                type="password"
                placeholder="再输入一次密码"
                value={registerForm.confirmPassword}
                onChange={(event) => updateRegister("confirmPassword", event.target.value)}
                minLength={8}
                required
              />
            </div>
          </label>
          <button type="submit" disabled={registerStatus === "submitting"}>
            <CalendarCheck size={19} />
            {registerStatus === "submitting" ? "创建中..." : "创建账号"}
          </button>
          {registerMessage ? (
            <p className={`auth-message auth-message-${registerStatus}`}>
              {registerMessage}
            </p>
          ) : null}
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
    </>
  );
}

async function loginWithPassword({
  phone,
  password,
}: {
  phone: string;
  password: string;
}): Promise<{ ok: boolean; message: string }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  const result = await response.json();

  return {
    ok: response.ok,
    message: result.message || "登录失败，请稍后再试。",
  };
}
