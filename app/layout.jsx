export const metadata = {
  title: "Gas Safety Device Video",
  description: "Create a 15-second promotional video for a Gas Safety Device",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fff6f0", color: "#2b2b2b", fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial' }}>
        {children}
      </body>
    </html>
  );
}
