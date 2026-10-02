import type { WebProject } from "../../data/webProjectsData";

interface ProjectModalProps {
  project: WebProject | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 bg-black/80 backdrop-blur-xl">
      <div className="max-w-[50rem] w-full max-h-[90vh] overflow-y-auto space-y-8 p-6 md:p-10 border border-white/10 rounded-2xl bg-neutral-950/90 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">{project.title}</h2>
            <p className="label opacity-50 mt-1 font-mono text-xs">{project.year} — {project.role}</p>
          </div>
          <button
            onClick={onClose}
            className="label text-xs font-mono uppercase px-4 py-2 rounded-full border border-white/20 hover:border-white transition-colors"
          >
            Close
          </button>
        </div>

        {/* Media Preview */}
        <div className="relative w-full rounded-xl overflow-hidden bg-neutral-900" style={{ aspectRatio: project.aspectRatio }}>
          {project.video ? (
            <video
              src={project.video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Description & Details */}
        <div className="space-y-4">
          <p className="text-base md:text-lg leading-relaxed text-neutral-300 font-light">
            {project.description}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
            <div>
              <span className="label opacity-40 block mb-1">Client</span>
              <span className="text-neutral-200">{project.client}</span>
            </div>
            <div>
              <span className="label opacity-40 block mb-1">Focus</span>
              <span className="text-neutral-200">{project.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
