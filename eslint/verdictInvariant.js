const PATTERN = /\b(work|works|succeeds?|success|worked)\b/i;

const ALLOWLIST = [
  /constructs\/VerdictCard\.tsx$/,
  /physics\/verdict\.ts$/,
  /physics\/verdict\.spec\.ts$/,
  /physics\/theorems\.ts$/,
  /ui\/helpContent\.tsx$/,
  /ui\/EquationTutor\.tsx$/,
];

function isAllowedFile(filename) {
  return ALLOWLIST.some((r) => r.test(filename));
}

const plugin = {
  rules: {
    'verdict-invariant': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Reserve success/works copy for VerdictCard + physics/verdict.ts. Route positive outcomes through buildVerdict.',
        },
        schema: [],
        messages: {
          forbidden:
            'Success/works copy ("{{text}}") is only allowed in VerdictCard.tsx or physics/verdict.ts. Route the outcome through buildVerdict() and render via <VerdictCard/>.',
        },
      },
      create(context) {
        if (isAllowedFile(context.filename)) return {};
        return {
          Literal(node) {
            if (typeof node.value !== 'string') return;
            if (PATTERN.test(node.value)) {
              context.report({
                node,
                messageId: 'forbidden',
                data: { text: node.value.slice(0, 80) },
              });
            }
          },
          JSXText(node) {
            const t = node.value.trim();
            if (t && PATTERN.test(t)) {
              context.report({ node, messageId: 'forbidden', data: { text: t.slice(0, 80) } });
            }
          },
          TemplateElement(node) {
            const raw = node.value.raw;
            if (raw && PATTERN.test(raw)) {
              context.report({ node, messageId: 'forbidden', data: { text: raw.slice(0, 80) } });
            }
          },
        };
      },
    },
  },
};

export default plugin;
