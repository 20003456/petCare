"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  Clock3,
  Edit3,
  HeartHandshake,
  LogOut,
  PawPrint,
  Plus,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type AppUser = {
  id: string;
  phone: string;
  customerName: string | null;
};

type Appointment = {
  id: string;
  pet_id: string | null;
  pet_name: string;
  pet_type: string;
  service_type: string | null;
  appointment_date: string;
  appointment_time: string | null;
  notes: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
};

type Pet = {
  id: string;
  name: string;
  petType: string;
  sensitivityNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type PetForm = {
  name: string;
  petType: string;
  sensitivityNotes: string;
};

const initialPetForm: PetForm = {
  name: "",
  petType: "",
  sensitivityNotes: "",
};

const statusLabels: Record<Appointment["status"], string> = {
  pending: "待确认",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
};

const petTypes = ["小型犬", "中大型犬", "猫咪"];

export default function AccountClient() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petForm, setPetForm] = useState(initialPetForm);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPet, setIsSavingPet] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const nextAppointment = useMemo(
    () =>
      appointments.find(
        (appointment) =>
          appointment.status === "pending" || appointment.status === "confirmed",
      ),
    [appointments],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      try {
        const sessionResponse = await fetch("/api/auth/session");
        const sessionResult = await sessionResponse.json();
        const nextUser = sessionResult.user ?? null;

        if (!nextUser) {
          window.location.href = "/auth";
          return;
        }

        const [appointmentsResponse, petsResponse] = await Promise.all([
          fetch("/api/appointments"),
          fetch("/api/pets"),
        ]);

        const appointmentsResult = await appointmentsResponse.json();
        const petsResult = await petsResponse.json();

        if (!appointmentsResponse.ok) {
          throw new Error(appointmentsResult.message || "读取预约失败。");
        }

        if (!petsResponse.ok) {
          throw new Error(petsResult.message || "读取宠物档案失败。");
        }

        if (!isMounted) {
          return;
        }

        setUser(nextUser);
        setAppointments(appointmentsResult.appointments ?? []);
        setPets(petsResult.pets ?? []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        showMessage(
          error instanceof Error ? error.message : "账号信息读取失败，请稍后再试。",
          "error",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      isMounted = false;
    };
  }, []);

  const updatePetForm = (field: keyof PetForm, value: string) => {
    setPetForm((current) => ({ ...current, [field]: value }));
  };

  const resetPetForm = () => {
    setPetForm(initialPetForm);
    setEditingPetId(null);
  };

  const editPet = (pet: Pet) => {
    setEditingPetId(pet.id);
    setPetForm({
      name: pet.name,
      petType: pet.petType,
      sensitivityNotes: pet.sensitivityNotes ?? "",
    });
  };

  const savePet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingPet(true);
    setMessage("");

    try {
      if (!petForm.name.trim() || !petForm.petType.trim()) {
        throw new Error("请填写宠物名字和宠物类型。");
      }

      const response = await fetch(
        editingPetId ? `/api/pets/${editingPetId}` : "/api/pets",
        {
          method: editingPetId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(petForm),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "保存宠物档案失败。");
      }

      setPets((current) => {
        if (!editingPetId) {
          return [result.pet, ...current];
        }

        return current.map((pet) => (pet.id === editingPetId ? result.pet : pet));
      });
      resetPetForm();
      showMessage(result.message || "宠物档案已保存。", "success");
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "保存宠物档案失败。",
        "error",
      );
    } finally {
      setIsSavingPet(false);
    }
  };

  const deletePet = async (pet: Pet) => {
    const confirmed = window.confirm(`确定删除 ${pet.name} 的档案吗？历史预约不会被删除。`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/pets/${pet.id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "删除宠物档案失败。");
      }

      setPets((current) => current.filter((item) => item.id !== pet.id));

      if (editingPetId === pet.id) {
        resetPetForm();
      }

      showMessage(result.message || "宠物档案已删除。", "success");
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "删除宠物档案失败。",
        "error",
      );
    }
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
  };

  return (
    <main className="account-page">
      <header className="account-header">
        <a className="brand" href="/" aria-label="返回爪爪焕新首页">
          <span className="brand-mark">
            <PawPrint size={22} />
          </span>
          <span>爪爪焕新</span>
        </a>
        <div className="account-header-actions">
          <a className="auth-back-link" href="/#booking">
            <ChevronLeft size={18} />
            去预约
          </a>
          <button className="account-logout" type="button" onClick={signOut}>
            <LogOut size={18} />
            退出
          </button>
        </div>
      </header>

      <section className="account-shell">
        <div className="account-title-row">
          <div>
            <p className="eyebrow">Pet Parent Center</p>
            <h1>我的账号</h1>
            <p>查看已预约信息，也可以提前维护宠物档案，门店接待时会更顺手。</p>
          </div>
          <div className="account-profile">
            <span>
              <UserRound size={22} />
            </span>
            <div>
              <strong>{user?.customerName || "家长"}</strong>
              <small>{user?.phone || "正在读取账号"}</small>
            </div>
          </div>
        </div>

        {message ? (
          <p className={`account-message account-message-${messageType}`}>
            {message}
          </p>
        ) : null}

        {isLoading ? (
          <div className="account-loading">正在读取你的预约和宠物档案...</div>
        ) : (
          <div className="account-grid">
            <section className="account-panel">
              <div className="account-panel-heading">
                <div>
                  <p className="eyebrow">Appointments</p>
                  <h2>我的预约</h2>
                </div>
                {nextAppointment ? (
                  <span className="account-pill">下一次：{formatDate(nextAppointment.appointment_date)}</span>
                ) : null}
              </div>

              {appointments.length > 0 ? (
                <div className="appointment-list">
                  {appointments.map((appointment) => (
                    <article className="appointment-item" key={appointment.id}>
                      <div className="appointment-date">
                        <CalendarCheck size={20} />
                        <div>
                          <strong>{formatDate(appointment.appointment_date)}</strong>
                          <small>
                            {appointment.appointment_time
                              ? formatTime(appointment.appointment_time)
                              : "到店前确认时间"}
                          </small>
                        </div>
                      </div>
                      <div className="appointment-main">
                        <h3>{appointment.pet_name}</h3>
                        <p>
                          {appointment.pet_type}
                          {appointment.service_type ? ` · ${appointment.service_type}` : ""}
                        </p>
                        {appointment.notes ? <small>{appointment.notes}</small> : null}
                      </div>
                      <span className={`status-badge status-${appointment.status}`}>
                        {statusLabels[appointment.status] ?? appointment.status}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="account-empty">
                  <CalendarCheck size={28} />
                  <h3>还没有预约记录</h3>
                  <p>先给毛孩子约一次洗护，记录会自动出现在这里。</p>
                  <a className="primary-button" href="/#booking">
                    去预约
                  </a>
                </div>
              )}
            </section>

            <section className="account-panel">
              <div className="account-panel-heading">
                <div>
                  <p className="eyebrow">Pets</p>
                  <h2>宠物档案</h2>
                </div>
                <span className="account-pill">{pets.length} 份档案</span>
              </div>

              <form className="pet-form" onSubmit={savePet}>
                <label>
                  宠物名字
                  <input
                    type="text"
                    value={petForm.name}
                    onChange={(event) => updatePetForm("name", event.target.value)}
                    placeholder="例如：奶昔"
                    required
                  />
                </label>
                <label>
                  宠物类型
                  <select
                    value={petForm.petType}
                    onChange={(event) => updatePetForm("petType", event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      请选择
                    </option>
                    {petTypes.map((petType) => (
                      <option key={petType}>{petType}</option>
                    ))}
                  </select>
                </label>
                <label className="pet-notes-field">
                  敏感备注
                  <textarea
                    value={petForm.sensitivityNotes}
                    onChange={(event) =>
                      updatePetForm("sensitivityNotes", event.target.value)
                    }
                    placeholder="例如：怕吹风、皮肤敏感、到店先安抚"
                    rows={4}
                  />
                </label>
                <div className="pet-form-actions">
                  <button type="submit" disabled={isSavingPet}>
                    {editingPetId ? <Save size={18} /> : <Plus size={18} />}
                    {isSavingPet ? "保存中..." : editingPetId ? "保存修改" : "新增档案"}
                  </button>
                  {editingPetId ? (
                    <button type="button" className="pet-cancel-button" onClick={resetPetForm}>
                      <X size={18} />
                      取消
                    </button>
                  ) : null}
                </div>
              </form>

              {pets.length > 0 ? (
                <div className="pet-list">
                  {pets.map((pet) => (
                    <article className="pet-item" key={pet.id}>
                      <div className="pet-item-icon">
                        <HeartHandshake size={20} />
                      </div>
                      <div>
                        <h3>{pet.name}</h3>
                        <p>{pet.petType}</p>
                        {pet.sensitivityNotes ? <small>{pet.sensitivityNotes}</small> : null}
                      </div>
                      <div className="pet-item-actions">
                        <button type="button" onClick={() => editPet(pet)} aria-label="编辑宠物档案">
                          <Edit3 size={17} />
                        </button>
                        <button type="button" onClick={() => deletePet(pet)} aria-label="删除宠物档案">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="account-empty account-empty-small">
                  <Clock3 size={26} />
                  <h3>还没有宠物档案</h3>
                  <p>先建一份档案，下次预约可以直接选择。</p>
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function formatDate(value: string): string {
  if (!value) {
    return "待确认日期";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value: string): string {
  return value.slice(0, 5);
}
