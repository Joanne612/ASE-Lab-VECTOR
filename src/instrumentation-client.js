/*
 * Berjalan sekali per pemuatan halaman, sebelum halaman interaktif. BE tidur
 * saat idle (scale-to-zero), jadi dibangunkan sedini mungkin: selagi user
 * mengisi form login, container BE sudah start. Hasilnya sengaja diabaikan.
 */
fetch("/api/health", { cache: "no-store" }).catch(() => {});
