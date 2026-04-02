function switchTab(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  btn.classList.add('active');
}

function countChars(inputId, ctId) {
  var len = document.getElementById(inputId).value.length;
  var el = document.getElementById(ctId);
  el.textContent = len.toLocaleString() + ' chars';
  el.classList.toggle('has-content', len > 0);
}

function doShare(type) {
  var val = document.getElementById(type + 'Input').value.trim();
  if (!val) { showToast('Nothing to share!', 'warn'); return; }
  var encoded = btoa(unescape(encodeURIComponent(val)));
  var url = location.origin + location.pathname + '?type=' + type + '&data=' + encoded;
  document.getElementById('lu-' + type).textContent = url;
  document.getElementById('lo-' + type).style.display = 'block';
  var qrCanvas = document.getElementById('qr-canvas-' + type);
  if (qrCanvas) qrCanvas.innerHTML = '';
  showToast('Link generated!', 'success');
}

var selectedFile = null;

function onFileChange() {
  var f = document.getElementById('fileInput').files[0];
  if (f) setFile(f);
}

function onFileDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('over');
  var f = e.dataTransfer.files[0];
  if (f) setFile(f);
}

function setFile(f) {
  selectedFile = f;
  document.getElementById('fpName').textContent = f.name;
  document.getElementById('fpSize').textContent = formatBytes(f.size);
  document.getElementById('filePill').style.display = 'flex';
  document.getElementById('fileBtn').disabled = false;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function doShareFile() {
  if (!selectedFile) { showToast('No file selected!', 'warn'); return; }
  var maxBytes = 1.5 * 1024 * 1024;
  if (selectedFile.size > maxBytes) {
    showToast('File too large for URL sharing (max ~1.5 MB)', 'warn');
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var base64 = e.target.result.split(',')[1];
    var meta = encodeURIComponent(selectedFile.name + '|' + selectedFile.type);
    var url = location.origin + location.pathname + '?type=file&name=' + meta + '&data=' + base64;
    document.getElementById('lu-file').textContent = url;
    document.getElementById('lo-file').style.display = 'block';
    var qc = document.getElementById('qr-canvas-file');
    if (qc) qc.innerHTML = '';
    showToast('Link generated!', 'success');
  };
  reader.readAsDataURL(selectedFile);
}

function copyLinkById(urlDivId, btnId) {
  var text = document.getElementById(urlDivId).textContent.trim();
  if (!text) return;
  navigator.clipboard.writeText(text).then(function() {
    var btn = document.getElementById(btnId);
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
    showToast('Copied to clipboard', 'info');
  }).catch(function() {
    showToast('Copy failed — please copy manually', 'warn');
  });
}

var qrInstances = {};

function toggleQR(qrWrapId, urlDivId, toggleEl) {
  var wrap = document.getElementById(qrWrapId);
  var url = document.getElementById(urlDivId).textContent.trim();
  if (!url) return;
  if (wrap.style.display === 'block') {
    wrap.style.display = 'none';
    toggleEl.textContent = 'Show QR code ↓';
  } else {
    wrap.style.display = 'block';
    toggleEl.textContent = 'Hide QR code ↑';
    var canvasId = wrap.querySelector('div').id;
    if (!qrInstances[canvasId]) {
      var el = document.getElementById(canvasId);
      el.innerHTML = '';
      qrInstances[canvasId] = new QRCode(el, {
        text: url,
        width: 180,
        height: 180,
        colorDark: '#ffffff',
        colorLight: '#12121a',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }
}

function showToast(msg, type) {
  type = type || 'info';
  var wrap = document.getElementById('toastWrap');
  var t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(function() { t.remove(); }, 3000);
}

function loadViewer() {
  var params = new URLSearchParams(location.search);
  var type = params.get('type');
  var data = params.get('data');
  if (!type || !data) return;

  document.getElementById('app').style.display = 'none';
  document.getElementById('viewer').style.display = 'block';

  var body = document.getElementById('viewerBody');

  if (type === 'text' || type === 'code') {
    try {
      var content = decodeURIComponent(escape(atob(data)));
      var labelClass = type === 'code' ? 'lbl-code' : 'lbl-text';
      var labelText = type === 'code' ? '💻 Code' : '📝 Text';
      var pre = document.createElement('pre');
      if (type === 'code') {
        var code = document.createElement('code');
        code.textContent = content;
        pre.appendChild(code);
        body.innerHTML = '<div class="viewer-label ' + labelClass + '">' + labelText + '</div>';
        body.appendChild(pre);
        hljs.highlightElement(pre.querySelector('code'));
      } else {
        pre.textContent = content;
        body.innerHTML = '<div class="viewer-label ' + labelClass + '">' + labelText + '</div>';
        body.appendChild(pre);
      }
    } catch(e) {
      body.innerHTML = '<p style="color:var(--c1)">Could not decode content.</p>';
    }
  } else if (type === 'file') {
    var nameMeta = params.get('name') || 'file';
    var parts = decodeURIComponent(nameMeta).split('|');
    var fileName = parts[0] || 'download';
    var mimeType = parts[1] || 'application/octet-stream';
    try {
      var byteString = atob(data);
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      var blob = new Blob([ab], { type: mimeType });
      var blobUrl = URL.createObjectURL(blob);
      body.innerHTML =
        '<div class="viewer-label lbl-file">📁 File</div>' +
        '<div class="viewer-meta">' + fileName + ' · ' + formatBytes(blob.size) + '</div>' +
        '<a class="download-btn" href="' + blobUrl + '" download="' + fileName + '">⬇ Download ' + fileName + '</a>';
    } catch(e) {
      body.innerHTML = '<p style="color:var(--c1)">Could not decode file.</p>';
    }
  }
}
loadViewer();