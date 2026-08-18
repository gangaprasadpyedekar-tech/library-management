// Fines & Due Date Ledger View Component
const FinesView = {
  selectedStatusFilter: 'All',

  render(container, store) {
    const state = store.getState();
    const role = store.getRole();

    const unpaidFines = state.fines.filter(f => f.status === 'Unpaid');
    const paidFines = state.fines.filter(f => f.status === 'Paid');
    const waivedFines = state.fines.filter(f => f.status === 'Waived');

    const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = paidFines.reduce((sum, f) => sum + f.amount, 0);
    const totalWaived = waivedFines.reduce((sum, f) => sum + f.amount, 0);

    let filteredFines = state.fines.filter(f => {
      if (this.selectedStatusFilter === 'Unpaid') return f.status === 'Unpaid';
      if (this.selectedStatusFilter === 'Paid') return f.status === 'Paid';
      if (this.selectedStatusFilter === 'Waived') return f.status === 'Waived';
      return true;
    });

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Fine & Overdue Ledger</h1>
          <p>Track late fees, collect outstanding balances, process payments, and record fine waivers.</p>
        </div>
      </div>

      <!-- Financial Metrics -->
      <div class="stats-grid">
        <div class="stat-card" style="--card-accent: #f43f5e;">
          <div class="stat-header">
            <span class="stat-label">OUTSTANDING FINES</span>
            <div class="stat-icon" style="background: rgba(244, 63, 94, 0.15); color: #fb7185;">💵</div>
          </div>
          <div class="stat-value" style="color: #f43f5e;">$${totalUnpaid.toFixed(2)}</div>
          <div class="stat-trend" style="background: rgba(244, 63, 94, 0.15); color: #fb7185;">
            ${unpaidFines.length} Unpaid Records
          </div>
        </div>

        <div class="stat-card" style="--card-accent: #10b981;">
          <div class="stat-header">
            <span class="stat-label">COLLECTED FINES</span>
            <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">💳</div>
          </div>
          <div class="stat-value" style="color: #34d399;">$${totalPaid.toFixed(2)}</div>
          <div class="stat-trend" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">
            ${paidFines.length} Paid Records
          </div>
        </div>

        <div class="stat-card" style="--card-accent: #f59e0b;">
          <div class="stat-header">
            <span class="stat-label">WAIVED FINES</span>
            <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">🕊️</div>
          </div>
          <div class="stat-value">$${totalWaived.toFixed(2)}</div>
          <div class="stat-trend" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">
            ${waivedFines.length} Waived Records
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="filter-group">
          <button class="nav-tab ${this.selectedStatusFilter === 'All' ? 'active' : ''}" id="filter-fine-all">All Records (${state.fines.length})</button>
          <button class="nav-tab ${this.selectedStatusFilter === 'Unpaid' ? 'active' : ''}" id="filter-fine-unpaid" style="color: ${unpaidFines.length > 0 ? '#fb7185' : ''};">Unpaid (${unpaidFines.length})</button>
          <button class="nav-tab ${this.selectedStatusFilter === 'Paid' ? 'active' : ''}" id="filter-fine-paid">Paid (${paidFines.length})</button>
          <button class="nav-tab ${this.selectedStatusFilter === 'Waived' ? 'active' : ''}" id="filter-fine-waived">Waived (${waivedFines.length})</button>
        </div>
      </div>

      <!-- Fines Table -->
      <div class="glass-panel" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Fine ID</th>
                <th>Member</th>
                <th>Reason / Description</th>
                <th>Created Date</th>
                <th>Amount</th>
                <th>Status</th>
                ${role === 'Librarian' ? '<th style="text-align: right;">Action</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${filteredFines.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    No fine records found for this category.
                  </td>
                </tr>
              ` : filteredFines.map(fine => {
                const isUnpaid = fine.status === 'Unpaid';
                const isPaid = fine.status === 'Paid';
                const isWaived = fine.status === 'Waived';

                return `
                  <tr>
                    <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--primary); font-weight: 700;">
                      ${fine.id}
                    </td>
                    <td>
                      <strong style="color: #fff;">${fine.memberName}</strong><br>
                      <span style="font-size: 0.75rem; color: var(--text-dim);">${fine.memberId}</span>
                    </td>
                    <td style="max-width: 300px;">
                      <span style="font-size: 0.85rem; color: var(--text-main);">${fine.reason}</span>
                    </td>
                    <td style="font-size: 0.85rem; color: var(--text-muted);">${fine.createdAt}</td>
                    <td>
                      <span style="font-size: 1.05rem; font-weight: 800; color: ${isUnpaid ? '#f43f5e' : isPaid ? '#34d399' : '#fbbf24'};">
                        $${fine.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span class="badge ${isUnpaid ? 'badge-overdue' : isPaid ? 'badge-available' : 'badge-returned'}">
                        ${fine.status}
                      </span>
                    </td>
                    ${role === 'Librarian' ? `
                      <td style="text-align: right;">
                        <div style="display: flex; justify-content: flex-end; gap: 0.4rem;">
                          ${isUnpaid ? `
                            <button class="btn btn-emerald btn-sm btn-pay-fine" data-id="${fine.id}">
                              💳 Collect Payment
                            </button>
                            <button class="btn btn-secondary btn-sm btn-waive-fine" data-id="${fine.id}">
                              🕊️ Waive
                            </button>
                          ` : `
                            <span style="font-size: 0.8rem; color: var(--text-dim);">Completed</span>
                          `}
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

    // Filter events
    const setFilter = (st) => {
      this.selectedStatusFilter = st;
      this.render(container, store);
    };

    container.querySelector('#filter-fine-all')?.addEventListener('click', () => setFilter('All'));
    container.querySelector('#filter-fine-unpaid')?.addEventListener('click', () => setFilter('Unpaid'));
    container.querySelector('#filter-fine-paid')?.addEventListener('click', () => setFilter('Paid'));
    container.querySelector('#filter-fine-waived')?.addEventListener('click', () => setFilter('Waived'));

    container.querySelectorAll('.btn-pay-fine').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const fine = state.fines.find(f => f.id === id);
        if (!fine) return;

        if (confirm(`Confirm payment collection of $${fine.amount.toFixed(2)} for ${fine.memberName}?`)) {
          try {
            store.payFine(id);
            Toast.success(`Payment of $${fine.amount.toFixed(2)} recorded successfully.`);
          } catch (e) {
            Toast.error(e.message);
          }
        }
      });
    });

    container.querySelectorAll('.btn-waive-fine').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const fine = state.fines.find(f => f.id === id);
        if (!fine) return;

        const reason = prompt(`Enter reason for waiving fine of $${fine.amount.toFixed(2)} for ${fine.memberName}:`, "Administrative Waiver / Special Permission");
        if (reason) {
          try {
            store.waiveFine(id, reason);
            Toast.success(`Fine of $${fine.amount.toFixed(2)} waived.`);
          } catch (e) {
            Toast.error(e.message);
          }
        }
      });
    });
  }
};
