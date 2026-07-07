with open('src/components/GlobalVoiceActivator.tsx', 'r') as f:
    content = f.read()

target = """      // Check for variations of the pronunciation "saizor"
      const wakeWords = ['cyzor', 'saizor', 'scissor', 'cizor', 'divisor', 'sai zor', 'caisor'];"""

replacement = """      // Check for variations of the pronunciation "cybot"
      const wakeWords = ['cybot', 'saibot', 'cibot', 'cy bot', 'sai bot', 'seibot'];"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/GlobalVoiceActivator.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Target not found")
