import Link from "next/link";
import { ArrowUpRight, CirclePlay, MapPin } from "lucide-react";
import { formatCurrency, formatDateRange, type Training } from "@/lib/domain";

interface TrainingCardProps { training: Training; index: number }

export function TrainingCard({ training, index }: TrainingCardProps) {
  const jp = training.totalJp;
  return (
    <Link href={`/diklat/${training.slug}`} className="training-card">
      <div className="training-card-image" style={{ background: index % 3 === 1 ? "#e2f1ed" : index % 3 === 2 ? "#fff0d9" : "var(--blue-soft)" }}>
        <span className="card-image-label">{training.category}</span>
        <span className="card-image-number">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="training-card-body">
        <div className="eyebrow">{formatDateRange(training.startsAt, training.endsAt)}</div>
        <h3>{training.title}</h3>
        <p>{training.subtitle}</p>
        <div className="card-meta"><span className="meta-pill lime">{jp} JP</span><span className="meta-pill">{training.price === 0 ? "Gratis" : formatCurrency(training.price)}</span><span className="meta-pill blue">{training.method === "ONLINE" ? <><CirclePlay size={11} /> Online</> : training.method === "HYBRID" ? "Hybrid" : <><MapPin size={11} /> Offline</>}</span></div>
        <div className="card-footer"><span>{training.quota} kuota</span><span>Detail <ArrowUpRight size={13} /></span></div>
      </div>
    </Link>
  );
}
