// Main Application Orchestrator and Global Modal Manager

class Application {
  constructor() {
    this.currentView = 'dashboard'; // 'dashboard' | 'books' | 'members' | 'circulation' | 'fines' | 'reports'
    this.modalOverlay = null;
    this.modalTitle = null;
    this.modalBody = null;
    this.modalFooter = null;
  }

  init() {
    this.setupDOM();
    this.bindEvents();

    // Subscribe to store updates
    store.subscribe(() => {
      this.renderCurrentView();
      this.updateNavbarBadges();
    });

    this.renderCurrentView();
    this.updateNavbarBadges();
  }

  setupDOM() {
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');
    this.modalFooter = document.getElementById('modal-footer');
  }

  bindEvents() {
    // Nav tabs
    document.querySelectorAll('.nav-tab[data-view]').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const view = tab.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Role switcher
    const roleSelect = document.getElementById('role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        store.setRole(e.target.value);
        Toast.info(`Switched interface mode to: ${e.target.value}`);
      });
    }

    // Modal close button
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    this.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.closeModal();
      }
    });
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Update active nav tab highlight
    document.querySelectorAll('.nav-tab[data-view]').forEach(tab => {
      if (tab.getAttribute('data-view') === viewName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    this.renderCurrentView();
  }

  renderCurrentView() {
    const mainContainer = document.getElementById('app-main-content');
    if (!mainContainer) return;

    if (this.currentView === 'dashboard') {
      DashboardView.render(mainContainer, store);
    } else if (this.currentView === 'books') {
      BooksView.render(mainContainer, store);
    } else if (this.currentView === 'members') {
      MembersView.render(mainContainer, store);
    } else if (this.currentView === 'circulation') {
      CirculationView.render(mainContainer, store);
    } else if (this.currentView === 'fines') {
      FinesView.render(mainContainer, store);
    } else if (this.currentView === 'reports') {
      ReportsView.render(mainContainer, store);
    }
  }

  updateNavbarBadges() {
    const state = store.getState();
    const overdueCount = state.issues.filter(i => i.status === 'Overdue').length;
    const badgeOverdue = document.getElementById('nav-badge-overdue');
    if (badgeOverdue) {
      badgeOverdue.textContent = overdueCount > 0 ? overdueCount : '';
      badgeOverdue.style.display = overdueCount > 0 ? 'inline-block' : 'none';
    }
  }

  // Generic Modal display helper
  showCustomModal(title, bodyHTML, buttons = []) {
    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = bodyHTML;

    this.modalFooter.innerHTML = '';
    buttons.forEach(btn => {
      const buttonEl = document.createElement('button');
      buttonEl.className = `btn ${btn.class || 'btn-secondary'}`;
      buttonEl.textContent = btn.label;
      buttonEl.addEventListener('click', () => {
        if (btn.action) btn.action();
      });
      this.modalFooter.appendChild(buttonEl);
    });

    this.modalOverlay.classList.add('active');
  }

  closeModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('active');
    }
  }

  // --- Add Book Modal ---
  openAddBookModal() {
    const categories = ['Computer Science', 'Fiction', 'History', 'Physics', 'Economics', 'Mathematics', 'Philosophy', 'General'];
    const bodyHTML = `
      <form id="form-add-book">
        <div class="form-group">
          <label class="form-label">Book Title *</label>
          <input type="text" id="add-book-title" class="form-control" placeholder="e.g. Master/Master System Architecture" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Author(s) *</label>
            <input type="text" id="add-book-author" class="form-control" placeholder="Author name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Category / Genre *</label>
            <select id="add-book-category" class="form-control">
              ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">ISBN Code *</label>
            <input type="text" id="add-book-isbn" class="form-control" placeholder="e.g. 978-0123456789" required>
          </div>
          <div class="form-group">
            <label class="form-label">Shelf Location *</label>
            <input type="text" id="add-book-shelf" class="form-control" placeholder="e.g. CS-A3-09" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Total Copies Count *</label>
            <input type="number" id="add-book-copies" class="form-control" value="3" min="1" required>
          </div>
          <div class="form-group">
            <label class="form-label">Publication Year</label>
            <input type="number" id="add-book-year" class="form-control" value="2025">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description / Abstract</label>
          <textarea id="add-book-desc" class="form-control" rows="3" placeholder="Brief summary of book topics..."></textarea>
        </div>
      </form>
    `;

    this.showCustomModal("📚 Register New Book in Catalog", bodyHTML, [
      { label: "Cancel", class: "btn-secondary", action: () => this.closeModal() },
      {
        label: "Save & Add Book",
        class: "btn-primary",
        action: () => {
          const title = document.getElementById('add-book-title').value.trim();
          const author = document.getElementById('add-book-author').value.trim();
          const isbn = document.getElementById('add-book-isbn').value.trim();
          const category = document.getElementById('add-book-category').value;
          const shelf = document.getElementById('add-book-shelf').value.trim();
          const copies = parseInt(document.getElementById('add-book-copies').value, 10) || 1;
          const year = parseInt(document.getElementById('add-book-year').value, 10) || 2025;
          const desc = document.getElementById('add-book-desc').value.trim();

          if (!title || !author || !isbn) {
            Toast.error("Please fill in all required fields (Title, Author, ISBN).");
            return;
          }

          store.addBook({
            title, author, isbn, category, shelf, totalCopies: copies, year, description: desc
          });

          this.closeModal();
          Toast.success(`Added '${title}' to library catalog!`);
        }
      }
    ]);
  }

  // --- Edit Book Modal ---
  openEditBookModal(bookId) {
    const state = store.getState();
    const book = state.books.find(b => b.id === bookId);
    if (!book) return;

    const categories = ['Computer Science', 'Fiction', 'History', 'Physics', 'Economics', 'Mathematics', 'Philosophy', 'General'];

    const bodyHTML = `
      <form id="form-edit-book">
        <div class="form-group">
          <label class="form-label">Book Title *</label>
          <input type="text" id="edit-book-title" class="form-control" value="${book.title}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Author(s) *</label>
            <input type="text" id="edit-book-author" class="form-control" value="${book.author}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select id="edit-book-category" class="form-control">
              ${categories.map(c => `<option value="${c}" ${book.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">ISBN Code *</label>
            <input type="text" id="edit-book-isbn" class="form-control" value="${book.isbn}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Shelf Location *</label>
            <input type="text" id="edit-book-shelf" class="form-control" value="${book.shelf}" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Total Copies Count *</label>
            <input type="number" id="edit-book-copies" class="form-control" value="${book.totalCopies}" min="1" required>
          </div>
          <div class="form-group">
            <label class="form-label">Publication Year</label>
            <input type="number" id="edit-book-year" class="form-control" value="${book.year}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="edit-book-desc" class="form-control" rows="3">${book.description || ''}</textarea>
        </div>
      </form>
    `;

    this.showCustomModal(`✏️ Edit Book — ${book.id}`, bodyHTML, [
      { label: "Cancel", class: "btn-secondary", action: () => this.closeModal() },
      {
        label: "Update Book",
        class: "btn-primary",
        action: () => {
          const title = document.getElementById('edit-book-title').value.trim();
          const author = document.getElementById('edit-book-author').value.trim();
          const isbn = document.getElementById('edit-book-isbn').value.trim();
          const category = document.getElementById('edit-book-category').value;
          const shelf = document.getElementById('edit-book-shelf').value.trim();
          const copies = parseInt(document.getElementById('edit-book-copies').value, 10);
          const year = parseInt(document.getElementById('edit-book-year').value, 10);
          const desc = document.getElementById('edit-book-desc').value.trim();

          store.updateBook(book.id, {
            title, author, isbn, category, shelf, totalCopies: copies, year, description: desc
          });

          this.closeModal();
          Toast.success(`Updated '${title}' details.`);
        }
      }
    ]);
  }

  // --- Add Member Modal ---
  openAddMemberModal() {
    const bodyHTML = `
      <form id="form-add-member">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" id="add-member-name" class="form-control" placeholder="e.g. Jonathan Vance" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" id="add-member-email" class="form-control" placeholder="e.g. j.vance@university.edu" required>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" id="add-member-phone" class="form-control" placeholder="+1 (555) 000-0000">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Role *</label>
            <select id="add-member-role" class="form-control">
              <option value="Student">Student (Max 3 Books, 14-day loan)</option>
              <option value="Faculty">Faculty (Max 5 Books, 30-day loan)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Department / Major</label>
            <input type="text" id="add-member-dept" class="form-control" placeholder="e.g. Computer Science">
          </div>
        </div>
      </form>
    `;

    this.showCustomModal("👤 Register New Member", bodyHTML, [
      { label: "Cancel", class: "btn-secondary", action: () => this.closeModal() },
      {
        label: "Register Member",
        class: "btn-primary",
        action: () => {
          const name = document.getElementById('add-member-name').value.trim();
          const email = document.getElementById('add-member-email').value.trim();
          const phone = document.getElementById('add-member-phone').value.trim();
          const role = document.getElementById('add-member-role').value;
          const dept = document.getElementById('add-member-dept').value.trim();

          if (!name || !email) {
            Toast.error("Please enter Name and Email.");
            return;
          }

          store.addMember({ name, email, phone, role, department: dept });
          this.closeModal();
          Toast.success(`Registered new member: ${name}`);
        }
      }
    ]);
  }

  // --- Edit Member Modal ---
  openEditMemberModal(memberId) {
    const state = store.getState();
    const member = state.members.find(m => m.id === memberId);
    if (!member) return;

    const bodyHTML = `
      <form id="form-edit-member">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" id="edit-member-name" class="form-control" value="${member.name}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" id="edit-member-email" class="form-control" value="${member.email}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" id="edit-member-phone" class="form-control" value="${member.phone || ''}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Role *</label>
            <select id="edit-member-role" class="form-control">
              <option value="Student" ${member.role === 'Student' ? 'selected' : ''}>Student</option>
              <option value="Faculty" ${member.role === 'Faculty' ? 'selected' : ''}>Faculty</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <input type="text" id="edit-member-dept" class="form-control" value="${member.department || ''}">
          </div>
        </div>
      </form>
    `;

    this.showCustomModal(`✏️ Edit Member — ${member.id}`, bodyHTML, [
      { label: "Cancel", class: "btn-secondary", action: () => this.closeModal() },
      {
        label: "Save Changes",
        class: "btn-primary",
        action: () => {
          const name = document.getElementById('edit-member-name').value.trim();
          const email = document.getElementById('edit-member-email').value.trim();
          const phone = document.getElementById('edit-member-phone').value.trim();
          const role = document.getElementById('edit-member-role').value;
          const dept = document.getElementById('edit-member-dept').value.trim();

          store.updateMember(member.id, { name, email, phone, role, department: dept });
          this.closeModal();
          Toast.success(`Updated profile for ${name}`);
        }
      }
    ]);
  }

  // --- Issue Book Modal ---
  openIssueModal(preselectedBookId = null) {
    const state = store.getState();
    const availableBooks = state.books.filter(b => b.availableCopies > 0);
    const activeMembers = state.members.filter(m => m.status === 'Active');

    if (availableBooks.length === 0) {
      Toast.error("No books currently available in stock to issue.");
      return;
    }

    const bodyHTML = `
      <form id="form-issue-book">
        <div class="form-group">
          <label class="form-label">Select Book to Issue *</label>
          <select id="issue-book-select" class="form-control" required>
            ${availableBooks.map(b => `
              <option value="${b.id}" ${b.id === preselectedBookId ? 'selected' : ''}>
                ${b.title} (${b.availableCopies} available)
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Select Borrower Member *</label>
          <select id="issue-member-select" class="form-control" required>
            ${activeMembers.map(m => `
              <option value="${m.id}">${m.name} (${m.role} — ${m.id})</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Loan Duration (Days)</label>
          <select id="issue-duration-select" class="form-control">
            <option value="14" selected>14 Days (Standard Student Loan)</option>
            <option value="30">30 Days (Extended Faculty Loan)</option>
            <option value="7">7 Days (Short Course Reserve)</option>
          </select>
        </div>

        <div style="background: rgba(99, 102, 241, 0.1); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); font-size: 0.85rem; color: #a5b4fc;">
          ℹ️ System verifies borrower limit & unpaid fines before completing transaction. Late returns incur $1.00/day fine.
        </div>
      </form>
    `;

    this.showCustomModal("➕ Issue Book to Member", bodyHTML, [
      { label: "Cancel", class: "btn-secondary", action: () => this.closeModal() },
      {
        label: "Confirm & Issue Book",
        class: "btn-primary",
        action: () => {
          const bookId = document.getElementById('issue-book-select').value;
          const memberId = document.getElementById('issue-member-select').value;
          const duration = document.getElementById('issue-duration-select').value;

          try {
            const newIssue = store.issueBook({ bookId, memberId, durationDays: duration });
            this.closeModal();
            Toast.success(`Book issued! Due Date: ${newIssue.dueDate}`);

            // Automatically open printable receipt
            CirculationView.printReceiptModal(newIssue.id, store);
          } catch (err) {
            Toast.error(err.message);
          }
        }
      }
    ]);
  }

  // --- Return Book Modal ---
  openReturnModal(preselectedIssueId = null) {
    const state = store.getState();
    const activeIssues = state.issues.filter(i => i.status === 'Active' || i.status === 'Overdue');

    if (activeIssues.length === 0) {
      Toast.info("There are no active or overdue loans to return.");
      return;
    }

    const selectedIssue = activeIssues.find(i => i.id === preselectedIssueId) || activeIssues[0];

    const bodyHTML = `
      <form id="form-return-book">
        <div class="form-group">
          <label class="form-label">Select Loan to Process Return *</label>
          <select id="return-issue-select" class="form-control">
            ${activeIssues.map(i => `
              <option value="${i.id}" ${i.id === selectedIssue.id ? 'selected' : ''}>
                ${i.bookTitle} — ${i.memberName} (${i.status})
              </option>
            `).join('')}
          </select>
        </div>

        <div id="return-calculation-preview" style="background: rgba(15, 23, 42, 0.6); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1.25rem;">
          <!-- Dynamically computed fine preview -->
        </div>

        <div class="form-group">
          <label class="form-label">Book Return Condition</label>
          <select id="return-condition-select" class="form-control">
            <option value="Good">Good / Standard Condition</option>
            <option value="Minor Wear">Minor Wear & Tear</option>
            <option value="Damaged">Damaged (Requires Repair / Replacement fee)</option>
          </select>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
          <input type="checkbox" id="return-waive-checkbox" style="width: 16px; height: 16px; cursor: pointer;">
          <label for="return-waive-checkbox" style="font-size: 0.85rem; color: #fff; cursor: pointer;">
            Waive any accrued late fine for this return
          </label>
        </div>
      </form>
    `;

    this.showCustomModal("↩ Return Book & Calculate Fines", bodyHTML, [
      { label: "Cancel", class: "btn-secondary", action: () => this.closeModal() },
      {
        label: "Confirm Return",
        class: "btn-emerald",
        action: () => {
          const issueId = document.getElementById('return-issue-select').value;
          const condition = document.getElementById('return-condition-select').value;
          const waiveFine = document.getElementById('return-waive-checkbox').checked;

          try {
            const returnedIssue = store.returnBook({ issueId, conditionNotes: condition, waiveFine });
            this.closeModal();
            Toast.success(`Book return processed for '${returnedIssue.bookTitle}'!`);
            CirculationView.printReceiptModal(returnedIssue.id, store);
          } catch (err) {
            Toast.error(err.message);
          }
        }
      }
    ]);

    // Live update calculation preview when issue select changes
    const selectEl = document.getElementById('return-issue-select');
    const previewEl = document.getElementById('return-calculation-preview');

    const updatePreview = () => {
      const issue = activeIssues.find(i => i.id === selectEl.value);
      if (!issue) return;

      const today = new Date("2026-08-18");
      const dueDate = new Date(issue.dueDate);
      let lateDays = 0;
      if (today > dueDate) {
        lateDays = Math.ceil(Math.abs(today - dueDate) / (1000 * 60 * 60 * 24));
      }
      const calcFine = lateDays * 1.00;

      previewEl.innerHTML = `
        <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem;">
          <div><strong style="color: var(--text-muted);">Borrower:</strong> ${issue.memberName}</div>
          <div><strong style="color: var(--text-muted);">Due Date:</strong> ${issue.dueDate}</div>
          <div><strong style="color: var(--text-muted);">Return Date:</strong> 2026-08-18</div>
          <div style="border-top: 1px dashed var(--border-color); padding-top: 0.5rem; margin-top: 0.25rem;">
            ${lateDays > 0 ? `
              <span style="color: #fb7185; font-weight: 700;">⚠️ ${lateDays} Days Overdue — Calculated Fine: $${calcFine.toFixed(2)}</span>
            ` : `
              <span style="color: #34d399; font-weight: 700;">✅ Returned On-Time (No Fine)</span>
            `}
          </div>
        </div>
      `;
    };

    selectEl.addEventListener('change', updatePreview);
    updatePreview();
  }
}

// Global instance
window.app = new Application();
