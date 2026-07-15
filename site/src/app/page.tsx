import Link from 'next/link';
import { CheckCircle, ChevronRight, Search, Shield, Star, Truck } from 'lucide-react';

const differentials = [
  {
    icon: CheckCircle,
    title: 'Confiança',
    text: 'Veículos revisados e selecionados para você comprar com mais segurança.',
  },
  {
    icon: Star,
    title: 'Qualidade',
    text: 'Carros com procedência, transparência e atenção em cada detalhe.',
  },
  {
    icon: Search,
    title: 'Busca fácil',
    text: 'Encontre o modelo ideal com informações claras e atendimento rápido.',
  },
  {
    icon: Truck,
    title: 'Atendimento personalizado',
    text: 'Nossa equipe ajuda você a encontrar o carro ideal para a sua necessidade.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[500px] items-center overflow-hidden bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2800&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-brothers-dark/95 via-brothers-dark/80 to-brothers-dark/60" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 lg:px-6">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center">
            <div className="flex flex-shrink-0 items-center justify-start lg:w-1/3">
              <img
                src="/images/icon-brothers-oficial.png"
                alt="Ícone Brothers Multimarcas"
                className="h-40 w-auto object-contain md:h-52 lg:h-64"
              />
            </div>

            <div className="flex w-full flex-col items-center px-0 text-center lg:w-2/3 lg:items-start lg:pl-12 lg:text-left">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brothers-green">
                Seminovos selecionados
              </p>
              <h1 className="mb-6 text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl">
                Seu próximo carro começa com informação.
              </h1>
              <p className="mb-8 text-base text-white/80 md:text-lg">
                Escolha seu próximo carro com mais segurança. Aqui você encontra veículos
                selecionados, atendimento transparente e as melhores oportunidades para fazer um
                excelente negócio.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/veiculos"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brothers-green px-8 py-4 font-bold text-brothers-dark transition hover:brightness-110"
                >
                  <Search className="h-5 w-5" />
                  Ver estoque
                </Link>
                <a
                  href="https://wa.me/5511985614257"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 font-semibold text-white transition hover:border-brothers-green hover:text-brothers-green"
                >
                  Falar com vendedor
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brothers-gray py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {differentials.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-brothers-dark p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brothers-green/10">
                  <item.icon className="h-6 w-6 text-brothers-green" />
                </div>
                <h2 className="mb-2 text-lg font-bold">{item.title}</h2>
                <p className="text-sm text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Confira nosso estoque</h2>
          <p className="mx-auto mb-8 max-w-2xl text-white/70">
            Carros, SUVs, pick-ups e utilitários das melhores marcas. Todos disponíveis para você
            escolher.
          </p>
          <Link
            href="/veiculos"
            className="inline-flex items-center gap-2 rounded-full bg-brothers-green px-8 py-4 font-bold text-brothers-dark transition hover:brightness-110"
          >
            Ver todos os veículos
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section id="sobre" className="bg-brothers-gray py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative h-80 overflow-hidden rounded-2xl lg:h-[400px]">
              <img
                src="https://images.unsplash.com/photo-1489824904134-891ab64532f1?q=80&w=1600&auto=format&fit=crop"
                alt="Loja Brothers Multimarcas"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brothers-green">
                Sobre nós
              </p>
              <h2 className="mb-4 text-3xl font-bold">Quem Somos</h2>
              <p className="mb-4 text-lg font-semibold text-white">
                Muito mais do que vender carros.
              </p>
              <div className="space-y-4 text-white/70">
                <p>
                  Na Brothers Multimarcas, acreditamos que comprar um carro deve ser uma
                  experiência tranquila, transparente e segura.
                </p>
                <p>
                  Por isso, nosso trabalho começa muito antes da entrega das chaves: começa
                  ouvindo você, entendendo sua necessidade e ajudando a encontrar o veículo que
                  realmente faz sentido para a sua rotina.
                </p>
                <p>
                  Somos uma loja especializada em veículos multimarcas, com um estoque
                  cuidadosamente selecionado e uma equipe preparada para orientar cada cliente
                  durante toda a jornada de compra.
                </p>
                <p>Mais do que apresentar carros, queremos apresentar soluções.</p>
                <p>
                  Acreditamos que uma boa escolha acontece quando existe informação, confiança e
                  um atendimento feito com respeito.
                </p>
                <p>
                  É por isso que produzimos conteúdos educativos, compartilhamos conhecimento e
                  fazemos questão de esclarecer dúvidas antes, durante e depois da compra.
                </p>
                <p className="font-semibold text-white">Nosso objetivo é simples:</p>
                <p>
                  Ajudar pessoas a entender mais, comprar melhor e escolher com segurança o seu
                  próximo carro.
                </p>
                <p>Seja bem-vindo à Brothers Multimarcas.</p>
                <p>Será um prazer fazer parte da sua próxima conquista.</p>
                <p className="font-semibold text-brothers-green">
                  Porque o seu próximo carro começa com informação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}