import "./globals.css";

export const metadata = {
  title: 'Сервіс Онлайн Запису',
  description: 'Запис на послуги онлайн',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className="bg-[#fdf6f0] text-gray-900">
        {children}
      </body>
    </html>
  );
}
