import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

import { zFormFieldsIdea, zGoodieCategory } from '../schema';
import { onError, onSuccess, ORPCError } from '@orpc/client';
import { C } from 'vitest/dist/chunks/reporters.d.BFLkQcL6.js';
import { orpc } from '@/lib/orpc/client';
import { PreventNavigation } from '@/components/prevent-navigation';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';
import { B } from 'node_modules/better-auth/dist/index-COnelCGa.mjs';
import { BackButton } from '@/components/back-button';
import { Button } from '@react-email/components';
import { Form } from '@/components/form';
import { Card, CardContent } from '@/components/ui/card';

export const FormIdeaNew = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(zFormFieldsIdea()),
    values: {
      name: '',
      category: 'TSHIRT' as const,
      description: '',
    },
  });

  const goodieCreate = useMutation(
    orpc.goodie.create.mutationOptions({
      //fix with real router name
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.goodie.getAll.key(), //fix with real router name
          type: 'all',
        });

        if (canGoBack) router.history.back({ ignoreBlocker: true });
        else router.navigate({ to: '..', replace: true, ignoreBlocker: true });
      },
      onError: (error) => {
        if (
          error instanceof ORPCError &&
          error.code === 'CONFLICT' &&
          error.data.target.includes('name')
        ) {
          form.setError('name', { message: 'Name already exists' });
          return;
        }
      },
    })
  );

  return (
    <>
      <PreventNavigation shouldBlock={form.formState.isDirty} />
      <Form
        {...form}
        onSubmit={async (values) => {
          goodieCreate.mutate(values);
        }}
      >
        <PageLayout>
          <PageLayoutTopBar
            backButton={<BackButton />}
            actions={
              <Button
                size="sm"
                type="submit"
                className="min-w-20"
                loading={goodieCreate.isPending}
              >
                {"Ajouter l'idée"}
              </Button>
            }
          >
            <PageLayoutTopBarTitle>
              {'Ajouter une nouvelle idée de goodies :'}
            </PageLayoutTopBarTitle>
          </PageLayoutTopBar>
          <PageLayoutContent>
            <div className="flex flex-col gap-4 xs:flex-row">
              <div className="flex-2">
                <Card>
                  <CardContent>{/* add form */}</CardContent>
                </Card>
              </div>
              <div
                aria-hidden
                className="mx-auto w-full max-w-64 min-w-48 flex-1"
              >
                <GoodieAsset /> // to be fixed with real picture type
              </div>
            </div>
          </PageLayoutContent>
        </PageLayout>
      </Form>
    </>
  );
};
