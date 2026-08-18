// Circulation Desk (Issue & Return Management) View
const CirculationView = {
  selectedStatus: 'All',

  render(container, store) {
    const state = store.getState();
    const role = store.getRole();

    let filteredIssues = state.issues.filter(issue => {
      if (this.selectedStatus === 'Active') return issue.status === 'Active';
      if (this.selectedStatus === 'Overdue') return issue.status === 'Overdue';
      if (this.selectedStatus === 'Returned') return issue.status === 'Returned' || issue.status === 'Returned Late';
      return true;
    });

    const activeCount = state.issues.filter(i => i.status === 'Active').length;
    const overdueCount = state.issues.filter(i => i.status === 'Overdue').length;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Circulation Desk (Issue & Return)</h1>
          <p>Process book loans, check active due dates, calculate late fines, and manage book returns.</p>
        </div>
        ${role === 'Librarian' ? `
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-primary" id="btn-issue-desk">
              <span>➕ Issue Book</span>
            </button>
            <button class="btn btn-emerald" id="btn-return-desk">
              <span>↩ Process Return</span>
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Toolbar / Filters -->
      <div class="toolbar">
        <div class="filter-group">
          <button class="nav-tab ${this.selectedStatus === 'All' ? 'active' : ''}" id="filter-issue-all">All Loans (${state.issues.length})</button>
          <button class="nav-tab ${this.selectedStatus === 'Active' ? 'active' : ''}" id="filter-issue-active">Active (${activeCount})</button>
          <button class="nav-tab ${this.selectedStatus === 'Overdue' ? 'active' : ''}" id="filter-issue-overdue" style="color: ${overdueCount > 0 ? '#fb7185' : ''};">Overdue ⚠️ (${overdueCount})</button>
          <button class="nav-tab ${this.selectedStatus === 'Returned' ? 'active' : ''}" id="filter-issue-returned">Returned Ledger</button>
        </div>
      </div>

      <!-- Issues Table -->
      <div class="glass-panel" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Book Title</th>
                <th>Member Name</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine Pending</th>
                ${role === 'Librarian' ? '<th style="text-align: right;">Action</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredIssues.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    No loans match the selected filter.
                  </td>
                </tr>
              ` : filteredIssues.map(issue => {
                const isOverdue = issue.status === 'Overdue';
                const isReturned = issue.status === 'Returned' || issue.status === 'Returned Late';

                return `
                  <tr>
                    <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--primary); font-weight: 700;">
                      ${issue.id}
                    </td>
                    <td>
                      <strong style="color: #fff; font-size: 0.9rem;">${issue.bookTitle}</strong><br>
                      <span style="font-size: 0.75rem; color: var(--text-dim);">ID: ${issue.bookId}</span>
                    </td>
                    <td>
                      <strong style="color: #fff;">${issue.memberName}</strong><br>
                      <span style="font-size: 0.75rem; color: var(--text-dim);">${issue.memberId}</span>
                    </td>
                    <td>${issue.issueDate}</td>
                    <td>
                      <strong style="color: ${isOverdue ? '#fb7185' : '#fff'};">${issue.dueDate}</strong>
                    </td>
                    <td>
                      <span class="badge ${issue.status === 'Active' ? 'badge-active' : isOverdue ? 'badge-overdue' : 'badge-returned'}">
                        ${issue.status}
                      </span>
                    </td>
                    <td>
                      ${issue.fineAmount > 0 ? `
                        <span style="color: ${issue.fineStatus === 'Paid' ? '#34d399' : '#fb7185'}; font-weight: 700;">
                          $${issue.fineAmount.toFixed(2)} (${issue.fineStatus})
                        </span>
                      ` : '<span style="color: var(--text-dim);">$0.00</span>'}
                    </td>
                    ${role === 'Librarian' ? `
                      <td style="text-align: right;">
                        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                          ${!isReturned ? `
                            <button class="btn btn-emerald btn-sm btn-process-return-item" data-id="${issue.id}">
                              ↩ Return
                            </button>
                          ` : ''}
                          <button class="btn btn-secondary btn-sm btn-print-receipt" data-id="${issue.id}">
                            🧾 Receipt
                          </button>
                        </div>
                      </td>
                    ` : ''}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Event handlers
    const setFilter = (status) => {
      this.selectedStatus = status;
      this.render(container, store);
    };

    container.querySelector('#filter-issue-all')?.addEventListener('click', () => setFilter('All'));
    container.querySelector('#filter-issue-active')?.addEventListener('click', () => setFilter('Active'));
    container.querySelector('#filter-issue-overdue')?.addEventListener('click', () => setFilter('Overdue'));
    container.querySelector('#filter-issue-returned')?.addEventListener('click', () => setFilter('Returned'));

    container.querySelector('#btn-issue-desk')?.addEventListener('click', () => {
      window.app.openIssueModal();
    });

    container.querySelector('#btn-return-desk')?.addEventListener('click', () => {
      window.app.openReturnModal();
    });

    container.querySelectorAll('.btn-process-return-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.app.openReturnModal(id);
      });
    });

    container.querySelectorAll('.btn-print-receipt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.printReceiptModal(id, store);
      });
    });
  },

  printReceiptModal(issueId, store) {
    const state = store.getState();
    const issue = state.issues.find(i => i.id === issueId);
    if (!issue) return;

    const content = `
      <div class="receipt-box" id="printable-receipt-content">
        <div class="receipt-header">
          <h2 style="font-size: 1.1rem; color: #fff; text-transform: uppercase;">CENTRAL LIBRARY SYSTEM</h2>
          <p style="font-size: 0.75rem; color: var(--text-muted);">Official Circulation Receipt</p>
          <p style="font-size: 0.75rem; color: var(--text-dim); margin-top: 4px;">Receipt ID: RCT-${issue.id}</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Borrower:</span>
            <strong style="color: #fff;">${issue.memberName} (${issue.memberId})</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Book Title:</span>
            <strong style="color: #fff; max-width: 250px; text-align: right;">${issue.bookTitle}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Book ID:</span>
            <span>${issue.bookId}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Issue Date:</span>
            <span>${issue.issueDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Due Date:</span>
            <strong style="color: #a5b4fc;">${issue.dueDate}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Return Date:</span>
            <span>${issue.returnDate || 'Pending Return'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">Loan Status:</span>
            <strong style="color: #fff;">${issue.status}</strong>
          </div>
          ${issue.fineAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 0.5rem; margin-top: 0.5rem;">
              <span style="color: #fb7185;">Fine Amount:</span>
              <strong style="color: #fb7185;">$${issue.fineAmount.toFixed(2)} (${issue.fineStatus})</strong>
            </div>
          ` : ''}
        </div>

        <div style="text-align: center; border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 0.75rem; font-size: 0.75rem; color: var(--text-muted);">
          Thank you for visiting Central Library.<br>
          Please return books on or before due date to avoid fines ($1.00/day).
        </div>
      </div>
    `;

    window.app.showCustomModal(`Transaction Receipt — ${issue.id}`, content, [
      {
        label: "🖨️ Print Receipt",
        class: "btn-primary",
        action: () => {
          const printWindow = window.open('', '_blank');
          printWindow.document.write(`
            <html>
              <head>
                <title>Receipt - ${issue.id}</title>
                <style>
                  body { font-family: monospace; padding: 20px; font-size: 14px; }
                  .receipt-box { width: 320px; border: 1px solid #000; padding: 15px; }
                  .receipt-header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                  .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
                </style>
              </head>
              <body>
                ${document.getElementById('printable-receipt-content').outerHTML}
                <script>window.print(); setTimeout(() => window.close(), 500);</script>
              </body>
            </html>
          `);
        }
      },
      { label: "Close", class: "btn-secondary", action: () => window.app.closeModal() }
    ]);
  }
};
