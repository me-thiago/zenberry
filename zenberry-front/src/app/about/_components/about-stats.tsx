export function AboutStats() {
  return (
    <div
      className="grid grid-cols-3 gap-6 mb-8"
      aria-label="Estatísticas Zenberry"
    >
      <div>
        <div className="text-4xl font-bold text-secondary mb-1">80%</div>
        <div className="text-sm text-gray-600">clients satisfied</div>
      </div>
      <div>
        <div className="text-4xl font-bold text-secondary mb-1">10K</div>
        <div className="text-sm text-gray-600">varieties</div>
      </div>
      <div>
        <div className="text-4xl font-bold text-secondary mb-1">7</div>
        <div className="text-sm text-gray-600">cito para entrega</div>
      </div>
    </div>
  );
}
