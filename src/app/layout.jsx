import "./globals.css";

export const metadata = {
  title: "Mini Photo Editor",
  description: "Edit your photo here!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="black">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
