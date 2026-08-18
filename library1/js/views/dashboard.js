// Dashboard View Render Component
const DashboardView = {
  render(container, store) {
    const state = store.getState();
    const role = store.getRole();

    // Calculations
    const totalBooksCount = state.books.length;
    const totalCopiesCount = state.books.reduce((acc, b) => acc + b.totalCopies, 0);
    const totalAvailableCopies = state.books.reduce((acc, b) => acc + b.availableCopies, 0);
    const totalActiveLoans = state.issues.filter(i => i.status === 'Active').length;
    const totalOverdueLoans = state.issues.filter(i => i.status === 'Overdue').length;
    const totalMembers = state.members.length;

    const unpaidFines = state.fines.filter(f => f.status === 'Unpaid');
    const totalUnpaidFinesAmount = unpaidFines.reduce((acc, f) => acc + f.amount, 0);

    const paidFines = state.fines.filter(f => f.status === 'Paid');
    const totalPaidFinesAmount = paidFines.reduce((acc, f) => acc + f.amount, 0);

    // Categories breakdown
    const categoryCounts = {};
    state.books.forEach(b => {
      categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
    });

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Library Command Center</h1>
          <p>Welcome back! Here is an overview of system inventory, active loans, and member operations.</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-sm" id="btn-refresh-data">🔄 Refresh</button>
          <button class="btn btn-secondary btn-sm" id="btn-reset-db" style="color: #f43f5e;">⚡ Reset Demo Data</button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card" style="--card-accent: #6366f1;">
          <div class="stat-header">
            <span class="stat-label">TOTAL BOOKS / COPIES</span>
            <div class="stat-icon" style="background: rgba(99, 102, 241, 0.15); color: #818cf8;">📚</div>
          </div>
          <div class="stat-value">${totalBooksCount} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;">(${totalCopiesCount} copies)</span></div>
          <div class="stat-trend" style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc;">
            Catalog Inventory
          </div>
        </div>

        <div class="stat-card" style="--card-accent: #10b981;">
          <div class="stat-header">
            <span class="stat-label">AVAILABLE COPIES</span>
            <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">✅</div>
          </div>
          <div class="stat-value">${totalAvailableCopies}</div>
          <div class="stat-trend" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">
            ${Math.round((totalAvailableCopies / (totalCopiesCount || 1)) * 100)}% Stock Available
          </div>
        </div>

        <div class="stat-card" style="--card-accent: #06b6d4;">
          <div class="stat-header">
            <span class="stat-label">ACTIVE BORROWS</span>
            <div class="stat-icon" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee;">📖</div>
          </div>
          <div class="stat-value">${totalActiveLoans}</div>
          <div class="stat-trend" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee;">
            Checked Out Now
          </div>
        </div>

        <div class="stat-card" style="--card-accent: #f43f5e;">
          <div class="stat-header">
            <span class="stat-label">OVERDUE BOOKS</span>
            <div class="stat-icon" style="background: rgba(244, 63, 94, 0.15); color: #fb7185;">⚠️</div>
          </div>
          <div class="stat-value" style="color: ${totalOverdueLoans > 0 ? '#f43f5e' : '#fff'};">${totalOverdueLoans}</div>
          <div class="stat-trend" style="background: rgba(244, 63, 94, 0.15); color: #fb7185;">
            Action Required
          </div>
        </div>

        <div class="stat-card" style="--card-accent: #f59e0b;">
          <div class="stat-header">
            <span class="stat-label">UNPAID FINES</span>
            <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">💰</div>
          </div>
          <div class="stat-value">$${totalUnpaidFinesAmount.toFixed(2)}</div>
          <div class="stat-trend" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">
            Collectable Ledger
          </div>
        </div>
      </div>

      <!-- Quick Actions Bar -->
      ${role === 'Librarian' ? `
      <div class="quick-actions">
        <button class="btn btn-primary" id="btn-quick-issue">
          <span>➕ Issue Book</span>
        </button>
        <button class="btn btn-emerald" id="btn-quick-return">
          <span>↩ Return Book</span>
        </button>
        <button class="btn btn-secondary" id="btn-quick-add-book">
          <span>📚 Add New Book</span>
        </button>
        <button class="btn btn-secondary" id="btn-quick-add-member">
          <span>👤 Register Member</span>
        </button>
      </div>
      ` : ''}

      <!-- Main Layout Grid (2 Columns) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
        
        <!-- Category Breakdown & Inventory Bar -->
        <div class="glass-panel">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff;">Category Distribution</h3>
            <span class="badge badge-active">${Object.keys(categoryCounts).length} Genres</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / totalBooksCount) * 100);
              return `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
                    <span style="font-weight: 600; color: #e5e7eb;">${cat}</span>
                    <span style="color: var(--text-muted);">${count} titles (${pct}%)</span>
                  </div>
                  <div style="width: 100%; height: 8px; background: var(--bg-input); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent-cyan)); border-radius: 4px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- System Audit Log Stream -->
        <div class="glass-panel">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff;">Recent Activity Log</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Real-time events</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem; max-height: 280px; overflow-y: auto; padding-right: 4px;">
            ${state.logs.slice(0, 7).map(log => {
              let dotColor = '#6366f1';
              if (log.type === 'issue') dotColor = '#3b82f6';
              if (log.type === 'return') dotColor = '#10b981';
              if (log.type === 'warning') dotColor = '#f43f5e';
              if (log.type === 'fine') dotColor = '#f59e0b';

              return `
                <div style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.6rem; border-radius: 8px; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-color);">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: ${dotColor}; margin-top: 6px; flex-shrink: 0;"></div>
                  <div style="flex: 1;">
                    <p style="font-size: 0.85rem; color: #f3f4f6; font-weight: 500; line-height: 1.4;">${log.text}</p>
                    <span style="font-size: 0.725rem; color: var(--text-dim);">${log.timestamp}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;

    // Event handlers
    const btnIssue = container.querySelector('#btn-quick-issue');
    if (btnIssue) {
      btnIssue.addEventListener('click', () => {
        window.app.openIssueModal();
      });
    }

    const btnReturn = container.querySelector('#btn-quick-return');
    if (btnReturn) {
      btnReturn.addEventListener('click', () => {
        window.app.openReturnModal();
      });
    }

    const btnAddBook = container.querySelector('#btn-quick-add-book');
    if (btnAddBook) {
      btnAddBook.addEventListener('click', () => {
        window.app.openAddBookModal();
      });
    }

    const btnAddMember = container.querySelector('#btn-quick-add-member');
    if (btnAddMember) {
      btnAddMember.addEventListener('click', () => {
        window.app.openAddMemberModal();
      });
    }

    const btnReset = container.querySelector('#btn-reset-db');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all library data to demo initial state?")) {
          store.resetDatabase();
          Toast.success("Library database reset to initial demo state.");
        }
      });
    }

    const btnRefresh = container.querySelector('#btn-refresh-data');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        store.recalculateOverdues();
        Toast.info("System overdues & fines recalculated.");
      });
    }
  }
};
