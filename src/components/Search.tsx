import { useState, useEffect } from 'react';
import styles from '@/styles/Search.module.css';
import { Product } from '@/types/product';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchProps {
  onSearch: (query: string) => void;
  products: Product[];
}

export default function Search({ onSearch, products }: SearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [debouncedQuery, products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = (product: Product) => {
    setQuery(product.name);
    setIsOpen(false);
    onSearch(product.name);
    router.push(`/search?q=${encodeURIComponent(product.name)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit} className={styles.searchWrapper}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Поиск товаров..."
          className={styles.searchInput}
          onFocus={() => setIsOpen(true)}
        />
        {isOpen && suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((product) => (
              <div
                key={product.id}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(product)}
              >
                <span className={styles.suggestionName}>{product.name}</span>
                <span className={styles.suggestionPrice}>{product.price} Br</span>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
} 