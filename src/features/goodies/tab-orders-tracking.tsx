import { useQuery, useQueryClient } from '@tanstack/react-query';
import JSConfetti from 'js-confetti';
import { Package } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DataList,
  DataListCell,
  DataListRow,
  DataListText,
} from '@/components/ui/datalist';

import { FormGoodieOrder } from './form-order';
import { FormFieldsGoodieOrder } from './schema';

const statusVariantMap: Record<
  string,
  'outline' | 'secondary' | 'negative' | 'warning' | 'positive'
> = {
  IDEA: 'outline',
  REQUESTED: 'secondary',
  QUOTED: 'secondary',
  ORDERED: 'warning',
  RECEIVED: 'positive',
  CANCELLED: 'negative',
};

const formatDate = (date?: Date | null) =>
  date ? new Intl.DateTimeFormat('fr-FR').format(new Date(date)) : '—';

export default function GoodieOrdersTab() {
  const queryClient = useQueryClient();

  const form = useForm<FormFieldsGoodieOrder>({
    defaultValues: {
      name: '',
      supplierId: '',
      comment: null,
      status: 'IDEA',
      madeById: '',
    },
  });

  // Fetch de tous les fournisseurs
  const { data: orders = [], isLoading } = useQuery({
    queryKey: orpc.order.getAllGoodieOrders.key(),
    queryFn: () => orpc.order.getAllGoodieOrders.call(),
  });

  if (isLoading) {
    return <div>Chargement des commandes...</div>;
  }

  // Création d'un fournisseur
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await orpc.order.createGoodieOrder.call(values);

      await queryClient.invalidateQueries({
        queryKey: orpc.order.getAllGoodieOrders.key(),
      });

      form.reset({
        ...form.getValues(),
      });

      toast.success('Commande ajoutée');
    } catch {
      toast.error('Erreur lors de la création');
    }
  });
  const jsConfetti = new JSConfetti();
  const handleClick = () => {
    jsConfetti.addConfetti({
      emojis: ['🎅🏻', '🎄', '❄'],
      confettiNumber: 100,
    });
  };
  return (
    <div className="space-y-6">
      <FormProvider {...form}>
        {/*ADD SUPPLIER*/}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Package />
              Nouvelle commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <FormGoodieOrder />
            <Button
              onClick={() => {
                handleClick();
                onSubmit();
              }}
            >
              Ajouter
            </Button>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <DataList>
            {orders.map((order) => (
              <DataListRow key={order.id} withHover>
                {/* Status */}
                <DataListCell className="flex-none">
                  <Badge
                    variant={statusVariantMap[order.status] ?? 'secondary'}
                  >
                    {order.status}
                  </Badge>
                </DataListCell>

                {/* Main info */}
                <DataListCell>
                  <DataListText className="font-medium"></DataListText>

                  <DataListText className="text-xs text-muted-foreground">
                    Quantité : {order.quantity ?? '—'}
                  </DataListText>
                </DataListCell>

                {/* User */}
                <DataListCell>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      {order.madeBy?.image ? (
                        <AvatarImage
                          src={order.madeBy.image}
                          alt="@cosmobear"
                        />
                      ) : null}
                    </Avatar>
                    <DataListText className="text-xs text-muted-foreground">
                      {order.madeBy?.name ?? '_'}
                    </DataListText>
                  </div>
                </DataListCell>

                {/* Goodie / Supplier */}
                <DataListCell>
                  <DataListText className="text-xs text-muted-foreground">
                    Goodie : {order.goodieId ?? '—'}
                  </DataListText>
                  <DataListText className="text-xs text-muted-foreground">
                    Fournisseur : {order.supplierId ?? '—'}
                  </DataListText>
                </DataListCell>

                {/* Dates */}
                <DataListCell>
                  <DataListText className="text-xs text-muted-foreground">
                    Commandé : {formatDate(order.requestedAt)}
                  </DataListText>
                  <DataListText className="text-xs text-muted-foreground">
                    Reçu : {formatDate(order.receivedAt)}
                  </DataListText>
                </DataListCell>
              </DataListRow>
            ))}
          </DataList>
        </div>
      </FormProvider>
    </div>
  );
}
