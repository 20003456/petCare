import "../src/styles.css";

export const metadata = {
  title: "爪爪焕新 Pet Spa",
  description: "宠物洗护、造型精修与门店预约服务。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
