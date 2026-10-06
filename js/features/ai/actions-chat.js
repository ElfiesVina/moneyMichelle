// ==================== ACTIONS ====================
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function processNL() {
  const input = document.getElementById('nl-input');
  const text = input.value.trim();
  if (!text) return;

  addChatMessage('user', text);
  input.value = '';

  let result = null;
  let via = 'lokal';
  let fallbackNote = '';

  // Mode AI: coba server dulu, kalau gagal jatuh ke pembaca lokal
  if (settings.mode === 'ai' && settings.apiUrl) {
    const waiting = addChatMessage('ai', '⏳ AI sedang membaca...');
    try {
      result = aiToResult(await parseWithAI(text));
      via = 'AI';
    } catch (e) {
      fallbackNote = '⚠️ AI tidak bisa dipakai (' + escapeHtml(e && e.message ? e.message : 'error') + '), memakai pembaca lokal.<br>';
    }
    if (waiting && waiting.remove) waiting.remove();
  }

  if (!result) result = parseNL(text);
  if (result.askWallet) {
    const names = state.wallets.map(w => escapeHtml(w.name)).join(', ');
    const contoh = escapeHtml(state.wallets[0].name.toLowerCase());
    addChatMessage('ai', `${fallbackNote}❓ Wallet-nya yang mana? Ulangi kalimatmu dengan menyebut salah satu: ${names}.<br><span class="text-xs text-slate-500">Contoh: "pengeluaran ${contoh} jajan 15k"</span>`);
    return;
  }
  if (result.error) {
    addChatMessage('ai', `${fallbackNote}❌ ${result.error}`);
    return;
  }

  // Save transaction through the single transaction service.
  appendTransaction({
    type: result.type, amount: result.amount, walletId: result.walletId,
    categoryId: result.categoryId, note: result.note, date: result.date
  });

  const typeLabel = result.type === 'expense' ? 'Pengeluaran' : 'Pemasukan';
  const sign = result.type === 'expense' ? '−' : '+';
  addChatMessage('ai', `${fallbackNote}✅ <strong>${typeLabel}</strong> berhasil dicatat! <span class="text-xs text-slate-400">via ${via}</span><br>
    ${sign} ${formatRp(result.amount)} · ${result.parsed.wallet} · ${result.parsed.category}
    ${result.note ? '<br><span class="text-slate-500 text-xs">Catatan: ' + result.note + '</span>' : ''}`);
}

function addChatMessage(role, html) {
  const el = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
  bubble.innerHTML = `
    <div class="max-w-[88%] break-words px-4 py-2.5 rounded-2xl text-sm ${
      role === 'user' 
        ? 'bg-indigo-600 text-white rounded-br-md' 
        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
    }">${html}</div>
  `;
  el.appendChild(bubble);
  el.scrollTop = el.scrollHeight;
  return bubble;
}

function fillExample(btn) {
  document.getElementById('nl-input').value = btn.textContent;
  document.getElementById('nl-input').focus();
}

// Voice
function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    addChatMessage('ai', 'Browser kamu belum mendukung voice recognition. Coba Chrome/Edge.');
    return;
  }
  if (isRecording) {
    recognition.stop();
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'id-ID';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isRecording = true;
    document.getElementById('voice-btn').classList.add('recording');
    addChatMessage('ai', '🎤 Mendengarkan... silakan bicara.');
  };
  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    document.getElementById('nl-input').value = text;
    processNL();
  };
  recognition.onerror = (e) => {
    addChatMessage('ai', 'Gagal mendengarkan: ' + e.error);
  };
  recognition.onend = () => {
    isRecording = false;
    document.getElementById('voice-btn').classList.remove('recording');
  };
  recognition.start();
}

