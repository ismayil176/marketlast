import React from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Skeleton';
import { ProductWithOffers } from '../types';
import { SlidersHorizontal, PackageSearch } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';

export default function HomePage() {
  const [products, setProducts] = React.useState<ProductWithOffers[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState('price_asc');
  const [query, setQuery] = React.useState('');
  const { latitude, longitude, loading: geoLoading } = useGeolocation();

  const fetchProducts = async (q: string = '', s: string = 'price_asc') => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/products/search?q=${encodeURIComponent(q)}&sort=${s}`;
      if (latitude && longitude) {
        url += `&lat=${latitude}&lng=${longitude}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Məlumat yüklənərkən xəta baş verdi');
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Fetch products once geolocation is ready or if it fails/is denied
    if (!geoLoading) {
      fetchProducts(query, sort);
    }
  }, [geoLoading, latitude, longitude]);

  const handleSearch = (q: string) => {
    setQuery(q);
    fetchProducts(q, sort);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    fetchProducts(query, newSort);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
          Market qiymətlərini <span className="text-blue-600">müqayisə et</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Azərbaycanın ən böyük supermarketlərindəki minlərlə məhsulun qiymətini bir yerdə tapın və ən ucuzunu seçin.
        </p>
        <div className="pt-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Results Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              {query ? `"${query}" üçün nəticələr` : 'Populyar məhsullar'}
            </h2>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">
              {products.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal size={18} className="text-slate-400" />
            <select 
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            >
              <option value="price_asc">Ən ucuz</option>
              <option value="alpha_asc">Əlifba sırası</option>
              <option value="newest">Ən yeni</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-12 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => fetchProducts(query, sort)}
              className="mt-4 text-sm font-bold text-red-700 underline"
            >
              Yenidən cəhd et
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
            <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <PackageSearch size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Məhsul tapılmadı</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Axtarışınıza uyğun məhsul tapılmadı. Zəhmət olmasa başqa sözlərlə yoxlayın.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
