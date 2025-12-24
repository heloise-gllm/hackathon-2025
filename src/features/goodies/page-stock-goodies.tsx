import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { useCursors } from 'kikoojs';
import { BoxIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import CardGoodieDisplay from '@/features/goodies/components/card-goodie-display';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

import { GOODIE_CATEGORY_OPTIONS } from './schema';

const GOODIE_CATEGORY_LABELS: Record<
  (typeof GOODIE_CATEGORY_OPTIONS)[number],
  string
> = {
  TSHIRT: 'T-shirt',
  HOODIE: 'Hoodie',
  STICKER: 'Stickers',
  MUG: 'Mug',
  TOTE_BAG: 'Tote bag',
  NOTEBOOK: 'Carnet',
  OTHER: 'Autre',
};

export const PageGoodiesStock = () => {
  const matchRoute = useMatchRoute();

  const isStock = matchRoute({ to: '/manager/goodies/stock' });
  const isSuppliers = matchRoute({ to: '/manager/goodies/suppliers' });

  const [categoryFilter, setCategoryFilter] = useState<
    'ALL' | (typeof GOODIE_CATEGORY_OPTIONS)[number]
  >('ALL');

  const goodiesQuery = useInfiniteQuery(
    orpc.goodie.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({ cursor }),
      initialPageParam: undefined,
      maxPages: 10,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const goodies = goodiesQuery.data?.pages.flatMap((p) => p.items) ?? [];

  const filteredGoodies =
    categoryFilter === 'ALL'
      ? goodies
      : goodies.filter((g) => g.category === categoryFilter);

  // Retourne le stock total d'un goodie
  const getTotalStock = (variants: { stockQty?: number }[]) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((total, v) => total + (v.stockQty ?? 0), 0);
  };
  useCursors({
    enabledCursors: 'rainbowCursor',
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        actions={
          <div className="flex items-center gap-2">
            {/* Select de filtre */}
            <select
              className="rounded-md border px-2 py-1"
              value={categoryFilter}
              onChange={(e) => {
                const value = e.target.value as
                  | 'ALL'
                  | (typeof GOODIE_CATEGORY_OPTIONS)[number];
                setCategoryFilter(value);
              }}
            >
              <option value="ALL">Toutes les catégories</option>
              {GOODIE_CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {GOODIE_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>

            {/* Bouton "Nouveau Goodie" */}
            <ResponsiveIconButton
              asChild
              label="Nouveau goodie"
              variant="secondary"
              size="sm"
            >
              <Link to="/manager/goodies/new">
                <div className="flex gap-2">
                  <PlusIcon />
                </div>
              </Link>
            </ResponsiveIconButton>
          </div>
        }
      >
        <PageLayoutTopBarTitle>
          <div className="flex flex-row items-center gap-4">
            <BoxIcon />

            <div className="flex flex-row gap-2 rounded-xl bg-primary-foreground p-1">
              <Link to="/manager/goodies/stock">
                <Button variant={isStock ? 'default' : 'secondary'}>
                  Gestion du Stock
                </Button>
              </Link>

              <Link to="/manager/goodies/suppliers">
                <Button variant={isSuppliers ? 'default' : 'secondary'}>
                  Gestion des Fournisseurs
                </Button>
              </Link>
            </div>
          </div>
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent className="pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredGoodies.length === 0 ? (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              Aucun goodie pour le moment...
            </div>
          ) : (
            filteredGoodies.map((goodie) => (
              <CardGoodieDisplay
                key={goodie.id}
                id={goodie.id}
                title={goodie.name}
                year={goodie.edition ?? ''}
                category={goodie.category}
                description={goodie.description ?? ''}
                stock={goodie.total ?? getTotalStock(goodie.variants)}
                variants={goodie.variants}
                imageUrl={goodie.assets[0]?.url}
              />
            ))
          )}
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
