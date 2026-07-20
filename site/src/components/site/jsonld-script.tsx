/**
 * Componente para renderizar JSON-LD de forma segura em páginas.
 * Funciona em Server Components e Client Components.
 */

interface JsonLdScriptProps {
  data: Record<string, unknown>;
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
