"use client";

import { useState } from "react";
import Image from "next/image";
import { CandleLight } from "./CandleLight";

export function Gallery({ images, name }: { images: { url: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="candle-scene relative aspect-[4/5] overflow-hidden rounded-3xl bg-wax-deep">
        {current && (
          <>
            <Image
              src={current.url}
              alt={`Bouquet ${name}, photo ${active + 1}`}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <CandleLight key={current.url} src={current.url} />
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Afficher la photo ${index + 1}`}
              aria-current={index === active}
              className={`relative aspect-[4/5] w-20 cursor-pointer overflow-hidden rounded-xl border-2 ${
                index === active ? "border-plum" : "border-transparent"
              }`}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
