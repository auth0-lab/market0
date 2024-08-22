export default function Loader() {
  return (
    <div className="flex gap-2 items-center w-full ml-4">
      <div
        className="animate-dots-loader w-[10px]"
        style={{ borderRadius: "50%", aspectRatio: 1 }}
      />
    </div>
  );
}
