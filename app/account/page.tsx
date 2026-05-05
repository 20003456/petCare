import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = {
  title: "我的账号 | 爪爪焕新 Pet Spa",
  description: "查看预约记录，管理宠物档案。",
};

export default function AccountPage() {
  return <AccountClient />;
}
