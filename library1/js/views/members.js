// Student / Member Directory & Management View
const MembersView = {
  searchQuery: '',
  selectedRole: 'All',

  render(container, store) {
    const state = store.getState();
    const role = store.getRole();

    let filteredMembers = state.members.filter(member => {
      const q = this.searchQuery.toLowerCase();
      const matchesSearch = !q ||
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.id.toLowerCase().includes(q) ||
        (member.department && member.department.toLowerCase().includes(q));

      const matchesRole = this.selectedRole === 'All' || member.role === this.selectedRole;

      return matchesSearch && matchesRole;
    });

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Member & Student Directory</h1>
          <p>Manage library memberships, student/faculty borrowing limits, and active loan allocations.</p>
        </div>
        ${role === 'Librarian' ? `
          <button class="btn btn-primary" id="btn-add-member-view">
            <span>👤 Register New Member</span>
          </button>
        ` : ''}
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="members-search-input" placeholder="Search by name, email, ID, department..." value="${this.searchQuery}">
        </div>

        <div class="filter-group">
          <select class="filter-select" id="filter-member-role">
            <option value="All" ${this.selectedRole === 'All' ? 'selected' : ''}>All Roles</option>
            <option value="Student" ${this.selectedRole === 'Student' ? 'selected' : ''}>Students Only</option>
            <option value="Faculty" ${this.selectedRole === 'Faculty' ? 'selected' : ''}>Faculty Only</option>
          </select>
        </div>
      </div>

      <!-- Members Grid Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${filteredMembers.map(member => {
          // Calculate active borrows for this member
          const activeLoans = state.issues.filter(i => i.memberId === member.id && (i.status === 'Active' || i.status === 'Overdue'));
          const overdueCount = activeLoans.filter(i => i.status === 'Overdue').length;

          // Calculate total unpaid fines
          const unpaidFines = state.fines.filter(f => f.memberId === member.id && f.status === 'Unpaid');
          const unpaidTotal = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

          // Get initials for avatar
          const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2);

          return `
            <div class="glass-panel" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div class="avatar">${initials}</div>
                    <div>
                      <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff;">${member.name}</h3>
                      <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; font-family: 'JetBrains Mono', monospace;">${member.id}</span>
                    </div>
                  </div>
                  <span class="badge ${member.role === 'Faculty' ? 'badge-active' : 'badge-available'}">
                    ${member.role}
                  </span>
                </div>

                <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1.25rem;">
                  <div>📧 ${member.email}</div>
                  <div>📞 ${member.phone || 'N/A'}</div>
                  <div>🏢 Dept: <strong style="color: #fff;">${member.department || 'General'}</strong></div>
                  <div>📅 Member Since: ${member.joinedDate}</div>
                </div>

                <!-- Borrowing Capacity Bar -->
                <div style="background: rgba(15, 23, 42, 0.6); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1rem;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.35rem;">
                    <span style="color: var(--text-muted); font-weight: 600;">Books Borrowed:</span>
                    <strong style="color: ${activeLoans.length >= member.maxLimit ? '#f43f5e' : '#fff'};">
                      ${activeLoans.length} / ${member.maxLimit} max
                    </strong>
                  </div>
                  <div style="width: 100%; height: 6px; background: var(--bg-input); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${(activeLoans.length / member.maxLimit) * 100}%; height: 100%; background: ${activeLoans.length >= member.maxLimit ? '#f43f5e' : 'var(--primary)'}; border-radius: 3px;"></div>
                  </div>
                  ${unpaidTotal > 0 ? `
                    <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #fb7185; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                      ⚠️ Unpaid Fines: $${unpaidTotal.toFixed(2)}
                    </div>
                  ` : ''}
                </div>
              </div>

              <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.85rem;">
                <button class="btn btn-secondary btn-sm btn-member-detail" data-id="${member.id}" style="flex: 1;">
                  👁️ Profile & History
                </button>
                ${role === 'Librarian' ? `
                  <button class="btn btn-secondary btn-sm btn-edit-member" data-id="${member.id}">
                    ✏️ Edit
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Event listeners
    const searchInput = container.querySelector('#members-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(container, store);
      });
    }

    const roleSelect = container.querySelector('#filter-member-role');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        this.selectedRole = e.target.value;
        this.render(container, store);
      });
    }

    const btnAdd = container.querySelector('#btn-add-member-view');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        window.app.openAddMemberModal();
      });
    }

    container.querySelectorAll('.btn-member-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.showMemberDetailModal(id, store);
      });
    });

    container.querySelectorAll('.btn-edit-member').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.app.openEditMemberModal(id);
      });
    });
  },

  showMemberDetailModal(memberId, store) {
    const state = store.getState();
    const member = state.members.find(m => m.id === memberId);
    if (!member) return;

    const loans = state.issues.filter(i => i.memberId === memberId);
    const activeLoans = loans.filter(i => i.status === 'Active' || i.status === 'Overdue');
    const memberFines = state.fines.filter(f => f.memberId === memberId);
    const unpaidFinesTotal = memberFines.filter(f => f.status === 'Unpaid').reduce((sum, f) => sum + f.amount, 0);

    const content = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
        <div class="avatar" style="width: 54px; height: 54px; font-size: 1.3rem;">
          ${member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>
        <div>
          <h2 style="color: #fff; font-size: 1.3rem; font-weight: 800;">${member.name}</h2>
          <span style="font-family: 'JetBrains Mono', monospace; color: var(--primary); font-weight: 700;">${member.id}</span>
          <span class="badge badge-active" style="margin-left: 0.5rem;">${member.role}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; background: rgba(15, 23, 42, 0.5); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1.5rem; font-size: 0.85rem;">
        <div><strong style="color: var(--text-muted);">Email:</strong> ${member.email}</div>
        <div><strong style="color: var(--text-muted);">Phone:</strong> ${member.phone}</div>
        <div><strong style="color: var(--text-muted);">Department:</strong> ${member.department}</div>
        <div><strong style="color: var(--text-muted);">Max Borrow Limit:</strong> ${member.maxLimit} books</div>
        <div><strong style="color: var(--text-muted);">Active Loans:</strong> ${activeLoans.length} books</div>
        <div><strong style="color: var(--text-muted);">Unpaid Fines:</strong> <span style="color: ${unpaidFinesTotal > 0 ? '#f43f5e' : '#10b981'}; font-weight: 700;">$${unpaidFinesTotal.toFixed(2)}</span></div>
      </div>

      <h4 style="color: #fff; font-size: 0.95rem; margin-bottom: 0.75rem;">Active & Historical Loans (${loans.length})</h4>
      ${loans.length === 0 ? `
        <p style="color: var(--text-muted); font-size: 0.85rem;">No loan history for this member.</p>
      ` : `
        <div style="max-height: 200px; overflow-y: auto;">
          <table class="custom-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${loans.map(l => `
                <tr>
                  <td><strong style="color: #fff;">${l.bookTitle}</strong></td>
                  <td>${l.issueDate}</td>
                  <td>${l.dueDate}</td>
                  <td><span class="badge ${l.status === 'Active' ? 'badge-active' : l.status === 'Overdue' ? 'badge-overdue' : 'badge-returned'}">${l.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;

    window.app.showCustomModal(`Member Profile — ${member.name}`, content, [
      { label: "Close", class: "btn-secondary", action: () => window.app.closeModal() }
    ]);
  }
};
