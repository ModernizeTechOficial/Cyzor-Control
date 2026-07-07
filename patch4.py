with open('src/components/GlobalVoiceActivator.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "let idxOlimpo = currentTranscript.lastIndexOf('olimpo');", 
    ""
)

content = content.replace(
    "let lastIdx = Math.max(idxCyzor, idxOlimpo);", 
    "let lastIdx = idxCyzor;"
)

content = content.replace(
    "let wakeWord = lastIdx === idxCyzor ? 'cyzor' : 'olimpo';", 
    "let wakeWord = 'cyzor';"
)

content = content.replace(
    ">Olimpo está ouvindo...</h2>", 
    ">Cyzor está ouvindo...</h2>"
)

with open('src/components/GlobalVoiceActivator.tsx', 'w') as f:
    f.write(content)
