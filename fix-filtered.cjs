const fs = require('fs');

// IdeiasView
let ideias = fs.readFileSync('src/components/IdeiasView.tsx', 'utf8');
ideias = ideias.replace(
  /const filteredIdeas = ideas\.filter\(i => \{/,
  'const filteredIdeas = useMemo(() => ideas.filter(i => {'
);
ideias = ideias.replace(
  /    return matchesSearch && matchesStatus;\n  \}\);/,
  `    return matchesSearch && matchesStatus;\n  }), [ideas, searchQuery, statusFilter]);`
);
fs.writeFileSync('src/components/IdeiasView.tsx', ideias);
console.log('IdeiasView filteredIdeas fixed');

// ProdutosView
let produtos = fs.readFileSync('src/components/ProdutosView.tsx', 'utf8');
produtos = produtos.replace(
  /const filteredProducts = mappedProducts\.filter\(p => \{/,
  'const filteredProducts = useMemo(() => mappedProducts.filter(p => {'
);
produtos = produtos.replace(
  /    return matchesSearch && matchesStatus && matchesCompany;\n  \}\);/,
  `    return matchesSearch && matchesStatus && matchesCompany;\n  }), [mappedProducts, searchQuery, statusFilter, companyFilter]);`
);
fs.writeFileSync('src/components/ProdutosView.tsx', produtos);
console.log('ProdutosView filteredProducts fixed');
