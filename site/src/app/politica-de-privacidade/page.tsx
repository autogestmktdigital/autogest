import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Política de Privacidade da Brothers Multimarcas. Saiba como tratamos seus dados, cookies e suas opções de privacidade.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-brothers-dark py-16">
      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Política de Privacidade</h1>

        <div className="space-y-8 text-white/80">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Introdução</h2>
            <p>
              A Brothers Multimarcas valoriza a privacidade dos visitantes do nosso site. Esta política
              explica como coletamos, usamos e protegemos suas informações quando você navega em nosso
              site ou entra em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Dados que coletamos</h2>
            <p className="mb-2">Podemos coletar os seguintes dados técnicos durante sua navegação:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Endereço IP (anonimizado quando possível)</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Páginas visitadas e tempo de permanência</li>
              <li>Origem do acesso (site, busca, rede social)</li>
              <li>Cookies e identificadores anônimos</li>
            </ul>
            <p className="mt-2"><strong className="text-white">Não coletamos:</strong> nome, CPF, e-mail, telefone ou qualquer dado pessoal
              identificável sem seu consentimento explícito. Essas informações só são fornecidas por
              você diretamente ao entrar em contato pelo WhatsApp ou outro canal.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. Uso de cookies</h2>
            <p className="mb-2">Utilizamos cookies para melhorar sua experiência de navegação. As categorias são:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong className="text-white">Essenciais:</strong> necessários para o funcionamento básico do site.</li>
              <li><strong className="text-white">Analíticos:</strong> ajudam-nos a entender como os visitantes interagem com o site (Google Analytics).</li>
              <li><strong className="text-white">Marketing:</strong> utilizados para exibir anúncios relevantes e medir campanhas (Meta Pixel, Google Ads).</li>
            </ul>
            <p className="mt-2">
              Você pode gerenciar suas preferências de cookies a qualquer momento clicando em
              "Configurações de cookies" no rodapé do site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. Google Analytics e Google Tag Manager</h2>
            <p>
              Utilizamos o Google Tag Manager para gerenciar tags de rastreamento e o Google Analytics
              para análise de tráfego. Essas ferramentas coletam dados anonimizados sobre a navegação
              no site. O Google pode processar esses dados de acordo com sua própria política de privacidade.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">5. Meta Pixel</h2>
            <p>
              O Meta Pixel (Facebook) pode ser ativado futuramente para campanhas de remarketing.
              Quando ativo, ele coleta eventos anônimos de navegação (como visualização de páginas e
              cliques em botões) para exibir anúncios relevantes. Nenhum dado pessoal identificável
              é enviado ao Meta sem seu consentimento.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">6. Links para WhatsApp</h2>
            <p>
              Nossos botões de WhatsApp direcionam você para o aplicativo WhatsApp. Ao clicar, você
              será redirecionado para um link oficial do WhatsApp (wa.me). Não armazenamos nem
              processamos conversas do WhatsApp em nosso site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">7. Finalidade da coleta</h2>
            <p className="mb-2">Os dados coletados são utilizados para:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Melhorar a experiência de navegação no site</li>
              <li>Analisar o desempenho das páginas e do estoque</li>
              <li>Medir a eficácia de campanhas de marketing</li>
              <li>Exibir anúncios relevantes (quando consentido)</li>
              <li>Manter a segurança e estabilidade do site</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">8. Retenção e segurança</h2>
            <p>
              Os dados de navegação são retidos pelo período necessário para as finalidades descritas
              acima, respeitando os prazos definidos pelas ferramentas de analytics (geralmente até
              26 meses no Google Analytics). Adotamos medidas técnicas e organizacionais para proteger
              seus dados contra acesso não autorizado, alteração ou destruição.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">9. Seus direitos (LGPD)</h2>
            <p className="mb-2">De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Saber se estamos tratando seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Revogar seu consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos dados</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">10. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Recomendamos revisar esta página
              ocasionalmente para se manter informado sobre como protegemos suas informações.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">11. Contato</h2>
            <p>
              Se tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados,
              entre em contato conosco pelo WhatsApp ou e-mail disponíveis no rodapé do site.
            </p>
          </section>

          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/50">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
