export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div className="border border-indigo-500">
      <div className="text-indigo-500">blog assign post</div>
      My Post: {params.slug}
    </div>
  );
}
