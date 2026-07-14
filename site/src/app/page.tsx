import Link from 'next/link';
import { ArrowRight, Search, ShieldCheck, Star, Truck } from 'lucide-react';
import { getVehicles, formatVehicleYear, getImageUrl } from '@/lib/api';

export default async function HomePage() {
  const response = await getVehicles({ status: 'available', limit: 6 }).catch(() => ({ data: [] }));
  const featured = response.data.slice(0, 6);

  return (
    <main className="bg-brothers-dark">
      <section className="border-b border-white/10 bg-gradient-to-b from-brothers-gray to-brothers-dark py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:px-6">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-full border border-brothers-green/30 bg-brothers-green/10 px-4 py-1 text-sm text-brothers-green">
              Brothers Multimarcas
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Seu próximo carro começa com informação.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              Veículos selecionados, revisados e com as melhores condições do mercado.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/veiculos" className="inline-flex items-center gap-2 rounded-full bg-brothers-green px-6 py-3 font-semibold text-brothers-dark transition hover:brightness-110">
                Ver estoque
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#sobre" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-brothers-green hover:text-brothers-green">
                Conhecer a loja
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: 'Confiança', text: 'Veículos revisados e selecionados.' },
                { icon: Star, title: 'Qualidade', text: 'Carros com procedência e transparência.' },
                { icon: Search, title: 'Busca fácil', text: 'Encontre seu carro ideal rapidamente.' },
                { icon: Truck, title: 'Entrega', text: 'Atendimento completo do início ao fim.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-brothers-gray p-5">
                  <item.icon className="h-6 w-6 text-brothers-green" />
                  <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Destaques do estoque</h2>
              <p className="mt-2 text-white/70">Veja alguns dos veículos disponíveis agora.</p>
            </div>
            <Link href="/veiculos" className="text-sm font-semibold text-brothers-green">
              Ver todos
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((vehicle) => (
              <Link key={vehicle.id} href={`/veiculos/${vehicle.id}`} className="overflow-hidden rounded-2xl border border-white/10 bg-brothers-gray transition hover:-translate-y-1 hover:border-brothers-green/40">
                <div className="aspect-[4/3] bg-black">
                  <img
                    src={getImageUrl(vehicle.images?.split(',')[0] || '')}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm text-brothers-green">{formatVehicleYear(vehicle)}</p>
                  <h3 className="mt-1 text-xl font-semibold">{vehicle.brand} {vehicle.model}</h3>
                  <p className="mt-2 text-sm text-white/70">{vehicle.description || 'Veículo disponível para você.'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" className="border-t border-white/10 bg-brothers-gray py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2 lg:px-6">
          <div>
            <h2 className="text-3xl font-bold">Sobre a Brothers Multimarcas</h2>
            <p className="mt-4 text-white/70">
              Trabalhamos com veículos cuidadosamente selecionados, oferecendo atendimento transparente e suporte na compra do seu próximo carro.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-brothers-dark p-6">
            <h3 className="text-xl font-semibold text-brothers-green">Atendimento</h3>
            <p className="mt-3 text-white/70">
              Segunda a sexta: 10:00 às 19:00
              <br />
              Sábados, domingos e feriados: 10:00 às 18:00
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}