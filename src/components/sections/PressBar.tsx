const publications = [
  "TechCrunch", "Product Hunt", "The Verge", "Wired", "Forbes", "Fast Company",
];

const PressBar = () => {
  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto px-4">
        <p className="section-label text-center mb-6">AS SEEN IN</p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {publications.map((pub) => (
            <span
              key={pub}
              className="text-sm font-heading font-bold text-muted-foreground/40 tracking-widest uppercase"
            >
              {pub}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PressBar;
