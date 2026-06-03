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
        <style dangerouslySetInnerHTML={{ __html: `
          #google_translate_element {
            display: inline-flex;
            align-items: center;
          }
          #google_translate_element .goog-te-gadget {
            font-family: Arial, sans-serif !important;
            font-size: 0 !important;
          }
          #google_translate_element .goog-te-gadget select {
            font-family: Arial, sans-serif !important;
            font-size: 13px !important;
            font-weight: 600;
            color: #333;
            background-color: white;
            border: 1.5px solid #e5e5e5;
            border-radius: 8px;
            padding: 6px 10px;
            cursor: pointer;
            outline: none;
            transition: border-color 0.2s;
            max-width: 160px;
          }
          #google_translate_element .goog-te-gadget select:hover {
            border-color: #f90;
          }
          #google_translate_element .goog-te-gadget select:focus {
            border-color: #f90;
            box-shadow: 0 0 0 3px rgba(255,153,0,0.1);
          }
          .goog-te-banner-frame { display: none !important; }
          .skiptranslate iframe { display: none !important; }
          body { top: 0 !important; }
          .goog-tooltip { display: none !important; }
          .goog-tooltip:hover { display: none !important; }
          .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
          #goog-gt-tt { display: none !important; }
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif' }}>
        {children}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <script dangerouslySetInnerHTML={{ __html: `
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'es',
              includedLanguages: 'en,es,fr,pt,de,it,zh-CN,ja,ko,ar,ru,hi,nl,pl,tr,vi,th,id,ms',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            }, 'google_translate_element');
          }
        `}} />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async></script>
      </body>
    </html>
  );
}