with open('src/components/home/HomeIntelligence.tsx', 'r') as f:
    content = f.read()

target = """  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);"""

replacement = """  useEffect(() => {
    window.speechSynthesis.getVoices();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/home/HomeIntelligence.tsx', 'w') as f:
        f.write(content)
