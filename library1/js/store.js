// Centralized Reactive State Store with LocalStorage Persistence

class LibraryStore {
  constructor() {
    this.STORAGE_KEY = 'ANTIGRAVITY_LMS_DATA_V1';
    this.listeners = [];
    this.currentRole = 'Librarian'; // 'Librarian' or 'Member'
    this.currentMemberId = 'MEM-201'; // Default member view
    this.state = this.loadState();
    this.recalculateOverdues();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load state from LocalStorage", e);
    }
    // Fallback to initial seed data
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save state to LocalStorage", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState() {
    return this.state;
  }

  setRole(role) {
    this.currentRole = role;
    this.notify();
  }

  getRole() {
    return this.currentRole;
  }

  setMemberView(memberId) {
    this.currentMemberId = memberId;
    this.notify();
  }

  getCurrentMemberViewId() {
    return this.currentMemberId;
  }

  // Recalculate overdues based on current date (2026-08-18)
  recalculateOverdues() {
    const today = new Date("2026-08-18");
    let changed = false;

    this.state.issues.forEach(issue => {
      if (issue.status === 'Active' || issue.status === 'Overdue') {
        const dueDate = new Date(issue.dueDate);
        if (today > dueDate) {
          const diffTime = Math.abs(today - dueDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const fine = diffDays * 1.00;

          if (issue.status !== 'Overdue' || issue.fineAmount !== fine) {
            issue.status = 'Overdue';
            issue.fineAmount = fine;
            issue.fineStatus = 'Unpaid';
            changed = true;

            // Ensure fine entry exists
            let existingFine = this.state.fines.find(f => f.issueId === issue.id);
            if (!existingFine) {
              this.state.fines.push({
                id: `FIN-${Date.now()}`,
                issueId: issue.id,
                memberId: issue.memberId,
                memberName: issue.memberName,
                amount: fine,
                reason: `${diffDays} Days Overdue for ${issue.bookTitle}`,
                status: 'Unpaid',
                createdAt: "2026-08-18"
              });
            } else if (existingFine.status === 'Unpaid') {
              existingFine.amount = fine;
              existingFine.reason = `${diffDays} Days Overdue for ${issue.bookTitle}`;
            }
          }
        }
      }
    });

    if (changed) {
      this.saveState();
    }
  }

  // Book CRUD
  addBook(bookData) {
    const newId = `BK-${1000 + this.state.books.length + 1}`;
    const newBook = {
      id: newId,
      ...bookData,
      totalCopies: parseInt(bookData.totalCopies, 10) || 1,
      availableCopies: parseInt(bookData.totalCopies, 10) || 1,
      coverBg: bookData.coverBg || 'linear-gradient(135deg, #1e3a8a, #3b82f6)'
    };
    this.state.books.unshift(newBook);
    this.logActivity(`Added new book: '${newBook.title}' (ISBN: ${newBook.isbn})`, 'book');
    this.saveState();
    return newBook;
  }

  updateBook(bookId, updatedData) {
    const index = this.state.books.findIndex(b => b.id === bookId);
    if (index !== -1) {
      const old = this.state.books[index];
      const diffTotal = (parseInt(updatedData.totalCopies, 10) || old.totalCopies) - old.totalCopies;
      this.state.books[index] = {
        ...old,
        ...updatedData,
        totalCopies: parseInt(updatedData.totalCopies, 10) || old.totalCopies,
        availableCopies: Math.max(0, old.availableCopies + diffTotal)
      };
      this.logActivity(`Updated book details for '${old.title}'`, 'book');
      this.saveState();
    }
  }

  deleteBook(bookId) {
    const book = this.state.books.find(b => b.id === bookId);
    if (book) {
      // Check if active borrowings exist
      const activeLoans = this.state.issues.filter(i => i.bookId === bookId && (i.status === 'Active' || i.status === 'Overdue'));
      if (activeLoans.length > 0) {
        throw new Error(`Cannot delete book '${book.title}' while copies are currently issued to members.`);
      }
      this.state.books = this.state.books.filter(b => b.id !== bookId);
      this.logActivity(`Deleted book: '${book.title}'`, 'warning');
      this.saveState();
    }
  }

  // Member CRUD
  addMember(memberData) {
    const newId = `MEM-${200 + this.state.members.length + 1}`;
    const maxLimit = memberData.role === 'Faculty' ? 5 : 3;
    const newMember = {
      id: newId,
      ...memberData,
      maxLimit,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    this.state.members.unshift(newMember);
    this.logActivity(`Registered new member: ${newMember.name} (${newMember.role})`, 'member');
    this.saveState();
    return newMember;
  }

  updateMember(memberId, updatedData) {
    const index = this.state.members.findIndex(m => m.id === memberId);
    if (index !== -1) {
      this.state.members[index] = {
        ...this.state.members[index],
        ...updatedData
      };
      this.logActivity(`Updated member profile for ${this.state.members[index].name}`, 'member');
      this.saveState();
    }
  }

  deleteMember(memberId) {
    const member = this.state.members.find(m => m.id === memberId);
    if (member) {
      const activeLoans = this.state.issues.filter(i => i.memberId === memberId && (i.status === 'Active' || i.status === 'Overdue'));
      if (activeLoans.length > 0) {
        throw new Error(`Cannot delete member '${member.name}' who has unreturned books.`);
      }
      this.state.members = this.state.members.filter(m => m.id !== memberId);
      this.logActivity(`Deleted member record: ${member.name}`, 'warning');
      this.saveState();
    }
  }

  // Circulation Desk (Issue & Return)
  issueBook({ bookId, memberId, durationDays = 14 }) {
    const book = this.state.books.find(b => b.id === bookId);
    const member = this.state.members.find(m => m.id === memberId);

    if (!book) throw new Error("Book not found.");
    if (!member) throw new Error("Member not found.");

    if (book.availableCopies <= 0) {
      throw new Error(`No available copies left for '${book.title}'. All copies are currently issued.`);
    }

    // Check member active loans limit
    const activeMemberLoans = this.state.issues.filter(
      i => i.memberId === memberId && (i.status === 'Active' || i.status === 'Overdue')
    );

    if (activeMemberLoans.length >= member.maxLimit) {
      throw new Error(`Member '${member.name}' has reached their maximum borrowing limit of ${member.maxLimit} books.`);
    }

    // Check unpaid fines threshold
    const unpaidFines = this.state.fines.filter(f => f.memberId === memberId && f.status === 'Unpaid');
    const totalUnpaidAmount = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
    if (totalUnpaidAmount > 10.00) {
      throw new Error(`Borrowing blocked: Member '${member.name}' has $${totalUnpaidAmount.toFixed(2)} in unpaid fines.`);
    }

    // Deduct available copy
    book.availableCopies -= 1;

    // Calculate dates
    const issueDate = new Date("2026-08-18");
    const dueDateObj = new Date("2026-08-18");
    dueDateObj.setDate(dueDateObj.getDate() + parseInt(durationDays, 10));

    const newIssue = {
      id: `ISU-${Date.now().toString().slice(-4)}`,
      bookId: book.id,
      bookTitle: book.title,
      memberId: member.id,
      memberName: member.name,
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDateObj.toISOString().split('T')[0],
      returnDate: null,
      status: 'Active',
      fineAmount: 0,
      fineStatus: 'None'
    };

    this.state.issues.unshift(newIssue);
    this.logActivity(`Issued '${book.title}' to ${member.name} (Due: ${newIssue.dueDate})`, 'issue');
    this.saveState();
    return newIssue;
  }

  returnBook({ issueId, conditionNotes = "Good", waiveFine = false }) {
    const issue = this.state.issues.find(i => i.id === issueId);
    if (!issue) throw new Error("Issue record not found.");
    if (issue.status === 'Returned' || issue.status === 'Returned Late') {
      throw new Error("This book has already been returned.");
    }

    const book = this.state.books.find(b => b.id === issue.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    }

    const returnDateStr = "2026-08-18";
    issue.returnDate = returnDateStr;

    const returnDateObj = new Date(returnDateStr);
    const dueDateObj = new Date(issue.dueDate);

    let lateDays = 0;
    if (returnDateObj > dueDateObj) {
      const diffTime = Math.abs(returnDateObj - dueDateObj);
      lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (lateDays > 0) {
      issue.status = 'Returned Late';
      const fineAmount = lateDays * 1.00;
      issue.fineAmount = fineAmount;

      let fineObj = this.state.fines.find(f => f.issueId === issue.id);
      if (!fineObj) {
        fineObj = {
          id: `FIN-${Date.now()}`,
          issueId: issue.id,
          memberId: issue.memberId,
          memberName: issue.memberName,
          amount: fineAmount,
          reason: `${lateDays} Days Overdue for ${issue.bookTitle}`,
          status: waiveFine ? 'Waived' : 'Unpaid',
          createdAt: returnDateStr
        };
        this.state.fines.unshift(fineObj);
      } else {
        fineObj.amount = fineAmount;
        if (waiveFine) fineObj.status = 'Waived';
      }

      issue.fineStatus = fineObj.status;
    } else {
      issue.status = 'Returned';
      issue.fineAmount = 0;
      issue.fineStatus = 'None';
    }

    this.logActivity(`Returned '${issue.bookTitle}' from ${issue.memberName} (Condition: ${conditionNotes})`, 'return');
    this.saveState();
    return issue;
  }

  // Fines Management
  payFine(fineId) {
    const fine = this.state.fines.find(f => f.id === fineId);
    if (!fine) throw new Error("Fine record not found.");
    fine.status = 'Paid';
    fine.paidAt = "2026-08-18";

    // Update associated issue fineStatus
    const issue = this.state.issues.find(i => i.id === fine.issueId);
    if (issue) {
      issue.fineStatus = 'Paid';
    }

    this.logActivity(`Fine of $${fine.amount.toFixed(2)} paid by ${fine.memberName}`, 'fine');
    this.saveState();
  }

  waiveFine(fineId, reason = "Admin Discretion") {
    const fine = this.state.fines.find(f => f.id === fineId);
    if (!fine) throw new Error("Fine record not found.");
    fine.status = 'Waived';
    fine.reason += ` (Waived: ${reason})`;

    const issue = this.state.issues.find(i => i.id === fine.issueId);
    if (issue) {
      issue.fineStatus = 'Waived';
    }

    this.logActivity(`Fine of $${fine.amount.toFixed(2)} waived for ${fine.memberName} (${reason})`, 'warning');
    this.saveState();
  }

  logActivity(text, type = 'info') {
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
    this.state.logs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: timeStr,
      text,
      type
    });
    // Keep max 50 logs
    if (this.state.logs.length > 50) {
      this.state.logs = this.state.logs.slice(0, 50);
    }
  }

  resetDatabase() {
    this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveState();
  }
}

const store = new LibraryStore();
