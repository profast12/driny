import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, idioma } = await req.json();

    const idiomaTexto: any = {
      'es': 'español', 'en': 'English', 'fr': 'français',
      'pt': 'português', 'de': 'Deutsch', 'it': 'italiano',
      'zh-CN': 'chino', 'ja': 'japonés', 'ko': 'coreano',
      'ar': 'árabe', 'ru': 'ruso',
    };

    const idiomaNombre = idiomaTexto[idioma] || 'español';

    const systemPrompt = `Eres DrinyBot, asistente virtual de Driny, marketplace colombiano. Responde siempre en ${idiomaNombre}. Se breve y amable. Maximo 120 palabras por respuesta.

Sobre Driny:
- Marketplace colombiano en driny.vercel.app
- Pagos con PayPal, comision 5% por venta
- Dos tipos de cuenta: Comprador y Vendedor
- Vendedores publican productos y crean subastas en tiempo real
- Compradores compran productos y ofertan en subastas
- Envios con Coordinadora, Interrapidisimo, Servientrega o TCC
- Vendedores NO pueden comprar ni dejar resenas
- Compradores NO pueden vender ni crear subastas
- SKU indica unidades disponibles del producto
- Notificaciones en tiempo real para compras, ventas y subastas
- Para comprar: crear cuenta comprador, buscar producto, carrito, pagar con PayPal
- Para vender: crear cuenta vendedor, panel vendedor, publicar producto con fotos
- Para subastas: ver subastas activas, hacer ofertas, vendedor acepta o rechaza`;

    const mensajesGroq = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await client.chat.completions.create({
      model: 'llama3-8b-8192',
      max_tokens: 300,
      system: systemPrompt,
      messages: mensajesGroq,
    } as any);

    const texto = response.choices[0]?.message?.content || '';
    return NextResponse.json({ respuesta: texto });

  } catch (error: any) {
    console.error('Error DrinyBot:', error?.message);
    return NextResponse.json({
      respuesta: 'Lo siento, hubo un error. Intenta de nuevo.',
      error: error?.message
    });
  }
}