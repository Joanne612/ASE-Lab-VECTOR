/** Pesan validasi per field dari BE ({ field: ["pesan", ...] }). Hanya pesan pertama yang ditampilkan. */
export default function FieldError({ id, messages }) {
  if (!messages?.length) return null;

  return (
    <p id={id} className="mt-1 px-1 text-[13px] text-red-600">
      {messages[0]}
    </p>
  );
}
