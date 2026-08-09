export default function AdminLoading() {
  return (
    <div className="animate-pulse" aria-label="Загрузка раздела">
      <div className="h-9 w-48 rounded bg-[#020D13]/10" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-[#020D13]/7" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 rounded-md border border-[#020D13]/8 bg-white"
          />
        ))}
      </div>
      <div className="mt-6 h-72 rounded-md border border-[#020D13]/8 bg-white" />
    </div>
  );
}
