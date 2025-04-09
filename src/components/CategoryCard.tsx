import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  id: string;
  name: string;
  image: string | null;
}

export const CategoryCard = ({ id, name, image }: CategoryCardProps) => {
  return (
    <Link
      href={`/category/${id}`}
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
    >
      <div className="relative h-full w-full">
        <Image
          src={image || '/placeholder.png'}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 480px) 50vw, 33vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.png';
          }}
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <span className="text-white text-lg font-semibold text-center px-4">
          {name}
        </span>
      </div>
    </Link>
  );
}; 