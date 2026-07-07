with open('src/components/GlobalVoiceActivator.tsx', 'r') as f:
    content = f.read()

target = """      // Auto restart to keep listening for wake word or next command
      if (!hasPermissionError) {
        try {
          recognition.start();
        } catch (e) {}
      }"""

replacement = """      // Auto restart to keep listening for wake word or next command
      if (!hasPermissionError) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {}
        }, 100);
      }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/GlobalVoiceActivator.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Target not found")
