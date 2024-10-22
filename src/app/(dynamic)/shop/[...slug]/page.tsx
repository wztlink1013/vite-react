export default function Page({ params }: { params: { slug: string } }) {
  console.info('>>> shop params >>>', params);
  return (
    <div className="border border-indigo-700">
      <div className="text-indigo-700">shop assign slug</div>
      Shop: {params.slug}
    </div>
  );
}
