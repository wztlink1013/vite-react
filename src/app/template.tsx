export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-pink-600">
      <div className="text-pink-600">root template page</div>
      {children}
    </div>
  );
}
