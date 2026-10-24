import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatDigitsInput,
  parseLocalDate,
  parseRupiahInput,
  selectionFromDate,
  toOccurredAt,
} from "@/lib/format";
import { createTransaction, createTransfer, useAccounts, useInvalidate } from "@/lib/queries";
import { useHydrated } from "@/lib/use-hydrated";
import { useToday } from "@/lib/use-today";

export const TABS = ["Pengeluaran", "Pemasukan", "Transfer"];
export const TAB_TYPE = { Pengeluaran: "EXPENSE", Pemasukan: "INCOME" };

// Tombol akun di form. Labelnya sama dengan nama akun bawaan BE, jadi id-nya
// dicari dari GET /accounts berdasarkan nama.
export const ACCOUNTS = [
  { label: "Tunai", icon: "wallet" },
  { label: "Kartu Bank", icon: "card" },
  { label: "Tabungan", icon: "piggy" },
];

/** Gabungkan pesan validasi per field dari BE; kalau tidak ada, pakai pesan umum. */
export function errorText(error) {
  const messages = Object.values(error.fieldErrors ?? {}).flat();
  return messages.length > 0 ? messages.join(" ") : error.message;
}

const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** State dan aksi form pencatatan, dipakai bersama tampilan mobile dan desktop. */
export function useTransactionForm() {
  const router = useRouter();
  const invalidate = useInvalidate();
  const today = useToday();
  const hydrated = useHydrated();
  const { data: accounts } = useAccounts();

  const [tab, setTab] = useState("Pengeluaran");
  const [categoryId, setCategoryId] = useState(null);
  const [account, setAccount] = useState("Tunai");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [chosenDate, setChosenDate] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fee, setFee] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const accountList = accounts?.data ?? [];
  const accountNames = accountList.length > 0 ? accountList.map((a) => a.name) : ACCOUNTS.map((a) => a.label);

  const isTransfer = tab === "Transfer";
  // Default tanggal transaksi = hari ini (null sampai hydrate, lihat useToday).
  const date = chosenDate ?? (today ? selectionFromDate(parseLocalDate(today), "harian") : null);

  const handleAmount = (e) => setAmount(formatDigitsInput(e.target.value));
  const handleFee = (e) => setFee(formatDigitsInput(e.target.value));

  const changeTab = (t) => {
    setTab(t);
    setCategoryId(null);
    setFrom("");
    setTo("");
    setFee("");
    setError(null);
  };

  const swapAssets = () => {
    setFrom(to);
    setTo(from);
  };

  const hasAmount = parseRupiahInput(amount) > 0 && Boolean(date);
  const canSubmit = isTransfer
    ? Boolean(from.trim() && to.trim()) && hasAmount
    : Boolean(categoryId) && hasAmount;

  const submitTransfer = async () => {
    const fromAccount = accountList.find((a) => sameName(a.name, from));
    const toAccount = accountList.find((a) => sameName(a.name, to));
    if (!fromAccount || !toAccount) {
      throw new Error(`Akun "${(fromAccount ? to : from).trim()}" tidak ditemukan.`);
    }
    if (fromAccount.id === toAccount.id) throw new Error("Akun asal dan tujuan harus berbeda.");

    await createTransfer({
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      amount: parseRupiahInput(amount),
      fee: parseRupiahInput(fee) || undefined,
      note: note.trim() || undefined,
      occurredAt: toOccurredAt(date),
    });
  };

  const submitTransaction = () =>
    createTransaction({
      type: TAB_TYPE[tab],
      amount: parseRupiahInput(amount),
      // Kalau daftar akun gagal dimuat, BE memakai akun default user.
      accountId: accountList.find((a) => a.name === account)?.id,
      categoryId,
      note: note.trim() || undefined,
      occurredAt: toOccurredAt(date),
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await (isTransfer ? submitTransfer() : submitTransaction());
      // Header, riwayat, statistik, dan saldo akun ikut diperbarui.
      await invalidate("/transactions");
      if (isTransfer) await invalidate("/accounts");
      router.push("/homepage");
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return {
    tab,
    changeTab,
    isTransfer,
    categoryId,
    setCategoryId,
    account,
    setAccount,
    accountNames,
    amount,
    handleAmount,
    note,
    setNote,
    date,
    setChosenDate,
    today,
    hydrated,
    from,
    setFrom,
    to,
    setTo,
    swapAssets,
    fee,
    handleFee,
    canSubmit,
    submitting,
    error,
    handleSubmit,
  };
}
