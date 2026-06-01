import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Driny — Compra, vende y subasta en Colombia",
  description: "El marketplace colombiano para comprar, vender y subastar productos. Envios a todo Colombia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif' }}>{children}</body>
    </html>
  );
}