import Image from "next/image";

const petalPositions: Record<
  number,
  { top?: string; left?: string; right?: string; bottom?: string }
> = {
  1: { top: "57%", right: "80%" }, // Pétala superior esquerda
  2: { top: "0%", right: "70%" }, // Pétala superior direita
  3: { bottom: "11%", right: "40%" }, // Pétala inferior direita
  4: { top: "0%", left: "23%" }, // Pétala inferior esquerda
  5: { top: "57%", left: "33%" }, // Pétala lateral esquerda
};

export function ZenberryLoader() {
  return (
    <div className="fixed inset-0 bg-white z-100 flex items-center justify-center">
      <div className="relative flex items-center gap-6">
        {/* Lotus Petals */}
        <div className="relative w-[120px] h-[120px]">
          {[1, 2, 3, 4, 5].map((num) => (
            <Image
              key={num}
              src={`/loader/petal-${num}.svg`}
              alt=""
              width={80}
              height={80}
              className="absolute animate-petal-appear"
              style={{
                ...petalPositions[num],
                animationDelay: `${(num - 1) * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
