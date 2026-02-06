/**
 * Percorre recursivamente um nó Lexical-JSON e devolve seu texto.
 * - Cada nó `text` retorna node.text
 * - Cada nó `linebreak` vira "\n"
 * - Qualquer outro nó acumula o resultado dos filhos
 */
export function walkLexicalNode(node: any): string {
  if (!node || typeof node !== 'object') {
    return '';
  }

  if (node.type === 'text') {
    return node.text ?? '';
  }

  if (node.type === 'linebreak') {
    return '\n';
  }

  if (Array.isArray(node.children)) {
    return node.children
      .map((child: any) => this.walkLexicalNode(child))
      .join('');
  }

  return '';
}

/**
 * Converte todo o JSON vindo do editor Lexical em um texto plano.
 * Aqui, cada filho direto de `root.children` (parágrafo, heading, code, etc)
 * vira uma "linha" separada por "\n". Se dentro do próprio bloco houver
 * <linebreak/>, elas continuam virando "\n" normalmente.
 */
export function lexicalToText(lexicalJson: any): string {
  if (
    lexicalJson &&
    typeof lexicalJson === 'object' &&
    Array.isArray(lexicalJson.root?.children)
  ) {
    const blocos = lexicalJson.root.children.map((child: any) =>
      this.walkLexicalNode(child),
    );
    return blocos.join('\n');
  }

  return this.walkLexicalNode(lexicalJson);
}


/**
 * Converte uma string simples (com "\n") em um documento Lexical-JSON minimal:
 * um <root> contendo um <paragraph> com textos e <linebreak/> onde houver "\n".
 */
function textToLexical(text: string): any {
  const lines: string[] = text.split('\n');
  const children: any[] = [];

  lines.forEach((line: string, idx: number) => {
    children.push({
      type: 'text',
      version: 1,
      format: 0,
      detail: 0,
      style: '',
      text: line,
      mode: 'normal',
    });

    if (idx !== lines.length - 1) {
      children.push({
        type: 'linebreak',
        version: 1,
      });
    }
  });

  const paragraphNode: any = {
    type: 'paragraph',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr' as const,
    textFormat: 0,
    textStyle: '',
    children,
  };

  const rootNode: any = {
    type: 'root',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr' as const,
    children: [paragraphNode],
  };

  return { root: rootNode };
}
