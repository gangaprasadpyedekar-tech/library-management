// Initial dataset for Library Management System
const INITIAL_DATA = {
  books: [
    {
      id: "BK-1001",
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      isbn: "978-0132350884",
      category: "Computer Science",
      publisher: "Prentice Hall",
      year: 2008,
      totalCopies: 5,
      availableCopies: 3,
      shelf: "CS-A1-04",
      description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
      coverBg: "linear-gradient(135deg, #1e3a8a, #3b82f6)"
    },
    {
      id: "BK-1002",
      title: "The Pragmatic Programmer: Your Journey to Mastery",
      author: "David Thomas, Andrew Hunt",
      isbn: "978-0135957059",
      category: "Computer Science",
      publisher: "Addison-Wesley",
      year: 2019,
      totalCopies: 4,
      availableCopies: 2,
      shelf: "CS-A2-12",
      description: "The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development.",
      coverBg: "linear-gradient(135deg, #065f46, #10b981)"
    },
    {
      id: "BK-1003",
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
      isbn: "978-0201633610",
      category: "Computer Science",
      publisher: "Addison-Wesley",
      year: 1994,
      totalCopies: 3,
      availableCopies: 1,
      shelf: "CS-B1-02",
      description: "Capturing a wealth of experience about the design of object-oriented software by four top-notch designers.",
      coverBg: "linear-gradient(135deg, #581c87, #8b5cf6)"
    },
    {
      id: "BK-1004",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0061120084",
      category: "Fiction",
      publisher: "Harper Perennial",
      year: 1960,
      totalCopies: 6,
      availableCopies: 5,
      shelf: "FIC-L3-08",
      description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
      coverBg: "linear-gradient(135deg, #991b1b, #ef4444)"
    },
    {
      id: "BK-1005",
      title: "1984",
      author: "George Orwell",
      isbn: "978-0451524935",
      category: "Fiction",
      publisher: "Signet Classic",
      year: 1949,
      totalCopies: 4,
      availableCopies: 2,
      shelf: "FIC-O1-15",
      description: "A dystopian social science fiction novel and cautionary tale about totalitarianism and mass surveillance.",
      coverBg: "linear-gradient(135deg, #854d0e, #eab308)"
    },
    {
      id: "BK-1006",
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      isbn: "978-0062316097",
      category: "History",
      publisher: "Harper",
      year: 2014,
      totalCopies: 4,
      availableCopies: 3,
      shelf: "HIS-H2-05",
      description: "100,000 years ago, at least six human species inhabited the earth. Today there is just one. Us. Homo sapiens.",
      coverBg: "linear-gradient(135deg, #1e293b, #475569)"
    },
    {
      id: "BK-1007",
      title: "Introduction to Algorithms, 4th Edition",
      author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
      isbn: "978-0262046305",
      category: "Computer Science",
      publisher: "MIT Press",
      year: 2022,
      totalCopies: 8,
      availableCopies: 4,
      shelf: "CS-C3-01",
      description: "A comprehensive update of the leading algorithms text, with new material on matchings in bipartite graphs, online algorithms, machine learning, and more.",
      coverBg: "linear-gradient(135deg, #0f766e, #14b8a6)"
    },
    {
      id: "BK-1008",
      title: "Quantum Physics for Beginners",
      author: "Carl J. Pratt",
      isbn: "978-1801201552",
      category: "Physics",
      publisher: "Pratt Publishing",
      year: 2021,
      totalCopies: 3,
      availableCopies: 3,
      shelf: "PHY-P1-09",
      description: "Discover the hidden rules of the universe and how quantum mechanics reshaped modern science.",
      coverBg: "linear-gradient(135deg, #431407, #c2410c)"
    },
    {
      id: "BK-1009",
      title: "Principles of Corporate Finance",
      author: "Richard Brealey, Stewart Myers, Franklin Allen",
      isbn: "978-1260013900",
      category: "Economics",
      publisher: "McGraw-Hill",
      year: 2019,
      totalCopies: 5,
      availableCopies: 4,
      shelf: "ECO-B4-02",
      description: "Describes the theory and practice of corporate finance and explains how financial managers use financial theory to solve practical problems.",
      coverBg: "linear-gradient(135deg, #14532d, #22c55e)"
    },
    {
      id: "BK-1010",
      title: "Deep Learning",
      author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
      isbn: "978-0262035613",
      category: "Computer Science",
      publisher: "MIT Press",
      year: 2016,
      totalCopies: 3,
      availableCopies: 1,
      shelf: "CS-D2-10",
      description: "An introduction to a broad range of topics in deep learning, covering mathematical and conceptual background, deep learning techniques used in industry, and research perspectives.",
      coverBg: "linear-gradient(135deg, #311b92, #673ab7)"
    }
  ],

  members: [
    {
      id: "MEM-201",
      name: "Sophia Chen",
      email: "sophia.chen@university.edu",
      phone: "+1 (555) 234-5678",
      role: "Student",
      department: "Computer Science",
      maxLimit: 3,
      joinedDate: "2025-09-01",
      status: "Active"
    },
    {
      id: "MEM-202",
      name: "Dr. Marcus Vance",
      email: "m.vance@university.edu",
      phone: "+1 (555) 876-5432",
      role: "Faculty",
      department: "Physics",
      maxLimit: 5,
      joinedDate: "2023-01-15",
      status: "Active"
    },
    {
      id: "MEM-203",
      name: "Alex Rivera",
      email: "arivera99@gmail.com",
      phone: "+1 (555) 345-6789",
      role: "Student",
      department: "Electrical Engineering",
      maxLimit: 3,
      joinedDate: "2025-10-12",
      status: "Active"
    },
    {
      id: "MEM-204",
      name: "Emma Watson",
      email: "emma.w@university.edu",
      phone: "+1 (555) 987-6543",
      role: "Student",
      department: "Literature",
      maxLimit: 3,
      joinedDate: "2024-02-20",
      status: "Active"
    },
    {
      id: "MEM-205",
      name: "Prof. Elena Rostova",
      email: "elena.r@university.edu",
      phone: "+1 (555) 456-7890",
      role: "Faculty",
      department: "Economics",
      maxLimit: 5,
      joinedDate: "2022-08-10",
      status: "Active"
    },
    {
      id: "MEM-206",
      name: "Liam O'Connor",
      email: "liam.oc@student.edu",
      phone: "+1 (555) 789-0123",
      role: "Student",
      department: "History",
      maxLimit: 3,
      joinedDate: "2025-01-10",
      status: "Active"
    }
  ],

  issues: [
    {
      id: "ISU-9001",
      bookId: "BK-1001",
      bookTitle: "Clean Code: A Handbook of Agile Software Craftsmanship",
      memberId: "MEM-201",
      memberName: "Sophia Chen",
      issueDate: "2026-08-01",
      dueDate: "2026-08-15", // Overdue by 3 days relative to 2026-08-18
      returnDate: null,
      status: "Overdue",
      fineAmount: 3.00,
      fineStatus: "Unpaid"
    },
    {
      id: "ISU-9002",
      bookId: "BK-1002",
      bookTitle: "The Pragmatic Programmer: Your Journey to Mastery",
      memberId: "MEM-202",
      memberName: "Dr. Marcus Vance",
      issueDate: "2026-08-05",
      dueDate: "2026-09-04",
      returnDate: null,
      status: "Active",
      fineAmount: 0,
      fineStatus: "None"
    },
    {
      id: "ISU-9003",
      bookId: "BK-1003",
      bookTitle: "Design Patterns: Elements of Reusable Object-Oriented Software",
      memberId: "MEM-203",
      memberName: "Alex Rivera",
      issueDate: "2026-07-20",
      dueDate: "2026-08-03", // Overdue by 15 days
      returnDate: null,
      status: "Overdue",
      fineAmount: 15.00,
      fineStatus: "Unpaid"
    },
    {
      id: "ISU-9004",
      bookId: "BK-1005",
      bookTitle: "1984",
      memberId: "MEM-204",
      memberName: "Emma Watson",
      issueDate: "2026-08-10",
      dueDate: "2026-08-24",
      returnDate: null,
      status: "Active",
      fineAmount: 0,
      fineStatus: "None"
    },
    {
      id: "ISU-9005",
      bookId: "BK-1007",
      bookTitle: "Introduction to Algorithms, 4th Edition",
      memberId: "MEM-201",
      memberName: "Sophia Chen",
      issueDate: "2026-07-01",
      dueDate: "2026-07-15",
      returnDate: "2026-07-20",
      status: "Returned Late",
      fineAmount: 5.00,
      fineStatus: "Paid"
    },
    {
      id: "ISU-9006",
      bookId: "BK-1010",
      bookTitle: "Deep Learning",
      memberId: "MEM-205",
      memberName: "Prof. Elena Rostova",
      issueDate: "2026-08-12",
      dueDate: "2026-09-11",
      returnDate: null,
      status: "Active",
      fineAmount: 0,
      fineStatus: "None"
    }
  ],

  fines: [
    {
      id: "FIN-3001",
      issueId: "ISU-9001",
      memberId: "MEM-201",
      memberName: "Sophia Chen",
      amount: 3.00,
      reason: "3 Days Overdue for Clean Code",
      status: "Unpaid",
      createdAt: "2026-08-16"
    },
    {
      id: "FIN-3002",
      issueId: "ISU-9003",
      memberId: "MEM-203",
      memberName: "Alex Rivera",
      amount: 15.00,
      reason: "15 Days Overdue for Design Patterns",
      status: "Unpaid",
      createdAt: "2026-08-04"
    },
    {
      id: "FIN-3003",
      issueId: "ISU-9005",
      memberId: "MEM-201",
      memberName: "Sophia Chen",
      amount: 5.00,
      reason: "5 Days Overdue for Introduction to Algorithms",
      status: "Paid",
      createdAt: "2026-07-16",
      paidAt: "2026-07-20"
    }
  ],

  logs: [
    { id: "LOG-1", timestamp: "2026-08-18 10:30:00", text: "Issued 'Deep Learning' to Prof. Elena Rostova", type: "issue" },
    { id: "LOG-2", timestamp: "2026-08-16 09:00:00", text: "System marked 'Clean Code' as Overdue for Sophia Chen", type: "warning" },
    { id: "LOG-3", timestamp: "2026-08-10 14:15:00", text: "Issued '1984' to Emma Watson", type: "issue" },
    { id: "LOG-4", timestamp: "2026-07-20 16:45:00", text: "Received return of 'Introduction to Algorithms' from Sophia Chen. Fine of $5.00 paid.", type: "return" }
  ]
};
