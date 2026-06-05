import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, idioma } = await req.json();

    const idiomaTexto: any = {
      'es': 'español',
      'en': 'English',
      'fr': 'français',
      'pt': 'português',
      'de': 'Deutsch',
      'it': 'italiano',
      'zh-CN': 'chino mandarín',
      'ja': 'japonés',
      'ko': 'coreano',
      'ar': 'árabe',
      'ru': 'ruso',
    };

    const idiomaNombre = idiomaTexto[idioma] || 'español';

    const systemPrompt = `Eres el asistente virtual de Driny, un marketplace colombiano donde las personas pueden comprar, vender y subastar productos. Tu nombre es DrinyBot.

IMPORTANTE: Responde SIEMPRE en ${idiomaNombre}. Sin excepciones.

INFORMACION SOBRE DRINY:
- Driny es un marketplace colombiano en driny.vercel.app
- Los pagos se hacen con PayPal
- La comision de Driny es del 5% sobre cada venta
- Hay dos tipos de cuenta: Comprador y Vendedor
- Los vendedores pueden publicar productos y crear subastas
- Los compradores pueden comprar productos y ofertar en subastas
- El envio se coordina directamente entre vendedor y comprador usando paqueterias colombianas: Coordinadora, Interrapidisimo, Servientrega o TCC
- Las subastas son en tiempo real con ofertas en vivo
- Los vendedores NO pueden comprar productos ni dejar resenas
- Los compradores NO pueden vender ni crear subastas
- El SKU indica cuantas unidades hay disponibles de un producto

COMO AYUDAR:
1. Si preguntan como comprar: crear cuenta de comprador, buscar producto, agregar al carrito y pagar con PayPal
2. Si preguntan como vender: crear cuenta de vendedor, ir al panel de vendedor y publicar el producto con fotos
3. Si preguntan sobre subastas: ver subastas activas, hacer ofertas y el vendedor acepta o rechaza al final
4. Si preguntan sobre envios: el vendedor coordina con el comprador por WhatsApp usando paqueterias colombianas
5. Si preguntan sobre pagos: se usa PayPal de forma segura

ESTILO:
- Se amable, profesional y conciso
- Usa respuestas cortas y directas
- Si necesitas dar pasos, usa numeracion clara
- No uses markdown
- Maximo 150 palabras por respuesta`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: messages,
    });

    const texto = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ respuesta: texto });

  } catch (error: any) {
    console.error('Error DrinyBot:', error);
    return NextResponse.json(
      { respuesta: 'Lo siento, hubo un error. Verifica tu conexion e intenta de nuevo.', error: error.message },
      { status: 500 }
    );
  }
}