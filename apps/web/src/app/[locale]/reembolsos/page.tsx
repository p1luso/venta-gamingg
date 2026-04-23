'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { RefreshCcw, ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-black italic uppercase tracking-tight text-gray-900 dark:text-white mt-12 mb-4">
    {children}
  </h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">{children}</p>
);
const UL = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-700 dark:text-gray-400 leading-relaxed marker:text-[#00FF88]">
    {children}
  </ul>
);
const OL = ({ children }: { children: React.ReactNode }) => (
  <ol className="list-decimal pl-6 space-y-2 mb-4 text-gray-700 dark:text-gray-400 leading-relaxed marker:text-[#00FF88] marker:font-bold">
    {children}
  </ol>
);

export default function ReembolsosPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF9] dark:bg-[#0A0A0A] text-gray-900 dark:text-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#00FF88] uppercase tracking-widest mb-8 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00FF88]/10 flex items-center justify-center">
            <RefreshCcw className="w-5 h-5 text-[#00FF88]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Legal</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-3">
          Política de <span className="text-[#00FF88]">Reembolsos</span>
        </h1>
        <p className="text-sm text-gray-500 mb-12">Última actualización: 22 de abril de 2026</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <div className="p-5 rounded-2xl bg-[#00FF88]/5 border border-[#00FF88]/20">
            <CheckCircle2 className="w-5 h-5 text-[#00FF88] mb-2" />
            <h3 className="text-sm font-black uppercase italic tracking-tight mb-1 text-gray-900 dark:text-white">
              Reembolso total
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Si tu orden aún no comenzó a procesarse.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
            <XCircle className="w-5 h-5 text-red-400 mb-2" />
            <h3 className="text-sm font-black uppercase italic tracking-tight mb-1 text-gray-900 dark:text-white">
              Sin reembolso
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Si las monedas ya fueron entregadas a tu cuenta.
            </p>
          </div>
        </div>

        <article>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            En VentaGamingg entendemos que pueden surgir inconvenientes. Por eso definimos una
            política clara y transparente respecto a devoluciones y reembolsos, adaptada a la
            naturaleza{' '}
            <strong className="text-gray-900 dark:text-white">digital y consumible</strong> de
            nuestros productos.
          </p>

          <H2>1. Naturaleza del producto</H2>
          <P>
            Las monedas virtuales y servicios de transferencia que ofrecemos son{' '}
            <strong className="text-gray-900 dark:text-white">bienes digitales consumibles</strong>{' '}
            y, una vez entregados, no pueden ser devueltos al estado original. Esta política se
            basa en dicha característica.
          </P>

          <H2>2. Reembolso total (100%)</H2>
          <P>Tenés derecho a un reembolso íntegro en los siguientes casos:</P>
          <UL>
            <li>
              La orden fue pagada pero{' '}
              <strong className="text-gray-900 dark:text-white">aún no fue asignada</strong> a
              nuestro sistema de transferencia (estado <em>PENDING</em>).
            </li>
            <li>
              Solicitás la cancelación{' '}
              <strong className="text-gray-900 dark:text-white">antes</strong> de enviar las
              credenciales de EA (Comfort Trade) o de listar el jugador en el mercado (Player
              Auction).
            </li>
            <li>
              Por un error imputable a VentaGamingg no podemos completar la entrega en un plazo
              razonable.
            </li>
            <li>Duplicación involuntaria del pago por una falla técnica.</li>
          </UL>

          <H2>3. Reembolso parcial</H2>
          <P>
            Si la transferencia se ejecutó parcialmente (por ejemplo, se entregaron 300k de 500k
            monedas y la cuenta sufrió una restricción externa), se reembolsará únicamente la{' '}
            <strong className="text-gray-900 dark:text-white">diferencia proporcional</strong> a
            las monedas no entregadas, descontando el costo operativo del intento de transferencia.
          </P>

          <H2>4. Casos sin derecho a reembolso</H2>
          <P>
            <strong className="text-gray-900 dark:text-white">No se emitirán reembolsos</strong>{' '}
            en las siguientes situaciones:
          </P>
          <UL>
            <li>
              Las monedas ya fueron{' '}
              <strong className="text-gray-900 dark:text-white">acreditadas en la cuenta</strong>{' '}
              del usuario (orden en estado <em>COMPLETED</em>).
            </li>
            <li>
              La cuenta EA del usuario fue suspendida o limitada por EA Sports durante o después
              de la transferencia (riesgo aceptado según los{' '}
              <Link href="/terminos" className="text-[#00FF88] hover:underline">
                Términos y Condiciones
              </Link>
              ).
            </li>
            <li>
              El usuario proporcionó credenciales incorrectas, incompletas o caducadas que
              imposibilitaron la entrega.
            </li>
            <li>
              El usuario modificó, desactivó o bloqueó su cuenta mientras la orden estaba en
              proceso.
            </li>
            <li>Arrepentimiento del usuario luego de la entrega efectiva.</li>
          </UL>

          <H2>5. Cómo solicitar un reembolso</H2>
          <P>Para solicitar un reembolso debés:</P>
          <OL>
            <li>
              Contactarnos por WhatsApp o chat de soporte dentro de las 72 horas posteriores al
              pago.
            </li>
            <li>Indicar el ID de la orden y el motivo detallado de la solicitud.</li>
            <li>Adjuntar capturas o evidencia si el motivo lo requiere.</li>
          </OL>
          <P>
            Evaluaremos tu solicitud en un plazo máximo de{' '}
            <strong className="text-gray-900 dark:text-white">48 horas hábiles</strong> y te
            responderemos con la resolución. Los reembolsos aprobados se acreditan por el mismo
            medio de pago utilizado, pudiendo demorar entre{' '}
            <strong className="text-gray-900 dark:text-white">5 y 15 días hábiles</strong> según
            el procesador de pagos.
          </P>

          <H2>6. Reembolsos a la wallet interna</H2>
          <P>
            Como alternativa, el usuario puede optar por recibir el reembolso como{' '}
            <strong className="text-gray-900 dark:text-white">
              crédito en su wallet de VentaGamingg
            </strong>
            . Esta opción se procesa en el acto y suele incluir un bonus adicional sobre el monto
            original.
          </P>

          <div className="mt-10 p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-black uppercase italic tracking-tight text-yellow-500 mb-1">
                Importante
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Al confirmar tu compra declarás conocer y aceptar esta política. Si tenés dudas
                antes de comprar, contactanos primero para evaluar tu caso.
              </p>
            </div>
          </div>

          <H2>7. Contacto</H2>
          <P>
            Ante cualquier duda sobre esta política podés contactarnos a través del chat de
            soporte disponible en el sitio o por WhatsApp, de lunes a sábado de 10:00 a 22:00 hs.
          </P>
        </article>
      </main>

      <Footer />
    </div>
  );
}
