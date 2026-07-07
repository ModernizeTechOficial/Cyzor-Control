with open('src/components/GlobalVoiceActivator.tsx', 'r') as f:
    content = f.read()

target = """      let idxCyzor = currentTranscript.lastIndexOf('cyzor');
      
      let lastIdx = idxCyzor;
      
      if (lastIdx !== -1) {
         let wakeWord = 'cyzor';
         remainder = currentTranscript.substring(lastIdx + wakeWord.length).trim();
      }"""

replacement = """      // Check for variations of the pronunciation "saizor"
      const wakeWords = ['cyzor', 'saizor', 'scissor', 'cizor', 'divisor', 'sai zor', 'caisor'];
      let lastIdx = -1;
      let wakeWord = '';
      
      for (const word of wakeWords) {
        const idx = currentTranscript.lastIndexOf(word);
        if (idx > lastIdx) {
          lastIdx = idx;
          wakeWord = word;
        }
      }
      
      if (lastIdx !== -1) {
         remainder = currentTranscript.substring(lastIdx + wakeWord.length).trim();
      }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/GlobalVoiceActivator.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Target not found")
