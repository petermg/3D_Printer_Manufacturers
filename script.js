const $ = (id) => document.getElementById(id);
const contacts = window.AB2047_CONTACTS || [];

const els = {
  senderName: $('senderName'), senderLocation: $('senderLocation'), senderRole: $('senderRole'),
  printerNote: $('printerNote'), personalNote: $('personalNote'), templateSelect: $('templateSelect'),
  includeSupport: $('includeSupport'), subjectPreview: $('subjectPreview'), bodyPreview: $('bodyPreview'),
  companyList: $('companyList'), segmentFilter: $('segmentFilter'), contactFilter: $('contactFilter'),
  searchBox: $('searchBox'), visibleCount: $('visibleCount'), selectedCount: $('selectedCount'),
  drafts: $('drafts'), draftStats: $('draftStats'), contactDetails: $('contactDetails')
};

const selected = new Set();
const consumerNames = ['Bambu Lab','Creality','Anycubic','Prusa Research','ELEGOO','Flashforge','QIDI Tech','FLSUN','Sovol','Snapmaker','Raise3D','Phrozen','Peopoly','UniFormation','HeyGears','MINGDA','LulzBot','BCN3D','eufyMake / AnkerMake','Artillery3D','Tronxy','Kingroon','Voxelab'];

const recommendedNames = ['Bambu Lab','Creality','Anycubic','Prusa Research','ELEGOO','Flashforge','QIDI Tech','FLSUN','Sovol','Snapmaker','Raise3D','Phrozen','Formlabs','UltiMaker','Markforged','Stratasys','3D Systems','HP 3D Printing','Nano Dimension / Desktop Metal','Nexa3D','Carbon'];

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function subject(companyName = '[Company]') {
  return `Please speak up about California AB 2047 and its impact on 3D printing`;
}

function personBlock() {
  const name = els.senderName.value.trim() || '[Your Name]';
  const loc = els.senderLocation.value.trim() || '[City, State]';
  const role = els.senderRole.value.trim();
  const printer = els.printerNote.value.trim();
  const note = els.personalNote.value.trim();
  let block = `I am writing as a ${role} who is concerned about California Assembly Bill 2047.`;
  if (printer) block += `\n\nFor context: ${printer}.`;
  if (note) block += `\n\nMy personal concern is: ${note}`;
  return {block, signoff: `${name}\n${loc}`};
}

function makeBody(template, companyName='your company') {
  const {block, signoff} = personBlock();
  const companyLine = companyName && companyName !== '[Company]' ? ` I am contacting ${companyName} because your company has an important voice in the 3D printing ecosystem.` : '';
  if (template === 'short') {
    return `Hello,\n\n${block}${companyLine}\n\nAs currently written, AB 2047 appears to require covered 3D printers sold or transferred in California to include firearm blueprint detection / blocking technology and manufacturer attestations before sale in the state.\n\nI understand the public-safety concern, but I am worried the bill could create serious unintended consequences for legitimate users, including false positives, restricted slicer compatibility, closed workflows, increased costs, and reduced access to printers in California.\n\nPlease consider publicly commenting on AB 2047 or contacting California lawmakers so they hear from people with real technical knowledge of 3D printing.\n\nThank you,\n\n${signoff}`;
  }
  if (template === 'technical') {
    return `Hello,\n\n${block}${companyLine}\n\nAB 2047 would require covered 3D printer manufacturers selling or transferring printers in California to implement firearm blueprint detection / blocking technology and submit model-by-model attestations.\n\nMy concern is that this type of mandate could have major technical side effects, including:\n\n- False positives that block legitimate parts.\n- Pressure toward closed slicers, locked firmware, or cloud-scanned workflows.\n- Reduced compatibility with open-source slicers, firmware, and local/offline printing.\n- Increased engineering and compliance costs.\n- Unclear impact on repair, modification, education, makerspaces, and small businesses.\n- The possibility that some companies may stop selling certain printers in California rather than redesign products around the mandate.\n\nThe 3D printing industry has practical expertise that lawmakers need before this bill moves further. Please consider issuing a public statement, submitting comments, contacting California lawmakers, or coordinating with other manufacturers and community organizations.\n\nThank you,\n\n${signoff}`;
  }
  return `Hello,\n\n${block}${companyLine}\n\nAs currently written, AB 2047 appears to require 3D printer manufacturers selling or transferring covered printers in California to implement firearm blueprint detection / blocking technology, submit model-by-model attestations, and ensure covered printers are listed as compliant before sale in California.\n\nI understand the stated public-safety concern, but I am worried this bill could create serious unintended consequences for the broader 3D printing community, including hobbyists, educators, makerspaces, repair users, artists, engineers, and small businesses.\n\nMy concerns include:\n\n- False positives blocking legitimate prints.\n- Closed or restricted slicer workflows.\n- Reduced compatibility with open-source tools and firmware.\n- Increased costs for manufacturers and users.\n- Pressure toward cloud-based file scanning or invasive monitoring.\n- The possibility that some companies may stop selling certain printers in California instead of redesigning products around this mandate.\n\nI am asking your company to publicly evaluate AB 2047 and, if appropriate, speak up about the technical and practical problems it may create. The 3D printing industry has important expertise that lawmakers need to hear before this bill moves further.\n\nPlease consider issuing a public statement, submitting comments, contacting California lawmakers, or joining with other manufacturers and community organizations to explain how this bill would affect legitimate 3D printing users.\n\nThank you for your time and for supporting the 3D printing community.\n\nSincerely,\n\n${signoff}`;
}

function updatePreview() {
  els.subjectPreview.textContent = subject();
  els.bodyPreview.textContent = makeBody(els.templateSelect.value, '[Company]');
}

function bestEmails(company) {
  if (!els.includeSupport.checked && company.suggestedEmails.length) return company.suggestedEmails;
  const all = [];
  for (const row of [...company.contacts].sort((a,b) => b.outreachScore - a.outreachScore)) {
    const hay = `${row.department} ${row.notes}`.toLowerCase();
    if (!els.includeSupport.checked && ['support','customer service','after-sales','technical'].some(w => hay.includes(w))) continue;
    if (['privacy','talent','recruitment','hr'].some(w => hay.includes(w))) continue;
    for (const email of row.emails) if (!all.includes(email)) all.push(email);
    if (all.length >= 3) break;
  }
  return all.length ? all : company.suggestedEmails;
}

function contactFormUrl(company) {
  const sorted = [...company.contacts].sort((a,b) => b.outreachScore - a.outreachScore);
  const row = sorted.find(r => r.sourceUrl) || company.contacts.find(r => r.sourceUrl);
  return row ? row.sourceUrl : '';
}

function renderSegments() {
  const segs = [...new Set(contacts.map(c => c.segment).filter(Boolean))].sort();
  for (const seg of segs) {
    const opt = document.createElement('option');
    opt.value = seg; opt.textContent = seg;
    els.segmentFilter.appendChild(opt);
  }
}

function cardMatches(company) {
  const q = els.searchBox.value.trim().toLowerCase();
  const seg = els.segmentFilter.value;
  const type = els.contactFilter.value;
  const text = `${company.name} ${company.segment} ${company.contacts.map(r => `${r.department} ${r.emailText} ${r.notes}`).join(' ')}`.toLowerCase();
  if (q && !text.includes(q)) return false;
  if (seg && company.segment !== seg) return false;
  if (type === 'email' && !company.hasDirectEmail) return false;
  if (type === 'form' && !company.hasContactForm) return false;
  return true;
}

function renderCompanies() {
  els.companyList.innerHTML = '';
  let visible = 0;
  contacts.forEach((company, idx) => {
    if (!cardMatches(company)) return;
    visible++;
    const emails = bestEmails(company);
    const form = contactFormUrl(company);
    const card = document.createElement('article');
    card.className = 'company-card';
    card.innerHTML = `
      <div class="company-top">
        <label class="company-title"><input type="checkbox" data-company="${company.slug}" ${selected.has(company.slug) ? 'checked' : ''}/><span><span class="company-name">${escapeHtml(company.name)}</span><br><span class="small">${escapeHtml(company.segment)}</span></span></label>
      </div>
      <div class="pills">
        ${emails.length ? `<span class="pill good">${emails.length} public email contact${emails.length === 1 ? '' : 's'}</span>` : `<span class="pill warn">No direct public email</span>`}
        ${form ? `<span class="pill">Company contact page</span>` : ''}
        ${company.contacts.length > Math.max(emails.length, 1) ? `<span class="pill">More contact options</span>` : ''}
      </div>
      <p class="small">${emails.length ? escapeHtml(emails.join(', ')) : 'Use official contact/source links in the full directory below.'}</p>
    `;
    els.companyList.appendChild(card);
  });
  els.visibleCount.textContent = visible;
  els.selectedCount.textContent = selected.size;
}

function renderDetails() {
  els.contactDetails.innerHTML = '';
  for (const company of contacts) {
    const d = document.createElement('details');
    d.innerHTML = `<summary>${escapeHtml(company.name)} <span class="small">— ${escapeHtml(company.segment)}</span></summary>
      <table>
        <thead><tr><th>Department</th><th>Email(s)</th><th>Phone / other</th><th>Region</th><th>Notes</th><th>Source</th></tr></thead>
        <tbody>${company.contacts.map(r => `<tr>
          <td>${escapeHtml(r.department)}</td>
          <td>${escapeHtml(r.emailText || '—')}</td>
          <td>${escapeHtml(r.phone || '—')}</td>
          <td>${escapeHtml(r.region || '—')}</td>
          <td>${escapeHtml(r.notes || '')}<br><span class="small">Confidence: ${escapeHtml(r.confidence || '')}</span></td>
          <td>${r.sourceUrl ? `<a href="${escapeHtml(r.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(r.sourceLabel || 'Source')}</a>` : '—'}</td>
        </tr>`).join('')}</tbody>
      </table>`;
    els.contactDetails.appendChild(d);
  }
}

function mailtoUrl(to, company) {
  const body = makeBody(els.templateSelect.value, company.name);
  // Do not use URLSearchParams here. Some email clients display spaces from
  // application/x-www-form-urlencoded query strings as literal plus signs.
  // encodeURIComponent uses %20 for spaces, which mail clients handle more reliably.
  const encodedTo = String(to || '')
    .split(',')
    .map(addr => encodeURIComponent(addr.trim()))
    .filter(Boolean)
    .join(',');
  const encodedSubject = encodeURIComponent(subject(company.name));
  const encodedBody = encodeURIComponent(body);
  return `mailto:${encodedTo}?subject=${encodedSubject}&body=${encodedBody}`;
}

function gmailComposeUrl(to, company) {
  const body = makeBody(els.templateSelect.value, company.name);
  const encodedTo = encodeURIComponent(String(to || '').split(',').map(addr => addr.trim()).filter(Boolean).join(','));
  const encodedSubject = encodeURIComponent(subject(company.name));
  const encodedBody = encodeURIComponent(body);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`;
}

function renderDrafts() {
  els.drafts.innerHTML = '';
  const selectedCompanies = contacts.filter(c => selected.has(c.slug));
  let emailDraftCount = 0, formCount = 0;
  for (const company of selectedCompanies) {
    const emails = bestEmails(company);
    const form = contactFormUrl(company);
    const card = document.createElement('article');
    card.className = 'draft-card';
    if (emails.length) {
      emailDraftCount++;
      const to = emails.join(',');
      card.innerHTML = `<h3>${escapeHtml(company.name)}</h3>
        <p class="draft-to"><strong>To:</strong> ${escapeHtml(to)}</p>
        <div class="draft-actions">
          <a class="button primary" href="${mailtoUrl(to, company)}">Open email app draft</a>
          <a class="button secondary" href="${gmailComposeUrl(to, company)}" target="_blank" rel="noopener">Open Gmail draft</a>
          <button class="button secondary" data-copy-company="${company.slug}" type="button">Copy body</button>
          ${form ? `<a class="button ghost" href="${escapeHtml(form)}" target="_blank" rel="noopener">Open company contact page</a>` : ''}
        </div>`;
    } else {
      formCount++;
      card.innerHTML = `<h3>${escapeHtml(company.name)}</h3>
        <p class="draft-to">No direct public email was listed for this company in the directory.</p>
        <div class="draft-actions">
          ${form ? `<a class="button primary" href="${escapeHtml(form)}" target="_blank" rel="noopener">Open company contact page</a>` : ''}
          <button class="button secondary" data-copy-company="${company.slug}" type="button">Copy body</button>
        </div>`;
    }
    els.drafts.appendChild(card);
  }
  els.draftStats.textContent = selectedCompanies.length ? `${selectedCompanies.length} companies selected • ${emailDraftCount} email drafts • ${formCount} contact-page-only entries` : 'No companies selected yet.';
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    return true;
  }
}

function initEvents() {
  ['input','change'].forEach(evt => {
    [els.senderName, els.senderLocation, els.senderRole, els.printerNote, els.personalNote, els.templateSelect, els.includeSupport].forEach(el => el.addEventListener(evt, () => { updatePreview(); renderCompanies(); }));
    [els.searchBox, els.segmentFilter, els.contactFilter].forEach(el => el.addEventListener(evt, renderCompanies));
  });
  els.companyList.addEventListener('change', (e) => {
    const cb = e.target.closest('input[type="checkbox"][data-company]');
    if (!cb) return;
    cb.checked ? selected.add(cb.dataset.company) : selected.delete(cb.dataset.company);
    els.selectedCount.textContent = selected.size;
  });
  $('selectNone').addEventListener('click', () => { selected.clear(); renderCompanies(); });
  $('selectRecommended').addEventListener('click', () => {
    for (const c of contacts) if (recommendedNames.includes(c.name)) selected.add(c.slug);
    renderCompanies();
  });
  $('selectConsumer').addEventListener('click', () => {
    for (const c of contacts) if (consumerNames.includes(c.name) || c.segment.toLowerCase().includes('consumer')) selected.add(c.slug);
    renderCompanies();
  });
  $('generateDrafts').addEventListener('click', renderDrafts);
  $('copyBody').addEventListener('click', async () => {
    await copyText(makeBody(els.templateSelect.value, '[Company]'));
    $('copyBody').textContent = 'Copied'; setTimeout(() => $('copyBody').textContent = 'Copy body', 1100);
  });
  els.drafts.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy-company]');
    if (!btn) return;
    const company = contacts.find(c => c.slug === btn.dataset.copyCompany);
    await copyText(makeBody(els.templateSelect.value, company ? company.name : '[Company]'));
    btn.textContent = 'Copied'; setTimeout(() => btn.textContent = 'Copy body', 1100);
  });
  $('resetForm').addEventListener('click', () => {
    els.senderName.value = ''; els.senderLocation.value = ''; els.senderRole.selectedIndex = 0;
    els.printerNote.value = ''; els.personalNote.value = ''; els.templateSelect.value = 'balanced';
    els.includeSupport.checked = false; updatePreview(); renderCompanies();
  });
}

renderSegments();
renderDetails();
updatePreview();
renderCompanies();
initEvents();
