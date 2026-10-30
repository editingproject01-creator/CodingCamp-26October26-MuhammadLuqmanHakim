(function () {
  "use strict";

  // --- Constants & storage keys ---
  const STORAGE_KEYS = {
    TRANSACTIONS: "ebv:transactions",
    CATEGORIES: "ebv:categories",
    THEME: "ebv:theme",
  };
  const DEFAULT_CATEGORIES = ["Food", "Transport", "Fun"];
  const MAX_CUSTOM_CATEGORIES = 20;

  // --- Utility Formatting ---
  function formatRupiah(amount) {
    // Menggunakan toLocaleString untuk memisahkan setiap 3 digit dengan titik
    return "Rp" + Math.round(amount).toLocaleString("id-ID");
  }

  // --- Pure logic layer (no DOM, no storage) ---
  function computeBalance(transactions) {
    return transactions.reduce((sum, txn) => sum + txn.amount, 0);
  }

  function aggregateByCategory(transactions) {
    const totals = {};
    for (const txn of transactions) {
      totals[txn.category] = (totals[txn.category] || 0) + txn.amount;
    }
    return totals;
  }

  function groupByMonth(transactions) {
    const groups = {};
    for (const txn of transactions) {
      const date = new Date(txn.date);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const key = `${year}-${month}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(txn);
    }
    return groups;
  }

  function summarizeMonth(transactionsInMonth) {
    return {
      total: computeBalance(transactionsInMonth),
      breakdown: aggregateByCategory(transactionsInMonth),
    };
  }

  function isNonEmpty(str) {
    return typeof str === "string" && str.trim().length > 0;
  }

  function validateTransaction(formValues) {
    const errors = [];
    const { itemName, amount, category } = formValues;

    if (!isNonEmpty(itemName)) errors.push("Item name is required.");
    if (!isNonEmpty(category)) errors.push("Category is required.");

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push("Amount must be a positive number.");
    }

    return {
      valid: errors.length === 0,
      errors,
      data:
        errors.length === 0
          ? {
              itemName: itemName.trim(),
              amount: numAmount,
              category: category.trim(),
            }
          : null,
    };
  }

  function validateCategoryName(name, existingCategories, customCount) {
    if (!isNonEmpty(name))
      return { valid: false, reason: "Category name cannot be empty." };
    const trimmed = name.trim();
    if (trimmed.length > 50)
      return {
        valid: false,
        reason: "Category name cannot exceed 50 characters.",
      };
    if (
      existingCategories
        .map((c) => c.toLowerCase())
        .includes(trimmed.toLowerCase())
    ) {
      return { valid: false, reason: "Category already exists." };
    }
    if (customCount >= MAX_CUSTOM_CATEGORIES) {
      return {
        valid: false,
        reason: "Maximum custom category limit (20) reached.",
      };
    }
    return { valid: true, reason: null, sanitized: trimmed };
  }

  function isStoredTransaction(x) {
    return (
      x &&
      typeof x === "object" &&
      typeof x.id === "string" &&
      isNonEmpty(x.itemName) &&
      typeof x.amount === "number" &&
      x.amount > 0 &&
      isNonEmpty(x.category) &&
      !isNaN(Date.parse(x.date))
    );
  }

  function deserializeTransactions(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      if (!parsed.every(isStoredTransaction))
        throw new Error("Schema validation failed");
      return { ok: true, data: parsed };
    } catch (e) {
      return { ok: false, error: "Stored data could not be loaded." };
    }
  }

  function serializeState(data) {
    return JSON.stringify(data);
  }

  // --- Storage_Manager ---
  const Storage_Manager = {
    isAvailable() {
      try {
        const test = "__test__";
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    },
    loadTransactions() {
      const stored = window.localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!stored) return { ok: true, data: [] };
      return deserializeTransactions(stored);
    },
    saveTransactions(transactions) {
      try {
        window.localStorage.setItem(
          STORAGE_KEYS.TRANSACTIONS,
          serializeState(transactions),
        );
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: "Data could not be saved (Storage full or unavailable).",
        };
      }
    },
    loadCategories() {
      const stored = window.localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!stored) return { ok: true, data: [] };
      try {
        const parsed = JSON.parse(stored);
        return { ok: true, data: Array.isArray(parsed) ? parsed : [] };
      } catch (e) {
        return { ok: false, error: "Custom categories could not be loaded." };
      }
    },
    saveCategories(categories) {
      try {
        window.localStorage.setItem(
          STORAGE_KEYS.CATEGORIES,
          serializeState(categories),
        );
        return { ok: true };
      } catch (e) {
        return { ok: false, error: "Categories could not be saved." };
      }
    },
    loadTheme() {
      return window.localStorage.getItem(STORAGE_KEYS.THEME) || "light";
    },
    saveTheme(theme) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
      } catch (e) {}
    },
  };

  // --- Theme_Manager ---
  const Theme_Manager = {
    toggle(current) {
      return current === "light" ? "dark" : "light";
    },
    applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
    },
  };

  // --- View Renderers ---
  function renderMessages(messagesContainer, messages) {
    messagesContainer.innerHTML = "";
    messages.forEach((msg) => {
      const div = document.createElement("div");
      div.className = "message-banner";
      div.textContent = msg;
      messagesContainer.appendChild(div);
    });
  }

  function renderBalance(displayEl, balance) {
    displayEl.textContent = formatRupiah(balance);
  }

  function renderTransactionList(containerEl, listEl, emptyEl, transactions) {
    if (transactions.length === 0) {
      listEl.style.display = "none";
      emptyEl.style.display = "block";
      return;
    }
    listEl.style.display = "block";
    emptyEl.style.display = "none";

    const frag = document.createDocumentFragment();
    transactions.forEach((txn) => {
      const li = document.createElement("li");

      const infoSpan = document.createElement("span");
      infoSpan.textContent = `${txn.itemName} - ${formatRupiah(txn.amount)} (${txn.category})`;

      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "Delete";
      delBtn.setAttribute("data-id", txn.id);
      delBtn.setAttribute("aria-label", `Delete ${txn.itemName}`);

      li.appendChild(infoSpan);
      li.appendChild(delBtn);
      frag.appendChild(li);
    });

    listEl.innerHTML = "";
    listEl.appendChild(frag);
  }

  function renderChart(canvasEl, legendEl, emptyEl, transactions) {
    if (transactions.length === 0) {
      canvasEl.style.display = "none";
      legendEl.style.display = "none";
      emptyEl.style.display = "block";
      return;
    }

    canvasEl.style.display = "block";
    legendEl.style.display = "flex";
    emptyEl.style.display = "none";

    const ctx = canvasEl.getContext("2d");
    const width = canvasEl.width;
    const height = canvasEl.height;
    const radius = Math.min(width, height) / 2;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const totals = aggregateByCategory(transactions);
    const totalAmount = computeBalance(transactions);

    const palette = [
      "#0056b3",
      "#dc3545",
      "#28a745",
      "#ffc107",
      "#17a2b8",
      "#6610f2",
      "#fd7e14",
      "#20c997",
    ];
    let startAngle = 0;

    legendEl.innerHTML = "";
    let colorIdx = 0;

    for (const [category, amount] of Object.entries(totals)) {
      const sliceAngle = (amount / totalAmount) * 2 * Math.PI;
      const color = palette[colorIdx % palette.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      startAngle += sliceAngle;

      const legItem = document.createElement("div");
      legItem.className = "legend-item";
      const colorBox = document.createElement("div");
      colorBox.className = "legend-color";
      colorBox.style.backgroundColor = color;
      const legLabel = document.createElement("span");
      legLabel.textContent = `${category} (${formatRupiah(amount)})`;

      legItem.appendChild(colorBox);
      legItem.appendChild(legLabel);
      legendEl.appendChild(legItem);

      colorIdx++;
    }
  }

  function renderSummary(summaryContainer, emptyEl, transactions) {
    if (transactions.length === 0) {
      summaryContainer.innerHTML = "";
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";

    const groups = groupByMonth(transactions);
    const frag = document.createDocumentFragment();

    Object.keys(groups)
      .sort()
      .reverse()
      .forEach((monthKey) => {
        const summary = summarizeMonth(groups[monthKey]);

        const groupDiv = document.createElement("div");
        groupDiv.className = "month-group";

        const headerDiv = document.createElement("div");
        headerDiv.className = "month-header";
        headerDiv.innerHTML = `<span>${monthKey}</span><span>${formatRupiah(summary.total)}</span>`;

        const detailDiv = document.createElement("div");
        detailDiv.className = "month-detail";

        for (const [cat, amt] of Object.entries(summary.breakdown)) {
          const row = document.createElement("div");
          row.className = "month-detail-row";
          row.innerHTML = `<span>${cat}</span><span>${formatRupiah(amt)}</span>`;
          detailDiv.appendChild(row);
        }

        groupDiv.appendChild(headerDiv);
        groupDiv.appendChild(detailDiv);
        frag.appendChild(groupDiv);
      });

    summaryContainer.innerHTML = "";
    summaryContainer.appendChild(frag);
  }

  function renderCategorySelector(selectEl, allCategories) {
    selectEl.innerHTML = "";
    allCategories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      selectEl.appendChild(opt);
    });
  }

  // --- AppController ---
  const AppController = {
    state: {
      transactions: [],
      customCategories: [],
      theme: "light",
      globalMessages: [],
    },

    init() {
      this.els = {
        messages: document.getElementById("messages-container"),
        themeToggle: document.getElementById("theme-toggle"),
        balance: document.getElementById("balance-display"),
        txnForm: document.getElementById("transaction-form"),
        formErrors: document.getElementById("form-errors"),
        catSelect: document.getElementById("category-select"),
        catForm: document.getElementById("category-form"),
        catErrors: document.getElementById("category-errors"),
        txnList: document.getElementById("transaction-list"),
        txnEmpty: document.getElementById("transaction-empty"),
        chartCanvas: document.getElementById("spending-chart"),
        chartLegend: document.getElementById("chart-legend"),
        chartEmpty: document.getElementById("chart-empty"),
        summaryList: document.getElementById("summary-list"),
        summaryEmpty: document.getElementById("summary-empty"),
      };

      const hasStorage = Storage_Manager.isAvailable();
      if (!hasStorage) {
        this.state.globalMessages.push(
          "Data persistence is unavailable. Changes will not be saved.",
        );
      }

      this.state.theme = hasStorage
        ? Storage_Manager.loadTheme()
        : Theme_Manager.defaultTheme
          ? Theme_Manager.defaultTheme()
          : "light";
      Theme_Manager.applyTheme(this.state.theme);

      if (hasStorage) {
        const catRes = Storage_Manager.loadCategories();
        if (catRes.ok) {
          this.state.customCategories = catRes.data;
        } else {
          this.state.globalMessages.push(catRes.error);
        }
      }

      if (hasStorage) {
        const txnRes = Storage_Manager.loadTransactions();
        if (txnRes.ok) {
          this.state.transactions = txnRes.data;
        } else {
          this.state.transactions = [];
          this.state.globalMessages.push(txnRes.error);
        }
      }

      this.bindEvents();
      this.renderAll();
    },

    getAllCategories() {
      return [...DEFAULT_CATEGORIES, ...this.state.customCategories];
    },

    bindEvents() {
      this.els.themeToggle.addEventListener("click", () =>
        this.handleToggleTheme(),
      );

      this.els.txnForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddTransaction({
          itemName: document.getElementById("item-name").value,
          amount: document.getElementById("amount").value,
          category: this.els.catSelect.value,
        });
      });

      this.els.catForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddCategory(document.getElementById("new-category").value);
      });

      this.els.txnList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
          this.handleDeleteTransaction(e.target.getAttribute("data-id"));
        }
      });
    },

    handleToggleTheme() {
      this.state.theme = Theme_Manager.toggle(this.state.theme);
      Theme_Manager.applyTheme(this.state.theme);
      if (Storage_Manager.isAvailable())
        Storage_Manager.saveTheme(this.state.theme);
    },

    handleAddTransaction(formValues) {
      this.els.formErrors.textContent = "";
      const validation = validateTransaction(formValues);

      if (!validation.valid) {
        this.els.formErrors.textContent = validation.errors.join(" ");
        return;
      }

      const newTxn = {
        ...validation.data,
        id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        date: new Date().toISOString(),
      };

      this.state.transactions.push(newTxn);
      this.persistAndRender();
      this.els.txnForm.reset();
    },

    handleDeleteTransaction(id) {
      this.state.transactions = this.state.transactions.filter(
        (t) => t.id !== id,
      );
      this.persistAndRender();
    },

    handleAddCategory(name) {
      this.els.catErrors.textContent = "";
      const validation = validateCategoryName(
        name,
        this.getAllCategories(),
        this.state.customCategories.length,
      );

      if (!validation.valid) {
        this.els.catErrors.textContent = validation.reason;
        return;
      }

      this.state.customCategories.push(validation.sanitized);

      if (Storage_Manager.isAvailable()) {
        const res = Storage_Manager.saveCategories(this.state.customCategories);
        if (!res.ok) this.state.globalMessages.push(res.error);
      }

      this.els.catForm.reset();
      this.renderCategorySelector();
    },

    persistAndRender() {
      if (Storage_Manager.isAvailable()) {
        const res = Storage_Manager.saveTransactions(this.state.transactions);
        if (!res.ok && !this.state.globalMessages.includes(res.error)) {
          this.state.globalMessages.push(res.error);
          this.renderMessages();
        }
      }
      this.renderDynamicViews();
    },

    renderAll() {
      this.renderMessages();
      this.renderCategorySelector();
      this.renderDynamicViews();
    },

    renderDynamicViews() {
      renderBalance(this.els.balance, computeBalance(this.state.transactions));
      renderTransactionList(
        document.getElementById("transaction-list-container"),
        this.els.txnList,
        this.els.txnEmpty,
        this.state.transactions,
      );
      renderChart(
        this.els.chartCanvas,
        this.els.chartLegend,
        this.els.chartEmpty,
        this.state.transactions,
      );
      renderSummary(
        this.els.summaryList,
        this.els.summaryEmpty,
        this.state.transactions,
      );
    },

    renderMessages() {
      renderMessages(this.els.messages, this.state.globalMessages);
    },

    renderCategorySelector() {
      renderCategorySelector(this.els.catSelect, this.getAllCategories());
    },
  };

  document.addEventListener("DOMContentLoaded", () => AppController.init());
})();
