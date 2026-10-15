import JsonLd from './JsonLd';

// FAQ accordion + FAQPage schema. Answers are written to be quotable by
// Google's answer boxes and AI assistants (short, direct, self-contained).
export default function Faq({ items, schema = true }) {
  if (!items?.length) return null;
  return (
    <>
      <div className="faq">
        {items.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      {schema && (
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }} />
      )}
    </>
  );
}
