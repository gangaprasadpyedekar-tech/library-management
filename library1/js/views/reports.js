// Analytical Reports & Data Export Component
const ReportsView = {
  activeReportTab: 'inventory', // 'inventory' | 'overdue' | 'fines' | 'popular'

  render(container, store) {
    const state = store.getState();

    container.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <h1>Reports & Analytical Exports</h1>
          <p>Generate printable audit reports, examine inventory health, and export data in standard CSV format.</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-secondary" id="btn-print-report">🖨️ Print Report</button>
          <button class="btn btn-emerald" id="btn-export-csv">📥 Export CSV</button>
        </div>
      </div>

      <!-- Report Tabs -->
      <div class="toolbar">
        <div class="filter-group">
          <button class="nav-tab ${this.activeReportTab === 'inventory' ? 'active' : ''}" id="tab-rep-inventory">📦 Inventory Summary</button>
          <button class="nav-tab ${this.activeReportTab === 'overdue' ? 'active' : ''}" id="tab-rep-overdue">⚠️ Overdue Borrowers</button>
          <button class="nav-tab ${this.activeReportTab === 'fines' ? 'active' : ''}" id="tab-rep-fines">💰 Fine Ledger</button>
          <button class="nav-tab ${this.activeReportTab === 'popular' ? 'active' : ''}" id="tab-rep-popular">⭐ Top Popular Books</button>
        </div>
      </div>

      <!-- Report Content Box -->
      <div class="glass-panel" id="report-printable-area">
        ${this.renderReportContent(state)}
      </div>
    `;

    // Events
    container.querySelector('#tab-rep-inventory')?.addEventListener('click', () => { this.activeReportTab = 'inventory'; this.render(container, store); });
    container.querySelector('#tab-rep-overdue')?.addEventListener('click', () => { this.activeReportTab = 'overdue'; this.render(container, store); });
    container.querySelector('#tab-rep-fines')?.addEventListener('click', () => { this.activeReportTab = 'fines'; this.render(container, store); });
    container.querySelector('#tab-rep-popular')?.addEventListener('click', () => { this.activeReportTab = 'popular'; this.render(container, store); });

    container.querySelector('#btn-print-report')?.addEventListener('click', () => {
      const content = document.getElementById('report-printable-area').outerHTML;
      const win = window.open('', '_blank');
      win.document.write(`
        <html>
          <head>
            <title>Library System Report</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
              th { background: #f2f2f2; }
            </style>
          </head>
          <body>
            <h2>CENTRAL LIBRARY SYSTEM — REPORT</h2>
            <p>Generated Date: 2026-08-18</p>
            <hr>
            ${content}
            <script>window.print(); setTimeout(() => window.close(), 500);</script>
          </body>
        </html>
      `);
    });

    container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
      this.exportCSV(state);
    });
  },

  renderReportContent(state) {
    if (this.activeReportTab === 'inventory') {
      return `
        <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 1rem;">Full Catalog Inventory Summary</h3>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Shelf</th>
                <th>Total Stock</th>
                <th>Available</th>
                <th>Checked Out</th>
              </tr>
            </thead>
            <tbody>
              ${state.books.map(b => `
                <tr>
                  <td style="font-family: 'JetBrains Mono', monospace; color: var(--primary);">${b.id}</td>
                  <td><strong style="color: #fff;">${b.title}</strong></td>
                  <td>${b.author}</td>
                  <td>${b.category}</td>
                  <td>${b.shelf}</td>
                  <td>${b.totalCopies}</td>
                  <td><strong style="color: #34d399;">${b.availableCopies}</strong></td>
                  <td>${b.totalCopies - b.availableCopies}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (this.activeReportTab === 'overdue') {
      const overdues = state.issues.filter(i => i.status === 'Overdue');
      return `
        <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 1rem;">Overdue Borrowers List (${overdues.length} records)</h3>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Borrower Name</th>
                <th>Book Title</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Accrued Fine</th>
              </tr>
            </thead>
            <tbody>
              ${overdues.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No overdue borrowers at this time!</td></tr>' : 
                overdues.map(i => `
                <tr>
                  <td style="font-family: 'JetBrains Mono', monospace;">${i.id}</td>
                  <td><strong style="color: #fff;">${i.memberName}</strong> (${i.memberId})</td>
                  <td>${i.bookTitle}</td>
                  <td>${i.issueDate}</td>
                  <td><strong style="color: #fb7185;">${i.dueDate}</strong></td>
                  <td><strong style="color: #fb7185;">$${i.fineAmount.toFixed(2)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (this.activeReportTab === 'fines') {
      return `
        <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 1rem;">Fine Collection & Waiver Ledger</h3>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Fine ID</th>
                <th>Borrower</th>
                <th>Reason</th>
                <th>Created</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.fines.map(f => `
                <tr>
                  <td style="font-family: 'JetBrains Mono', monospace;">${f.id}</td>
                  <td><strong style="color: #fff;">${f.memberName}</strong></td>
                  <td>${f.reason}</td>
                  <td>${f.createdAt}</td>
                  <td><strong>$${f.amount.toFixed(2)}</strong></td>
                  <td><span class="badge ${f.status === 'Paid' ? 'badge-available' : f.status === 'Unpaid' ? 'badge-overdue' : 'badge-returned'}">${f.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (this.activeReportTab === 'popular') {
      // Calculate borrow count per book
      const borrowCounts = {};
      state.issues.forEach(i => {
        borrowCounts[i.bookId] = (borrowCounts[i.bookId] || 0) + 1;
      });

      const sortedBooks = [...state.books].sort((a, b) => (borrowCounts[b.id] || 0) - (borrowCounts[a.id] || 0));

      return `
        <h3 style="color: #fff; font-size: 1.1rem; margin-bottom: 1rem;">Most Popular Borrowed Titles</h3>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Times Borrowed</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              ${sortedBooks.map((b, idx) => `
                <tr>
                  <td style="font-weight: 800; color: var(--primary);">#${idx + 1}</td>
                  <td><strong style="color: #fff;">${b.title}</strong></td>
                  <td>${b.author}</td>
                  <td>${b.category}</td>
                  <td><span class="badge badge-active">${borrowCounts[b.id] || 0} times</span></td>
                  <td>${b.availableCopies} / ${b.totalCopies} available</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  },

  exportCSV(state) {
    let filename = `Library_${this.activeReportTab}_Report_${Date.now()}.csv`;
    let csvRows = [];

    if (this.activeReportTab === 'inventory') {
      csvRows.push(['ID', 'Title', 'Author', 'Category', 'ISBN', 'Shelf', 'Total Copies', 'Available Copies']);
      state.books.forEach(b => {
        csvRows.push([b.id, `"${b.title}"`, `"${b.author}"`, b.category, b.isbn, b.shelf, b.totalCopies, b.availableCopies]);
      });
    } else if (this.activeReportTab === 'overdue') {
      csvRows.push(['Loan ID', 'Member ID', 'Member Name', 'Book Title', 'Issue Date', 'Due Date', 'Fine Amount']);
      state.issues.filter(i => i.status === 'Overdue').forEach(i => {
        csvRows.push([i.id, i.memberId, `"${i.memberName}"`, `"${i.bookTitle}"`, i.issueDate, i.dueDate, i.fineAmount]);
      });
    } else if (this.activeReportTab === 'fines') {
      csvRows.push(['Fine ID', 'Member ID', 'Member Name', 'Amount', 'Reason', 'Status', 'Created Date']);
      state.fines.forEach(f => {
        csvRows.push([f.id, f.memberId, `"${f.memberName}"`, f.amount, `"${f.reason}"`, f.status, f.createdAt]);
      });
    } else if (this.activeReportTab === 'popular') {
      csvRows.push(['ID', 'Title', 'Author', 'Category', 'Total Stock', 'Available Stock']);
      state.books.forEach(b => {
        csvRows.push([b.id, `"${b.title}"`, `"${b.author}"`, b.category, b.totalCopies, b.availableCopies]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Toast.success(`Report exported as ${filename}`);
  }
};
