with open('src/components/IAView.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if '<div className="relative group flex items-center">' in line:
        new_lines.append("""          <div className="relative group flex items-center gap-2 border border-slate-200 bg-slate-50/50 rounded-xl focus-within:border-indigo-500 focus-within:bg-white transition-all shadow-sm pr-14 pl-2">
            <div className="flex items-center gap-1">
              <button 
                onClick={handleMicClick}
                className={`p-2 rounded-lg transition-all ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                title="Gravar áudio"
              >
                <Mic size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
              />
              <button 
                onClick={handlePaperclipClick}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-all"
                title="Anexar arquivo"
              >
                <Paperclip size={16} />
              </button>
              <button 
                onClick={handleGlobeClick}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-all"
                title="Enviar link"
              >
                <Globe size={16} />
              </button>
            </div>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(query);
              }}
              placeholder="Pergunte sobre seus projetos, finanças ou clientes..."
              className="w-full bg-transparent py-3.5 outline-none text-sm font-medium placeholder:text-slate-400"
            />
""")
        skip = True
    elif skip and '<button ' in line:
        skip = False
        new_lines.append(line)
    elif not skip:
        new_lines.append(line)

with open('src/components/IAView.tsx', 'w') as f:
    f.writelines(new_lines)
print("Success")
