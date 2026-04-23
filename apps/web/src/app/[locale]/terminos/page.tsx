'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

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

export default function TerminosPage() {
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
            <FileText className="w-5 h-5 text-[#00FF88]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Legal</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-3">
          Términos y <span className="text-[#00FF88]">Condiciones</span>
        </h1>
        <p className="text-sm text-gray-500 mb-12">Última actualización: 22 de abril de 2026</p>

        <article>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            Bienvenido a <strong className="text-gray-900 dark:text-white">VentaGamingg</strong>.
            Al acceder, registrarte o utilizar nuestros servicios aceptás estar legalmente
            vinculado a los presentes Términos y Condiciones. Te pedimos que los leas con
            atención antes de realizar una compra.
          </p>

          <H2>1. Naturaleza del servicio</H2>
          <P>
            VentaGamingg ofrece servicios de{' '}
            <strong className="text-gray-900 dark:text-white">transferencia de bienes virtuales</strong>{' '}
            asociados a videojuegos de terceros, específicamente monedas del modo Ultimate Team
            de EA Sports FC. Nuestro servicio se presta bajo dos modalidades:
          </P>
          <UL>
            <li>
              <strong className="text-gray-900 dark:text-white">Comfort Trade:</strong> el usuario
              nos proporciona credenciales temporales para que nuestro equipo realice la
              transferencia de monedas directamente en su cuenta.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Player Auction:</strong> el
              usuario lista un jugador específico en el mercado y nosotros lo adquirimos al precio
              pactado, transfiriendo el valor equivalente en monedas.
            </li>
          </UL>
          <P>
            Lo que se contrata es{' '}
            <strong className="text-gray-900 dark:text-white">tiempo, esfuerzo y experiencia profesional</strong>{' '}
            de nuestro equipo para ejecutar dicha transferencia. En ningún caso se adquieren
            bienes físicos ni tangibles.
          </P>

          <H2>2. Desvinculación de EA Sports</H2>
          <P>
            VentaGamingg{' '}
            <strong className="text-gray-900 dark:text-white">no está afiliada, asociada, autorizada, patrocinada ni respaldada</strong>{' '}
            por Electronic Arts Inc. ("EA Sports"), FIFA, ni por ninguna liga, club o jugador
            profesional. Todas las marcas, logotipos y nombres comerciales mencionados pertenecen
            a sus respectivos propietarios y se utilizan exclusivamente con fines descriptivos.
          </P>

          <H2>3. Riesgos inherentes</H2>
          <P>
            El usuario reconoce y acepta expresamente que los{' '}
            <strong className="text-gray-900 dark:text-white">Términos de Servicio de EA Sports</strong>{' '}
            prohíben la transferencia de monedas entre cuentas por medios no autorizados. En
            consecuencia, el uso de nuestro servicio puede conllevar riesgos, incluidos pero no
            limitados a:
          </P>
          <UL>
            <li>Suspensión temporal o permanente de la cuenta del usuario.</li>
            <li>Restricciones de acceso al Transfer Market.</li>
            <li>Pérdida de monedas, jugadores u otros bienes virtuales de la cuenta.</li>
          </UL>
          <P>
            <strong className="text-gray-900 dark:text-white">VentaGamingg no se responsabiliza</strong>{' '}
            por sanciones aplicadas por EA Sports sobre la cuenta del usuario como consecuencia
            del uso de este servicio. Al contratar, el usuario asume voluntariamente dicho riesgo.
          </P>

          <H2>4. Obligaciones del usuario</H2>
          <UL>
            <li>Proporcionar información veraz, actualizada y completa al momento de realizar una orden.</li>
            <li>Ser el titular legítimo de la cuenta EA donde se recibirá la transferencia.</li>
            <li>No compartir credenciales con terceros durante el proceso.</li>
            <li>Cumplir con la legislación aplicable en su país de residencia.</li>
          </UL>

          <H2>5. Proceso de pago</H2>
          <P>
            Los pagos se procesan a través de proveedores certificados (MercadoPago, Stripe,
            transferencia bancaria). Una vez confirmado el pago, la orden entra en cola y se
            procesa en el plazo informado. Nos reservamos el derecho a cancelar y reembolsar una
            orden ante indicios de fraude o incumplimiento de estos términos.
          </P>

          <H2>6. Propiedad intelectual</H2>
          <P>
            Todos los contenidos del sitio (diseño, código, textos, logotipos propios) son
            propiedad exclusiva de VentaGamingg y están protegidos por las leyes de propiedad
            intelectual. Queda prohibida su reproducción total o parcial sin autorización previa.
          </P>

          <H2>7. Limitación de responsabilidad</H2>
          <P>
            En la máxima medida permitida por la ley, VentaGamingg no será responsable por daños
            indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad
            de uso del servicio. Nuestra responsabilidad máxima se limita al monto efectivamente
            pagado por el usuario en la orden objeto del reclamo.
          </P>

          <H2>8. Modificaciones</H2>
          <P>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Las
            modificaciones entrarán en vigor al ser publicadas en el sitio. El uso continuado del
            servicio constituye aceptación de los términos actualizados.
          </P>

          <H2>9. Contacto</H2>
          <P>
            Para consultas relacionadas con estos términos, podés escribirnos a través del chat
            de soporte disponible en el sitio o a nuestro canal oficial de WhatsApp.
          </P>

          <p className="text-xs text-gray-500 dark:text-gray-600 mt-12 pt-8 border-t border-gray-200 dark:border-white/5">
            Al continuar utilizando VentaGamingg declarás haber leído, comprendido y aceptado la
            totalidad de los presentes Términos y Condiciones.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
