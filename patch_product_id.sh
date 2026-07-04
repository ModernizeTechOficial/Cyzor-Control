sed -i '/const \[selectedProduct/a \
\
  useEffect(() => {\n    if (globalFilters.productId && productsData && productsData.length > 0) {\n      const p = productsData.find((proj: any) => proj.id.toString() === globalFilters.productId.toString());\n      if (p) setSelectedProduct(p);\n    }\n  }, [globalFilters.productId, productsData]);\n' src/components/ProdutosView.tsx
