// Book Catalog & Management View
const BooksView = {
  viewMode: 'grid', // 'grid' or 'table'
  searchQuery: '',
  selectedCategory: 'All',
  selectedAvailability: 'All',

  render(container, store) {
    const state = store.getState();
    const role = store.getRole();

    // Collect unique categories
    const categories = ['All', ...new Set(state.books.map(b => b.category))];

    // Filter books
    let filteredBooks = state.books.filter(book => {
      const q = this.searchQuery.toLowerCase();
      const matchesSearch = !q || 
        book.title.toLowerCase().includes(q) || 
        book.author.toLowerCase().includes(q) || 
        book.isbn.toLowerCase().includes(q) ||
        book.id.toLowerCase().includes(q);

      const matchesCat = this.selectedCategory === 'All' || book.category === this.selectedCategory;

      let matchesAvail = true;
      if (this.selectedAvailability === 'Available') {
        matchesAvail = book.availableCopies > 0;
      } else if (this.selectedAvailability === 'CheckedOut') {
        matchesAvail = book.availableCopies < book.totalCopies;
      }

      return matchesSearch && matchesCat && matchesAvail;
    });

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Book Inventory & Catalog</h1>
          <p>Browse, manage, and check real-time availability of library titles and physical stock copies.</p>
        </div>
        ${role === 'Librarian' ? `
          <button class="btn btn-primary" id="btn-add-book-view">
            <span>➕ Add New Book</span>
          </button>
        ` : ''}
      </div>

      <!-- Toolbar: Search, Filters, View toggle -->
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="books-search-input" placeholder="Search by title, author, ISBN..." value="${this.searchQuery}">
        </div>

        <div class="filter-group">
          <select class="filter-select" id="filter-category">
            ${categories.map(c => `<option value="${c}" ${this.selectedCategory === c ? 'selected' : ''}>Category: ${c}</option>`).join('')}
          </select>

          <select class="filter-select" id="filter-availability">
            <option value="All" ${this.selectedAvailability === 'All' ? 'selected' : ''}>All Availability</option>
            <option value="Available" ${this.selectedAvailability === 'Available' ? 'selected' : ''}>Available Now</option>
            <option value="CheckedOut" ${this.selectedAvailability === 'CheckedOut' ? 'selected' : ''}>Currently Issued</option>
          </select>

          <div style="display: flex; background: var(--bg-input); border-radius: var(--radius-md); padding: 2px; border: 1px solid var(--border-color);">
            <button class="nav-tab ${this.viewMode === 'grid' ? 'active' : ''}" id="btn-view-grid" style="padding: 0.4rem 0.8rem;">📱 Grid</button>
            <button class="nav-tab ${this.viewMode === 'table' ? 'active' : ''}" id="btn-view-table" style="padding: 0.4rem 0.8rem;">📋 Table</button>
          </div>
        </div>
      </div>

      <!-- Catalog Container -->
      ${filteredBooks.length === 0 ? `
        <div class="glass-panel" style="text-align: center; padding: 4rem 2rem;">
          <p style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</p>
          <h3 style="color: #fff; font-weight: 700; margin-bottom: 0.5rem;">No matching books found</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Try adjusting your search criteria or filter options.</p>
        </div>
      ` : this.viewMode === 'grid' ? `
        <div class="books-grid">
          ${filteredBooks.map(book => {
            const isAvail = book.availableCopies > 0;
            return `
              <div class="book-card">
                <div class="book-cover-container" style="background: ${book.coverBg};">
                  <div style="font-size: 3rem; opacity: 0.25; font-weight: 900; color: #fff;">📖</div>
                  <span class="book-category-tag">${book.category}</span>
                  <div class="book-status-badge">
                    <span class="badge ${isAvail ? 'badge-available' : 'badge-unavailable'}">
                      ${isAvail ? `In Stock (${book.availableCopies}/${book.totalCopies})` : 'All Issued'}
                    </span>
                  </div>
                </div>

                <div class="book-details">
                  <div style="font-size: 0.75rem; color: var(--primary); font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-bottom: 4px;">
                    ${book.id} • Shelf: ${book.shelf || 'N/A'}
                  </div>
                  <h3 class="book-title" title="${book.title}">${book.title}</h3>
                  <p class="book-author">by ${book.author}</p>
                  
                  <div class="book-meta">
                    <span>ISBN: ${book.isbn}</span>
                    <span>Year: ${book.year}</span>
                  </div>
                </div>

                <div class="book-card-actions">
                  <button class="btn btn-secondary btn-sm btn-detail-book" data-id="${book.id}" style="flex: 1;">
                    👁️ Details
                  </button>
                  ${role === 'Librarian' ? `
                    ${isAvail ? `
                      <button class="btn btn-primary btn-sm btn-issue-this-book" data-id="${book.id}">
                        ➕ Issue
                      </button>
                    ` : ''}
                    <button class="btn btn-secondary btn-sm btn-edit-book" data-id="${book.id}">
                      ✏️ Edit
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="glass-panel" style="padding: 0; overflow: hidden;">
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>ID / ISBN</th>
                  <th>Title & Author</th>
                  <th>Category</th>
                  <th>Shelf Location</th>
                  <th>Stock / Copies</th>
                  <th>Status</th>
                  ${role === 'Librarian' ? '<th style="text-align: right;">Actions</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${filteredBooks.map(book => {
                  const isAvail = book.availableCopies > 0;
                  return `
                    <tr>
                      <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
                        <span style="color: var(--primary); font-weight: 700;">${book.id}</span><br>
                        <span style="color: var(--text-dim);">${book.isbn}</span>
                      </td>
                      <td>
                        <strong style="color: #fff; font-size: 0.95rem;">${book.title}</strong><br>
                        <span style="color: var(--text-muted); font-size: 0.85rem;">${book.author}</span>
                      </td>
                      <td><span class="badge" style="background: rgba(99, 102, 241, 0.1); color: #a5b4fc;">${book.category}</span></td>
                      <td><span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--accent-cyan);">${book.shelf || 'N/A'}</span></td>
                      <td>
                        <span style="font-weight: 700;">${book.availableCopies}</span> / ${book.totalCopies} available
                      </td>
                      <td>
                        <span class="badge ${isAvail ? 'badge-available' : 'badge-unavailable'}">
                          ${isAvail ? 'Available' : 'Checked Out'}
                        </span>
                      </td>
                      ${role === 'Librarian' ? `
                        <td style="text-align: right;">
                          <div style="display: flex; justify-content: flex-end; gap: 0.4rem;">
                            <button class="btn btn-secondary btn-sm btn-detail-book" data-id="${book.id}">👁️</button>
                            ${isAvail ? `<button class="btn btn-primary btn-sm btn-issue-this-book" data-id="${book.id}">➕ Issue</button>` : ''}
                            <button class="btn btn-secondary btn-sm btn-edit-book" data-id="${book.id}">✏️</button>
                            <button class="btn btn-rose btn-sm btn-delete-book" data-id="${book.id}">🗑️</button>
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
      `}
    `;

    // Event listeners
    const searchInput = container.querySelector('#books-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(container, store);
      });
    }

    const catSelect = container.querySelector('#filter-category');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.render(container, store);
      });
    }

    const availSelect = container.querySelector('#filter-availability');
    if (availSelect) {
      availSelect.addEventListener('change', (e) => {
        this.selectedAvailability = e.target.value;
        this.render(container, store);
      });
    }

    const btnGrid = container.querySelector('#btn-view-grid');
    if (btnGrid) {
      btnGrid.addEventListener('click', () => {
        this.viewMode = 'grid';
        this.render(container, store);
      });
    }

    const btnTable = container.querySelector('#btn-view-table');
    if (btnTable) {
      btnTable.addEventListener('click', () => {
        this.viewMode = 'table';
        this.render(container, store);
      });
    }

    const btnAddBookView = container.querySelector('#btn-add-book-view');
    if (btnAddBookView) {
      btnAddBookView.addEventListener('click', () => {
        window.app.openAddBookModal();
      });
    }

    // Detail, Edit, Issue, Delete actions
    container.querySelectorAll('.btn-detail-book').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.showBookDetailModal(id, store);
      });
    });

    container.querySelectorAll('.btn-edit-book').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.app.openEditBookModal(id);
      });
    });

    container.querySelectorAll('.btn-issue-this-book').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.app.openIssueModal(id);
      });
    });

    container.querySelectorAll('.btn-delete-book').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        try {
          if (confirm("Are you sure you want to delete this book from catalog?")) {
            store.deleteBook(id);
            Toast.success("Book removed from catalog.");
          }
        } catch (err) {
          Toast.error(err.message);
        }
      });
    });
  },

  showBookDetailModal(bookId, store) {
    const state = store.getState();
    const book = state.books.find(b => b.id === bookId);
    if (!book) return;

    // Find loan history for this book
    const loans = state.issues.filter(i => i.bookId === bookId);

    const content = `
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
        <div style="width: 120px; height: 160px; border-radius: 12px; background: ${book.coverBg}; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #fff;">
          📖
        </div>
        <div style="flex: 1; min-width: 240px;">
          <span class="badge badge-active" style="margin-bottom: 0.5rem;">${book.category}</span>
          <h2 style="font-size: 1.4rem; color: #fff; font-weight: 800;">${book.title}</h2>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 0.75rem;">by ${book.author}</p>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.85rem;">
            <div><strong style="color: var(--text-muted);">ISBN:</strong> ${book.isbn}</div>
            <div><strong style="color: var(--text-muted);">Publisher:</strong> ${book.publisher || 'N/A'} (${book.year})</div>
            <div><strong style="color: var(--text-muted);">Shelf Location:</strong> <span style="font-family: 'JetBrains Mono', monospace; color: var(--accent-cyan);">${book.shelf}</span></div>
            <div><strong style="color: var(--text-muted);">Stock Status:</strong> ${book.availableCopies} of ${book.totalCopies} available</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem; background: rgba(15, 23, 42, 0.5); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
        <h4 style="color: #fff; font-size: 0.9rem; margin-bottom: 0.35rem;">Description</h4>
        <p style="color: var(--text-muted); font-size: 0.875rem; line-height: 1.5;">${book.description || 'No description provided.'}</p>
      </div>

      <div>
        <h4 style="color: #fff; font-size: 0.95rem; margin-bottom: 0.75rem;">Borrowing History (${loans.length} transactions)</h4>
        ${loans.length === 0 ? `
          <p style="color: var(--text-muted); font-size: 0.85rem;">No borrowing records for this title yet.</p>
        ` : `
          <div style="max-height: 180px; overflow-y: auto;">
            <table class="custom-table" style="font-size: 0.8rem;">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${loans.map(l => `
                  <tr>
                    <td><strong>${l.memberName}</strong></td>
                    <td>${l.issueDate}</td>
                    <td>${l.dueDate}</td>
                    <td><span class="badge ${l.status === 'Active' ? 'badge-active' : l.status === 'Overdue' ? 'badge-overdue' : 'badge-returned'}">${l.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    window.app.showCustomModal(`Book Details — ${book.id}`, content, [
      { label: "Close", class: "btn-secondary", action: () => window.app.closeModal() }
    ]);
  }
};
